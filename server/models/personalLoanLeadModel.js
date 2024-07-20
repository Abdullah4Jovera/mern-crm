const mongoose = require('mongoose');
const { Schema } = mongoose;

const personalLoanLeadSchema = new Schema({
  service: {
    type: String, 
    required: true,
    enum: ['Personal Loan']
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
    enum: ['New Lead', 'Marketing Lead', 'Rejected',  'Follow Up', 'Under Calculation',  'Final Discussion', 'Service App Req'],
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
},


 { timestamps: true });

const PersonalLoanLead = mongoose.model('PersonalLoanLead', personalLoanLeadSchema);

module.exports = PersonalLoanLead;
