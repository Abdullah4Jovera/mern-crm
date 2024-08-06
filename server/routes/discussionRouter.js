const express = require('express');
const router = express.Router();
const Discussion = require('../models/discussionModel'); // Adjust the path as necessary

// POST /api/discussions - Create a new discussion
router.post('/', isAuth ,  async (req, res) => {
  try {
    const {  message, leadType, leadId } = req.body;

    // Create a new discussion instance
    const newDiscussion = new Discussion({
      user,
      message,
      leadType,
      leadId,
    });

    // Save the discussion to the database
    const savedDiscussion = await newDiscussion.save();

    res.status(201).json(savedDiscussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ error: 'Failed to create discussion' });
  }
});

// GET /api/discussions/:id - Get a discussion by ID
router.get('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    res.json(discussion);
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ error: 'Failed to fetch discussion' });
  }
});

// PUT /api/discussions/:id - Update a discussion by ID
router.put('/:id', async (req, res) => {
  try {
    const { user, message, leadType, leadId } = req.body;

    const updatedDiscussion = await Discussion.findByIdAndUpdate(
      req.params.id,
      { user, message, leadType, leadId },
      { new: true } // Return the updated document
    );

    if (!updatedDiscussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    res.json(updatedDiscussion);
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({ error: 'Failed to update discussion' });
  }
});

// DELETE /api/discussions/:id - Delete a discussion by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedDiscussion = await Discussion.findByIdAndDelete(req.params.id);

    if (!deletedDiscussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ error: 'Failed to delete discussion' });
  }
});

module.exports = router;
