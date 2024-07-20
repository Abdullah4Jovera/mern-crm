const express = require('express');
const router = express.Router();
const { rolePermissions } = require('../rolePermissions');

router.get('/', (req, res) => {
  const roles = Object.keys(rolePermissions).map(role => ({
    role,
    permissions: rolePermissions[role]
  }));
  res.json(roles);
});

module.exports = router;