const express = require('express');
const multer = require('multer');
const router = express.Router();
const { isAuth } = require('../utils.js');
const logActivity = require('../utils/logActivity.js');
const BusinessLoanLead = require('../models/businessLoanLeadModel.js');
const PersonalLoanLead = require('../models/personalLoanLeadModel.js');
const MortgageLoanLead = require('../models/mortgageLoanLeadModel.js');
const RealEstateLoanLead = require('../models/realEstateLoanLeadModel.js');

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
router.post('/upload-file', isAuth, upload.single('file'), async (req, res) => {
  try {
    const { leadId, leadType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    let leadModel;

    // Select the appropriate lead model based on leadType
    switch (leadType) {
      case 'BusinessLoanLead':
        leadModel = BusinessLoanLead;
        break;
      case 'PersonalLoanLead':
        leadModel = PersonalLoanLead;
        break;
      case 'MortgageLoanLead':
        leadModel = MortgageLoanLead;
        break;
      case 'RealEstateLoanLead':
        leadModel = RealEstateLoanLead;
        break;
      default:
        return res.status(400).json({ error: 'Invalid leadType' });
    }

    // Find the lead and update with file URL
    const lead = await leadModel.findById(leadId);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Log activity
    const activityLog = await logActivity(leadId, leadType, 'File uploaded', req.user._id, `File ${file.originalname} uploaded by ${req.user.name}`);

    // Update lead with activity log ID
    lead.activityLogs = lead.activityLogs || [];
    lead.activityLogs.push(activityLog._id);
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
