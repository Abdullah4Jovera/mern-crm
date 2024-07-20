import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../Auth/AuthContext';
import axios from 'axios';
import CardPayment from '../../components/CardPayment';
import Navbar from '../../components/navbar/Navbar'

const UserDashboard = () => {
    const { state } = useContext(AuthContext);
    const { userinfo } = state;

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (userinfo) {
            const newSocket = io('http://localhost:8080', {
                query: { userId: userinfo._id }
            });

            newSocket.on('newMessage', (data) => {
                setReceivedMessages(prevMessages => [...prevMessages, data]);
            });

            newSocket.on('newNotification', (notification) => {
                setNotifications(prevNotifications => [...prevNotifications, notification]);
            });

            newSocket.on('loanStatusChanged', (notification) => {
                setNotifications(prevNotifications => [...prevNotifications, notification]);
            });

            setSocket(newSocket);

            return () => {
                newSocket.off('newMessage');
                newSocket.off('newNotification');
                newSocket.off('loanStatusChanged');
                newSocket.disconnect();
            };
        }
    }, [userinfo]);

    useEffect(() => {
        fetch('/api/users/get-all-users')
            .then(response => response.json())
            .then(data => {
                if (data && data.users && Array.isArray(data.users)) {
                    setUsers(data.users);
                } else {
                    console.error('Invalid response format for users:', data);
                }
            })
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    const handleSendMessage = () => {
        if (selectedUser && message.trim() !== '' && socket) {
            socket.emit('sendMessage', {
                senderId: userinfo._id,
                receiverId: selectedUser._id,
                message
            });
            setMessage('');
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    const handlePayPalPayment = () => {
        fetch('/paypal/pay')
            .then(response => response.json())
            .then(data => {
                if (data && data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                } else {
                    console.error('Payment initiation failed.');
                }
            })
            .catch(error => console.error('Error initiating payment:', error));
    };

    return (
        <>
            <Navbar/>
            <div>
                <h1>User Dashboard</h1>
                <h2>Select a user to send a message:</h2>
                <ul>
                    {users.map(user => (
                        <li key={user._id} onClick={() => handleUserSelect(user)}>
                            {user.name}
                        </li>
                    ))}
                </ul>
                {selectedUser && (
                    <div>
                        <h3>Send Message to {selectedUser.name}:</h3>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                )}
                <div>
                    <h2>Received Messages:</h2>
                    <ul>
                        {receivedMessages.map((msg, index) => (
                            <li key={index}>
                                {msg.senderName}: {msg.message}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2>Notifications:</h2>
                    <ul>
                        {notifications.map((notification, index) => (
                            <li key={index}>
                                {notification.message} (Loan ID: {notification.loanId})
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2>Payment:</h2>
                    <button onClick={handlePayPalPayment}>Make PayPal Payment</button>
                </div>
            </div>


           <CardPayment />
        </>
    );
};

export default UserDashboard;
