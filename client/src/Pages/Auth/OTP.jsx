import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container, Button, Spinner, Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import Card from 'react-bootstrap/Card';
import otp from '../../assets/loginImages/otp.png'
import { Link } from 'react-router-dom';
import '../Auth/Login.css'
import "@sl-codeblaster/react-3d-animated-card";
import AnimatedCard from "@sl-codeblaster/react-3d-animated-card";
import JoveraLogoweb from '../../assets/loginImages/JoveraLogoweb.png';

const OTP = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await axios.post('https://studies-kde-suspension-composer.trycloudflare.com/api/users/verify-otp', { ...data, email });
      toast.success(response.data.message);
      navigate('/reset-password', { state: { token: response.data.token, email } });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Error verifying OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="animated-container">

      <Row>
        <Col xs={12} md={12} className='forgotcontainer'>
          {/* <Card className='cardContainer'>
            <Card.Body>
              <img className='forgotImage' src={otp} alt='otp' />
              <Card.Title>OTP Verification</Card.Title>
              <h6 className='verfifyAccount' >Please Enter the One Time Password to Verify Account</h6>
              <p>A one Time Password has been sent to your Email</p>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group controlId="formOTP">
                  <Form.Control
                    type="text"
                    placeholder="Enter the OTP"
                    {...register('otp', { required: 'OTP is required' })}
                    isInvalid={!!errors.otp}
                  />
                  <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type="invalid">
                    {errors.otp?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className='loginDiv'>
                  {
                    isLoading ?
                      <Link className='loginText'>
                        <Spinner
                          as="span"
                          animation="grow"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        Loading...
                      </Link> :
                      <Button type="submit" className='loginText'>Validate OTP</Button>
                  }
                </div>
              </Form>
              <ToastContainer />
            </Card.Body>
          </Card> */}
          <div className='divConatainer'>
            <img src={JoveraLogoweb} alt='Logo' className="login_image" />
            <div>
              <AnimatedCard
                config={{
                  rotation: 15,
                  transition: {
                    duration: 0.5,
                    timingMode: "ease"
                  },
                  transform: {
                    figureIcon: {
                      rotation: 20,
                      translateZ: 160
                    },
                    titleTranslateZ: 140,
                    bodyTextTranslateZ: 100,
                    buttonTranslateZ: 80
                  }
                }}
                style={{
                  width: '100%'
                }}
              >

                <div className="card cardContainer">
                  <div className="figure">
                    <div className="figure_bg" />
                    <img className='forgotImage' src={otp} alt='otp' />
                  </div>
                  <div className="content">
                    <h2 className="title" style={{ color: 'black', fontWeight: '600px', textAlign:'center' }} >OTP Verification</h2>
                    <h6 className='signInfo' style={{ color: 'black', fontWeight: '600px', textAlign:'center' }} >Please Enter the One Time Password to Verify Account</h6>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                      <Form.Group controlId="formOTP">
                        <Form.Control
                          type="text"
                          placeholder="Enter the OTP"
                          {...register('otp', { required: 'OTP is required' })}
                          isInvalid={!!errors.otp}
                        />
                        <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type="invalid">
                          {errors.otp?.message}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <div className='loginDiv'>
                        {
                          isLoading ?
                            <Link className='loginText'>
                              <Spinner
                                as="span"
                                animation="grow"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                              />
                              Loading...
                            </Link> :
                            <Button type="submit" className='loginText'>Validate OTP</Button>
                        }
                      </div>
                    </Form>
                    <ToastContainer />
                  </div>
                </div>

              </AnimatedCard>
            </div>
          </div>
        </Col>
      </Row>
      {/* <div style={{ width: '100%', maxWidth: '400px', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#AE82CE' }}>Verify OTP</h2>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group controlId="formOTP">
            <Form.Label>OTP</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter the OTP"
              {...register('otp', { required: 'OTP is required' })}
              isInvalid={!!errors.otp}
            />
            <Form.Control.Feedback type="invalid">
              {errors.otp?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Button
            variant="success"
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', backgroundColor: '#AE82CE', borderColor: '#AE82CE', marginTop: '20px' }}
          >
            {isLoading ? <Spinner animation="border" size="sm" /> : 'Verify OTP'}
          </Button>
        </Form>
        <ToastContainer />
      </div> */}
    </Container>
  );
};

export default OTP;
