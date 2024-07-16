const mongoose = require('mongoose');

const helpAndSupportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supportType: { 
      type: String, 
      enum: ['BL', 'ML', 'PL', 'RL',], 
      required: true 
    },
    message: { type: String, required: true },
    process: { type: String, required: true, default: 'pending' }
  },
  {
    timestamps: true,
  }
);

const HelpAndSupport = mongoose.model('HelpAndSupport', helpAndSupportSchema);
module.exports = HelpAndSupport;
