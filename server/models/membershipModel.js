const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    // enum: ['Silver', 'Gold', 'Diamond'],
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    // required: true
  },
  paymentInformation: {
    // Define your payment information fields here
    // For example:
    paymentMethod: {
      type: String,
      required: true
    },
    transactionId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }
});

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;
