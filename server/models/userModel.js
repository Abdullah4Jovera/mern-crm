const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    contactNumber: { type: String, unique: true, sparse: true },
    image: { type: String },
    otp: { type: String, default: null },
    otpExpiration: { type: Date, default: null },
    resetToken: { type: String, default: null }, 
    resetTokenExpiration: { type: Date, default: null },
    role: {
      type: String,
      enum: ['user', 'superadmin','CEO', 'MD', 
        'personalloanmanger', 'businessfinanceloanmanger', 'realestateloanmanger', 'mortgageloanmanger',
        'personalloanHOD','businessfinanceloanHOD','realestateloanHOD','mortgageloanHOD',
        'personalloancordinator','businessfinanceloancordinator','realestateloancordinator','mortgageloancordinator',
        'personalloanteamleader','businessfinanceloanteamleader','realestateloanteamleader','mortgageloanteamleader',
        'personalloansales','businessfinanceloansales','realestateloansales','mortgageloansales'
        
      ],
      default: 'user', 
      required: true,
    },
    googleId: { type: String, unique: true, sparse: true },
    delStatus: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    membership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership', 
      unique: true,
      sparse: true, 
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
