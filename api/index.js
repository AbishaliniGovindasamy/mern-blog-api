require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/user');
const Post = require('./models/post');

// Initialize app
const app = express();
const port = process.env.PORT || 4000; // Use the environment variable

// MongoDB connection
const mongoDBUrl = process.env.MONGO_URI; // Load MongoDB URL from .env
mongoose
  .connect(mongoDBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());

// Secret Key for JWT
const secret = process.env.SECRET_KEY; // Load secret key from .env

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
