const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['request_update', 'system', 'message', 'validation', 'rejection'],
    default: 'system'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  }
}, { timestamps: true });

// Index for fetching unread notifications per user
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
// Index for fetching all notifications per user
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
