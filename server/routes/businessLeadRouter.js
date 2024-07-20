const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const BusinessLoanLead = require('../models/businessLoanLeadModel.js');
const PersonalLoanLead = require('../models/personalLoanLeadModel.js');
const User = require('../models/userModel.js'); 
const MortgageLoanLead = require('../models/mortgageLoanLeadModel.js');
const RealEstateLoanLead = require('../models/realEstateLoanLeadModel.js');
const { isAuth, hasRole } = require('../utils.js');
const Discussion = require('../models/discussionModel.js');
const logActivity = require('../utils/logActivity.js');
// Create Lead ....
router.post('/create-lead', isAuth, async (req, res) => {
  const { service, client, selectedUsers = [], stage, description, source, labels, clientDetails } = req.body;

  try {
    let clientId = client;

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
    
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID or client details must be provided' });
    }

    const rolesToInclude = [
      'CEO', 
      'MD',
      'businessfinanceloanmanger',
      'businessfinanceloanHOD',
      'businessfinanceloancordinator'
    ];
    
    const usersWithRoles = await User.find({
      'role': { $in: rolesToInclude }
    });

    const usersToAdd = usersWithRoles.map(user => user._id.toString());
    const updatedSelectedUsers = [...new Set([...selectedUsers, ...usersToAdd])];

    const newLead = new BusinessLoanLead({
      service,
      client: clientId,
      selectedUsers: updatedSelectedUsers,
      stage,
      description,
      source,
      labels,
    });

    await newLead.save();

    // Log activity
    const activityLog = await logActivity(newLead._id, 'BusinessLoanLead', 'create', req.user._id, 'Created a new business loan lead');

    // Update lead with activity log ID
    newLead.activityLogs.push(activityLog._id);
    await newLead.save();

    res.status(201).json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all business loan leads 
router.get('/get-all-business-leads', async (req, res) => {
  try {
    const leads = await BusinessLoanLead.find()
      .populate('client', 'name') // Populate client with username only
      .populate('selectedUsers', 'name') // Populate selectedUsers with username only
      .populate({
        path: 'activityLogs',
        select: 'action details timestamp', // Select only action and details fields from activity logs
        populate: { path: 'userId', select: 'name' } // Populate user field in activity logs with username
      })
      .populate({
        path: 'discussions',
        populate: { path: 'user', select: 'name' } // Populate user field in discussions with username
      });

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Transfer a business lead to a personal lead
router.put('/transfer-lead/:leadId/:leadType', async (req, res) => {
  const { leadId, leadType } = req.params;

  try {
    // Determine the appropriate model based on leadType
    let LeadModel;
    let serviceType;
    
    switch (leadType) {
      case 'Personal':
        LeadModel = PersonalLoanLead;
        serviceType = 'Personal Loan';
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

    // Find the business lead to transfer
    const businessLead = await BusinessLoanLead.findById(leadId);

    if (!businessLead) {
      return res.status(404).json({ error: 'Business lead not found' });
    }

    // Create a new lead of the specified type
    const newLead = new LeadModel({
      service: serviceType,
      client: businessLead.client,
      selectedUsers: businessLead.selectedUsers,
      stage: businessLead.stage,
      description: businessLead.description,
      source: businessLead.source,
      labels: businessLead.labels,
      transferredfrom: {
        leadType: 'BusinessLoanLead',
        leadId: businessLead._id,
      },
    });

    await newLead.save();

    // Update the business lead with transfer information
    businessLead.transferredTo = {
      leadType: leadType === 'RealEstate' ? 'RealEstateLoanLead' : `${leadType}LoanLead`, // Adjust based on your naming convention
      leadId: newLead._id,
    };

    await businessLead.save();

    res.status(200).json({ message: 'Lead transferred successfully', transferredLead: newLead });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/discussions', async (req, res) => {
  try {
    const discussion = new Discussion(req.body);
    await discussion.save();
    
    // Add discussion reference to BusinessLoanLead
    const leadId = req.body.lead;
    const businessLoanLead = await BusinessLoanLead.findById(leadId);
    if (!businessLoanLead) {
      return res.status(404).send({ error: 'BusinessLoanLead not found' });
    }
    
    businessLoanLead.discussions.push(discussion._id);
    await businessLoanLead.save();

    res.status(201).send(discussion);
  } catch (err) {
    res.status(400).send(err);
  }
});
module.exports = router;
