const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const fs = require('fs');
const config = require('./config/config');
const uploadRoutes = require('./routes/uploadRoutes');
const routes = require('./routes');
const dbConfig = require('./database/db');

mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.db, {useNewUrlParser: true})
  .then(() => console.log('Connection successful!'))
  .catch((error) => console.error('Connection failed:', error));

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5501',
  'https://3dr4vhc7-9000.asse.devtunnels.ms',
].filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Content-Length'],
  })
);

// Parse JSON for non-upload routes
app.use(bodyParser.json({limit: '2gb'}));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '2gb',
  })
);

// Ensure upload directory exists
fs.mkdirSync(config.UPLOAD_BASE_PATH, {recursive: true});

// Expose uploads
app.use('/uploads', express.static(config.UPLOAD_BASE_PATH));

// API routes
app.use('/api', uploadRoutes);
app.use('/', uploadRoutes);
app.use('/', routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({status: 'ok', timestamp: new Date().toISOString()});
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
  console.log(`Upload directory: ${config.UPLOAD_BASE_PATH}`);
  console.log(
    `Max file size: ${config.MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB`
  );
});

module.exports = app;
