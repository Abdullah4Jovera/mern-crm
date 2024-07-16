const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Receiver of the notification
    },
    entityType: {
        type: String,
        required: true // Type of entity (e.g., 'personal_loan', 'real_estate_loan', etc.)
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true // ID of the related entity
    },
    message: {
        type: String,
        required: true // Message for the notification
    },
    timestamp: {
        type: Date,
        default: Date.now // Timestamp of when the notification was created
    },
    read: {
        type: Boolean,
        default: false // Indicates whether the notification has been read by the receiver
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
