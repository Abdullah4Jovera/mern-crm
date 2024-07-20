const express = require('express');
const router = express.Router();
const PersonalLoan = require('../models/personalLoanModel');
const User = require('../models/userModel');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { isAuth, hasRole } = require('../utils');
const Notification = require('../models/notificationModel');
const { getIO } = require('../socket');
const storage = multer.diskStorage({});
const upload = multer({ storage });
cloudinary.config({
    cloud_name: 'dn1oz4vt9', 
    api_key: '376365558848471',
    api_secret: 'USb46ns9p4V7fAWMppTP54xiv00'
});
// POST route to apply for a personal loan
router.post('/apply-for-personal-loan', isAuth ,hasRole([
  'user', 

]), async (req, res) => {
    try {
      const { companyName, loanAmount, monthlySalary, anyLoan, message ,previousloanAmount } = req.body;
      const userId = req.user._id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if the user has provided all required profile information
      if (!user.name || !user.email || !user.contactNumber) {
        return res.status(400).json({ error: 'Incomplete profile. Please provide your name, email, and contact number before applying for a loan' });
      }
  
      const existingLoan = await PersonalLoan.findOne({ userId });
      if (existingLoan) {
          return res.status(400).json({ error: 'User has already applied for a Personal loan' });
      }
  
      // Create a new personal loan application
      const personalLoan = new PersonalLoan({
        companyName,
        loanAmount,
        monthlySalary,
        anyLoan,
        message,
        userId,
        previousloanAmount
      });
  
     
      await personalLoan.save();
  
    
  
      res.status(201).json({ message: 'Personal loan application submitted successfully' });
    } catch (error) {
      console.error('Error submitting personal loan application:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  router.put('/upload-documents/:loanId', isAuth, hasRole([
    'user', 
  
  ]), upload.array('documents', 5), async (req, res) => {
    try {
        const { loanId } = req.params;
        const userId = req.user._id; // Get user ID from req.user
      
        // Find the personal loan by ID
        const personalLoan = await PersonalLoan.findById(loanId);
        if (!personalLoan) {
            return res.status(404).json({ error: 'Personal loan not found' });
        }

        // Check if the user ID matches the user ID associated with the loan
        if (personalLoan.userId.toString() !== userId.toString()) {
          return res.status(401).json({ error: 'Unauthorized. User does not have permission to upload documents for this loan' });
      }
      

        // Upload new documents to Cloudinary
        const uploadedDocuments = [];
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path);
            uploadedDocuments.push(result.secure_url);
        }

        // Append new documents to existing documents
        personalLoan.documents = [...personalLoan.documents, ...uploadedDocuments];

        // Save the updated documents for the personal loan
        await personalLoan.save(); 

        res.status(200).json({ message: 'Documents uploaded successfully' });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET route to get all personal loans (for superadmin)
router.get('/all-personal-loans', isAuth , hasRole([
  'personalloanmanger', 'superadmin'

]),  async (req, res) => {
  try {
      // Find all personal loans and populate the userId field with name and email only
      const personalLoans = await PersonalLoan.find().populate({
          path: 'userId',
          select: 'name email'
      });
      res.status(200).json({ personalLoans });
  } catch (error) {
      console.error('Error fetching all personal loans:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// PUT route to update the status of a personal loan (for superadmin)
router.put('/update-loan-status/:loanId', isAuth, hasRole([
  'personalloanmanger', 'superadmin'

]), async (req, res) => {
  try {
      const { loanId } = req.params;
      const { status } = req.body;

      // Check if the provided status is valid
      if (!['Request To Call', 'Submit Documents', 'Follow Up', 'Request To Signature', 'Reject'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status provided' });
      }

      // Find the personal loan by ID
      const loan = await PersonalLoan.findById(loanId);
      if (!loan) {
          return res.status(404).json({ error: 'Personal loan not found' });
      }

      // Update the status
      loan.status = status;
      await loan.save();

      // Find the user who applied for the loan
      const user = await User.findById(loan.userId);
      if (user) {
          // Create a notification for the user
          const notification = new Notification({
              sender: req.user._id,
              receiver: user._id,
              entityType: 'personal_loan',
              entityId: loan._id,
              message: `Loan status has been changed to ${status}`,
          });
          await notification.save();

          // Emit real-time notification to the user
          const io = getIO();
          io.to(user._id.toString()).emit('loanStatusChanged', {
              message: notification.message,
              loanId: notification.entityId,
          });
      }

      res.status(200).json({ message: 'Loan status updated successfully' });
  } catch (error) {
      console.error('Error updating loan status:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;