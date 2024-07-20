import React, { useState, useContext } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import SuperAdminNavbar from '../../components/navbar/Navbar';
import { Container, Spinner, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import styled, { keyframes } from 'styled-components';
import background from '../../assets/loginImages/bg.png';
import { CircularProgressBar } from "react-percentage-bar";
import './SuperAdmin.css';
import SideBar from './SideBar';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledCard = styled(Card)`
  animation: ${fadeIn} 0.5s ease-in-out;
  background-image: url(${background});
  background-size: cover;
  background-position: center;
  color: white;
  margin-top: 20px;
 transition: background-color 0.3s ease;
  opacity: 0.9;
  .card-body {
    display: flex;
    flex-direction: column;
    justify-content: start;
    // background: rgba(0, 0, 0, 0.5);
  }
  h6, .card-title {
    color: white;
  }
    
`;

const Title = styled.h3`
  text-align: center;
  color: #343a40;
`;

const LoanDetail = styled.div`
  flex-grow: 1;
  & > h6 {
    margin: 5px 0;
    text-align: start;
  }
`;

const ProgressBarContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: auto;
`;

const isImage = (url) => {
    return /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(url);
};

const isPDF = (url) => {
    return /\.pdf$/i.test(url);
};

const SuperAdminDashboard = () => {
    const { state, loading, error } = useContext(AuthContext);
    const { loans } = state;
    const [selectedLoanType, setSelectedLoanType] = useState('allBusinessFinanceLoans');
    const [showModal, setShowModal] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState(null);

    const handleShowModal = (documents) => {
        setSelectedDocuments(documents);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDocuments(null);
    };

    if (loading) {
        return (
            <div>
                <SuperAdminNavbar />
                <Container className="text-center">
                    <Spinner animation="border" />
                </Container>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <SuperAdminNavbar />
                <Container className="text-center">
                    <p>Error: {error}</p>
                </Container>
            </div>
        );
    }

    const filteredLoans = loans[selectedLoanType] || [];

    const renderLoanDetails = (loan) => {
        let progressBarProps = {};
        switch (loan.status) {
            case 'Request To Call':
                progressBarProps = {
                    trackColor: 'rgba(0, 0, 255, 0.5)',
                    backgroundColor: 'rgba(0, 0, 255, 0.5)',
                };
                break;
            case 'Follow Up':
                progressBarProps = {
                    trackColor: 'rgba(255, 255, 0, 0.5)',
                    backgroundColor: 'rgba(255, 255, 0, 0.5)',
                };
                break;
            case 'Reject':
                progressBarProps = {
                    trackColor: 'rgba(255, 0, 0, 0.5)',
                    backgroundColor: 'rgba(255, 0, 0, 0.5)',
                };
                break;
            default:
                progressBarProps = {
                    trackColor: 'grey',
                    backgroundColor: 'grey',
                };
                break;
        }

        return (
            <>
                <LoanDetail>

                    {selectedLoanType === 'allMortgageLoans' && (
                        <>
                            <h6>{`Name: ${loans.allBusinessFinanceLoans[0]?.userId?.name ? loans.allBusinessFinanceLoans[0]?.userId?.name : 'User Name Not Found'}`}</h6>
                            <h6>{`Email: ${loans.allBusinessFinanceLoans[0]?.userId?.email ? loans.allBusinessFinanceLoans[0]?.userId?.email : 'User Email Not Found'}`}</h6>
                            <h6>{`Contact Number: ${loans.allBusinessFinanceLoans[0].userId.contactNumber ? loans.allBusinessFinanceLoans[0].userId.contactNumber : 'UserNumber Not Found'}`}</h6>
                            <h6>{`Property Location: ${loan.propertyLocation || 'N/A'}`}</h6>
                            <h6>{`Type of Property: ${loan.typeOfProperty || 'N/A'}`}</h6>
                            <h6>{`Monthly Income: ${loan.monthlyIncome || 'N/A'} AED`}</h6>
                            <h6>{`Source: ${loan.source || 'N/A'}`}</h6>
                            <h6>{`Message: ${loan.message || 'Jovera Group! A Complete Real-Estate and Financial Solution'}`}</h6>
                            <h6>{`Date: ${new Date(loan.applicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}</h6>
                            <h6>{`Documents: ${loan.documents.length || 'No documents available'}`}</h6>
                            {loan.documents.length > 0 ? (
                                <Button className='viewDocClass' onClick={() => handleShowModal(loan.documents)}>View Documents</Button>
                            ) : null}
                        </>
                    )}
                    {selectedLoanType === 'allPersonalLoans' && (
                        <>
                            <h6>{`Name: ${loans.allPersonalLoans[0]?.userId?.name ? loans.allBusinessFinanceLoans[0]?.userId?.name : ''}`}</h6>
                            <h6>{`Email: ${loans.allPersonalLoans[0]?.userId?.email ? loans.allBusinessFinanceLoans[0]?.userId?.email : ''}`}</h6>
                            <h6>{`Contact Number: ${loans.allPersonalLoans[0].userId.contactNumber ? loans.allBusinessFinanceLoans[0].userId.contactNumber : ''}`}</h6>
                            <h6>{`Company Name: ${loan.companyName || 'Jovera Group'}`}</h6>
                            <h6>{`Source: ${loan.source || ''}`}</h6>
                            <h6>{`Monthly Salary: ${loan.monthlySalary || 'N/A'} AED`}</h6>
                            <h6>{`Any Loan: ${loan.anyLoan ? 'Yes' : 'No'}`}</h6>
                            <h6>{`Loan Amount: ${loan.loanAmount || '0'} AED`}</h6>
                            <h6>{`Loan Amount: ${loan.previousloanAmount ? loan.previousloanAmount : '0'} AED`}</h6>
                            <h6>{`Message: ${loan.message || 'Jovera Group! A Complete Real-Estate and Financial Solution'}`}</h6>
                            <h6>{`Date: ${new Date(loan.applicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}</h6>
                            <h6>{`Documents: ${loan.documents.length || 'No documents available'}`}</h6>
                            {loan.documents.length > 0 ? (
                                <Button className='viewDocClass' onClick={() => handleShowModal(loan.documents)}>View Documents</Button>
                            ) : null}
                        </>
                    )}
                    {selectedLoanType === 'allBusinessFinanceLoans' && (
                        <>
                            <h6>{`Name: ${loans.allBusinessFinanceLoans[0]?.userId?.name ? loans.allBusinessFinanceLoans[0]?.userId?.name : ''}`}</h6>
                            <h6>{`Email: ${loans.allBusinessFinanceLoans[0]?.userId?.email ? loans.allBusinessFinanceLoans[0]?.userId?.email : ''}`}</h6>
                            <h6>{`Contact Number: ${loans.allBusinessFinanceLoans[0].userId.contactNumber ? loans.allBusinessFinanceLoans[0].userId.contactNumber : ''}`}</h6>
                            <h6>{`Company Name: ${loan.companyName || 'Jovera Group'}`}</h6>
                            <h6>{`Services: ${loan.services || ''}`}</h6>
                            <h6>{`Source: ${loan.source || ''}`}</h6>
                            <h6>{`Company POS: ${loan.companyPOS ? 'True' : 'False'}`}</h6>
                            <h6>{`Company Auto Finance: ${loan.companyAutoFinance ? 'True' : 'False'}`}</h6>
                            <h6>{`Pos TurnOver Monthly: ${loan.posTurnoverMonthly ? loan.posTurnoverMonthly : '0'}`}</h6>
                            <h6>{`Company TurnOver Anually: ${loan.companyTurnoverAnually ? loan.companyTurnoverAnually : '0'}`}</h6>
                            <h6>{`Message: ${loan.message || 'Jovera Group! A Complete Real-Estate and Financial Solution'}`}</h6>
                            <h6>{`Date: ${new Date(loan.applicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}</h6>
                            <h6>{`Documents: ${loan.documents.length || 'No documents available'}`}</h6>
                            {loan.documents.length > 0 ? (
                                <Button className='viewDocClass' onClick={() => handleShowModal(loan.documents)}>View Documents</Button>
                            ) : null}
                        </>
                    )}
                </LoanDetail>
                {/* <ProgressBarContainer>
          <CircularProgressBar
            size={"1rem"}
            radius={"6rem"}
            text={loan.status}
            animation={true}
            textStyle={{ color: 'white' }}
            showPercentage={false}
            stroke="rgba(255, 255, 0, 0.5)" // Set the stroke color here
            {...progressBarProps}
            className='circularRange no-stroke'
          />
        </ProgressBarContainer> */}
            </>
        );
    };

    const getTitle = () => {
        switch (selectedLoanType) {
            case 'allBusinessFinanceLoans':
                return 'Business Loan';
            case 'allMortgageLoans':
                return 'Mortgage Loan';
            case 'allPersonalLoans':
                return 'Personal Loan';
            default:
                return 'Loan';
        }
    };

    return (
        <div>
            <SuperAdminNavbar />
            <Container fluid>
                <Row>
                    <Col xs={12} sm={12} md={2} lg={2} xl={2} xxl={2} className='colContainerSidebar'>
                        <SideBar />
                    </Col>

                    <Col xs={12} sm={12} md={12} lg={10} xl={10} xxl={10} >
                        <Row>
                            <Col xs={12} sm={12} md={12}>
                                <div className="AllLoansbtnContainer">
                                    <Button className="AllLoansbtn" onClick={() => setSelectedLoanType('allBusinessFinanceLoans')}>Business Loan</Button>
                                    <Button className="AllLoansbtn" onClick={() => setSelectedLoanType('allMortgageLoans')}>Mortgage Loan</Button>
                                    <Button className="AllLoansbtn" onClick={() => setSelectedLoanType('allPersonalLoans')}>Personal Loan</Button>
                                    <Button className="AllLoansbtn" onClick={() => setSelectedLoanType('allBusinessFinanceLoans')}>Business Loan</Button>
                                    <Button className="AllLoansbtn" onClick={() => setSelectedLoanType('allMortgageLoans')}>Mortgage Loan</Button>
                                    <Button className="AllLoansbtn" onClick={() => setSelectedLoanType('allPersonalLoans')}>Personal Loan</Button>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12} sm={12} md={6} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', alignItems: 'center' }} >
                                {
                                    filteredLoans.map((loan, index) => {
                                        console.log(loan?.userId, 'userloanloan')
                                        return (
                                            <StyledCard style={{ width: '100%', maxWidth: '350px', height: '100%', maxHeight: '500px', }} key={index}>
                                                <Card.Body>
                                                    <Card.Title>
                                                        {getTitle()}
                                                    </Card.Title>
                                                    <Card.Text>
                                                        {renderLoanDetails(loan)}
                                                    </Card.Text>
                                                </Card.Body>
                                            </StyledCard>
                                        );
                                    })
                                }
                            </Col>
                            <Col xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}>1</Col>
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

export default SuperAdminDashboard;
