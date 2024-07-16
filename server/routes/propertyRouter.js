const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dn1oz4vt9',
    api_key: '376365558848471',
    api_secret: 'USb46ns9p4V7fAWMppTP54xiv00'
});

// Configure multer storage with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'properties',
        format: async (req, file) => 'jpeg', // supports promises as well
        public_id: (req, file) => `${Date.now()}-${file.originalname}`,
    },
});

const upload = multer({ storage: storage });

const Property = require('../models/propertyModel');

const router = express.Router();

// Create a new property
router.post('/post-property', upload.fields([{ name: 'Mainimage', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
    try {
        const {
            title, location, address, price, description, propertyType, bedRooms,
            bathrooms, builtUp, plotSize, furnishing, completion, usage, ownership,
            income, purpose,contactPersonName, contact, truCheck, features, email, totalFloors,
            totalParkingSpace, elevators
        } = req.body;

        // Get the last created property
        const lastProperty = await Property.findOne({}, {}, { sort: { 'createdAt': -1 } });

        let lastReferenceNo = 0;
        if (lastProperty && lastProperty.referenceNumber) {
            lastReferenceNo = parseInt(lastProperty.referenceNumber.split('-')[2], 10);
        }

        const newReferenceNumber = `Jover-Property-${lastReferenceNo + 1}`;

        let Mainimage = '';
        if (req.files['Mainimage']) {
            Mainimage = req.files['Mainimage'][0].path;
        }

        const images = [];
        if (req.files['images']) {
            req.files['images'].forEach(file => {
                images.push(file.path);
            });
        }

        const newProperty = new Property({
            title,
            location,
            address,
            price,
            Mainimage,
            images,
            purpose,
            description,
            propertyType,
            bedRooms,
            bathrooms,
            builtUp,
            plotSize,
            furnishing,
            completion,
            usage,
            ownership,
            income,
            contactPersonName,
            contact,
            truCheck,
            features,
            email,
            referenceNumber: newReferenceNumber,
            totalFloors,
            totalParkingSpace,
            elevators
        });

        await newProperty.save();
        res.status(201).json(newProperty);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Get all properties
router.get('/all-properties', async (req, res) => {
    try {
        const properties = await Property.find();
        res.status(200).json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;
