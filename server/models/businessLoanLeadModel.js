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
    enum: ['New Lead', 'Marketing Lead', 'Rejected', 'Follow Up', 'Under Calculation', 'Final Discussion', 'Service App Req'],
    default: 'New Lead',
  },
  description: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
    enum: ['Marketing', 'Telesales', 'Self'],
  },
  subsource: {
    type: String,
    required: true,
    enum: ['Mobileapp', 'Facebook', 'Tiktok','Jovera'],
    default: 'Mobileapp'
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
  transferredFrom: {
    type: {
      leadType: String,
      leadId: mongoose.Schema.Types.ObjectId,
    },
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true,
  },
  discussions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
  }],
  activityLogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityLog', 
  }],
  files: [{
    url: String,
    filename: String
  }],
  createdby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  isconverted: { // Added field
    type: Boolean,
    default: false, // Default value set to true
  },
  updatedby: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  }],
}, { timestamps: true });

const BusinessLoanLead = mongoose.model('BusinessLoanLead', businessLoanLeadSchema);

module.exports = BusinessLoanLead;
