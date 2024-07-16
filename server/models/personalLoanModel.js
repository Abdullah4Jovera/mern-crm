const mongoose = require('mongoose');

const personalLoanSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  loanAmount: {
    type: Number,
    required: true
  },
  monthlySalary: {
    type: Number,
    required: true
  },
  anyLoan: {
    type: Boolean,
    default: false
  },
  previousloanAmount: {
    type: Number,
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

const PersonalLoan = mongoose.model('PersonalLoan', personalLoanSchema);

module.exports = PersonalLoan;