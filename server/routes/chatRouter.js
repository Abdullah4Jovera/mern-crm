const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/chatMessageModel');

// POST route to send a message
router.post('/send-message', async (req, res) => {
    try {
        const { sender, receiver, message } = req.body;
        const newMessage = new ChatMessage({ sender, receiver, message });
        await newMessage.save();
        // Emit real-time message to recipient's room
        const io = req.app.get('io');
        io.to(receiver.toString()).emit('newMessage', { message: newMessage });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET route to fetch chat history
router.get('/get-messages/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await ChatMessage.find({ receiver: userId }).populate('sender');
        res.status(200).json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
