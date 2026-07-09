const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a notification for a specific user
 */
const createNotification = async (userId, title, message, type = 'system', relatedId = null) => {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      relatedId
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * Create a notification for all admin users
 */
const createAdminNotification = async (title, message, type = 'system', relatedId = null) => {
  try {
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      user: admin._id,
      title,
      message,
      type,
      relatedId
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error creating admin notifications:', error);
  }
};

module.exports = {
  createNotification,
  createAdminNotification
};
