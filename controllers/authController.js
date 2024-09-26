import express from 'express';
import User from '../models/User.js';
import Role from '../models/Role.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import handleErrors from '../validation/handleErrors.js';
import { registerValidation } from '../validation/userValidator.js';
import dotenv from 'dotenv';
dotenv.config();
export const register = async(req,res)=>{
   
//validation de requiste
   const { error } = registerValidation(req.body);
   if (error) return res.status(400).json({ message: error.details[0].message });

   let clientRole = await Role.findOne({ name: 'client' });
    
   // If not, create it
   if (!clientRole) {
     clientRole = await Role.create({ name: 'client' });
   }
   // console.log(req.body); 


    const { name, email, password,phoneNumber, address } = req.body;
    try{
     const nameExiste = await User.findOne({name});
     if(nameExiste){
        return res.status(400).json({ message: 'This name ealrdy exist' });
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
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

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
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email envoyé : ' + info.response);
    });

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