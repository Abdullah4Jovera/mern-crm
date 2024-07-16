const express = require('express');
const router = express.Router();
const Contact = require('../models/contactModel');

// POST route for creating a new contact
router.post('/contact-us', async (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newContact = new Contact({
            name,
            email,
            phone,
            message
        });

        await newContact.save();

        res.status(201).json(newContact);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save contact' });
    }
});

module.exports = router;
