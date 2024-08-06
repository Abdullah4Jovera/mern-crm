
    const permissions = require('./permissions');
    
    const rolePermissions = {
  "superadmin": [
    "create_user",
    "read_user",
    "update_user",
    "delete_user",
    "create_lead",
    "read_lead",
    "update_lead",
    "delete_lead",
    "check_lead"
  ],
  "CEO": [
    "create_lead",
    "read_lead",
    "update_lead",
    "check_lead",
    "create_user",
    "read_user",
    "update_user",
    "delete_user",
    "delete_lead"
  ],
  "businessfinanceloanmanger": [
    "create_lead",
    "read_lead",
    "update_lead",
    "delete_lead"
  ]
};
    
    const assignPermissionsToRole = (role) => {
      return rolePermissions[role] || [];
    };
    
    module.exports = { assignPermissionsToRole, rolePermissions };
  