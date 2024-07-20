import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import logo from '../../assets/loginImages/favicon.png'

const BusinessFinanceNavbar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate()

    const handleLogout = () => {
        logout();
    };

    return (
        <Navbar expand="lg" className="navbarcontainer">
            <Container>
                <img src={logo} alt='Logo' onClick={() => navigate('/superadmindashboard')} style={{ cursor: 'pointer' }} className="logo-image" />
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                    <Nav className="m-auto" style={{ maxHeight: '100px' }} navbarScroll>
                        <Nav.Link href="#action1">Support</Nav.Link>
                        <Nav.Link href="#action2">Terms</Nav.Link>
                        <Nav.Link href="#">
                            Privacy
                        </Nav.Link>
                        <NavDropdown title="EN" id="navbarScrollingDropdown">
                            <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                            <NavDropdown.Item href="#action4">
                                Another action
                            </NavDropdown.Item>
                            <NavDropdown.Item href="#action5">
                                Something else here
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default BusinessFinanceNavbar