require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/user');
const Post = require('./models/post');

// Initialize app
const app = express();
const port = 4000;

// MongoDB connection
const mongoDBUrl = process.env.MONGO_URL || 'mongodb+srv://abishalini353:XT40GTc86AtM5Wmf@cluster0.0cumj.mongodb.net/';
mongoose.connect(mongoDBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Enhanced CORS configuration
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurations
const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET || 'your_secret_key';

// Improved Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only image files are allowed (jpeg, png, gif)'));
  }
  cb(null, true);
};

const uploadMiddleware = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  }
  res.status(500).json({ message: 'Internal server error' });
});

// Routes

// Register User
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, salt);
    const userDoc = await User.create({ username, password: hashedPassword });
    res.json({ message: 'User registered successfully', user: userDoc });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login User
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(400).json({ message: 'User not found' });
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) {
      return res.status(400).json({ message: 'Wrong credentials' });
    }

    jwt.sign({ username, id: userDoc._id }, secret, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { 
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      }).json({
        id: userDoc._id,
        username,
        message: 'Login successful'
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

// Create Post
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const info = jwt.verify(token, secret);
    const { title, summary, content } = req.body;
    
    if (!title || !summary || !content) {
      return res.status(400).json({ message: 'Title, summary and content are required' });
    }

    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: req.file?.path || null,
      author: info.id,
    });
    
    res.status(201).json(postDoc);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Update Post
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const info = jwt.verify(token, secret);
    const { id, title, summary, content } = req.body;
    
    if (!id || !title || !summary || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const postDoc = await Post.findById(id);
    if (!postDoc) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (postDoc.author.toString() !== info.id) {
      return res.status(403).json({ message: 'Unauthorized: You are not the author' });
    }

    // Delete old file if new one is uploaded
    if (req.file && postDoc.cover) {
      try {
        fs.unlinkSync(postDoc.cover);
      } catch (err) {
        console.error('Error deleting old file:', err);
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(id, {
      title,
      summary,
      content,
      cover: req.file?.path || postDoc.cover,
      updatedAt: new Date()
    }, { new: true });

    res.json(updatedPost);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// Fetch All Posts
app.get('/post', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Fetch Post by ID
app.get('/post/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const postDoc = await Post.findById(id).populate('author', 'username');
    if (!postDoc) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(postDoc);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});