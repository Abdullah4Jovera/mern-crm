const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { getIO } = require('../socket');
const BusinessLoanLead = require('../models/businessLoanLeadModel.js');
const PersonalLoanLead = require('../models/personalLoanLeadModel.js');
const User = require('../models/userModel.js'); 
const MortgageLoanLead = require('../models/mortgageLoanLeadModel.js');
const RealEstateLoanLead = require('../models/realEstateLoanLeadModel.js');
const { isAuth, hasRole } = require('../utils.js');
const Discussion = require('../models/discussionModel.js');
const logActivity = require('../utils/logActivity.js');
const Notification = require('../models/notificationModel.js');


// Create Lead ....
router.post('/create-lead', isAuth, async (req, res) => {
  const { service, client, selectedUsers = [], stage, description, source, labels, clientDetails } = req.body;

  try {
    let clientId = client;

    // If client ID is not provided, check client details to create or find the client
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

    // Check if client ID is still not set
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID or client details must be provided' });
    }

    // Define roles to include
    const rolesToInclude = [
      'superadmin',
      'CEO',
      'MD',
      'businessfinanceloanmanger',
      'businessfinanceloanHOD',
      'businessfinanceloancordinator'
    ];

    // Find users with the specified roles
    const usersWithRoles = await User.find({
      role: { $in: rolesToInclude }
    });

    // Include users with roles
    const usersToAdd = usersWithRoles.map(user => user._id.toString());
    const uniqueUsers = new Set([...selectedUsers, ...usersToAdd]);

    // Add req.user._id if it's not already in the set
    if (!uniqueUsers.has(req.user._id.toString())) {
      uniqueUsers.add(req.user._id.toString());
    }

    // Create new business loan lead
    const newLead = new BusinessLoanLead({
      service,
      client: clientId,
      selectedUsers: Array.from(uniqueUsers),
      stage,
      description,
      source,
      labels,
      createdby: req.user._id,
      updatedby: req.user._id,
    });

    await newLead.save();

    // Log activity
    const activityLog = await logActivity(newLead._id, 'BusinessLoanLead', 'create', req.user._id, `Created a new business loan lead by ${req.user.name}`);

    // Update lead with activity log ID
    newLead.activityLogs.push(activityLog._id);
    await newLead.save();

    res.status(201).json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: error.message });
  }
});



// Get all business loan leads where req.user._id is included in selectedUsers
router.get('/get-all-business-leads', isAuth, async (req, res) => {
  try {
    const leads = await BusinessLoanLead.find({
      selectedUsers: req.user._id // Filter leads where req.user._id is in selectedUsers
    })
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
router.put('/transfer-lead/:leadId/:leadType',  async (req, res) => {
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


router.post('/discussions', isAuth, async (req, res) => {
  try {
    const { _id: userId } = req.user; // Extract user ID from req.user
    
    const discussion = new Discussion({
      user: userId, // Assign user ID to discussion
      message: req.body.message,
      leadType: req.body.leadType,
      lead: req.body.lead
    });

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


// Get single business loan lead by ID
router.get('/get-business-lead/:id', isAuth, async (req, res) => {
  try {
    // Find the lead by ID and populate fields
    const lead = await BusinessLoanLead.findById(req.params.id)
      .populate('client', 'name') // Populate client with name only
      .populate('selectedUsers', 'name') // Populate selectedUsers with name only
      .populate({
        path: 'activityLogs',
        select: 'action details timestamp', // Select only action and details fields from activity logs
        populate: { path: 'userId', select: 'name' } // Populate user field in activity logs with name
      })
      .populate({
        path: 'discussions',
        populate: { path: 'user', select: 'name' } // Populate user field in discussions with name
      });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check if the requesting user is included in selectedUsers
    const isAuthorized = lead.selectedUsers.some(user => user._id.equals(req.user._id));

    if (!isAuthorized) {
      return res.status(403).json({ error: 'You are not authorized to view this lead' });
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Update lead stage
router.put('/update-lead-stage/:id', isAuth, async (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;

  try {
      // Find the lead by ID to get the previous stage
      const lead = await BusinessLoanLead.findById(id).populate('client');
      if (!lead) {
          return res.status(404).json({ error: 'Lead not found' });
      }

      const isAuthorized = lead.selectedUsers.some(user => user._id.equals(req.user._id));

      if (!isAuthorized) {
        return res.status(403).json({ error: 'You are not authorized to update the lead of stage' });
      }
  
      
      // Store previous stage
      const previousStage = lead.stage;
      // Update the lead stage
      lead.stage = stage;
      const updatedLead = await lead.save();

      // Log activity
      const activityLog = await logActivity(updatedLead._id, 'BusinessLoanLead', 'update', req.user._id, `Updated lead stage from ${previousStage} to ${stage} by ${req.user.name}.`);

      // Push activity log ID into lead's activityLogs array
      updatedLead.activityLogs.push(activityLog._id);
      await updatedLead.save();
      const clientName = lead.client ? lead.client.name : 'Unknown Client';
      // Emit notification to all selectedUsers
      const io = getIO();
      lead.selectedUsers.forEach(userId => {
          const notification = new Notification({
              sender: req.user._id,
              receiver: userId,
              entityType: 'BusinessLoanLead',
              entityId: updatedLead._id,
              message: `Lead stage of ${clientName} has been updated from ${previousStage} to ${stage} by ${req.user.name}.`,
          });
          notification.save().then(() => {
              io.to(userId.toString()).emit('notifications', {
                  message: notification.message,
                  leadId: notification.entityId,
                  entityType: notification.entityType,
              });
          });
      });

      res.status(200).json(updatedLead);
  } catch (error) {
      console.error('Error updating lead stage:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


 

module.exports = router;
