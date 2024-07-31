import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Container, Spinner, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from './AuthContext';
import loginimage from '../../assets/loginImages/loginimage.png';
import '../Auth/Login.css'; // Import your CSS file
import "@sl-codeblaster/react-3d-animated-card";
import AnimatedCard from "@sl-codeblaster/react-3d-animated-card";
import JoveraLogoweb from '../../assets/loginImages/JoveraLogoweb.png';

const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { state: { userinfo }, login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userinfo) {
      const role = userinfo.role;
      const roleBasedDashboard = {
        CEO: '/ceodashboard',
        MD: '/mddashboard',
        superadmin: '/superadmindashboard',
        personalloanmanger: '/personalloandashboard',
        personalloanHOD: '/personalloandashboard',
        personalloancordinator: 'personalloandashboard',
        personalloanteamleader: '/personalloandashboard',
        personalloansales: '/personalloandashboard',
        businessfinanceloanmanger: '/businessfinancedashboard',
        businessfinanceloancordinator: '/businessfinancedashboard',
        businessfinanceloanteamleader: '/businessfinancedashboard',
        businessfinanceloansales: '/businessfinancedashboard',
        businessfinanceloanHOD: '/businessfinancedashboard',
        realestateloanmanger: '/realestateloanmangerdashboard',
        realestateloanHOD: '/realestateloanHOD',
        realestateloancordinator: '/realestateloancordinator',
        realestateloanteamleader: '/realestateloanteamleader',
        realestateloansales: '/realestateloansales',
        mortgageloanmanger: '/mortgageloanmangerdashboard',
        mortgageloanHOD: '/mortgageloanHOD',
        mortgageloancordinator: '/mortgageloancordinator',
        mortgageloanteamleader: '/mortgageloanteamleader',
        mortgageloansales: '/mortgageloansales',
        marketingagent:'/marketingdashboard',
        marketingmanager:'/marketingdashboard',
        telesaleagent:'/telesaledashboard',
        telesaleteamleader:'/telesaledashboard',
      };
      navigate(roleBasedDashboard[role] || '/userdashboard');
    }
  }, [userinfo, navigate]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/users/login', data);
      const userData = response.data.user;

      login(userData);

      const role = userData.role;
      const roleBasedDashboard = {
        CEO: '/ceodashboard',
        MD: '/mddashboard',
        superadmin: '/superadmindashboard',
        personalloanmanger: '/personalloandashboard',
        personalloanHOD: '/personalloandashboard',
        personalloancordinator: 'personalloandashboard',
        personalloanteamleader: '/personalloandashboard',
        personalloansales: '/personalloandashboard',
        businessfinanceloanmanger: '/businessfinancedashboard',
        businessfinanceloancordinator: '/businessfinancedashboard',
        businessfinanceloanteamleader: '/businessfinancedashboard',
        businessfinanceloansales: '/businessfinancedashboard',
        businessfinanceloanHOD: '/businessfinancedashboard',
        realestateloanmanger: '/realestateloanmangerdashboard',
        realestateloanHOD: '/realestateloanHOD',
        realestateloancordinator: '/realestateloancordinator',
        realestateloanteamleader: '/realestateloanteamleader',
        realestateloansales: '/realestateloansales',
        mortgageloanmanger: '/mortgageloanmangerdashboard',
        mortgageloanHOD: '/mortgageloanHOD',
        mortgageloancordinator: '/mortgageloancordinator',
        mortgageloanteamleader: '/mortgageloanteamleader',
        mortgageloansales: '/mortgageloansales',
        marketingagent:'/marketingdashboard',
        marketingmanager:'/marketingdashboard',
        telesaleagent:'/telesaledashboard',
        telesaleteamleader:'/telesaledashboard',
      };
      navigate(roleBasedDashboard[role] || '/userdashboard');
    } catch (error) {
      if (error.response) {
        const { status } = error.response.data;
        switch (status) {
          case 404:
            toast.error('User not found.');
            break;
          case 401:
            toast.warn('Email not verified. OTP sent for verification.');
            break;
          case 402:
            toast.error('Incorrect password.');
            break;
          default:
            toast.error('Internal server error. Please try again later.');
        }
      } else {
        console.error('Error logging in:', error);
        toast.error('Error logging in. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="animated-container">
      <Row>
        <Col xs={12} md={12} className='loginContainer'>
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
                    <img className='logoimg' src={loginimage} alt='login' />
                  </div>
                  <div className="content">
                    <h2 className="title" style={{ color: 'black', fontWeight: '600px', textAlign: 'center' }} >User Login</h2>
                    <h6 className='signInfo' style={{ color: 'black', fontWeight: '600px', textAlign: 'center' }}>Sign in by Entering the Information Below</h6>
                    <Form.Label className='classLabel'>Email</Form.Label>
                    <Form.Control
                      placeholder="Email or Contact Number"
                      type='email'
                      name='emailOrContact'
                      {...register('emailOrContact', { required: 'Email or Contact Number is required' })}
                      isInvalid={errors.emailOrContact}
                    />
                    {errors.emailOrContact && <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type="invalid">{errors.emailOrContact.message}</Form.Control.Feedback>}

                    <Form.Label className='classLabel'>Password</Form.Label>
                    <Form.Control
                      placeholder='Password'
                      type='password'
                      name='password'
                      {...register('password', { required: 'Password is required' })}
                      isInvalid={errors.password}
                    />
                    {errors.password && <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type="invalid">{errors.password.message}</Form.Control.Feedback>}
                    <div className='loginDiv' onClick={handleSubmit(onSubmit)} style={{ cursor: 'pointer' }}>
                      {isLoading ?
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
                        <Link className='loginText'>Login</Link>
                      }
                    </div>
                    <hr className='hrtag' />
                    <div className='classLabelforgot'>
                      <Link to={'/forgot-password'} className='forgotpass'>Forgot Password</Link>
                    </div>
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

export default Login;
