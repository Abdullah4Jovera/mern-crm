const express = require('express');
const stripe = require('stripe')('sk_test_51PQ7NlGrOyzlgVTmSfu0VtojPj5rwLP5bZHRvXpc0KCGu2z0fVLg1Zbh6WQNOB0eD531l6W0iKCmljyKLfg8udQB00GcdYMRNJ');
const router = express.Router();
const Membership = require('../models/membershipModel');
const User = require('../models/userModel');

router.post('/pay/card', async (req, res) => {
    const { token, total, userId, plan } = req.body;

    try {
        const charge = await stripe.charges.create({
            amount: Math.round(total * 100), // Amount in cents
            currency: 'usd',
            source: token,
            description: `Charge for ${plan}`
        });

        let percentage;
        if (plan === 'Silver') {
            percentage = 5;
        } else if (plan === 'Gold') {
            percentage = 10;
        } else if (plan === 'Diamond') {
            percentage = 15;
        }

        const membership = new Membership({
            plan,
            percentage,
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            paymentInformation: {
                paymentMethod: 'Card',
                transactionId: charge.id,
                amount: parseFloat(total)
            }
        });

        const savedMembership = await membership.save();

        await User.findByIdAndUpdate(userId, { membership: savedMembership._id });

        res.status(200).json({ success: true, message: 'Payment successful!' });
    } catch (error) {
        res.status(500).json({ error: 'Payment failed. Please try again.' });
    }
});

module.exports = router;
