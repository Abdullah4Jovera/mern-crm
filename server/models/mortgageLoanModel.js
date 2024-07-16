const mongoose = require('mongoose');

const mortgageLoanSchema = new mongoose.Schema({
  typeOfProperty: {
    type: String,
    required: true
  },
  propertyLocation: {
    type: String,
    required: true
  },
  monthlyIncome: {
    type: Number,
    required: true
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

const MortgageLoan = mongoose.model('MortgageLoan', mortgageLoanSchema);

module.exports = MortgageLoan;