import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51PQ7NlGrOyzlgVTmH0S8ErVNv8rm9SICM1fANWh4WODfUbSq7A5CHjttlF3oGG7eku6xR0ijB2gEyv62zYieN02B00Ynu5UtiO');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardDetails, setCardDetails] = useState({ total: '10.00' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleCardPayment = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    try {
      const { token, error } = await stripe.createToken(cardElement);
      if (error) {
        setError(error.message);
        return;
      }

      const response = await axios.post('/stripe/pay/card', { token: token.id, total: cardDetails.total });

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

const UserDashboard = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default UserDashboard;
