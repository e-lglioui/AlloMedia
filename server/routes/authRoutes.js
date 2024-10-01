import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js'; 

// POST Methods
//register
router.post('/api/auth/register', authController.register);

router.post('/api/auth/verify-user/:token', authController.verifyEmail);

//login
router.post('/api/auth/login', authController.login);
//verifie the otp
router.post('/api/auth/verify2FA/:id', authController.verifyOTP);

//resend the otp 

router.post('/api/auth/resend-otp/:id', authController.resendOTP);

//forget password
router.post('/api/auth/forgetpassword', authController.forgetpasword);
//resetpasword
router.post('api/auth/resetpassword/:token', authController.forgetpasword);

export default router; 
