const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const BusinessLoanLead = require('../models/businessLoanLeadModel.js');
const PersonalLoanLead = require('../models/personalLoanLeadModel.js');
const MortgageLoanLead = require('../models/mortgageLoanLeadModel.js'); // Import MortgageLoanLead model
const User = require('../models/userModel.js');
const RealEstateLoanLead = require('../models/realEstateLoanLeadModel.js');

// Create a new mortgage loan lead
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
  // Check if a lead already exists for the given client in any of the lead collections
  // const existingLeads = await Promise.all([
  //   BusinessLoanLead.findOne({ client: clientId }),
  //   PersonalLoanLead.findOne({ client: clientId }),
  //   MortgageLoanLead.findOne({ client: clientId }),
  //   RealEstateLoanLead.findOne({ client: clientId }) // Check for existing real estate loan lead
  // ]);

  // const existingBusinessLead = existingLeads[0];
  // const existingPersonalLead = existingLeads[1];
  // const existingMortgageLead = existingLeads[2];
  // const existingRealEstateLead = existingLeads[3]; // Capture existing real estate loan lead

  // if (existingBusinessLead) {
  //   return res.status(400).json({ error: 'A business lead already exists for the client', lead: existingBusinessLead });
  // }

  // if (existingPersonalLead) {
  //   return res.status(400).json({ error: 'A personal lead already exists for the client', lead: existingPersonalLead });
  // }

  // if (existingMortgageLead) {
  //   return res.status(400).json({ error: 'A mortgage lead already exists for the client', lead: existingMortgageLead });
  // }

  // if (existingRealEstateLead) {
  //   return res.status(400).json({ error: 'A real estate lead already exists for the client', lead: existingRealEstateLead });
  // }

    const rolesToInclude = [
      'CEO', 
      'MD',
      'mortgageloanmanger', 
      'mortgageloanHOD',
      'mortgageloancordinator'
    ];
    
    const usersWithRoles = await User.find({
      'role': { $in: rolesToInclude }
    });

    // console.log('Users with specified roles:', usersWithRoles); // Log fetched users

    // Add these users to the selectedUsers array if not already included
    const usersToAdd = usersWithRoles.map(user => user._id.toString());
    const updatedSelectedUsers = [...new Set([...selectedUsers, ...usersToAdd])];
    // Create the mortgage loan lead
    const newLead = new MortgageLoanLead({
      service,
      client: clientId,
      selectedUsers: updatedSelectedUsers,
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

// Transfer a mortgage loan lead to a different type of lead (Business, Personal, Real Estate)
router.put('/transfer-mortgage-lead/:leadId/:leadType', async (req, res) => {
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
      case 'Personal':
        LeadModel = PersonalLoanLead;
        serviceType = 'Personal Loan';
        break;
      case 'RealEstate':
        LeadModel = RealEstateLoanLead;
        serviceType = 'Real Estate Loan';
        break;
      default:
        return res.status(400).json({ error: 'Invalid lead type provided' });
    }

    // Find the mortgage loan lead to transfer
    const mortgageLead = await MortgageLoanLead.findById(leadId);

    if (!mortgageLead) {
      return res.status(404).json({ error: 'Mortgage loan lead not found' });
    }

    // Create a new lead of the specified type
    const newLead = new LeadModel({
      service: serviceType,
      client: mortgageLead.client,
      selectedUsers: mortgageLead.selectedUsers,
      stage: mortgageLead.stage,
      description: mortgageLead.description,
      source: mortgageLead.source,
      labels: mortgageLead.labels,
      transferredfrom: {
        leadType: 'MortgageLoanLead',
        leadId: mortgageLead._id,
      },
    });

    await newLead.save();

    // Update the mortgage loan lead with transfer information
    mortgageLead.transferredTo = {
      leadType: `${leadType}LoanLead`, // Adjust based on your naming convention
      leadId: newLead._id,
    };

    await mortgageLead.save();

    res.status(200).json({ message: 'Lead transferred successfully', transferredLead: newLead });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all mortgage loan leads
router.get('/get-all-mortgage-loan-leads', async (req, res) => {
  try {
    const leads = await MortgageLoanLead.find().populate('client').populate('selectedUsers');
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
