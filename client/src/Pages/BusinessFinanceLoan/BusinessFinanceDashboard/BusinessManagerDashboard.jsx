import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../Auth/AuthContext';
import BusinessFinanceNavbar from '../BusinessFinanceNavbar';
import { Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

import '../BusinessManager.css';
import BusinessLead from '../../../components/BusinessLead';

const BusinessManagerDashboard = () => {
  const { state } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    service: 'Business Loan',
    client: '',
    selectedUsers: [],
    stage: 'New Lead',
    description: '',
    source: '',
    labels: '',
    clientDetails: {
      email: '',
      contactNumber: '',
      name: ''
    }
  }); 
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    console.log(state.userinfo);
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users/get-all-users');
        const users = response.data.users;
        const filtered = users.filter(user => 
          user.role === 'businessfinanceloanteamleader' || user.role === 'businessfinanceloansales'
        );
        setFilteredUsers(filtered);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.clientDetails) {
      setFormData({
        ...formData,
        clientDetails: {
          ...formData.clientDetails,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleUserChange = (e) => {
    setFormData({
      ...formData,
      selectedUsers: Array.from(e.target.selectedOptions, option => option.value)
    });
  };

  const handleSubmit = async () => {
    try {
    
      const response = await axios.post('/api/business-lead/create-lead', formData, {
        headers: {
          Authorization: `Bearer ${state.userinfo.token}` // Include token in the request headers
        }
      });
      console.log('Lead created successfully:', response.data);
      setShowModal(false);
      // Reset form data or any other state updates
    } catch (error) {
      if (error.response) {
        console.error('Error creating lead:', error.response.data);
      } else {
        console.error('Error creating lead:', error.message);
      }
    }
  };

  return (
    <div>
      <BusinessFinanceNavbar />
      <h1>Business Loan Manager Dashboard</h1>
      <Button variant="primary" onClick={() => setShowModal(true)}>Create New Lead</Button>
        <BusinessLead />
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Lead</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <h5>Client Details</h5>
            <Form.Group controlId="formClientEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.clientDetails.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formClientContactNumber">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="text"
                name="contactNumber"
                value={formData.clientDetails.contactNumber}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formClientName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.clientDetails.name}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formSelectedUsers">
              <Form.Label>Select Users</Form.Label>
              <Form.Control
                as="select"
                multiple
                value={formData.selectedUsers}
                onChange={handleUserChange}
              >
                {filteredUsers.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formSource">
              <Form.Label>Source</Form.Label>
              <Form.Control
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formLabels">
              <Form.Label>Labels</Form.Label>
              <Form.Control
                type="text"
                name="labels"
                value={formData.labels}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleSubmit}>Submit</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BusinessManagerDashboard;
