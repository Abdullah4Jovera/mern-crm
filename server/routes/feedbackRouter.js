const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedBackModel');

// POST route for creating new feedback
router.post('/feedback-us', async (req, res) => {
    const { name, email, message, rating } = req.body;

    if (!name || !email || !message || rating == null) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newFeedback = new Feedback({
            name,
            email,
            message,
            rating
        });

        await newFeedback.save();

        res.status(201).json(newFeedback);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});

module.exports = router;
