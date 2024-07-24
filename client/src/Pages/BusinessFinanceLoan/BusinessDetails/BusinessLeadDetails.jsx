import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../Auth/AuthContext';
import BusinessFinanceNavbar from '../BusinessFinanceNavbar';
import './BusinessLeadDetails.css'; // Import custom CSS file

const BusinessLeadDetails = () => {
    const { id } = useParams();
    const { state } = useContext(AuthContext);
    const [leadDetails, setLeadDetails] = useState(null); // State to hold lead details
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchLeadDetails = async () => {
            try {
                const response = await axios.get(
                    `/api/business-lead/get-business-lead/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${state.userinfo.token}`
                        }
                    }
                );
                setLeadDetails(response.data); // Set fetched lead details to state
                setLoading(false); // Update loading state to false
            } catch (error) {
                console.error('Error fetching lead details:', error);
                setLoading(false); // Update loading state in case of error
            }
        };

        fetchLeadDetails();
    }, [id, state.userinfo.token]);

    // Function to render lead details
    const renderLeadDetails = () => {
        if (loading) {
            return <p>Loading...</p>; // Render loading indicator while fetching data
        }
        if (!leadDetails) {
            return <p>No details found for this lead.</p>; // Render message if leadDetails is null
        }

        return (
            <div className="lead-details">
                <div className="lead-details-left">
                    <h2>{leadDetails.service}</h2>
                    <p><strong>Client:</strong> {leadDetails.client.name}</p>
                    <p><strong>Description:</strong> {leadDetails.description}</p>
                    <p><strong>Source:</strong> {leadDetails.source}</p>
                    <p><strong>Stage:</strong> {leadDetails.stage}</p>

                    <div className="lead-section">
                        <h3>Selected Users:</h3>
                        <ul>
                            {leadDetails.selectedUsers.map(user => (
                                <li key={user._id}>{user.name}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="lead-section">
                        <h3>Labels:</h3>
                        <ul>
                            {leadDetails.labels.map(label => (
                                <li key={label}>{label}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="lead-details-right">
                    <div className="card">
                        <div className="card-body">
                            <div className="lead-section">
                                <h3>Activity Logs:</h3>
                                <ul>
                                    {leadDetails.activityLogs.map(log => (
                                        <li key={log._id} className="log-item">
                                            <p><strong>Action:</strong> {log.action}</p>
                                            <p><strong>User:</strong> {log.userId.name}</p>
                                            <p><strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}</p>
                                            <p><strong>Details:</strong> {log.details}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="lead-section">
                                <h3>Discussions:</h3>
                                <ul>
                                    {leadDetails.discussions.map(discussion => (
                                        <li key={discussion._id} className="discussion-item">
                                            <p><strong>User:</strong> {discussion.user.name}</p>
                                            <p><strong>Message:</strong> {discussion.message}</p>
                                            <p><strong>Timestamp:</strong> {new Date(discussion.timestamp).toLocaleString()}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <div className="lead-section">
                                <h3>Files:</h3>
                                <ul>
                                    {leadDetails.files.map(file => (
                                        <li key={file._id} className="file-item">
                                            <p><strong>Name:</strong> {file.name}</p>
                                            <p><strong>Type:</strong> {file.type}</p>
                                            <p><strong>Size:</strong> {file.size} bytes</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <BusinessFinanceNavbar />
            <div className="lead-details-container">
                {renderLeadDetails()}
            </div>
        </div>
    );
};

export default BusinessLeadDetails;
