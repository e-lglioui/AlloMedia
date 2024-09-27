import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js'; 

// POST Methods
router.post('/api/auth/register', authController.register);

router.post('/api/auth/verify-otp', authController.verifyEmail);

export default router; 
