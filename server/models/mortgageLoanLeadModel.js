const mongoose = require('mongoose');
const { Schema } = mongoose;

const mortgageLoanLeadSchema = new Schema({
  service: {
    type: String, 
    required: true,
    enum: ['Mortgage Loan']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  selectedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true, // Optional, depends on your specific requirements
  }],  
  stage: {
    type: String,
    required: true,
    enum: ['New Lead', 'Marketing Lead', 'Rejected',  'Follow Up', 'Pending','Service App Req'],
    default: 'New Lead',
  },
  description: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
    enum: ['Marketing', 'Telesales', 'Other'],
  },
  labels: {
    type: [String], // Array of strings for labels
    default: [], // Default to an empty array
  },
  transferredTo: {
    type: {
      leadType: String, 
      leadId: mongoose.Schema.Types.ObjectId, 
    },
    default: null,
  },
  transferredfrom: {
    type: {
      leadType: String, 
      leadId: mongoose.Schema.Types.ObjectId, 
    },
    default: null,
  },
  createdby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  updatedby: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  }],
}, { timestamps: true });

const MortgageLoanLead = mongoose.model('MortgageLoanLead', mortgageLoanLeadSchema);

module.exports = MortgageLoanLead;
