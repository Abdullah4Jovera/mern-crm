const express = require('express');
const router = express.Router();

const BusinessLoanLead = require('../models/businessLoanLeadModel.js');
const PersonalLoanLead = require('../models/personalLoanLeadModel.js');
const User = require('../models/userModel.js');
const MortgageLoanLead = require('../models/mortgageLoanLeadModel.js');
const RealEstateLoanLead = require('../models/realEstateLoanLeadModel.js');

// Route to check for any lead associated with client's contact number
router.post('/check-lead', async (req, res) => {
  const { contactNumber } = req.body;

  if (!contactNumber) {
    return res.status(400).json({ error: 'Contact number must be provided' });
  }

  try {
    // Find the user by contact number
    const user = await User.findOne({ contactNumber });

    if (!user) {
      return res.status(404).json({ error: 'No user found with the provided contact number' });
    }

    // Find leads associated with the user's ID
    const clientId = user._id;
    const leads = await Promise.all([
      BusinessLoanLead.find({ client: clientId }),
      PersonalLoanLead.find({ client: clientId }),
      MortgageLoanLead.find({ client: clientId }),
      RealEstateLoanLead.find({ client: clientId })
    ]);

    // Merge all found leads into a single array
    const allLeads = [].concat(...leads);

    if (allLeads.length === 0) {
      return res.status(404).json({ error: 'No leads found for the provided contact number' });
    }

    // Return the details of all found leads
    res.status(200).json({ user, leads: allLeads });
  } catch (error) {
    console.error('Error checking leads:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
