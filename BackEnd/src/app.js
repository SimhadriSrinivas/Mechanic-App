// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser'); // optional, express.json is fine
const authRoutes = require('./routes/auth.routes');
const { info } = require('./utils/logger');

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors()); // configure origin in production
app.use(express.json()); // parses application/json
app.use(bodyParser.urlencoded({ extended: true })); // parse form data if needed

// simple health check
app.get('/', (req, res) => res.send('OTP server alive'));

// mount routes with prefix
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

module.exports = app;
