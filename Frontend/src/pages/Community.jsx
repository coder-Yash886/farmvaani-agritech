import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Users, Plus, Send, LogOut } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';

export default function Community() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchGroups();
      initializeSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  const initializeSocket = () => {
    socketRef.current = io(API_BASE_URL);

    socketRef.current.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setGroups(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/groups/create`, {
        name: groupName,
        description: groupDescription
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setGroups(prev => [response.data.data, ...prev]);
        setGroupName('');
        setGroupDescription('');
        setShowCreateGroup(false);
      }
    } catch (error) {
      alert('Group create karne mein error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/groups/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setGroups(prev => prev.map(group =>
          group._id === groupId ? response.data.data : group
        ));
        selectGroup(response.data.data);
      }
    } catch (error) {
      alert('Group join karne mein error: ' + (error.response?.data?.message || error.message));
    }
  };

  const selectGroup = async (group) => {
    setSelectedGroup(group);

    if (socketRef.current) {
      socketRef.current.emit('joinGroup', group._id);
    }

    // Fetch messages
    try {
      const response = await axios.get(`${API_BASE_URL}/api/messages/${group._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessages(response.data.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/api/messages/send`, {
        groupId: selectedGroup._id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Message will be received via socket
        setNewMessage('');
      }
    } catch (error) {
      alert('Message send karne mein error: ' + (error.response?.data?.message || error.message));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!token) {
    return (
      <div className="container py-24 text-center">
        <h2>Please login to access community chat</h2>
      </div>
    );
  }

  return (
    <div className="community-page py-24">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl mb-4 flex items-center gap-3">
            <MessageCircle className="text-primary" size={40} />
            Farmer Community
          </h1>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Create Group
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Groups List */}
          <div className="lg:col-span-1">
            <div className="glass-panel">
              <h3 className="text-xl mb-4 flex items-center gap-2">
                <Users size={20} />
                Groups
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {groups.map(group => (
                  <div
                    key={group._id}
                    onClick={() => selectGroup(group)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedGroup?._id === group._id
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <h4 className="font-semibold">{group.name}</h4>
                    <p className="text-sm opacity-75">
                      {group.members.length} members
                    </p>
                  </div>
                ))}
                {groups.length === 0 && (
                  <p className="text-muted text-center py-4">
                    No groups yet. Create one!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedGroup ? (
              <div className="glass-panel h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                  <h3 className="text-xl font-semibold">{selectedGroup.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Users size={16} />
                    {selectedGroup.members.length} members
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-96">
                  {messages.map(message => (
                    <div key={message._id} className="flex gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{message.sender.name}</span>
                          <span className="text-xs text-muted">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary flex items-center gap-2"
                    disabled={!newMessage.trim()}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="glass-panel h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle size={48} className="text-muted mx-auto mb-4" />
                  <h3 className="text-xl mb-2">Select a group to start chatting</h3>
                  <p className="text-muted">Choose a group from the list or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="glass-panel w-full max-w-md mx-4">
              <h3 className="text-xl mb-4">Create New Group</h3>
              <form onSubmit={createGroup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="3"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
                    className="flex-1 btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}