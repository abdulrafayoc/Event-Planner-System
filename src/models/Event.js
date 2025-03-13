const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Meeting', 'Birthday', 'Appointment', 'Other']
  },
  reminder: {
    time: Date,
    notified: {
      type: Boolean,
      default: false
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

eventSchema.index({ date: 1, user: 1 });
eventSchema.index({ category: 1, user: 1 });

module.exports = mongoose.model('Event', eventSchema);