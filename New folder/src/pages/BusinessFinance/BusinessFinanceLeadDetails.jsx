import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../Auth/AuthContext';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const BusinessFinanceLeadDetails = () => {
    const { id } = useParams();
    const { state } = useContext(AuthContext);
    const [leadDetails, setLeadDetails] = useState(null); // State to hold lead details
    const [loading, setLoading] = useState(true); // Loading state
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const [newDiscussion, setNewDiscussion] = useState(''); // State to hold new discussion message
    const [selectedFiles, setSelectedFiles] = useState(null); // State to hold selected files

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

    // Function to handle adding a new discussion
    const handleAddDiscussion = async () => {
        try {
            const response = await axios.post(
                '/api/business-lead/discussions',
                {
                    message: newDiscussion,
                    leadType: 'BusinessLoanLead',
                    lead: id
                },
                {
                    headers: {
                        Authorization: `Bearer ${state.userinfo.token}`
                    }
                }
            );

            // Update leadDetails with the new discussion
            const updatedLead = { ...leadDetails };
            updatedLead.discussions.push(response.data); // Assuming response.data is the new discussion object
            setLeadDetails(updatedLead);

            // Reset modal and new discussion state
            setNewDiscussion('');
            setShowModal(false);
        } catch (error) {
            console.error('Error adding discussion:', error);
            // Handle error as needed
        }
    };

    // Function to handle file selection
    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };

    // Function to handle file upload
    const handleFileUpload = async () => {
        try {
            if (!selectedFiles || selectedFiles.length === 0) {
                console.error('No files selected for upload.');
                return;
            }

            const formData = new FormData();
            formData.append('leadId', id);
            formData.append('leadType', 'BusinessLoanLead');
            for (let i = 0; i < selectedFiles.length; i++) {
                formData.append('file', selectedFiles[i]);
            }

            const response = await axios.post('/uploads/upload-file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${state.userinfo.token}`
                }
            });

            // Update leadDetails with the uploaded files
            const updatedLead = { ...leadDetails };
            updatedLead.files.push({ _id: response.data.fileUrl, name: selectedFiles[0].name }); // Assuming response.data.fileUrl is the uploaded file's URL
            setLeadDetails(updatedLead);

            // Clear selected files state
            setSelectedFiles(null);
        } catch (error) {
            console.error('Error uploading file:', error);
            // Handle error as needed
        }
    };

    // Function to render lead details
    const renderLeadDetails = () => {
        if (loading) {
            return <Spinner animation="border" />; // Render spinner while loading
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
                        </div>
                    </div>

                    <div className="lead-section">
                        <h3>Discussions:</h3>
                        <Button variant="primary" onClick={() => setShowModal(true)}>Add Discussion</Button>
                        <ul>
                            {leadDetails.discussions.map(discussion => (
                                <li key={discussion._id} className="discussion-item">
                                    <p><strong>User:</strong> {discussion.user.name}</p>
                                    <p><strong>Message:</strong> {discussion.message}</p>
                                    <p><strong>Timestamp:</strong> {new Date(discussion.createdAt).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <div className="lead-section">
                                <h3>Files:</h3>
                                <input type="file" multiple onChange={handleFileChange} />
                                <Button onClick={handleFileUpload}>Add Files</Button>
                                <ul>
                                    {leadDetails.files.map(file => (
                                        <li key={file._id} className="file-item">
                                            {file && file.filename ? (
                                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                    {file.filename.toLowerCase().endsWith('.pdf') ? 'View PDF' : (
                                                        <img src={file.url} alt={file.filename} className="file-image" />
                                                    )}
                                                </a>
                                            ) : (
                                                <span>File details not available</span>
                                            )}
                                         
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
            {/* <BusinessFinanceNavbar /> */}
            <div className="lead-details-container">
                {renderLeadDetails()}

                {/* Modal for adding discussion */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Discussion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="discussionMessage">
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter your discussion message..."
                                    value={newDiscussion}
                                    onChange={(e) => setNewDiscussion(e.target.value)}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleAddDiscussion}>
                            Add Discussion
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default BusinessFinanceLeadDetails;
