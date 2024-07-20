// routes/rolePermissions.js
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { rolePermissions, assignPermissionsToRole } = require('../rolePermissions');

const hasPermission = require('../hasPermission');
const permissions = require('../permissions');
const fs = require('fs');
const path = require('path');
const { isAuth } = require('../utils');

// API to update role permissions
router.post('/update-role-permissions', isAuth, hasPermission([permissions.UPDATE_USER]), async (req, res) => {
  const { role, newPermissions } = req.body;

  // Update rolePermissions object in memory
  rolePermissions[role] = newPermissions;

  // Write updated rolePermissions to file
  const rolePermissionsPath = path.join(__dirname, '../rolePermissions.js');
  const fileContent = `
    const permissions = require('./permissions');
    
    const rolePermissions = ${JSON.stringify(rolePermissions, null, 2)};
    
    const assignPermissionsToRole = (role) => {
      return rolePermissions[role] || [];
    };
    
    module.exports = { assignPermissionsToRole, rolePermissions };
  `;

  fs.writeFileSync(rolePermissionsPath, fileContent);

  // Update all users with the affected role in the database
  const updatedPermissions = assignPermissionsToRole(role);
  await User.updateMany({ role }, { $set: { permissions: updatedPermissions } });

  res.status(200).json({ message: 'Role permissions updated successfully' });
});

module.exports = router;
