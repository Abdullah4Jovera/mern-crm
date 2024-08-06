const mongoose = require('mongoose');
const { Schema } = mongoose;

const realEstateLoanLeadSchema = new Schema({
  service: {
    type: String, 
    required: true,
    enum: ['Real Estate Loan']
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
    enum: ['New Lead', 'Marketing Lead', 'Follow Up',  'Pending', 'Interested', 'Service App Req', 'Rejected', ],
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
  isconverted: { 
    type: Boolean,
    default: false, 
  },
  delstatus: {
    type: Boolean,
    default: false, 
  },
  updatedby: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  }],
}, { timestamps: true });

const RealEstateLoanLead = mongoose.model('RealEstateLoanLead', realEstateLoanLeadSchema);

module.exports = RealEstateLoanLead;
