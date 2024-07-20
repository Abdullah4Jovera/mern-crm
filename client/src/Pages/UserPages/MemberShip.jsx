import React, { useContext, useState } from 'react';
import './MemberShip.css';
import { AuthContext } from '../Auth/AuthContext';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51PQ7NlGrOyzlgVTmH0S8ErVNv8rm9SICM1fANWh4WODfUbSq7A5CHjttlF3oGG7eku6xR0ijB2gEyv62zYieN02B00Ynu5UtiO');

const MemberShip = () => {
    const { state } = useContext(AuthContext);
    const { userinfo } = state;

    // State to manage modal visibility
    const [showModal, setShowModal] = useState(false);

    // State to track the selected membership plan
    const [selectedPlan, setSelectedPlan] = useState(null);

    // State to manage the payment method
    const [paymentMethod, setPaymentMethod] = useState(null);

    // Function to handle "Buy Now" button click and open the modal
    const handleBuyNow = (plan) => {
        setSelectedPlan(plan);
        setShowModal(true);
    };

    // Function to handle payment method selection
    const handlePaymentMethod = (method) => {
        setPaymentMethod(method);
        if (method === 'PayPal') {
            initiatePayPalPayment(); // Call function to initiate PayPal payment
        }
    };

    // Function to initiate PayPal payment
    const initiatePayPalPayment = () => {
        // Define the plan details based on the selected plan
        let planDetails;
        if (selectedPlan === 'Silver') {
            planDetails = { name: 'Silver Plan', price: '30.00', currency: 'USD' };
        } else if (selectedPlan === 'Gold') {
            planDetails = { name: 'Gold Plan', price: '60.00', currency: 'USD' };
        } else if (selectedPlan === 'Diamond') {
            planDetails = { name: 'Diamond Plan', price: '90.00', currency: 'USD' };
        }

        // Make an HTTP request to your backend to initiate the PayPal payment
        axios.post('/paypal/pay', {
            name: planDetails.name,
            price: planDetails.price,
            currency: planDetails.currency,
            userId: userinfo._id // Include user ID in the request
        })
        .then(response => {
            // Redirect the user to the PayPal payment page
            if (response.data && response.data.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            } else {
                console.error('Payment initiation failed.');
            }
        })
        .catch(error => {
            console.error('Error initiating PayPal payment:', error);
        });
    };

    return (
        <div className="membership-container">
            <h1>Our Membership Plans</h1>
            <div className="cards-container">
                {/* Membership plan cards */}
                <div className="card">
                    <h2>Silver Plan</h2>
                    <p>Enjoy basic features with standard support.</p>
                    <p className="price">$30/Annual</p>
                    <p className="features">Features: 5% discount</p>
                    <button onClick={() => handleBuyNow('Silver')}>Buy Now</button>
                </div>
                <div className="card">
                    <h2>Gold Plan</h2>
                    <p>Get access to advanced features with priority support.</p>
                    <p className="price">$60/Annual</p>
                    <p className="features">Features: 10% discount</p>
                    <button onClick={() => handleBuyNow('Gold')}>Buy Now</button>
                </div>
                <div className="card">
                    <h2>Diamond Plan</h2>
                    <p>Experience all features with exclusive benefits and top-tier support.</p>
                    <p className="price">$90/Annual</p>
                    <p className="features">Features: 15% discount</p>
                    <button onClick={() => handleBuyNow('Diamond')}>Buy Now</button>
                </div>
            </div>

            {/* Modal for payment options */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Payment Options</h2>
                        <p>Please select a payment method:</p>
                        {/* Button to pay by PayPal */}
                        <button onClick={() => handlePaymentMethod('PayPal')}>Pay by PayPal</button>
                        {/* Button to pay by Card */}
                        <button onClick={() => handlePaymentMethod('Card')}>Pay by Card</button>
                        {/* Button to close the modal */}
                        <button onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
            )}

            {/* Render Stripe payment form if Card payment method is selected */}
            {paymentMethod === 'Card' && (
                <Elements stripe={stripePromise}>
                    <CheckoutForm userinfo={userinfo} selectedPlan={selectedPlan} />
                </Elements>
            )}
        </div>
    );
};

const CheckoutForm = ({ userinfo, selectedPlan }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleCardPayment = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);

        let planDetails;
        if (selectedPlan === 'Silver') {
            planDetails = { name: 'Silver Plan', price: '30.00', currency: 'USD' };
        } else if (selectedPlan === 'Gold') {
            planDetails = { name: 'Gold Plan', price: '60.00', currency: 'USD' };
        } else if (selectedPlan === 'Diamond') {
            planDetails = { name: 'Diamond Plan', price: '90.00', currency: 'USD' };
        }

        try {
            const { token, error } = await stripe.createToken(cardElement);
            if (error) {
                setError(error.message);
                return;
            }

            const response = await axios.post('/stripe/pay/card', { 
                token: token.id, 
                total: planDetails.price,
                userId: userinfo._id, // Include user ID in the request
                plan: selectedPlan
            });

            if (response.status === 200) {
                setSuccess('Payment successful!');
            } else {
                setError('Payment failed. Please try again.');
            }
        } catch (error) {
            setError('Payment error. Please try again.');
        }
    };

    return (
        <form onSubmit={handleCardPayment}>
            <h2>Card Payment:</h2>
            <CardElement />
            <button type="submit" disabled={!stripe}>Make Card Payment</button>
            {error && <div>{error}</div>}
            {success && <div>{success}</div>}
        </form>
    );
};

export default MemberShip;
