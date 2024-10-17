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
 */router.post('/api/auth/verify-user/:token', authController.verifyEmail);

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
router.post('/api/auth/forgetpassword', authController.forgetPassword);
//resetpasword
router.post('/api/auth/reset-password/:token', authController.resetPassword);

router.post('/logout', (req, res) => {
   
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      path: '/',
    });
  
  
    return res.status(200).json({ message: 'Logout successful' });
  });

// Erenouvellement du token

export const refreshAccessToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken; 
    if (!refreshToken) {
        return next(new ErrorResponse('Refresh Token is missing', 401));
    }

    try {
        
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        return res.json({ success: true, accessToken: newAccessToken });
    } catch (error) {
        return next(new ErrorResponse('Invalid or expired refresh token', 403));
    }
};

  

export default router; 
