const Notification = require('../models/Notification');

const TIMEOUT_MS = 4500;

// Helper function to enforce timeout on queries
const withTimeout = (promise) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Database query timeout')), TIMEOUT_MS))
  ]);
};

// Get citizen notifications
exports.getNotifications = async (req, res) => {
  console.log("Notifications request start - getNotifications");
  try {
    const notifications = await withTimeout(
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
    );
    res.json(notifications);
  } catch (error) {
    console.error("Error in getNotifications:", error);
    res.status(error.message === 'Database query timeout' ? 408 : 500).json({ message: 'Server Error', error: error.message });
  } finally {
    console.log("Notifications request end - getNotifications");
  }
};

// Get unread notifications
exports.getUnreadNotifications = async (req, res) => {
  console.log("Notifications request start - getUnreadNotifications");
  try {
    const notifications = await withTimeout(
      Notification.find({ user: req.user._id, isRead: false })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
    );
    res.json(notifications);
  } catch (error) {
    console.error("Error in getUnreadNotifications:", error);
    res.status(error.message === 'Database query timeout' ? 408 : 500).json({ message: 'Server Error', error: error.message });
  } finally {
    console.log("Notifications request end - getUnreadNotifications");
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  console.log("Notifications request start - markAsRead");
  try {
    const notification = await withTimeout(
      Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isRead: true },
        { new: true }
      ).lean()
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    res.status(error.message === 'Database query timeout' ? 408 : 500).json({ message: 'Server Error', error: error.message });
  } finally {
    console.log("Notifications request end - markAsRead");
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  console.log("Notifications request start - markAllAsRead");
  try {
    await withTimeout(
      Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true }
      )
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error("Error in markAllAsRead:", error);
    res.status(error.message === 'Database query timeout' ? 408 : 500).json({ message: 'Server Error', error: error.message });
  } finally {
    console.log("Notifications request end - markAllAsRead");
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  console.log("Notifications request start - deleteNotification");
  try {
    const notification = await withTimeout(
      Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
      }).lean()
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    res.status(error.message === 'Database query timeout' ? 408 : 500).json({ message: 'Server Error', error: error.message });
  } finally {
    console.log("Notifications request end - deleteNotification");
  }
};
