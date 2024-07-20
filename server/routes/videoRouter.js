const express = require('express');
const cloudinary = require('cloudinary').v2;
const Video = require('../models/videoModel');
const multer = require('multer');
const router = express.Router();
const {  isAuth , hasRole} = require('../utils');

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dn1oz4vt9',
    api_key: '376365558848471',
    api_secret: 'USb46ns9p4V7fAWMppTP54xiv00'
});

// Create a new video
router.post('/upload-video', isAuth , hasRole([
    'superadmin',
  
  ]), upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create a promise for the Cloudinary upload
        const uploadResult = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'video' },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(req.file.buffer);
        });

        // Wait for the upload to complete
        const result = await uploadResult;

        // Create a new Video document with Cloudinary URL
        const video = new Video({
            url: result.secure_url,
        });

        // Save video to database
        await video.save();

        // Respond with essential information about the uploaded video
        res.status(201).json({
            videoId: video._id,
            url: video.url,
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

router.get('/all-videos', async (req, res) => {
    try {
        const videos = await Video.find();
        res.status(200).json(videos);
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

module.exports = router;
