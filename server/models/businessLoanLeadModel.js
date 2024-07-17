const mongoose = require('mongoose');
const { Schema } = mongoose;

const businessLoanLeadSchema = new Schema({
  service: {
    type: String, 
    required: true,
    enum: ['Business Loan'],
    default: 'Business Loan',
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  selectedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }], 
  stage: {
    type: String,
    required: true,
    enum: ['New Lead', 'Marketing Lead', 'Rejected', 'Closed', 'Follow Up', 'Under Calculation', 'Not Eligible', 'Final Discussion', 'Pending', 'Interested'],
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
    type: [String], 
    default: [], 
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
}, { timestamps: true });

const BusinessLoanLead = mongoose.model('BusinessLoanLead', businessLoanLeadSchema);

module.exports = BusinessLoanLead;
