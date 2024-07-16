const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const BusinessLoanLead = require('../models/businessLoanLeadModel.js');
const PersonalLoanLead = require('../models/personalLoanLeadModel.js');
const User = require('../models/userModel.js');

// Create a new personal loan lead
router.post('/create-lead', async (req, res) => {
  const { service, client, selectedUsers, stage, description, source, labels, clientDetails } = req.body;

  try {
    let clientId = client;

    // If client ID is not provided and client details are given, check for an existing user
    if (!clientId && clientDetails) {
      const existingUser = await User.findOne({ 
        $or: [
          { email: clientDetails.email },
          { contactNumber: clientDetails.contactNumber }
        ]
      });

      if (existingUser) {
        clientId = existingUser._id;
      } else {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash('12345', 10);
        const newUser = new User({
          ...clientDetails,
          verified: true,
          password: hashedPassword
        });
        await newUser.save();
        clientId = newUser._id;
      }
    }

    // If client ID is still not available, return an error
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID or client details must be provided' });
    }

    // Check if a lead already exists for the given client in any of the lead collections
    const existingLeads = await Promise.all([
      BusinessLoanLead.findOne({ client: clientId }),
      PersonalLoanLead.findOne({ client: clientId })
    ]);

    const existingBusinessLead = existingLeads[0];
    const existingPersonalLead = existingLeads[1];

    if (existingBusinessLead) {
      return res.status(400).json({ error: 'A business lead already exists for the client', lead: existingBusinessLead });
    }

    if (existingPersonalLead) {
      return res.status(400).json({ error: 'A personal lead already exists for the client', lead: existingPersonalLead });
    }

    // Create the personal loan lead
    const newLead = new PersonalLoanLead({
      service,
      client: clientId,
      selectedUsers,
      stage,
      description,
      source,
      labels,
    });

    await newLead.save();
    res.status(201).json(newLead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all personal loan leads
router.get('/get-all-personal-loan-leads', async (req, res) => {
  try {
    const leads = await PersonalLoanLead.find().populate('client').populate('selectedUsers');
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/transfer-personal-lead/:leadId/:leadType', async (req, res) => {
    const { leadId, leadType } = req.params;
  
    try {
      // Determine the appropriate model based on leadType
      let LeadModel;
      let serviceType;
  
      switch (leadType) {
        case 'Business':
          LeadModel = BusinessLoanLead;
          serviceType = 'Business Loan';
          break;
        case 'Mortgage':
          LeadModel = MortgageLoanLead;
          serviceType = 'Mortgage Loan';
          break;
        case 'RealEstate':
          LeadModel = RealEstateLoanLead;
          serviceType = 'Real Estate Loan';
          break;
        default:
          return res.status(400).json({ error: 'Invalid lead type provided' });
      }
  
      // Find the personal loan lead to transfer
      const personalLead = await PersonalLoanLead.findById(leadId);
  
      if (!personalLead) {
        return res.status(404).json({ error: 'Personal loan lead not found' });
      }
  
      // Create a new lead of the specified type
      const newLead = new LeadModel({
        service: serviceType,
        client: personalLead.client,
        selectedUsers: personalLead.selectedUsers,
        stage: personalLead.stage,
        description: personalLead.description,
        source: personalLead.source,
        labels: personalLead.labels,
        transferredfrom: {
          leadType: 'PersonalLoanLead',
          leadId: personalLead._id,
        },
      });
  
      await newLead.save();
  
      // Update the personal loan lead with transfer information
      personalLead.transferredTo = {
        leadType: `${leadType}LoanLead`, // Adjust based on your naming convention
        leadId: newLead._id,
      };
  
      await personalLead.save();
  
      res.status(200).json({ message: 'Lead transferred successfully', transferredLead: newLead });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



module.exports = router;
