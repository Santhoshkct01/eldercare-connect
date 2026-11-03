const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { initAutomation } = require('./services/automationService');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const sosRoutes = require('./routes/sosRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const adminRoutes = require('./routes/adminRoutes');
const featureRoutes = require('./routes/featureRoutes');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Socket.IO Connection & Events
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // User joins room for targeted alerts & notifications
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`[Socket.IO] User ${userId} joined room user_${userId}`);
  });

  // Live Location Streaming (every 15s when active)
  socket.on('update_location', (data) => {
    // Broadcast location to authorized listeners (family, assigned volunteer)
    io.emit(`location_${data.userId}`, data);
  });

  // Emergency Room
  socket.on('join_emergency', (sosId) => {
    socket.join(`emergency_${sosId}`);
  });

  socket.on('send_emergency_message', (data) => {
    io.to(`emergency_${data.sosId}`).emit('emergency_message', data);
  });

  // WebRTC Signaling
  socket.on('call_user', (data) => {
    io.to(`user_${data.userToCall}`).emit('incoming_call', {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on('answer_call', (data) => {
    io.to(`user_${data.to}`).emit('call_accepted', data.signal);
  });

  socket.on('end_call', (data) => {
    io.to(`user_${data.to}`).emit('call_ended');
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Initialize background automations
initAutomation(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Eldercare Connect API',
    uptime: process.uptime(),
    database: 'db01.dbhost.dev:5050 (db_458492c92)',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/features', featureRoutes);

// Production Static Client Serving
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send(`<h2>Eldercare Connect API is running.</h2><p>Client build will be served here once generated.</p>`);
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Start Server on 0.0.0.0
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Eldercare Connect Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
