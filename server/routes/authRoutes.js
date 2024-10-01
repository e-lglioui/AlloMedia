import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js'; 

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *         phoneNumber:
 *           type: string
 *           description: The user's phone number
 *         address:
 *           type: string
 *           description: The user's address
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/api/auth/register', authController.register);

/**
 * @swagger
 * /api/auth/verify-user/{token}:
 *   post:
 *     summary: Verify a user's email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: JWT token for email verification
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/api/auth/verify-user/:token', authController.verifyEmail);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
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
