import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container, Button, Spinner, Form, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import resetpass from '../../assets/loginImages/resetpass.png';
import { Link } from 'react-router-dom';
import "@sl-codeblaster/react-3d-animated-card";
import AnimatedCard from "@sl-codeblaster/react-3d-animated-card";
import Card from "react-animated-3d-card";
import JoveraLogoweb from '../../assets/loginImages/JoveraLogoweb.png';

const ResetPassword = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [getEmail, setGetEmail] = useState('')
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;
  const email = location.state?.email;
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await axios.post('https://studies-kde-suspension-composer.trycloudflare.com/api/users/reset-password', { ...data, token, email, newPassword: data.password });
      toast.success(response.data.message);
      navigate('/');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Error resetting password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getUserEmail = localStorage.getItem('userinfo')
    const parseEmail = JSON.parse(getUserEmail)
    setGetEmail(parseEmail)
  }, [])



  return (
    <Container fluid className="animated-container">
      <Row>
        <Col xs={12} md={12} className='forgotcontainer'>
          {/* <Card className='cardContainer'>
            <Card.Body>
              <img className='logoimg' src={resetpass} alt='Reset Password' />
              {
                getEmail ? <h6>Enter a New Password for {getEmail.email && getEmail.email} </h6> : <p style={{ color: 'red' }} >User Not Found! Please Login First</p>
              }

              <Card.Title>Reset Password</Card.Title>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group controlId="formPassword">
                  <Form.Label className='classLabel'>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter New Password"
                    {...register('password', {
                      required: 'Password is Required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formConfirmPassword">
                  <Form.Label className='classLabel'>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm New Password"
                    {...register('confirmPassword', {
                      required: 'Please Confirm Your Password',
                      validate: value =>
                        value === password || 'Passwords do not match'
                    })}
                    isInvalid={!!errors.confirmPassword}
                  />
                  <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type="invalid">
                    {errors.confirmPassword?.message}
                  </Form.Control.Feedback>
                </Form.Group>
                <div className='loginDiv'>
                  {isLoading ? (
                    <Link className='loginText'>
                      <Spinner
                        as="span"
                        animation="grow"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      Loading...
                    </Link>
                  ) : (
                    <Button type="submit" className='loginText'>Reset Password</Button>
                  )}
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
                    <img className='logoimg' src={resetpass} alt='Reset Password' />
                    {
                      getEmail ? <h6>Enter a New Password for {getEmail.email && getEmail.email} </h6> : <p style={{ color: 'red' }} >User Not Found! Please Login First</p>
                    }

                  </div>
                  <div className="content">
                    <h2 className="title" style={{ color: 'black', fontWeight: '600px', textAlign:'center' }} >Reset Password</h2>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                      <Form.Group controlId="formPassword">
                        <Form.Label className='classLabel'>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter New Password"
                          {...register('password', {
                            required: 'Password is Required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters'
                            }
                          })}
                          isInvalid={!!errors.password}
                        />
                        <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type="invalid">
                          {errors.password?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group controlId="formConfirmPassword">
                        <Form.Label className='classLabel'>Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm New Password"
                          {...register('confirmPassword', {
                            required: 'Please Confirm Your Password',
                            validate: value =>
                              value === password || 'Passwords do not match'
                          })}
                          isInvalid={!!errors.confirmPassword}
                        />
                        <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type="invalid">
                          {errors.confirmPassword?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <div className='loginDiv'>
                        {isLoading ? (
                          <Link className='loginText'>
                            <Spinner
                              as="span"
                              animation="grow"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                            Loading...
                          </Link>
                        ) : (
                          <Button type="submit" className='loginText'>Reset Password</Button>
                        )}
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
    </Container>
  );
};

export default ResetPassword;
