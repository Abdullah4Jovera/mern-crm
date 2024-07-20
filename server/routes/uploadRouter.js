const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const BusinessLoanLead = require('../models/businessLoanLeadModel.js');
const { isAuth } = require('../utils.js');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Create a new file upload endpoint
router.post('/upload-file',  upload.single('file'), async (req, res) => {
  try {
    const { leadId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    // Find the lead and update with file URL
    const lead = await BusinessLoanLead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    lead.files = lead.files || [];
    lead.files.push({ url: fileUrl, filename: file.originalname });
    await lead.save();

    res.status(200).json({ message: 'File uploaded successfully', fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
