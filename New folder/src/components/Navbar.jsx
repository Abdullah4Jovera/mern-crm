import React, { useContext, useEffect, useState } from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, NavDropdown, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Ensure you're using React Router v6
import io from 'socket.io-client';
import { AuthContext } from '../pages/Auth/AuthContext';

function AppNavbar() {
    const { logout, state } = useContext(AuthContext);
    const { userinfo } = state;
    const navigate = useNavigate(); // Get the navigate function from React Router

    const [notifications, setNotifications] = useState([]);
    const [showNotificationModal, setShowNotificationModal] = useState(false);

    useEffect(() => {
        if (userinfo) {
            const socket = io('http://localhost:8080', {
                query: { userId: userinfo._id },
                transports: ['websocket']
            });

            socket.on('connect', () => {
                console.log('Connected to socket server');
            });

            socket.on('notifications', (data) => {
                const { message, leadId, entityType } = data;

                const notification = {
                    message: `${message}.`,
                    leadId: leadId,
                    entityType: entityType,
                };

                setNotifications(prevNotifications => [...prevNotifications, notification]);
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from socket server');
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [userinfo]);

    const handleLogout = () => {
        logout();
        navigate('/'); // Navigate to home page on logout
    };

    const handleNotificationsClick = () => {
        setShowNotificationModal(true);
    };

    const handleViewNotification = (notification) => {
        // Remove the notification from the state
        setNotifications(prevNotifications =>
            prevNotifications.filter(notif => notif.leadId !== notification.leadId)
        );

        // Navigate to the notification details page
        navigate(`/businessfinanceleaddetails/${notification.leadId}`);
        setShowNotificationModal(false); // Close modal after navigating
    };

    return (
        <>
            <BootstrapNavbar expand="lg" className="navbarcontainer">
                <Container>
                    {/* <img
                        src={logo}
                        alt='Logo'
                        onClick={() => navigate('/businessfinancedashboard')}
                        style={{ cursor: 'pointer' }}
                        className="logo-image"
                    /> */}
                    <BootstrapNavbar.Toggle aria-controls="navbarScroll" />
                    <BootstrapNavbar.Collapse id="navbarScroll">
                        <Nav className="m-auto" style={{ maxHeight: '100px' }} navbarScroll>
                            <Nav.Link href="#action1">Support</Nav.Link>
                            <Nav.Link href="#action2">Terms</Nav.Link>
                            <Nav.Link href="#">Privacy</Nav.Link>
                            <NavDropdown title="EN" id="navbarScrollingDropdown">
                                <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                                <NavDropdown.Item href="#action4">Another action</NavDropdown.Item>
                                <NavDropdown.Item href="#action5">Something else here</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        <Nav>
                            <Nav.Link style={{ cursor: 'pointer' }} onClick={handleNotificationsClick}>
                                <i className="fas fa-bell"> Notifications ({notifications.length})</i>
                            </Nav.Link>
                            <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
                        </Nav>
                    </BootstrapNavbar.Collapse>
                </Container>
            </BootstrapNavbar>

            {/* Modal to display notifications */}
            <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Notifications</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul>
                        {notifications.map((notification, index) => (
                            <li key={index}>
                                <h5>{notification.message}</h5>
                                <h5>{notification.entityType}</h5>
                                <Button variant="primary" onClick={() => handleViewNotification(notification)}>
                                    View
                                </Button>
                            </li>
                        ))}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AppNavbar;
