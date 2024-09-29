import express from 'express';
import User from '../models/User.js';
import Role from '../models/Role.js';
import OTP from '../models/otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import handleErrors from '../validation/handleErrors.js';
import { registerValidation } from '../validation/userValidator.js';
import dotenv from 'dotenv';
//les utils
import transporter from '../utils/transporter.js'; 
import ErrorResponse from '../utils/errorResponse.js'
import generateCode from '../utils/generateCode.js'
import {otpMessage } from '../utils/emailUtils.js';
import sendToken from '../utils/sendToken.js';

dotenv.config();
export const register = async(req,res)=>{
   
//validation de requiste
   const { error } = registerValidation(req.body);
   if (error) return res.status(400).json({ message: error.details[0].message });

   let clientRole = await Role.findOne({ name: 'client' });

   if (!clientRole) {
     clientRole = await Role.create({ name: 'client' });
   }
   // console.log(req.body); 


    const { name, email, password,phoneNumber, address } = req.body;
    try{
      const existingUser = await User.findOne({ name: req.body.name });
  if (existingUser) {
    return res.status(400).json({ message: 'This name already exists' });
  }
     const emailExiste = await User.findOne({email});
     if(emailExiste){
        return res.status(400).json({ message: 'This email exist' });
     }

     const newUser = new User({
        name: name,
        password: password,
        email: email,
        phoneNumber:phoneNumber,
        address: address,
        role: clientRole,
        isVerified:false

    });

    await newUser.save();
    // console.log(process.env.EMAIL_USER);
    const emailToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const verificationUrl = `${process.env.API_URL}?token=${emailToken}`;

 console.log(verificationUrl);
    // Configure le transporteur d'e-mail (avec nodemailer)
    // const transporter = nodemailer.createTransport({
    //   host: 'smtp.gmail.com',
    //   port: 587,
    //   secure: false, 
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   }
    // });

    // Crée le contenu de l'e-mail
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: newUser.email, 
      subject: 'Email Verification',
      html: `
        <h1>Verify your email</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `,
    };

    // Envoie l'e-mail
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     return console.log(error);
    //   }
    //   console.log('Email envoyé : ' + info.response);
    // });
    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'User registered. Please check your email for verification.' });
    }catch(err){
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
};

export const verifyEmail = async (req, res) => {
    
  const { token } = req.query; // Récupère le token depuis la requête

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    // Vérifie le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId); 
  
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    user.isVerified = true;
    // console.log(user);
    await user.save();
//  console.log(user);
    // Répond avec un message de succès
    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error("Error while saving the user:", err);
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};


// export const login = async(req,res)=>{
//   const { error } = registerValidation(req.body);
//   if (error) return res.status(400).json({ message: error.details[0].message });

//   const { email, passwor } = req.body;
//   try{
//   const user = await User.findOne({email:req.body.email})
//   if(!user){
//     return res.status(400).json({message: 'email not found' });
//   }

//   }catch{

//   }

// }

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400))
  }

  try {
      const user = await User.findOne({ email }).select("+password") //selectionner user meme si le chois select: false in the model user

      if (!user) {
          return next(new ErrorResponse('Invalid Credentials', 401))
      }

      const isMatch = await user.matchPasswords(password);

      if (!isMatch) {
          return next(new ErrorResponse('Invalid Credentials', 401))
      }

      if (user.two_fa_status) {
        // await OTP.findOneAndDelete({ userId: user._id, otp: otp.otp }); 
          const otp = await new OTP({
              userId: user._id,
              otp: generateCode()
          }).save();

          user.OTP_code = otp.otp
          await user.save();

          await transporter.sendMail({
            from: process.env.EMAIL_USER, 
              to: user.email,
              subject: "One-Time Login Access",
              text:otpMessage(otp, user)
          });

          await OTP.findOneAndDelete({ userId: user._id, otp: otp.otp }); 

          return res.json({ otp: otp.otp, success: false, otpStatus: user.two_fa_status, id: user._id })
      }

      sendToken(user, 200, res);

  } catch (error) {
      next(error)
  }
};

//verifie the otp 
export const verifyOTP = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const { otp } = req.body

  try {
      if (!user) return res.status(400).send({ message: "invalid user" });

      const lastUpdatedTime = new Date(user.updatedAt);
      lastUpdatedTime.setMinutes(lastUpdatedTime.getMinutes() + 5);
      const currentTime = (new Date(Date.now()))

      if (lastUpdatedTime <= currentTime) {
          console.log('yes')
          user.OTP_code = null
          await user.save();
          return next(new ErrorResponse('OTP expired, please request a new one', 400));
      }

      if (otp !== user.OTP_code) {
          return next(new ErrorResponse('invalid token, please try again', 400))
      }


      user.OTP_code = null
      await user.save();
      return sendToken(user, 200, res);


  } catch (error) {
    console.error('Error during OTP verification:', error);
      return next(new ErrorResponse('Internal Server', 500))

  }
};





// Resending OTP 

export const resendOTP = async (req, res, next) => {
    const { id } = req.params
    const user = await User.findById(`${id}`);

    try {
        if (user.two_fa_status === 'on') {


            const otp = await new OTP({
                userId: user,
                otp: generateCode()
            }).save();

            user.OTP_code = otp.otp
            await user.save();

            await sendEmail({
                to: user.email,
                subject: "One-Time Login Access",
                text:otpMessage(otp, user)
            });

            await otp.remove();

            return res.json({ message: 'one-time login has been sent your email', otpStatus: user.two_fa_status, })
        }
        return res.json(user)


    } catch (error) {
        next(error)
    }
};

//reset password 
export const forgetpasword = async (req,res,next)=>{

  const { email } = req.body ;
  try{
    const user = await User.findOne({ email });
  if(!user){
  return res.status(400).json({message :'this email does not exist'})
  }
  const emailToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const verificationUrl = `${process.env.API_URL}?token=${emailToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: user.email, 
    subject: 'Reset ur pasword ',
    html: `
      <h1>Verify your email</h1>
      <p>Click the link below to change ur password :</p>
      <a href="${verificationUrl}">Verify Email</a>
    `,
  };
  await transporter.sendMail(mailOptions);

  res.status(201).json({ message: ' isen you email to vrefie to resnd your code ,please check ur email.' });
} catch (error){
next(error);
}
}