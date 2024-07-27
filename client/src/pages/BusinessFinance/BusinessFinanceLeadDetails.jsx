import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../Auth/AuthContext';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const BusinessFinanceLeadDetails = () => {
    const { id } = useParams();
    const { state } = useContext(AuthContext);
    const [leadDetails, setLeadDetails] = useState(null); 
    const [loading, setLoading] = useState(true); 
    const [showModal, setShowModal] = useState(false); 
    const [newDiscussion, setNewDiscussion] = useState(''); 
    const [selectedFiles, setSelectedFiles] = useState(null);

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
                setLeadDetails(response.data); 
                setLoading(false); 
            } catch (error) {
                console.error('Error fetching lead details:', error);
                setLoading(false); 
            }
        };

        fetchLeadDetails();
    }, [id, state.userinfo.token]);

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

            const updatedLead = { ...leadDetails };
            updatedLead.discussions.push(response.data); 
            setLeadDetails(updatedLead);

            setNewDiscussion('');
            setShowModal(false);
        } catch (error) {
            console.error('Error adding discussion:', error);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };

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

            const updatedLead = { ...leadDetails };
            updatedLead.files.push({ _id: response.data.fileUrl, name: selectedFiles[0].name }); 

            setSelectedFiles(null);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const renderLeadDetails = () => {
        if (loading) {
            return <Spinner animation="border" />; 
        }
        if (!leadDetails) {
            return <p>No details found for this lead.</p>;
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
            <div className="lead-details-container">
                {renderLeadDetails()}

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
