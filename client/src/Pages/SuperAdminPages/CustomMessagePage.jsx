// CustomMessagePage.js

import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Form, Dropdown, DropdownButton } from 'react-bootstrap';
import { AuthContext } from '../Auth/AuthContext';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:8080';

function CustomMessagePage() {
  const { state } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]); // State to store received messages

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users/get-all-users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.userinfo.token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [state.userinfo.token]);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      query: { userId: state.userinfo._id },
      transports: ['websocket']
    });

    newSocket.on('newMessage', (data) => {
      const { senderName, message, timestamp } = data;
      // Update messages state with new message
      setMessages(prevMessages => [...prevMessages, { senderName, message, timestamp }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [state.userinfo._id]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !message.trim()) return;

    const data = {
      senderId: state.userinfo._id,
      receiverId: selectedUser._id,
      message
    };

    if (socket) {
      socket.emit('sendMessage', data);
    }

    setMessage('');
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
    setSelectedUser(null);
  };

  return (
    <>
      <DropdownButton id="dropdown-basic-button" title="Send Custom Message">
        {users.map((user) => (
          <Dropdown.Item key={user._id} onClick={() => handleUserSelect(user)}>
            {user.name} ({user.email})
          </Dropdown.Item>
        ))}
      </DropdownButton>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Send Message to {selectedUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="message">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSendMessage}>
            Send Message
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Display received messages */}
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <p>{msg.senderName}: {msg.message}</p>
            <p>{new Date(msg.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default CustomMessagePage;
