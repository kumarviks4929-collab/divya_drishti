const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  type: { type: String, required: true }, // chat, kundali, matching, tool
  title: { type: String, required: true },
  timestamp: { type: Number, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  dob: { type: String, required: true },
  time: { type: String, required: true },
  place: { type: String, required: true },
  activities: [ActivitySchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);