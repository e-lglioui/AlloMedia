import User from '../models/User.js';

const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken(); 
   
    res.status(statusCode).json({
      success: true,
      token
    });
  };
  
  export default sendToken;
  