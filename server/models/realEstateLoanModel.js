const mongoose = require('mongoose');

const realEstateLoanSchema = new mongoose.Schema({
  propertyLocation: {
    type: String,
    required: true
  },
  propertyPurpose: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
  },
  propertyRange: {
    type: String,
  },
  propertyContains: {
    type: String,
  },
  message: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: { type: String , default: 'Mobile App'},
  status: { type: String, enum: ['Request To Call', 'Submit Documents', 'Follow Up', 'Request To Signature', 'Reject' ], default: 'Request To Call' },
  applicationDate: { type: Date, default: Date.now },
  delStatus : { type: Boolean, default: false },
  documents: [
    {
      type: String
    }
  ]

});

const RealEstateLoan = mongoose.model('RealEstateLoan', realEstateLoanSchema);

module.exports = RealEstateLoan;