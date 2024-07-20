import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import axios from 'axios';
import { Card, Button, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Loans = () => {
    const { state } = useContext(AuthContext);
    const { userinfo } = state;
    const [allLoans, setAllLoans] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await axios.get('/api/loans/my-loans', {
                    headers: {
                        Authorization: `Bearer ${userinfo.token}`
                    }
                });
                setAllLoans(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userinfo && userinfo.token) {
            fetchLoans();
        }
    }, [userinfo]);

    const handleDetailsClick = (loanType, loanId) => {
        navigate(`/loan/${loanType}/${loanId}`);
    };

    if (loading) {
        return <Spinner animation="border" role="status"><span className="sr-only">Loading...</span></Spinner>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <Container>
            <h1 className="my-4">My Loans</h1>
            <Row>
                {Object.entries(allLoans).map(([loanType, loans]) => (
                    loans.length > 0 && (
                        <Col key={loanType} xs={12}>
                            <h2>{loanType}</h2>
                            <Row>
                                {loans.map(loan => (
                                    <Col key={loan._id} xs={12} md={6} lg={4} xl={3}>
                                        <Card className="mb-4" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                                            <Card.Body>
                                                <Card.Title>{loan.companyName}</Card.Title>
                                                <Card.Text>
                                                    Service: {loan.services}
                                                </Card.Text>
                                                <Card.Text>
                                                    Status: {loan.status}
                                                </Card.Text>
                                                <Card.Text>
                                                    Application Date: {new Date(loan.applicationDate).toLocaleDateString()}
                                                </Card.Text>
                                                <Button variant="primary" onClick={() => handleDetailsClick(loanType, loan._id)}>Details</Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    )
                ))}
            </Row>
        </Container>
    );
};

export default Loans;
