const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.log('ERROR:', err.stack);
});

const authRoutes = require('./src/routes/authRoutes');
const farmerRoutes = require('./src/routes/farmerRoutes');
const advisoryRoutes = require('./src/routes/advisoryRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const mandiRoutes = require('./src/routes/mandiRoutes');
const groupRoutes = require('./src/routes/groupRoutes');
const messageRoutes = require('./src/routes/messageRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('MongoDB error:', err.message));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/mandi-rates', mandiRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FarmVaani chal raha hai!',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    routes: [
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET  /api/auth/profile',
      'PUT  /api/auth/change-password',
      'POST /api/advisory/ask',
      'GET  /api/advisory/history/:phone',
      'POST /api/alerts/generate',
      'GET  /api/alerts/:phone',
      'POST /api/groups/create',
      'GET  /api/groups',
      'POST /api/groups/:groupId/join',
      'POST /api/groups/:groupId/leave',
      'POST /api/messages/send',
      'GET  /api/messages/:groupId'
    ]
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server port ${PORT} pe chal raha hai`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a group room
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Leave a group room
  socket.on('leaveGroup', (groupId) => {
    socket.leave(groupId);
    console.log(`User ${socket.id} left group ${groupId}`);
  });

  // Send message
  socket.on('sendMessage', (data) => {
    const { groupId, message } = data;
    // Broadcast to all users in the group
    io.to(groupId).emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});