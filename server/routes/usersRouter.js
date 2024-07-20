const router = require("express").Router();
const passport = require("../passport");
const jwt = require('jsonwebtoken');
const { generateToken, isAuth } = require('../utils');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { OAuth2Client } = require("google-auth-library");
const expressAsyncHandler = require('express-async-handler');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { assignPermissionsToRole } = require('../rolePermissions'); 
const TOKEN_SECRET = process.env.JWT_SECRET;
cloudinary.config({
    cloud_name: 'dn1oz4vt9',
    api_key: '376365558848471',
    api_secret: 'USb46ns9p4V7fAWMppTP54xiv00'
});

// Configure multer for file uploads
const storage = multer.diskStorage({});
const upload = multer({ storage });
const client = new OAuth2Client("914723857650-1qa0dsvirt7gkgdgb8svb01j629efa5n.apps.googleusercontent.com");

router.post("/google-signin",  async (req, res) => {
    try {
        const { accessToken, userData } = req.body; // Extract the access token and user data from the request body

        // Process user data as needed
        const googleId = userData.id; // Unique identifier for the user provided by Google
        const email = userData.email;

        // Check if a user with the provided email already exists
        let user = await User.findOne({ email });

        if (user) {
            // If user exists, update their Google ID and other details if necessary
            user.googleId = googleId;
            user.name = userData.name;
            user.image = userData.picture;
            await user.save();
        } else {
            // If user doesn't exist, create a new user in the database
            user = new User({
                googleId,
                name: userData.name,
                email: userData.email,
                image: userData.picture
            });
            await user.save();
        }

        // Generate token
        const token = generateToken(user);

        // Omit the password field from the user object in the response
        const userWithoutPassword = { ...user.toObject(), password: undefined };

        // Include token inside the user object
        userWithoutPassword.token = token;

        res.status(200).json({ error: false, message: "Google Sign-In successful", user: userWithoutPassword });
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        res.status(500).json({ error: true, message: "Google Sign-In Error" });
    }
});

// Register User
// Function to send OTP via email
const sendOTP = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification OTP',
            text: `Your OTP for email verification is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);
        console.log("OTP sent successfully");
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Error sending OTP");
    }
};

// Register User with Email Verification
router.post('/register', expressAsyncHandler(async (req, res) => {
    try {
        const { name, email, password, contactNumber, image } = req.body;

        if (await User.findOne({ email })) {
            return res.status(400).json({ error: true, message: 'User with this email is already registered. Please login.' });
        }

        if (await User.findOne({ contactNumber })) {
            return res.status(400).json({ error: true, message: 'User with this contact number is already registered. Please login.' });
        }

        // Generate a random 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Save user with OTP and set verified to false
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, contactNumber, image, otp, verified: false });
        await newUser.save();

        // Send OTP to user's email
        await sendOTP(email, otp);

        res.status(201).json({ error: false, message: 'OTP sent to email for verification', user: { email } });
    } catch (error) {
        res.status(400).json({ error: true, message: 'Registration failed', details: error.message });
    }
}));

// Verify OTP during registration
router.post('/verify-otp-log', expressAsyncHandler(async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email, otp });

        if (!user) {
            return res.status(400).json({ error: true, message: 'Invalid OTP' });
        }

        // Remove OTP field, set verified to true, and save the user
        user.otp = undefined;
        user.verified = true;
        await user.save();

        // Generate token
        const token = generateToken(user);

        // Omit the password field from the user object in the response
        const userWithoutPassword = { ...user.toObject(), password: undefined };

        // Include token inside the user object
        userWithoutPassword.token = token;

        res.status(200).json({ error: false, message: "User registered and verified successfully", user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal server error", details: error.message });
    }
}));

router.post("/login", expressAsyncHandler(async (req, res) => {
    try {
        const { emailOrContact, password } = req.body;

        // Find user by email or contact number
        const user = await User.findOne({ 
            $or: [{ email: emailOrContact }, { contactNumber: emailOrContact }] 
        });

        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        // Check if user is verified
        if (!user.verified) {
            // Generate a random 4-digit OTP
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            user.otp = otp;
            await user.save();

            // Send OTP to user's email
            await sendOTP(user.email, otp);

            return res.status(401).json({ error: true, message: "Email not verified. OTP sent for verification." });
        }

        // Check if password matches
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(402).json({ error: true, message: "Incorrect password" });
        }

        // Generate token
        const token = generateToken(user);

        // Omit the password field from the user object in the response
        const userWithoutPassword = { ...user.toObject(), password: undefined };

        // Include token inside the user object
        userWithoutPassword.token = token;

        res.status(200).json({ error: false, message: "Login successful", user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal server error", details: error.message });
    }
}));
router.put("/edit-profile", isAuth, upload.single('image'), async (req, res) => {
    try {
        const { name, email, contactNumber, password } = req.body;
        let { image } = req.body;
        const userId = req.user._id;

        // Find user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        // Update user information
        user.name = name || user.name;
        user.email = email || user.email;
        user.contactNumber = contactNumber || user.contactNumber;

        // Update password if provided
        if (password) {
            // Hash the new password
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Upload image to Cloudinary if provided
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            image = result.secure_url;
        }

        user.image = image || user.image;

        // Save updated user
        const updatedUser = await user.save();

        res.status(200).json({ error: false, message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal server error", details: error.message });
    }
});
router.post(
    '/forgot-password',
    expressAsyncHandler(async (req, res) => {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Generate a random 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Set OTP and expiration time in the user document
        user.otp = otp;
        user.otpExpiration = Date.now() + 720 * 60 * 1000; // OTP expires in 12 hours
        await user.save();

        // Send OTP to the user's email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            html: `
                <html>
                <head></head>
                <body>
                    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                        <div style="margin:50px auto;width:70%;padding:20px 0">
                            <div style="border-bottom:1px solid #eee">
                                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Jovera Groups</a>
                            </div>
                            <p style="font-size:1.1em">Hi,</p>
                            <p>Thank you for choosing Jovera Groups. Use the following OTP to complete your password reset process. OTP is valid for 12 hours:</p>
                            <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                            <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
                            <hr style="border:none;border-top:1px solid #eee" />
                            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                                <p>Jovera Groups</p>
                                <p>Abu Dhabi</p>
                                <p>UAE</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.send({ message: 'OTP sent successfully' });
    })
);

router.post(
    '/verify-otp',
    expressAsyncHandler(async (req, res) => {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).send({ message: 'Incorrect OTP. Please try again.' });
        }

        if (user.otpExpiration < Date.now()) {
            return res.status(400).send({ message: 'OTP has expired. Please request a new OTP.' });
        }

        // Generate a temporary token
        const token = jwt.sign({ email: user.email }, TOKEN_SECRET, { expiresIn: '1h' });
        user.otp = undefined;
        // Store the token and its expiration time in the user document
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 60 * 60 * 1000; // Token expires in 1 hour
        await user.save();

        // Respond with the token
        res.send({ message: 'OTP verification successful', token });
    })
);

// Password reset route
router.post(
    '/reset-password',
    expressAsyncHandler(async (req, res) => {
        const { email, newPassword, token } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }

        if (!token || token !== user.resetToken) {
            return res.status(400).send({ message: 'Invalid or expired token. Please verify your OTP again.' });
        }

        if (user.resetTokenExpiration < Date.now()) {
            return res.status(400).send({ message: 'Token has expired. Please verify your OTP again.' });
        }

        // Reset the password
        user.password = bcrypt.hashSync(newPassword, 8);
        user.otp = undefined;
        user.otpExpiration = undefined;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.send({ message: 'Password reset successfully' });
    })
);

router.get("/get-all-users", expressAsyncHandler(async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ error: false, users });
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal server error", details: error.message });
    }
}));

///create staff user for crm 

router.post('/register-user', expressAsyncHandler(async (req, res) => {
    try {
        const { name, email, password, contactNumber, image, role } = req.body;
        const permissions = assignPermissionsToRole(role);  // Use the function correctly
        if (await User.findOne({ email })) {
            return res.status(400).json({ error: true, message: 'User with this email is already registered. Please login.' });
        }

        if (await User.findOne({ contactNumber })) {
            return res.status(400).json({ error: true, message: 'User with this contact number is already registered. Please login.' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            contactNumber,
            image,
            role,
            verified: true,
            permissions,
        });

        await newUser.save();

        res.status(201).json({ error: false, message: 'User registered successfully', user: { email, role } });
    } catch (error) {
        res.status(400).json({ error: true, message: 'Registration failed', details: error.message });
    }
}));


module.exports = router;
