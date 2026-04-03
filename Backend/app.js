const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.log('ERROR:', err.stack);
});

const authRoutes = require('./src/routes/authRoutes');
const farmerRoutes = require('./src/routes/farmerRoutes');
const advisoryRoutes = require('./src/routes/advisoryRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const mandiRoutes = require('./src/routes/mandiRoutes');

const app = express();

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
      'GET  /api/alerts/:phone'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server port ${PORT} pe chal raha hai`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});