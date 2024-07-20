import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BusinessLead.css';
const BusinessLead = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get('/api/business-lead/get-all-business-leads');
        setLeads(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="business-leads">
    <h1>Business Leads</h1>
    <div className="leads-container">
      {leads.map(lead => (
        <div key={lead._id} className="flip-card">
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <h2>{lead.service}</h2>
              <p><strong>Client:</strong> {lead.client.name}</p>
              <p><strong>Stage:</strong> {lead.stage}</p>
              <p><strong>Description:</strong> {lead.description}</p>
            </div>
            <div className="flip-card-back">
              <p><strong>Source:</strong> {lead.source}</p>
              <p><strong>Labels:</strong> {lead.labels.join(', ')}</p>
              <p><strong>Selected Users:</strong> {lead.selectedUsers.map(user => user.name).join(', ')}</p>
              <h3>Activity Logs:</h3>
              {lead.activityLogs.map(log => (
                <div key={log._id} className="activity-log">
                  <p><strong>Action:</strong> {log.action}</p>
                  <p><strong>Details:</strong> {log.details}</p>
                  <p><strong>User:</strong> {log.userId.name}</p>
                  <p><strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}</p>
                </div>
              ))}
              <h3>Discussions:</h3>
              {lead.discussions.map(discussion => (
                <div key={discussion._id} className="discussion">
                  <p><strong>User:</strong> {discussion.user.name}</p>
                  <p><strong>Message:</strong> {discussion.message}</p>
                  <p><strong>Timestamp:</strong> {new Date(discussion.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
};


export default BusinessLead;
