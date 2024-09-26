
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 

// POST Methods
router.post('/api/auth/register', authController.register);

router.post('/api/auth/verify-otp', authController.verifyEmail);







module.exports = router; 
