import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Auth/AuthContext';

const UpdateRolePermissions = () => {
  const { state} = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);

  useEffect(() => {
    if (state.userinfo.token) {
      axios.get('/api/permissions', {
        headers: {
          Authorization: `Bearer ${state.userinfo.token}`
        }
      })
      .then(response => {
        setAvailablePermissions(response.data);
      })
      .catch(error => {
        console.error('Error fetching permissions:', error);
      });

      axios.get('/api/roles', {
        headers: {
          Authorization: `Bearer ${state.userinfo.token}`
        }
      })
      .then(response => {
        setRoles(response.data);
      })
      .catch(error => {
        console.error('Error fetching roles:', error);
      });
    }
  }, [state.userinfo.token]);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    const roleData = roles.find(r => r.role === role);
    setPermissions(roleData ? roleData.permissions : []);
  };

  const handlePermissionChange = (permission) => {
    setPermissions(prevPermissions => {
      if (prevPermissions.includes(permission)) {
        return prevPermissions.filter(p => p !== permission);
      } else {
        return [...prevPermissions, permission];
      }
    });
  };

  const handleSubmit = () => {
    axios.post('/api/update-role-permissions', {
      role: selectedRole,
      newPermissions: permissions
    }, {
      headers: {
        Authorization: `Bearer ${state.userinfo.token}`
      }
    })
    .then(response => {
      alert('Permissions updated successfully');
    })
    .catch(error => {
      console.error('Error updating permissions:', error);
      alert('Failed to update permissions');
    });
  };

  return (
    <div>
      <h2>Update Role Permissions</h2>
      <select onChange={(e) => handleRoleChange(e.target.value)}>
        <option value="">Select Role</option>
        {roles.map(role => (
          <option key={role.role} value={role.role}>{role.role}</option>
        ))}
      </select>
      <div>
        {availablePermissions.map(permission => (
          <div key={permission}>
            <input
              type="checkbox"
              checked={permissions.includes(permission)}
              onChange={() => handlePermissionChange(permission)}
            />
            {permission}
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}>Update Permissions</button>
    </div>
  );
};

export default UpdateRolePermissions;
