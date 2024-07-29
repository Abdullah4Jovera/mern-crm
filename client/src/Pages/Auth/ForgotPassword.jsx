import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container, Button, Spinner, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import Card from 'react-bootstrap/Card';
import forgotpassword from '../../assets/loginImages/forgotpassword.png';
import { Link } from 'react-router-dom';
import '../Auth/forgotpassword.css'; // Ensure correct path to your CSS file
import "@sl-codeblaster/react-3d-animated-card";
import AnimatedCard from "@sl-codeblaster/react-3d-animated-card";
import JoveraLogoweb from '../../assets/loginImages/JoveraLogoweb.png';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/users/forgot-password', data);
      toast.success(response.data.message);
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.message || 'Error sending OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="animated-container">

      <Row >
        <Col xs={12} md={12} className='forgotcontainer'>
          {/* <Card className='cardContainer'>
            <Card.Body>
              <img className='forgotImage' src={forgotpassword} alt='login' />
              <Card.Title>Reset Password</Card.Title>
              <h6 className='signInfo'>Enter Your Email below to Reset Your Password</h6>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group controlId="formEmail">
                  <Form.Control
                    placeholder="Enter Email"
                    type='email'
                    {...register('email', { required: 'Email is required' })}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type="invalid">
                    {errors.email?.message}
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
                      <Button type="submit" className='loginText'>Reset Password</Button>
                  }
                </div>

                <div className='backloginDiv'>
                  <Link to={'/'} className='backtoLogin'>Back to Login</Link>
                </div>

              </Form>
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
                    <img className='forgotImage' src={forgotpassword} alt='login' />
                  </div>
                  <div className="content">
                    <h2 className="title" style={{ color: 'black', fontWeight: '600px', textAlign:'center' }} >Reset Password</h2>
                    <h6 className='signInfo'style={{ color: 'black', fontWeight: '600px', textAlign:'center' }} >Enter Your Email below to Reset Your Password</h6>

                    <Form onSubmit={handleSubmit(onSubmit)}>
                      <Form.Group controlId="formEmail">
                        <Form.Control
                          placeholder="Enter Email"
                          type='email'
                          {...register('email', { required: 'Email is required' })}
                          isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type="invalid">
                          {errors.email?.message}
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
                            <Button type="submit" className='loginText'>Reset Password</Button>
                        }
                      </div>

                      <div className='backloginDiv'>
                        <Link to={'/'} className='backtoLogin'>Back to Login</Link>
                      </div>

                    </Form>
                  </div>
                </div>

              </AnimatedCard>
            </div>
          </div>
        </Col>
      </Row>

      <ToastContainer />
    </Container>
  );
};

export default ForgotPassword;
