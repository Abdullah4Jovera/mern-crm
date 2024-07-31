const socketIO = require('socket.io');
const Notification = require('./models/notificationModel');
const ChatMessage = require('./models/chatMessageModel');
const User = require('./models/userModel'); // Import the User model

let io;

async function initializeSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },
        transports: ['websocket'] // Enforce WebSockets only
    });

    io.on('connection', async (socket) => {
        const userId = socket.handshake.query.userId;

        // Join user to their own room based on userId
        socket.join(userId);

        // Emit any unread notifications for the user
        const notifications = await Notification.find({ receiver: userId, read: false }).sort('timestamp');
        notifications.forEach(notification => {
            socket.emit('notifications', {
                message: notification.message,
                leadId: notification.entityId,
                entityType: notification.entityType,
                notificationId:notification._id
            });
        });

        // Mark notifications as read
        // await Notification.updateMany({ receiver: userId, read: false }, { read: true });

        // Listen for 'sendMessage' event
        socket.on('sendMessage', async (data) => {
            const { senderId, receiverId, message } = data;

            try {
                // Create a new chat message instance
                const chatMessage = new ChatMessage({
                    senderId: senderId,
                    receiverId: receiverId,
                    message: message
                });

                // Save the chat message
                await chatMessage.save();

                // Populate sender details dynamically
                const populatedMessage = await ChatMessage.findById(chatMessage._id)
                    .populate('senderId', 'name')
                    .exec(); // Execute the query to populate

                // Emit 'newMessage' event to recipient's room (receiverId)
                io.to(receiverId).emit('newMessage', {
                    senderId: populatedMessage.senderId._id,
                    senderName: populatedMessage.senderId.name,
                    message: message,
                    timestamp: new Date()
                });

                console.log('Saved and populated message:', populatedMessage);
            } catch (error) {
                console.error('Error saving chat message:', error);
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            socket.leave(userId); // Leave user's room
        });
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error('Socket.IO has not been initialized.');
    }
    return io; 
}

module.exports = {
    initializeSocket,
    getIO
};
