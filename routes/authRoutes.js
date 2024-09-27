import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js'; 

// POST Methods
//register
router.post('/api/auth/register', authController.register);

router.post('/api/auth/verify-otp', authController.verifyEmail);

//login
router.post('/api/auth/login', authController.login);






export default router; 
