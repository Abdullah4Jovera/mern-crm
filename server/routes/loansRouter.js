const express = require('express');
const router = express.Router();
const BusinessFinanceLoan = require('../models/businessFinanceLoanModel');
const MortgageLoan = require('../models/mortgageLoanModel');
const PersonalLoan = require('../models/personalLoanModel');
const RealEstateLoan = require('../models/realEstateLoanModel');
const { isAuth, hasRole  } = require('../utils');
const User = require('../models/userModel');

// Route to get all types of loans for a specific user
router.get('/my-loans', isAuth, hasRole([
  'user',

]), async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Find loans associated with the user ID
    const businessFinanceLoans = await BusinessFinanceLoan.find({ userId });
    const mortgageLoans = await MortgageLoan.find({ userId });
    const personalLoans = await PersonalLoan.find({ userId });
    const realEstateLoans = await RealEstateLoan.find({ userId });
    
    res.json({
      businessFinanceLoans,
      mortgageLoans,
      personalLoans,
      realEstateLoans
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to get all types of loans for all users (for superadmin)
router.get('/all-loans', isAuth, hasRole([
  'superadmin',

]),async (req, res) => {
  try {
    // Find all loans
    const allBusinessFinanceLoans = await BusinessFinanceLoan.find();
    const allMortgageLoans = await MortgageLoan.find();
    const allPersonalLoans = await PersonalLoan.find();
    const allRealEstateLoans = await RealEstateLoan.find();
    
    res.json({
      allBusinessFinanceLoans,
      allMortgageLoans,
      allPersonalLoans,
      allRealEstateLoans
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to get a single loan information for a specific user
router.get('/loan/:loanId', isAuth, hasRole([
  'user',

]), async (req, res) => {
  try {
    const userId = req.user._id;
    const { loanType } = req.body;
    const { loanId } = req.params;
    let loan;

    switch (loanType) { 
      case 'businessFinanceLoans':
        loan = await BusinessFinanceLoan.findOne({ _id: loanId, userId });
        break;
      case 'mortgageLoans':
        loan = await MortgageLoan.findOne({ _id: loanId, userId });
        break;
      case 'personalLoans':
        loan = await PersonalLoan.findOne({ _id: loanId, userId });
        break;
      case 'realEstateLoans':
        loan = await RealEstateLoan.findOne({ _id: loanId, userId });
        break;
      default:
        return res.status(400).json({ error: 'Invalid loan type' });
    }

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
