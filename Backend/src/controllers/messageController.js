const Message = require('../models/Message');
const Group = require('../models/Group');

// Send a message to a group
const sendMessage = async (req, res) => {
  try {
    const { groupId, content, messageType, imageUrl } = req.body;
    const farmerId = req.farmerId;

    // Check if farmer is member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group nahi mila'
      });
    }

    if (!group.members.includes(farmerId)) {
      return res.status(403).json({
        success: false,
        message: 'Aap is group ke member nahi hain'
      });
    }

    const message = await Message.create({
      group: groupId,
      sender: farmerId,
      content,
      messageType: messageType || 'text',
      imageUrl
    });

    await message.populate('sender', 'name phone');
    await message.populate('group', 'name');

    // Emit to socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(groupId).emit('newMessage', message);
    }

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get messages for a group
const getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const farmerId = req.farmerId;
    const { page = 1, limit = 50 } = req.query;

    // Check if farmer is member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group nahi mila'
      });
    }

    if (!group.members.includes(farmerId)) {
      return res.status(403).json({
        success: false,
        message: 'Aap is group ke member nahi hain'
      });
    }

    const messages = await Message.find({ group: groupId })
      .populate('sender', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      data: messages.reverse() // Reverse to show oldest first
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getMessages
};