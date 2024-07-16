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
}, { timestamps: true });

const RealEstateLoanLead = mongoose.model('RealEstateLoanLead', realEstateLoanLeadSchema);

module.exports = RealEstateLoanLead;
