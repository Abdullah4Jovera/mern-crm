const express = require('express');
const router = express.Router();
const permissions = require('../permissions');

router.get('/', (req, res) => {
  res.json(Object.values(permissions));
});

module.exports = router;