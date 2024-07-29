import React, { useContext, useState, useEffect } from 'react';
import { Button, Modal, Form, Card, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import './BusinessFinanceDashboard.css';
import Navbar from '../../components/Navbar';

const ItemTypes = {
  CARD: 'card',
};

const DraggableCard = ({ lead, index, moveCard, onEditClick }) => {
  const navigate = useNavigate();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id: lead._id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleDetails = () => {
    navigate(`/businessfinanceleaddetails/${lead._id}`);
  };

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
      className="flip-card"
    >
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>{lead.client?.name || 'Unnamed Client'}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{lead.service}</Card.Subtitle>
              <Card.Text>
                <strong>Description:</strong> {lead.description}
                <br />
                <strong>Source:</strong> {lead.source}
              </Card.Text>
              <Button onClick={handleDetails}>Details</Button>
              <Dropdown className="float-end">
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  ...
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => onEditClick(lead)}>Edit Lead</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

const DroppableColumn = ({ stage, leads, moveCard, onEditClick }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item) => {
      moveCard(item.id, stage);
    },
  }));

  return (
    <div ref={drop} className="lead-column">
      <h2>{stage}</h2>
      {leads.map((lead, index) => (
        <DraggableCard
          key={lead._id}
          lead={lead}
          index={index}
          moveCard={moveCard}
          onEditClick={onEditClick}
        />
      ))}
    </div>
  );
};

const BusinessFinanceDashboard = () => {
  const { state } = useContext(AuthContext);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    service: 'Business Loan',
    clientId: '',
    clientDetails: {
      email: '',
      contactNumber: '',
      name: ''
    },
    selectedUsers: [],
    stage: 'New Lead',
    description: '',
    source: '',
    labels: [],
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const stages = [
    'New Lead',
    'Marketing Lead',
    'Rejected',
    'Follow Up',
    'Under Calculation',
    'Final Discussion',
    'Service App Req'
  ];

  useEffect(() => {
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
    fetchLeads();
  }, [state.userinfo.token]);

  const fetchLeads = async () => {
    try {
      const response = await axios.get('/api/business-lead/get-all-business-leads', {
        headers: {
          Authorization: `Bearer ${state.userinfo.token}`
        }
      });
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

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
    } else if (name === 'labels') {
      setFormData({
        ...formData,
        labels: value.split(',').map(label => label.trim())
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

  const handleSubmitCreate = async () => {
    try {
      const response = await axios.post('/api/business-lead/create-lead', formData, {
        headers: {
          Authorization: `Bearer ${state.userinfo.token}`
        }
      });
      console.log('Lead created successfully:', response.data);
      setShowCreateModal(false);
      resetForm();
      fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleSubmitEdit = async () => {
    if (selectedLead) {
      try {
        const response = await axios.put(`/api/business-lead/edit-lead/${selectedLead._id}`, formData, {
          headers: {
            Authorization: `Bearer ${state.userinfo.token}`
          }
        });
        console.log('Lead updated successfully:', response.data);
        setShowEditModal(false);
        setSelectedLead(null);
        resetForm();
        fetchLeads();
      } catch (error) {
        console.error('Error updating lead:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      service: 'Business Loan',
      clientId: '',
      clientDetails: {
        email: '',
        contactNumber: '',
        name: ''
      },
      selectedUsers: [],
      stage: 'New Lead',
      description: '',
      source: '',
      labels: []
    });
  };

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setFormData({
      service: lead.service || 'Business Loan',
      clientId: lead.client?._id || '',
      clientDetails: {
        email: lead.client?.email || '',
        contactNumber: lead.client?.contactNumber || '',
        name: lead.client?.name || ''
      },
      selectedUsers: lead.selectedUsers?.map(user => user._id) || [], // Ensure it's an array
      stage: lead.stage || 'New Lead',
      description: lead.description || '',
      source: lead.source || '',
      labels: lead.labels || []
    });
    setShowEditModal(true);
  };


  const moveCard = async (id, newStage) => {
    try {
      await axios.put(`/api/business-lead/update-lead-stage/${id}`, { stage: newStage }, {
        headers: {
          Authorization: `Bearer ${state.userinfo.token}`
        }
      });

      const response = await axios.get('/api/business-lead/get-all-business-leads', {
        headers: {
          Authorization: `Bearer ${state.userinfo.token}`
        }
      });
      setLeads(response.data);
    } catch (error) {
      console.error('Error updating lead stage:', error);
      alert('Failed to update lead stage. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Business Finance Dashboard</h1>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>Create New Lead</Button>

        <DndProvider backend={HTML5Backend}>
          <div className="lead-columns">
            {stages.map(stage => (
              <DroppableColumn
                key={stage}
                stage={stage}
                leads={leads.filter(lead => lead.stage === stage)}
                moveCard={moveCard}
                onEditClick={handleEditClick}
              />
            ))}
          </div>
        </DndProvider>

        {/* Create Lead Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Create Lead</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formStage">
                <Form.Label>Stage</Form.Label>
                <Form.Control
                  as="select"
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                >
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </Form.Control>
              </Form.Group>
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
                      {user.name}
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
                <Form.Label>Labels (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  name="labels"
                  value={formData.labels.join(', ')}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Close</Button>
            <Button variant="primary" onClick={handleSubmitCreate}>Submit</Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Lead Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Lead</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formStage">
                <Form.Label>Stage</Form.Label>
                <Form.Control
                  as="select"
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                >
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </Form.Control>
              </Form.Group>
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
                      {user.name}
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
                <Form.Label>Labels (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  name="labels"
                  value={formData.labels.join(', ')}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
            <Button variant="primary" onClick={handleSubmitEdit}>Save Changes</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default BusinessFinanceDashboard;
