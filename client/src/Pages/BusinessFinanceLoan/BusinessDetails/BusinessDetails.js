import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../Auth/AuthContext';
import { Container, Row, Col, Spinner, Table, Dropdown, Button, Modal } from 'react-bootstrap';
import SideBar from '../../SuperAdminPages/SideBar';
import BusinessFinanceNavbar from '../BusinessFinanceNavbar';
import Card from 'react-bootstrap/Card';
import { CircularProgressBar } from "react-percentage-bar";
import '../BusinessManager.css';

const BusinessDetails = () => {
    const { id } = useParams();
    const { state } = useContext(AuthContext);
    const [loanData, setLoanData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState(null);

    const handleShowModal = (documents) => {
        if (Array.isArray(documents)) {
            setSelectedDocuments(documents);
        } else {
            setSelectedDocuments([documents]);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDocuments(null);
    };

    const isImage = (url) => /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(url);

    const isPDF = (url) => /\.pdf$/i.test(url);

    useEffect(() => {
        const fetchLoanDetails = async () => {
            try {
                const response = await axios.get(
                    `/api/loans/loan/businessFinanceLoans/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${state.userinfo.token}`
                        }
                    }
                );
                setLoanData(response.data);
            } catch (error) {
                console.error('Error fetching loan details:', error);
            }
        };

        fetchLoanDetails();
    }, [id, state.userinfo.token]);

    const updateLoanStatus = async (status) => {
        try {
            await axios.put(
                `http://192.168.2.137:8080/api/businessfinance-loans/update-loan-status/${id}`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${state.userinfo.token}`
                    }
                }
            );
            setLoanData(prevState => ({ ...prevState, status }));
            
        } catch (error) {
            console.error('Error updating loan status:', error);
        }
    };

    return (
        <div>
            <BusinessFinanceNavbar />
            <Container fluid>
                <Row>
                    <Col xs={12} sm={12} md={2}>
                        <SideBar />
                    </Col>
                    <Col xs={12} sm={12} md={10}>
                        {loanData ? (
                            <div className="table-container">
                                <Table striped bordered hover responsive size="lg mt-3">
                                    <thead style={{ textAlign: 'center' }} className='tableHead'>
                                        <tr>
                                            <th>Company Name</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Contact Number</th>
                                            <th>Services</th>
                                            <th>Source</th>
                                            <th>Company POS</th>
                                            <th>POS Turnover Monthly</th>
                                            <th>Turnover Annually</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ textAlign: 'center' }}>
                                            <td>{loanData.companyName}</td>
                                            <td>{loanData.userId?.name || 'User Deleted'}</td>
                                            <td>{loanData.userId?.email || 'Email Not Found'}</td>
                                            <td>{loanData.userId?.contactNumber || 'N/A'}</td>
                                            <td>{loanData.services}</td>
                                            <td>{loanData.source}</td>
                                            <td>{loanData.companyPOS ? 'Yes' : 'No'}</td>
                                            <td>{loanData.posTurnoverMonthly}</td>
                                            <td>{loanData.companyTurnoverAnually}</td>
                                            <td>{`${new Date(loanData.applicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className='mt-5'>
                                <Spinner animation="grow" />
                            </div>
                        )}
                        <Row>
                            <Col xs={12} sm={12} md={6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Card className='cardContainer mt-5 cardLeft'>
                                    <Card.Body>
                                        {
                                            loanData?.status ?
                                                <Card.Title style={{ marginTop: '15px' }} > {`Loan Status : ${loanData?.status && loanData?.status}`}</Card.Title>
                                                : <Spinner animation="grow" />
                                        }
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }} className='mt-3' >
                                            <CircularProgressBar
                                                size={"1rem"}
                                                radius={"5rem"}
                                                text={loanData?.status && loanData?.status}
                                                animation={true}
                                                textStyle={{ color: 'black' }}
                                                showPercentage={false}
                                                className='circularRange no-stroke'
                                            />
                                        </div>
                                        <Dropdown style={{ marginTop: '15px' }} >
                                            <Dropdown.Toggle className='dropdownbtn' >
                                                Change Status
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => updateLoanStatus('Follow Up')} >Follow Up</Dropdown.Item>
                                                <Dropdown.Item onClick={() => updateLoanStatus('Reject')} >Reject</Dropdown.Item>
                                                <Dropdown.Item onClick={() => updateLoanStatus('Request To Call')} >Request To Call</Dropdown.Item>
                                                <Dropdown.Item onClick={() => updateLoanStatus('Submit Documents')} >Submit Documents</Dropdown.Item>
                                                <Dropdown.Item onClick={() => updateLoanStatus('Request To Signature')} >Request To Signature</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} sm={12} md={6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Card className='cardContainer mt-5 cardRight'>
                                    <Card.Body>
                                        <Card.Title>Documents</Card.Title>
                                        <Button className='dropdownbtn' onClick={() => handleShowModal(loanData.documents)}>
                                            View Documents
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Documents</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDocuments ? (
                        <div>
                            {selectedDocuments.length > 0 ? (
                                selectedDocuments.map((doc, index) => (
                                    <div key={index} style={{ marginBottom: '1rem' }}>
                                        {isImage(doc) ? (
                                            <div className='imageViewContainer'>
                                                <img src={doc} className='modalViewDocImage' alt={`Document ${index + 1}`} />
                                            </div>
                                        ) : isPDF(doc) ? (
                                            <iframe src={doc} title={`Document ${index + 1}`} style={{ width: '100%', height: '500px' }} />
                                        ) : (
                                            <a href={doc} target="_blank" rel="noopener noreferrer">
                                                View Document {index + 1}
                                            </a>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No documents available</p>
                            )}
                        </div>
                    ) : (
                        <p>No documents available</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BusinessDetails;
