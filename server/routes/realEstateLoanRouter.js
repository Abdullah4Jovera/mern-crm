const express = require('express');
const router = express.Router();
const RealEstateLoan = require('../models/realEstateLoanModel');
const User = require('../models/userModel');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { isAuth, isUser, isSuperAdmin, isRELM } = require('../utils');
const Notification = require('../models/notificationModel');
const { getIO } = require('../socket');
const storage = multer.diskStorage({});
const upload = multer({ storage });
cloudinary.config({
    cloud_name: 'dn1oz4vt9',
    api_key: '376365558848471',
    api_secret: 'USb46ns9p4V7fAWMppTP54xiv00'
});

// POST route to apply for a real estate loan
router.post('/apply-for-real-estate-loan', isAuth, isUser,  async (req, res) => {
    try {
        const { propertyLocation, propertyPurpose, message, propertyType, propertyRange, propertyContains } = req.body;

        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user has provided all required profile information
        if (!user.name || !user.email || !user.contactNumber) {
            return res.status(400).json({ error: 'Incomplete profile. Please provide your name, email, and contact number before applying for a loan' });
        }
        // Check if the user has already applied for a business finance loan
        const existingLoan = await RealEstateLoan.findOne({ userId });
        if (existingLoan) {
            return res.status(400).json({ error: 'User has already applied for a Real Estate loan' });
        }

        // Create a new real estate loan application
        const realEstateLoan = new RealEstateLoan({
            propertyLocation,
            propertyPurpose,
            message,
            userId,
            propertyType,
            propertyRange,
            propertyContains
        });

        // Save the real estate loan application
        await realEstateLoan.save();

        // // Push the ID of the loan into the user's loans array
        // user.realEstateLoans.push(realEstateLoan._id);
        // await user.save();

        res.status(201).json({ message: 'Real estate loan application submitted successfully' });
    } catch (error) {
        console.error('Error submitting real estate loan application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/upload-documents/:loanId', isAuth, isUser, upload.array('documents', 5), async (req, res) => {
    try {
        const { loanId } = req.params;
        const userId = req.user._id;
        // Find the real estate loan by ID
        const realEstateLoan = await RealEstateLoan.findById(loanId);
        if (!realEstateLoan) {
            return res.status(404).json({ error: 'Real estate loan not found' });
        }
        if (realEstateLoan.userId.toString() !== userId.toString()) {
            return res.status(401).json({ error: 'Unauthorized. User does not have permission to upload documents for this loan' });
        }
        // Ensure realEstateLoan.documents is an array
        if (!Array.isArray(realEstateLoan.documents)) {
            realEstateLoan.documents = [];
        }
        // Upload new documents to Cloudinary
        const uploadedDocuments = [];
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path);
            uploadedDocuments.push(result.secure_url);
        }

        // Append new documents to existing documents
        realEstateLoan.documents.push(...uploadedDocuments);

        // Save the updated documents for the real estate loan
        await realEstateLoan.save();

        res.status(200).json({ message: 'Documents uploaded successfully' });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET route to get all real estate loans (for superadmin)
router.get('/all-real-estate-loans', isAuth , isRELM,  async (req, res) => {
    try {
        // Find all real estate loans and populate the userId field with name and email only
        const realEstateLoans = await RealEstateLoan.find().populate({
            path: 'userId',
            select: 'name email'
        });
        res.status(200).json({ realEstateLoans });
    } catch (error) {
        console.error('Error fetching all real estate loans:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// PUT route to update the status of a real estate loan (for superadmin)
router.put('/update-loan-status/:loanId', isAuth, isSuperAdmin, async (req, res) => {
    try {
        const { loanId } = req.params;
        const { status } = req.body;

        // Check if the provided status is valid
        if (!['Request To Call', 'Submit Documents', 'Follow Up', 'Request To Signature', 'Reject' ].includes(status)) {
            return res.status(400).json({ error: 'Invalid status provided' });
        }

        // Find the real estate loan by ID
        const loan = await RealEstateLoan.findById(loanId);
        if (!loan) {
            return res.status(404).json({ error: 'Real estate loan not found' });
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
                entityType: 'real_estate_loan',
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
