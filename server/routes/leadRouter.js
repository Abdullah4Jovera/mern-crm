const express = require('express');
const mongoose = require('mongoose');
const BusinessLoanLead = require('../models/businessLoanLeadModel');
const PersonalLoanLead = require('../models/personalLoanLeadModel');
const RealEstateLoanLead = require('../models/realEstateLoanLeadModel');
const MortgageLoanLead = require('../models/mortgageLoanLeadModel');
const { isAuth } = require('../utils');

const router = express.Router();
const populateOptions = [
    {
      path: 'client',
      select: 'name email contactNumber image',
    },
    {
      path: 'selectedUsers',
      select: 'name role image',
    },
    {
      path: 'createdBy',
      select: 'name role',
    },
    {
      path: 'updatedBy',
      select: 'name email',
    },
    {
      path: 'discussions',
    },
    {
      path: 'activityLogs',
    },
    // {
    //   path: 'createdby',
    //   select: 'name email',
    // },
    // {
    //   path: 'updatedby',
    //   select: 'name email',
    // } 
  ];
  
  // Get all leads from all collections
  router.get('/all-leads', isAuth ,async (req, res) => {
    try {
      const businessLoanLeads = await BusinessLoanLead.find({
        selectedUsers: req.user._id,
        delstatus: false  
      }).populate(populateOptions);
      const personalLoanLeads = await PersonalLoanLead.find({
        selectedUsers: req.user._id,
        delstatus: false  
      }).populate(populateOptions);
      const realEstateLoanLeads = await RealEstateLoanLead.find({
        selectedUsers: req.user._id,
        delstatus: false 
      }).populate(populateOptions);
      const mortgageLoanLeads = await MortgageLoanLead.find({
        selectedUsers: req.user._id,
        delstatus: false  
      }).populate(populateOptions);
  
      const allLeads = [
        ...businessLoanLeads,
        ...personalLoanLeads,
        ...realEstateLoanLeads,
        ...mortgageLoanLeads,
      ];
  
      res.status(200).json(allLeads);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching leads', error });
    }
  });
// Add other routes for creating, updating, deleting leads as needed

module.exports = router;
