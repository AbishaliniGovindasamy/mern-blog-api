require('dotenv').config(); // Load environment variables from .env
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
const port = 4000; // Fixed port to 4000

// MongoDB connection
const mongoDBUrl = 'mongodb+srv://abishalini353:XT40GTc86AtM5Wmf@cluster0.0cumj.mongodb.net/'; // Replace with your MongoDB connection string
mongoose.connect(mongoDBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({ credentials: true, origin: 'http://localhost:3000' })); // Adjust the origin if needed
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

// Configurations
const salt = bcrypt.genSaltSync(10);
const secret = 'your_secret_key'; // Replace with your secure secret key
const uploadMiddleware = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type'));
        }
        cb(null, true);
    },
});

// Routes
// Register User
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, salt);
        const userDoc = await User.create({ username, password: hashedPassword });
        res.json({ message: 'User registered successfully', user: userDoc });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// Login User
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    if (!userDoc) return res.status(400).json('User not found');

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        jwt.sign({ username, id: userDoc._id }, secret, { expiresIn: '1h' }, (err, token) => {
            if (err) return res.status(500).json('Error signing token');
            res.cookie('token', token, { httpOnly: true }).json({ id: userDoc._id, username });
        });
    } else {
        res.status(400).json('Wrong credentials');
    }
});

// Create Post
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const { originalname, path } = req.file;
    const newPath = `${path}.${originalname.split('.').pop()}`;
    fs.renameSync(path, newPath);

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) return res.status(401).json('Unauthorized');
        const { title, summary, content } = req.body;
        const postDoc = await Post.create({ title, summary, content, cover: newPath, author: info.id });
        res.json(postDoc);
    });
});

// Update Post
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;
    if (req.file) {
        const { originalname, path } = req.file;
        newPath = `${path}.${originalname.split('.').pop()}`;
        fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) return res.status(401).json('Unauthorized');

        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);
        if (!postDoc) return res.status(404).json('Post not found');

        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) return res.status(403).json('You are not the author');

        postDoc.title = title;
        postDoc.summary = summary;
        postDoc.content = content;
        if (newPath) postDoc.cover = newPath;

        await postDoc.save();
        res.json(postDoc);
    });
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
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Fetch Post by ID
app.get('/post/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid post ID format' });
        }
        const postDoc = await Post.findById(id).populate('author', 'username');
        if (!postDoc) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(postDoc);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})