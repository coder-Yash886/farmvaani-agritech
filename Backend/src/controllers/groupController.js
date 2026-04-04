const Group = require('../models/Group');
const Farmer = require('../models/Farmer');

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const farmerId = req.farmerId; // From auth middleware

    const group = await Group.create({
      name,
      description,
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy: farmerId
    });

    await group.populate('createdBy', 'name phone');
    await group.populate('members', 'name phone');

    res.json({
      success: true,
      data: group
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all groups (public or user's groups)
const getGroups = async (req, res) => {
  try {
    const farmerId = req.farmerId;

    const groups = await Group.find({
      $or: [
        { isPublic: true },
        { members: farmerId }
      ]
    })
    .populate('createdBy', 'name phone')
    .populate('members', 'name phone')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: groups
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Join a group
const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const farmerId = req.farmerId;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group nahi mila'
      });
    }

    if (!group.members.includes(farmerId)) {
      group.members.push(farmerId);
      await group.save();
    }

    await group.populate('createdBy', 'name phone');
    await group.populate('members', 'name phone');

    res.json({
      success: true,
      data: group
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Leave a group
const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const farmerId = req.farmerId;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group nahi mila'
      });
    }

    group.members = group.members.filter(member => member.toString() !== farmerId);
    await group.save();

    res.json({
      success: true,
      message: 'Group se nikle'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createGroup,
  getGroups,
  joinGroup,
  leaveGroup
};