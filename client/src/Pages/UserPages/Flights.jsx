import React, { useState } from 'react';
import axios from 'axios';

const Flights = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      origin,
      destination,
      departureDate
    };

    try {
      const response = await axios.post('http://localhost:8080/api/search-flights', payload);
      const itineraries = response.data.AirSearchResponse.AirSearchResult.FareItineraries;
      setResults(itineraries);
    } catch (err) {
      setError('Error fetching flight data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Flight Search</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div>
          <label>Origin:</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
            style={{ marginLeft: '10px', marginRight: '20px' }}
          />
        </div>
        <div>
          <label>Destination:</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            style={{ marginLeft: '10px', marginRight: '20px' }}
          />
        </div>
        <div>
          <label>Departure Date:</label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            required
            style={{ marginLeft: '10px', marginRight: '20px' }}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        <h3>Search Results</h3>
        {results.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <ul>
            {results.map((itinerary, index) => {
              const fareItinerary = itinerary.FareItinerary;
              const totalFare = fareItinerary.AirItineraryFareInfo.ItinTotalFares.TotalFare;
              const fareBreakdown = fareItinerary.AirItineraryFareInfo.FareBreakdown[0];
              const segments = fareItinerary.OriginDestinationOptions[0].OriginDestinationOption;

              return (
                <li key={index} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                  <h4>Itinerary {index + 1}</h4>
                  <p>Total Fare: {totalFare.Amount} {totalFare.CurrencyCode}</p>
                  <p>Baggage Allowance: {fareBreakdown.Baggage.join(', ')}</p>
                  <p>Cabin Baggage: {fareBreakdown.CabinBaggage.join(', ')}</p>
                  <p>Refundable: {fareBreakdown.PenaltyDetails.RefundAllowed ? 'Yes' : 'No'}</p>
                  <p>Refund Penalty: {fareBreakdown.PenaltyDetails.RefundPenaltyAmount} {fareBreakdown.PenaltyDetails.Currency}</p>
                  <p>Change Allowed: {fareBreakdown.PenaltyDetails.ChangeAllowed ? 'Yes' : 'No'}</p>
                  <p>Change Penalty: {fareBreakdown.PenaltyDetails.ChangePenaltyAmount} {fareBreakdown.PenaltyDetails.Currency}</p>

                  {segments.map((segment, segIndex) => (
                    <div key={segIndex} style={{ marginBottom: '10px' }}>
                      <p>Flight {segIndex + 1}:</p>
                      <p>
                        {segment.FlightSegment.DepartureAirportLocationCode} to{' '}
                        {segment.FlightSegment.ArrivalAirportLocationCode}
                      </p>
                      <p>
                        Departure: {new Date(segment.FlightSegment.DepartureDateTime).toLocaleString()}<br />
                        Arrival: {new Date(segment.FlightSegment.ArrivalDateTime).toLocaleString()}
                      </p>
                      <p>Duration: {segment.FlightSegment.JourneyDuration} minutes</p>
                      <p>Airline: {segment.FlightSegment.MarketingAirlineName} ({segment.FlightSegment.MarketingAirlineCode})</p>
                      <p>Flight Number: {segment.FlightSegment.FlightNumber}</p>
                      <p>Cabin Class: {segment.FlightSegment.CabinClassText}</p>
                      <p>Seats Remaining: {segment.SeatsRemaining.Number}</p>
                    </div>
                  ))}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Flights;
