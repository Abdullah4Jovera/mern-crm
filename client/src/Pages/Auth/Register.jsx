import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Form, Alert } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import Card from 'react-bootstrap/Card';
import loginimage from '../../assets/loginImages/loginimage.png';
import { Link } from 'react-router-dom';
import "@sl-codeblaster/react-3d-animated-card";
import AnimatedCard from "@sl-codeblaster/react-3d-animated-card";
import Card from "react-animated-3d-card";
import JoveraLogoweb from '../../assets/loginImages/JoveraLogoweb.png';

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        contactnumber: '',
        image: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.contactnumber) newErrors.contactnumber = 'Contact number is required';
        if (!formData.image) newErrors.image = 'Image is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        try {
            // Make API call to register user using formData
            const response = await fetch('https://studies-kde-suspension-composer.trycloudflare.com/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                navigate('/verify-otp');
                console.log(data.message);
            } else {
                // Handle registration error
                console.error(data.message);
                setErrors({ form: data.message });
            }
        } catch (error) {
            console.error('Registration failed:', error.message);
            setErrors({ form: 'Registration failed. Please try again.' });
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
                            <img className='logoimg' src={loginimage} alt='login' />
                            <Card.Title>Register Form</Card.Title>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group>
                                    <Form.Label className='classLabel'>Name</Form.Label>
                                    <Form.Control
                                        placeholder="Enter Name"
                                        type='text'
                                        name='name'
                                        onChange={handleChange}
                                        value={formData.name}
                                        isInvalid={!!errors.name}
                                    />
                                    <Form.Control.Feedback  style={{display:'flex', justifyContent:'start'}} type='invalid'>
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label className='classLabel'>Email</Form.Label>
                                    <Form.Control
                                        placeholder="Enter Email"
                                        type='email'
                                        name='email'
                                        onChange={handleChange}
                                        value={formData.email}
                                        isInvalid={!!errors.email}
                                    />
                                    <Form.Control.Feedback style={{display:'flex', justifyContent:'start'}} type='invalid'>
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label className='classLabel'>Password</Form.Label>
                                    <Form.Control
                                        placeholder="Enter Password"
                                        type='password'
                                        name='password'
                                        onChange={handleChange}
                                        value={formData.password}
                                        isInvalid={!!errors.password}
                                    />
                                    <Form.Control.Feedback  style={{display:'flex', justifyContent:'start'}} type='invalid'>
                                        {errors.password}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label className='classLabel'>Contact Number</Form.Label>
                                    <Form.Control
                                        placeholder="Enter Contact Number"
                                        type='number'
                                        name='contactnumber'
                                        onChange={handleChange}
                                        value={formData.contactnumber}
                                        isInvalid={!!errors.contactnumber}
                                    />
                                    <Form.Control.Feedback  style={{display:'flex', justifyContent:'start'}} type='invalid'>
                                        {errors.contactnumber}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label className='classLabel'>Image</Form.Label>
                                    <Form.Control
                                        type='file'
                                        name='image'
                                        onChange={handleChange}
                                        accept="image/*"
                                        isInvalid={!!errors.image}
                                    />
                                    <Form.Control.Feedback  style={{display:'flex', justifyContent:'start'}} type='invalid'>
                                        {errors.image}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {errors.form && (
                                    <Alert variant='danger' className='mt-3'>
                                        {errors.form}
                                    </Alert>
                                )}

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
                                        <Button type="submit" className='loginText'>Register</Button>
                                    )}
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
                                        <img className='logoimg' src={loginimage} alt='login' />

                                    </div>
                                    <div className="content">
                                        <h2 className="title" style={{ color: 'black', fontWeight: '600px', textAlign:'center' }} >Register Form</h2>
                                        <Form onSubmit={handleSubmit}>
                                            <Form.Group>
                                                <Form.Label className='classLabel'>Name</Form.Label>
                                                <Form.Control
                                                    placeholder="Enter Name"
                                                    type='text'
                                                    name='name'
                                                    onChange={handleChange}
                                                    value={formData.name}
                                                    isInvalid={!!errors.name}
                                                />
                                                <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type='invalid'>
                                                    {errors.name}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group>
                                                <Form.Label className='classLabel'>Email</Form.Label>
                                                <Form.Control
                                                    placeholder="Enter Email"
                                                    type='email'
                                                    name='email'
                                                    onChange={handleChange}
                                                    value={formData.email}
                                                    isInvalid={!!errors.email}
                                                />
                                                <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type='invalid'>
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group>
                                                <Form.Label className='classLabel'>Password</Form.Label>
                                                <Form.Control
                                                    placeholder="Enter Password"
                                                    type='password'
                                                    name='password'
                                                    onChange={handleChange}
                                                    value={formData.password}
                                                    isInvalid={!!errors.password}
                                                />
                                                <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type='invalid'>
                                                    {errors.password}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group>
                                                <Form.Label className='classLabel'>Contact Number</Form.Label>
                                                <Form.Control
                                                    placeholder="Enter Contact Number"
                                                    type='number'
                                                    name='contactnumber'
                                                    onChange={handleChange}
                                                    value={formData.contactnumber}
                                                    isInvalid={!!errors.contactnumber}
                                                />
                                                <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type='invalid'>
                                                    {errors.contactnumber}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group>
                                                <Form.Label className='classLabel'>Image</Form.Label>
                                                <Form.Control
                                                    type='file'
                                                    name='image'
                                                    onChange={handleChange}
                                                    accept="image/*"
                                                    isInvalid={!!errors.image}
                                                />
                                                <Form.Control.Feedback style={{ display: 'flex', justifyContent: 'start' }} type='invalid'>
                                                    {errors.image}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            {errors.form && (
                                                <Alert variant='danger' className='mt-3'>
                                                    {errors.form}
                                                </Alert>
                                            )}

                                            <div className='loginDiv' type="submit">
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
                                                    <Button type="submit" className='loginText'>Register</Button>
                                                )}
                                            </div>
                                        </Form>
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

export default Register;
