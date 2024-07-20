import React, { useContext, useEffect, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { AuthContext } from '../../Pages/Auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import logo from '../../assets/loginImages/favicon.png';
import './Navbar.css';
import CustomMessage from '../../Pages/SuperAdminPages/CustomMessagePage';

function SuperAdminNavbar() {
  const { logout, state } = useContext(AuthContext);
  const { userinfo } = state;
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanDetails, setLoanDetails] = useState(null);

  useEffect(() => {
    if (userinfo) {
      const socket = io('http://localhost:8080', {
        query: { userId: userinfo._id },
        transports: ['websocket']
      });

      socket.on('newNotification', (notification) => {
        setNotifications(prevNotifications => [...prevNotifications, notification]);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [userinfo]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotificationsClick = () => {
    setShowNotificationModal(true);
  };

  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
  };

  const handleNotificationClick = async (loanId, loanType) => {
    try {
      const response = await fetch(`http://localhost:8080/api/loans/single-loan-for-superadmin/${loanId}/${loanType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.userinfo.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loan details');
      }

      const data = await response.json();
      setLoanDetails(data);
      setShowLoanModal(true);
      setNotifications(prevNotifications => prevNotifications.filter(notif => notif.loanId !== loanId));
    } catch (error) {
      console.error('Error fetching loan details:', error);
    }
  };

  const handleCloseLoanModal = () => {
    setLoanDetails(null);
    setShowLoanModal(false);
    if (loanDetails) {
      setNotifications(prevNotifications => prevNotifications.filter(notif => notif.loanId !== loanDetails._id));
    }
  };

  return (
    <>
      <Navbar expand="lg" className="navbarcontainer">
        <Container>
          <img
            src={logo}
            alt='Logo'
            onClick={() => navigate('/superadmindashboard')}
            style={{ cursor: 'pointer' }}
            className="logo-image"
          />
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
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
              <Nav.Link>
                <Link to="/custommassage">Custom Message</Link>
              </Nav.Link>
              <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Modal to display notifications */}
      <Modal show={showNotificationModal} onHide={handleCloseNotificationModal}>
        <Modal.Header closeButton>
          <Modal.Title>Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            {notifications.map((notification, index) => (
              <li key={index} onClick={() => handleNotificationClick(notification.loanId, notification.entityType)}>
                {notification.message} (Entity Type: {notification.entityType})
              </li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseNotificationModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal to display loan details */}
      <Modal show={showLoanModal} onHide={handleCloseLoanModal}>
        <Modal.Header closeButton>
          <Modal.Title>Loan Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loanDetails ? (
            <div>
              <p><strong>Company Name:</strong> {loanDetails.companyName}</p>
              <p><strong>Company Turnover Annually:</strong> {loanDetails.companyTurnoverAnually}</p>
              <p><strong>Company Auto Finance:</strong> {loanDetails.companyAutoFinance}</p>
              <p><strong>Total EMI Paid Monthly:</strong> {loanDetails.totalEMIDpaidMonthly}</p>
              <p><strong>LG Request For:</strong> {loanDetails.LGRequestFor}</p>
              <p><strong>POS Turnover Monthly:</strong> {loanDetails.posTurnoverMonthly}</p>
              <p><strong>Company POS:</strong> {loanDetails.companyPOS}</p>
              <p><strong>Services:</strong> {loanDetails.services}</p>
              <p><strong>Message:</strong> {loanDetails.message}</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLoanModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SuperAdminNavbar;
