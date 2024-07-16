const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/search-flights', async (req, res) => {
  const { origin, destination, departureDate } = req.body;

  const payload = {
    user_id: "abdullahjovera_testAPI",
    user_password: "abdullahjoveraTest@2024",
    access: "Test",
    ip_address: "2.50.178.87",
    requiredCurrency: "PKR",
    journeyType: "OneWay",
    OriginDestinationInfo: [
      {
        departureDate: departureDate,
        airportOriginCode: origin,
        airportDestinationCode: destination
      }
    ],
    class: "Economy",
    adults: 1
  };

  try {
    const response = await axios.post('https://travelnext.works/api/aeroVE5/availability', payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching flight data:', error);
    res.status(500).json({ error: 'Error fetching flight data.' });
  }
});

module.exports = router;
