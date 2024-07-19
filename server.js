const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/adventure_site', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Models
const User = require('./models/User');
const Profile = require('./models/Profile');

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// User registration
app.post('/api/users/register', async (req, res) => {
    try {
        const { username, email, password, userType } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, userType });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

// User login
app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
        res.json({ token, userType: user.userType });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Create profile
app.post('/api/profiles', authenticateToken, async (req, res) => {
    try {
        const { state, city, description, activitiesOffered, lat, lng, email, phone } = req.body;
        const profile = new Profile({
            user: req.user.userId,
            state,
            city,
            description,
            activitiesOffered,
            lat,
            lng,
            email,
            phone
        });
        await profile.save();
        res.status(201).json({ message: 'Profile created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating profile' });
    }
});

// Get profiles
app.get('/api/profiles', authenticateToken, async (req, res) => {
    try {
        const { activity } = req.query;
        let query = {};
        if (activity) {
            query.activitiesOffered = activity;
        }
        const profiles = await Profile.find(query).populate('user', 'username');
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profiles' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));