import React, { useContext, useState, useEffect } from 'react';
import { Button, Modal, Form, Card, Dropdown, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import Select from 'react-select';
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
    clientDetails: {
      email: '',
      contactNumber: '',
      name: ''
    },
    selectedUsers: [],
    telesalesTeamLeader: '',
    stage: 'New Lead',
    description: '',
    source: '',
    labels: [],
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [telesalesTeamLeaders, setTelesalesTeamLeaders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

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

        const telesalesLeaders = users.filter(user => user.role === 'telesaleteamleader');
        setTelesalesTeamLeaders(telesalesLeaders);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleClientDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      clientDetails: { ...prevState.clientDetails, [name]: value }
    }));
  };

  const handleMultiSelectChange = (selectedOptions) => {
    setFormData(prevState => ({
      ...prevState,
      selectedUsers: selectedOptions.map(option => option.value)
    }));
  };

  const handleSourceChange = (selectedOption) => {
    const source = selectedOption ? selectedOption.value : '';
    setFormData(prevState => ({
      ...prevState,
      source,
      telesalesTeamLeader: source === 'Telesales' ? prevState.telesalesTeamLeader : '',
      selectedUsers: source === 'Telesales' 
        ? [...prevState.selectedUsers.filter(id => id !== prevState.telesalesTeamLeader), prevState.telesalesTeamLeader]
        : prevState.selectedUsers.filter(userId => userId !== prevState.telesalesTeamLeader)
    }));
  };

  const handleTelesalesTeamLeaderChange = (selectedOption) => {
    const teamLeaderId = selectedOption ? selectedOption.value : '';
    setFormData(prevState => ({
      ...prevState,
      telesalesTeamLeader: teamLeaderId,
      selectedUsers: prevState.source === 'Telesales'
        ? [...prevState.selectedUsers.filter(id => id !== prevState.telesalesTeamLeader), teamLeaderId]
        : prevState.selectedUsers.filter(id => id !== prevState.telesalesTeamLeader)
    }));
  };

  const handleCreateLead = async () => {
    setLoading(true);
    try {
      await axios.post('/api/business-lead/create-lead', formData, {
        headers: {
          Authorization: `Bearer ${state.userinfo.token}`
        }
      });
      setShowCreateModal(false);
      fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Failed to create lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setFormData({
      service: lead.service,
      clientDetails: {
        email: lead.client?.email || '',
        contactNumber: lead.client?.contactNumber || '',
        name: lead.client?.name || ''
      },
      selectedUsers: lead.selectedUsers.map(user => user._id),
      telesalesTeamLeader: lead.telesalesTeamLeader || '',
      stage: lead.stage,
      description: lead.description,
      source: lead.source,
      labels: lead.labels,
    });
    setShowEditModal(true);
  };

  const handleUpdateLead = async () => {
    setLoading(true);
    try {
      const updatedData = {
        ...formData,
        clientId: selectedLead.client._id // Adding clientId to the data to be sent in the PUT request
      };

      await axios.put(`/api/business-lead/edit-lead/${selectedLead._id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${state.userinfo.token}`
        }
      });
      setShowEditModal(false);
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const commonUsers = filteredUsers.filter(user => formData.selectedUsers.includes(user._id));
  const sourceOptions = [
    { value: 'Telesales', label: 'Telesales' },
    { value: 'Marketing', label: 'Marketing' }
  ];
  const telesalesOptions = telesalesTeamLeaders.map(leader => ({
    value: leader._id,
    label: leader.name
  }));

  return (
    <div>
      <Navbar />
      <div className="dashboard">
        <DndProvider backend={HTML5Backend}>
          {stages.map(stage => (
            <DroppableColumn
              key={stage}
              stage={stage}
              leads={leads.filter(lead => lead.stage === stage)}
              moveCard={moveCard}
              onEditClick={handleEditClick}
            />
          ))}
        </DndProvider>
        <Button onClick={() => setShowCreateModal(true)}>Create Lead</Button>
        {/* Create Lead Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Create Lead</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formService">
                <Form.Label>Service</Form.Label>
                <Form.Control
                  type="text"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formClientName">
                <Form.Label>Client Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.clientDetails.name}
                  onChange={handleClientDetailsChange}
                />
              </Form.Group>
              <Form.Group controlId="formClientEmail">
                <Form.Label>Client Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.clientDetails.email}
                  onChange={handleClientDetailsChange}
                />
              </Form.Group>
              <Form.Group controlId="formClientContactNumber">
                <Form.Label>Client Contact Number</Form.Label>
                <Form.Control
                  type="text"
                  name="contactNumber"
                  value={formData.clientDetails.contactNumber}
                  onChange={handleClientDetailsChange}
                />
              </Form.Group>
              <Form.Group controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formSource">
                <Form.Label>Source</Form.Label>
                <Select
                  options={sourceOptions}
                  onChange={handleSourceChange}
                  value={sourceOptions.find(option => option.value === formData.source)}
                />
              </Form.Group>
              {formData.source === 'Telesales' && (
                <Form.Group controlId="formTelesalesTeamLeader">
                  <Form.Label>Telesales Team Leader</Form.Label>
                  <Select
                    options={telesalesOptions}
                    onChange={handleTelesalesTeamLeaderChange}
                    value={telesalesOptions.find(option => option.value === formData.telesalesTeamLeader)}
                  />
                </Form.Group>
              )}
              <Form.Group controlId="formUsers">
                <Form.Label>Selected Users</Form.Label>
                <Select
                  options={commonUsers.map(user => ({
                    value: user._id,
                    label: user.name
                  }))}
                  isMulti
                  onChange={handleMultiSelectChange}
                  value={commonUsers.filter(user => formData.selectedUsers.includes(user._id)).map(user => ({
                    value: user._id,
                    label: user.name
                  }))}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Close</Button>
            <Button variant="primary" onClick={handleCreateLead} disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Create Lead'}
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Edit Lead Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Lead</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formService">
                <Form.Label>Service</Form.Label>
                <Form.Control
                  type="text"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formClientName">
                <Form.Label>Client Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.clientDetails.name}
                  onChange={handleClientDetailsChange}
                />
              </Form.Group>
              <Form.Group controlId="formClientEmail">
                <Form.Label>Client Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.clientDetails.email}
                  onChange={handleClientDetailsChange}
                />
              </Form.Group>
              <Form.Group controlId="formClientContactNumber">
                <Form.Label>Client Contact Number</Form.Label>
                <Form.Control
                  type="text"
                  name="contactNumber"
                  value={formData.clientDetails.contactNumber}
                  onChange={handleClientDetailsChange}
                />
              </Form.Group>
              <Form.Group controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formSource">
                <Form.Label>Source</Form.Label>
                <Select
                  options={sourceOptions}
                  onChange={handleSourceChange}
                  value={sourceOptions.find(option => option.value === formData.source)}
                />
              </Form.Group>
              {formData.source === 'Telesales' && (
                <Form.Group controlId="formTelesalesTeamLeader">
                  <Form.Label>Telesales Team Leader</Form.Label>
                  <Select
                    options={telesalesOptions}
                    onChange={handleTelesalesTeamLeaderChange}
                    value={telesalesOptions.find(option => option.value === formData.telesalesTeamLeader)}
                  />
                </Form.Group>
              )}
              <Form.Group controlId="formUsers">
                <Form.Label>Selected Users</Form.Label>
                <Select
                  options={commonUsers.map(user => ({
                    value: user._id,
                    label: user.name
                  }))}
                  isMulti
                  onChange={handleMultiSelectChange}
                  value={commonUsers.filter(user => formData.selectedUsers.includes(user._id)).map(user => ({
                    value: user._id,
                    label: user.name
                  }))}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
            <Button variant="primary" onClick={handleUpdateLead} disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Update Lead'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default BusinessFinanceDashboard;
