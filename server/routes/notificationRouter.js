const express = require('express');
const router = express.Router();
const Notification = require('../models/notificationModel'); // Adjust path as needed
const { isAuth } = require('../utils');
 // Authentication middleware

// Route to mark notification as read
router.put('/mark-as-read/:id', isAuth, async (req, res) => {
    const { id } = req.params;

    try {
        // Find and update the notification
        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Check if the notification belongs to the authenticated user
        if (notification.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Update the notification as read
        notification.read = true;
        await notification.save();

        res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
