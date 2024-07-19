const express = require('express');
const Profile = require('../models/Profile');

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { user, state, city, description, activitiesOffered } = req.body;
    const profile = new Profile({ user, state, city, description, activitiesOffered });
    await profile.save();
    res.status(201).json({ message: 'Profile created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating profile' });
  }
});

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', 'username');
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profiles' });
  }
});

module.exports = router;