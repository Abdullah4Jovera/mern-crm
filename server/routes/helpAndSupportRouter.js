const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const HelpAndSupport = require('../models/helpAndSupportModel');
const { isUser, isSuperAdmin } = require('../utils');
const isAuth = require('../utils').isAuth;

const router = express.Router();

// Route to create a new help and support request
router.post(
  '/submit-help-and-support',
  isAuth, isUser, 
  expressAsyncHandler(async (req, res) => {
    const { supportType, message } = req.body;
    const userId = req.user._id;

    try {
      const newHelpRequest = new HelpAndSupport({ user: userId, supportType, message });
      const savedHelpRequest = await newHelpRequest.save();
      res.status(201).json({ message: 'Help and support request created', data: savedHelpRequest });
    } catch (error) {
      res.status(400).json({ error: 'Failed to create help and support request', details: error.message });
    }
  })
);

// Route to get all help and support requests
router.get(
    '/all-help-and-support',
    isAuth, isSuperAdmin, 
    expressAsyncHandler(async (req, res) => {
      try {
        // Fetch all help and support requests and populate the 'user' field to include user details
        const helpRequests = await HelpAndSupport.find({}).populate('user', 'name contactNumber');
  
        res.status(200).json({ message: 'All help and support requests retrieved successfully', data: helpRequests });
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve help and support requests', details: error.message });
      }
    })
  );

module.exports = router;
