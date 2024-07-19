const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  state: { type: String, required: true },
  city: { type: String, required: true },
  description: String,
  activitiesOffered: [String]
});

module.exports = mongoose.model('Profile', ProfileSchema);