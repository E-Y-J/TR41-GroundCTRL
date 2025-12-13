const express = require('express');
const router = express.Router();

// Basic API welcome endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Hello from TR41-GroundCTRL Backend!',
    status: 'success',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
