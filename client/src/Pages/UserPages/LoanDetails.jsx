import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import io from 'socket.io-client';
import { Modal, Button } from 'react-bootstrap';

const LoanDetails = () => {
    const { loanType, loanId } = useParams();
    const { state } = useContext(AuthContext);
    const { userinfo } = state;
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]); // State for chat history
    const [superadminId, setSuperadminId] = useState('');
    const [socket, setSocket] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchLoanDetails = async () => {
            try {
                const response = await axios.get(`http://mob.lantanapk.com/api/loans/loan/${loanId}/${loanType}`, {
                    headers: {
                        Authorization: `Bearer ${userinfo.token}`
                    }
                });
                setLoan(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        const fetchSuperadminId = async () => {
            try {
                const response = await axios.get('/api/users/get-all-users');
                const superadmin = response.data.users.find(user => user.role === 'superadmin');
                setSuperadminId(superadmin._id);
            } catch (err) {
                console.error('Error fetching superadmin ID:', err);
            }
        };

        if (userinfo && userinfo.token) {
            fetchLoanDetails();
            fetchSuperadminId();

            const newSocket = io('http://localhost:8080', {
                query: { userId: userinfo._id }
            });

            newSocket.on('newMessage', (data) => {
                setChat(prevChat => [...prevChat, { senderId: data.senderId, message: data.message }]);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [loanId, loanType, userinfo]);

    const handleSendMessage = () => {
        if (message.trim() !== '' && socket) {
            socket.emit('sendMessage', {
                senderId: userinfo._id,
                receiverId: superadminId,
                message
            });
            setChat(prevChat => [...prevChat, { senderId: userinfo._id, message }]); // Add sent message to chat history
            setMessage('');
        }
    };

    const handleModalOpen = () => {
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Loan Details</h1>
            <h2>Loan Type: {loanType}</h2>
            <h2>Loan ID: {loanId}</h2>
            <h2>Company Name: {loan && loan.companyName}</h2>
            <p>Service: {loan && loan.services}</p>
            <p>Status: {loan && loan.status}</p>
            <p>Application Date: {loan && new Date(loan.applicationDate).toLocaleDateString()}</p>

            <Button variant="primary" onClick={handleModalOpen}>
                Open Chat
            </Button>

            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Chat with Superadmin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        {chat.map((message, index) => (
                            <div key={index}>
                                {message.senderId === userinfo._id ? (
                                    <p>You: {message.message}</p>
                                ) : (
                                    <p>Superadmin: {message.message}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSendMessage}>
                        Send
                    </Button>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default LoanDetails;
