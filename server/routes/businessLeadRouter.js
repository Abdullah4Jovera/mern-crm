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
  const { service='Business Loan', client, selectedUsers = [], stage, description, source, labels, clientDetails } = req.body;

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
      selectedUsers: req.user._id,
      delstatus: false  // Filter leads where req.user._id is in selectedUsers
    })
      .populate('client', 'name email contactNumber') // Populate client with name, email, and contactNumber
      .populate('selectedUsers', 'name image') // Populate selectedUsers with name
      .populate({
        path: 'activityLogs',
        select: 'action details timestamp', // Select only action, details, and timestamp fields from activity logs
        populate: { path: 'userId', select: 'name' } // Populate userId field in activity logs with name
      })
      .populate({
        path: 'discussions',
        populate: { path: 'user', select: 'name' } // Populate user field in discussions with name
      });

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Transfer a business lead to a personal lead
router.put('/transfer-lead/:leadId/:leadType', isAuth, async (req, res) => {
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
    const businessLead = await BusinessLoanLead.findById(leadId).populate('client');

    if (!businessLead) {
      return res.status(404).json({ error: 'Business lead not found' });
    }

    const isAuthorized = businessLead.selectedUsers.some(user => user._id.equals(req.user._id));
    if (!isAuthorized) {
      return res.status(403).json({ error: 'You are not authorized to transfer this lead' });
    }

    // Create a new lead of the specified type
    const newLead = new LeadModel({
      service: serviceType,
      client: businessLead.client,
      selectedUsers: businessLead.selectedUsers,
      // stage: businessLead.stage,
      description: businessLead.description,
      source: businessLead.source,
      labels: businessLead.labels,
      transferredfrom: {
        leadType: 'BusinessLoanLead',
        leadId: businessLead._id,
      },
      createdby:req.user._id
    });

    await newLead.save();

    // Update the business lead with transfer information
    businessLead.transferredTo = {
      leadType: leadType === 'RealEstate' ? 'RealEstateLoanLead' : `${leadType}LoanLead`,
      leadId: newLead._id,
    };

    await businessLead.save();

    // Log activity
    const activityLog = await logActivity(
      businessLead._id,
      'BusinessLoanLead',
      'transfer',
      req.user._id,
      `Transferred lead to ${serviceType} by ${req.user.name}.`
    );

    // Push activity log ID into business lead's activityLogs array
    businessLead.activityLogs.push(activityLog._id);
    await businessLead.save();

    const clientName = businessLead.client ? businessLead.client.name : 'Unknown Client';

    // Emit notification to all selectedUsers
    const io = getIO();
    const notifications = [];

    for (const userId of businessLead.selectedUsers) {
      const notification = new Notification({
        sender: req.user._id,
        receiver: userId,
        entityType: 'BusinessLoanLead',
        entityId: businessLead._id,
        message: `Lead of ${clientName} has been transferred to ${serviceType} by ${req.user.name}.`,
      });

      // Save the notification and collect it
      const savedNotification = await notification.save();
      notifications.push(savedNotification);

      // Emit notification with ID
      io.to(userId.toString()).emit('notifications', {
        message: savedNotification.message,
        leadId: savedNotification.entityId,
        entityType: savedNotification.entityType,
        notificationId: savedNotification._id // Include the notification ID
      });
    }

    res.status(200).json({ message: 'Lead transferred successfully', transferredLead: newLead });
  } catch (error) {
    console.error('Error transferring lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

 // Get single business loan lead by ID
router.get('/get-business-lead/:id', isAuth, async (req, res) => {
  try {
    // Find the lead by ID and populate fields
    const lead = await BusinessLoanLead.findById(req.params.id)
      .populate('client', 'name email contactNumber') // Populate client with name only
      .populate('selectedUsers', 'name role image ') // Populate selectedUsers with name only
      .populate({
        path: 'activityLogs',
        select: 'action details timestamp', // Select only action and details fields from activity logs
        populate: { path: 'userId', select: 'name image' } // Populate user field in activity logs with name
      })
      .populate({
        path: 'discussions',
        populate: { path: 'user', select: 'name image' } // Populate user field in discussions with name
      });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    if (lead.delstatus === true) {
      return res.status(403).json({ error: 'The lead has been deleted' });
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
      return res.status(403).json({ error: 'You are not authorized to update the lead stage' });
    }

    // Store previous stage
    const previousStage = lead.stage;
    // Update the lead stage
    lead.stage = stage;
    const updatedLead = await lead.save();

    // Log activity
    const activityLog = await logActivity(
      updatedLead._id,
      'BusinessLoanLead',
      'update',
      req.user._id,
      `Updated lead stage from ${previousStage} to ${stage} by ${req.user.name}.`
    );

    // Push activity log ID into lead's activityLogs array
    updatedLead.activityLogs.push(activityLog._id);
    await updatedLead.save();

    const clientName = lead.client ? lead.client.name : 'Unknown Client';

    // Emit notification to all selectedUsers
    const io = getIO();
    const notifications = [];

    for (const userId of lead.selectedUsers) {
      const notification = new Notification({
        sender: req.user._id,
        receiver: userId,
        entityType: 'BusinessLoanLead',
        entityId: updatedLead._id,
        message: `Lead stage of ${clientName} has been updated from ${previousStage} to ${stage} by ${req.user.name}.`,
      });

      // Save the notification and collect it
      const savedNotification = await notification.save();
      notifications.push(savedNotification);
      
      // Emit notification with ID
      io.to(userId.toString()).emit('notifications', {
        message: savedNotification.message,
        leadId: savedNotification.entityId,
        entityType: savedNotification.entityType,
        notificationId: savedNotification._id // Include the notification ID
      });
    }

    res.status(200).json(updatedLead);
  } catch (error) {
    console.error('Error updating lead stage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//// discussions 
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
    const businessLoanLead = await BusinessLoanLead.findById(leadId).populate('selectedUsers').populate('client');
    if (!businessLoanLead) {
      return res.status(404).send({ error: 'BusinessLoanLead not found' });
    }
    businessLoanLead.discussions.push(discussion._id);
    await businessLoanLead.save();

    // Emit notification to all selectedUsers
    const io = getIO();
    const notifications = [];

    for (const user of businessLoanLead.selectedUsers) {
      const notification = new Notification({
        sender: userId,
        receiver: user._id,
        entityType: 'BusinessLoanLead',
        entityId: req.body.lead,
        message: `New discussion added to the lead of ${businessLoanLead.client.name} by ${req.user.name}."${req.body.message}"`,
      });

      // Save the notification and collect it
      const savedNotification = await notification.save();
      notifications.push(savedNotification);
      
      // Emit notification with ID
      io.to(user._id.toString()).emit('notifications', {
        message: savedNotification.message,
        leadId: savedNotification.entityId,
        entityType: savedNotification.entityType,
        notificationId: savedNotification._id // Include the notification ID
      });
    }

    res.status(201).send(discussion);
  } catch (err) {
    console.error('Error creating discussion:', err);
    res.status(400).send(err);
  }
});
// Edit a lead (new route)
router.put('/edit-lead/:id', isAuth, async (req, res) => {
  const { id } = req.params;
  const { service, clientId, clientDetails, selectedUsers = [], stage, description, source, labels } = req.body;

  try {
    
    let changeDetails = {};
    // Fetch the existing lead and populate client and selectedUsers
    const lead = await BusinessLoanLead.findById(id).populate('client').populate('selectedUsers');
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
   

    // Check if the user is authorized to edit this lead
    const isAuthorized = lead.selectedUsers.some(user => user._id.equals(req.user._id));
    if (!isAuthorized) {
      return res.status(403).json({ error: 'You are not authorized to edit this lead' });
    }

    // Capture original values
    const originalLead = {
      service: lead.service,
      client: lead.client ? lead.client.toObject() : null,
      selectedUsers: lead.selectedUsers.map(user => user._id.toString()),
      stage: lead.stage,
      description: lead.description,
      source: lead.source,
      labels: lead.labels
    };

    // Update lead fields
    if (service !== undefined) lead.service = service;
    if (clientId !== undefined) lead.client = clientId;
    if (stage !== undefined) lead.stage = stage;
    if (description !== undefined) lead.description = description;
    if (source !== undefined) lead.source = source;
    if (labels !== undefined) lead.labels = labels;
    lead.updatedby = req.user._id;

    // Handle client details update
    if (clientDetails && clientId) {
      const client = await User.findById(clientId);
      if (client) {
        const originalClientDetails = {
          name: client.name,
          email: client.email,
          contactNumber: client.contactNumber
        };

        // Update client details
        client.name = clientDetails.name || client.name;
        client.email = clientDetails.email || client.email;
        client.contactNumber = clientDetails.contactNumber || client.contactNumber;
        await client.save();

        // Capture updated client details
        const updatedClientDetails = {
          name: client.name,
          email: client.email,
          contactNumber: client.contactNumber
        };

        // Identify changes in client details
        let clientChangeDetails = '';
        Object.keys(originalClientDetails).forEach(key => {
          if (originalClientDetails[key] !== updatedClientDetails[key]) {
            clientChangeDetails += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${originalClientDetails[key] || 'None'} → ${updatedClientDetails[key] || 'None'}, `;
          }
        });

        // Remove trailing comma and space
        clientChangeDetails = clientChangeDetails.trim().replace(/,$/, '');

        // Add client change details to the change summary
        if (clientChangeDetails) {
          changeDetails['client'] = `Client details changed: ${clientChangeDetails}`;
        }
      }
    }

    // Define roles to include
    const rolesToInclude = [
      'superadmin',
      'CEO',
      'MD',
      'businessfinanceloanmanger',
      'businessfinanceloanHOD',
     
    ];

    // Find users with the specified roles
    const usersWithRoles = await User.find({ role: { $in: rolesToInclude } });
    const usersWithRolesIds = usersWithRoles.map(user => user._id.toString());
    let uniqueUsers = new Set([...selectedUsers, ...usersWithRolesIds]);

    // Check if the source is Marketing and adjust selected users
    if (source === 'Marketing') {
      // Include marketing managers
      const marketingManagers = await User.find({ role: 'marketingmanager' });
      const marketingManagerIds = marketingManagers.map(user => user._id.toString());
      uniqueUsers = new Set([...uniqueUsers, ...marketingManagerIds]);

      // Remove telesales team leaders if present
      const telesalesTeamLeaders = await User.find({ role: 'telesaleteamleader' });
      const telesalesTeamLeaderIds = telesalesTeamLeaders.map(user => user._id.toString());
      uniqueUsers = new Set([...uniqueUsers].filter(userId => !telesalesTeamLeaderIds.includes(userId)));
    }

    // Check if the source is Telesales and adjust selected users
    if (source === 'Telesales') {
      const marketingManagers = await User.find({ role: 'marketingmanager' });
      const marketingManagerIds = marketingManagers.map(user => user._id.toString());
      uniqueUsers = new Set([...uniqueUsers].filter(userId => !marketingManagerIds.includes(userId)));
    }

    // Add req.user._id if it's not already in the set
    if (!uniqueUsers.has(req.user._id.toString())) {
      uniqueUsers.add(req.user._id.toString());
    }

    lead.selectedUsers = Array.from(uniqueUsers);

    // Save updated lead
    const updatedLead = await lead.save();

    // Initialize change details
    // let changeDetails = {};

    // Fetch updated lead with populated client and selected users
    const updatedLeadPopulated = await BusinessLoanLead.findById(id).populate('client').populate('selectedUsers');
    const updatedClientDoc = updatedLeadPopulated.client;
    const updatedClient = updatedClientDoc ? updatedClientDoc.toObject() : null;
    const updatedUserIds = updatedLeadPopulated.selectedUsers.map(user => user._id.toString());

    // Identify added and removed users
    const addedUsers = updatedUserIds.filter(id => !originalLead.selectedUsers.includes(id));
    const removedUsers = originalLead.selectedUsers.filter(id => !updatedUserIds.includes(id));

    // Get user details
    const getUserNames = async (userIds) => {
      const users = await User.find({ _id: { $in: userIds } });
      return users.map(user => user.name);
    };

    const addedUserNames = await getUserNames(addedUsers);
    const removedUserNames = await getUserNames(removedUsers);

    // Identify changes in the lead
    Object.keys(originalLead).forEach(key => {
      if (key !== 'selectedUsers' && key !== 'client' && JSON.stringify(originalLead[key]) !== JSON.stringify(updatedLead[key])) {
        changeDetails[key] = `${originalLead[key]} → ${updatedLead[key]}`;
      }
    });

    if (addedUserNames.length > 0) {
      changeDetails['User Added in the lead '] = `Added: ${addedUserNames.join(', ')}`;
    }

    if (removedUserNames.length > 0) {
      changeDetails['Users Removed from the lead '] = `Removed: ${removedUserNames.join(', ')}`;
    }

    // Format the changes for notification
    const changes = Object.keys(changeDetails).map(key => `${key}: ${changeDetails[key]}`);

    // Prepare activity log message
    const activityLogMessage = `Edited business loan lead by ${req.user.name}. Changes: ${changes.join(', ')}`;
    const activityLog = await logActivity(updatedLead._id, 'BusinessLoanLead', 'edit', req.user._id, activityLogMessage);
    updatedLead.activityLogs.push(activityLog._id);
    await updatedLead.save();

    // Notify all selected users about the update
    const clientName = updatedClient ? updatedClient.name : 'Unknown Client';
    const io = getIO();

    // Create and save notifications
    const notifications = await Promise.all(
      lead.selectedUsers.map(async user => {
        const notificationMessage = `Business loan lead for ${clientName} has been updated by ${req.user.name}. Changes: ${changes.join(', ')}`;
        const notification = new Notification({
          sender: req.user._id,
          receiver: user._id,
          entityType: 'BusinessLoanLead',
          entityId: updatedLead._id,
          message: notificationMessage,
        });

        // Save notification and return saved instance
        return await notification.save();
      })
    );

    // Emit notifications with ID
    notifications.forEach(notification => {
      io.to(notification.receiver.toString()).emit('notifications', {
        message: notification.message,
        leadId: notification.entityId,
        entityType: notification.entityType,
        notificationId: notification._id // Include the notification ID
      });
    });

    res.status(200).json(updatedLead);
  } catch (error) {
    console.error('Error editing lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Update delstatus to true for a business loan lead and notify users
router.put('/update-delstatus/:id', isAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Find the lead by ID
    const lead = await BusinessLoanLead.findById(id).populate('selectedUsers').populate('client');
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check if the requesting user is included in selectedUsers
    const isAuthorized = lead.selectedUsers.some(user => user._id.equals(req.user._id));
    if (!isAuthorized) {
      return res.status(403).json({ error: 'You are not authorized to update this lead' });
    }

    // Update the delstatus field to true
    lead.delstatus = true;
    const updatedLead = await lead.save();

    // Prepare notification message
    const clientName = lead.client ? lead.client.name : 'Unknown Client';
    const notificationMessage = `Business loan lead for ${clientName} has been deleted by ${req.user.name}.`;

    // Create and save notifications
    const io = getIO();
    const notifications = await Promise.all(
      lead.selectedUsers.map(async user => {
        const notification = new Notification({
          sender: req.user._id,
          receiver: user._id,
          entityType: 'BusinessLoanLead',
          entityId: updatedLead._id,
          message: notificationMessage,
        });

        // Save notification and return saved instance
        return await notification.save();
      })
    );

    // Emit notifications with ID
    notifications.forEach(notification => {
      io.to(notification.receiver.toString()).emit('notifications', {
        message: notification.message,
        leadId: notification.entityId,
        entityType: notification.entityType,
        notificationId: notification._id // Include the notification ID
      });
    });

    res.status(200).json(updatedLead);
  } catch (error) {
    console.error('Error updating delstatus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
