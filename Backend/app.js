const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.log('ERROR:', err.stack);
});

const authRoutes = require('./src/routes/authRoutes');
const farmerRoutes = require('./src/routes/farmerRoutes');
const advisoryRoutes = require('./src/routes/advisoryRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const mandiRoutes = require('./src/routes/mandiRoutes');
const communityRoutes = require('./src/routes/communityRoutes');
const Message = require('./src/models/Message');

const app = express();
const server = http.createServer(app);

// Enable CORS for express
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded audio files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  // When a user joins their district room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // When a message is sent
  socket.on('send-message', async (data) => {
    try {
      const msg = await Message.create({
        roomId:      data.roomId,
        senderName:  data.senderName,
        senderPhone: data.senderPhone,
        text:        data.text     || '',
        audioUrl:    data.audioUrl || '',
        imageUrl:    data.imageUrl || '',   // ← was missing!
      });
      // Broadcast to everyone in the room (including sender)
      io.to(data.roomId).emit('receive-message', msg);
    } catch (err) {
      console.error('Message save error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// MongoDB connect
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farmvaani')
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('MongoDB error:', err.message));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/mandi-rates', mandiRoutes);
app.use('/api/community', communityRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FarmVaani chal raha hai!',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server port ${PORT} pe chal raha hai`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});