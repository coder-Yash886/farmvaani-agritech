const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const farmerRoutes = require('./src/routes/farmerRoutes');
const advisoryRoutes = require('./src/routes/advisoryRoutes');
const alertRoutes = require('./src/routes/alertRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('MongoDB error:', err.message));

// Routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FarmVaani chal raha hai!',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    routes: [
      'POST /api/farmers/register',
      'GET  /api/farmers/:phone',
      'POST /api/advisory/ask',
      'GET  /api/advisory/history/:phone',
      'POST /api/alerts/generate',
      'GET  /api/alerts/:phone',
      'PATCH /api/alerts/read/:id'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server port ${PORT} pe chal raha hai`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});