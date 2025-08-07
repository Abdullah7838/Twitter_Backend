const express = require('express');
const router = express.Router();

router.post('/admin-login', (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email === adminEmail && password === adminPassword) {
    return res.json({ success: true });
  } else {
    return res.json({ success: false });
  }
});

module.exports = router; 
