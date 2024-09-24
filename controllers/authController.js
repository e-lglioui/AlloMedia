const User=require('../models/User');
const Role=require('../models/Role');
const jwt=require('jsonwebtoken');
const bcryptjs=require('bcryptjs');
const nodemailer = require('nodemailer');


exports.register= async(req,res)=>{

    const { name, email, password,phoneNumber, address} = req.body;
    try{
     const nameExiste = await User.findOne({name});
     if(nameExiste){
        return res.status(400).json({ message: 'This name ealrdy exist' });
     }
     const emailExiste = await User.findOne({email});
     if(emailExiste){
        return res.status(400).json({ message: 'This email exist' });
     }
     const hashedPassword = await hashPassword(password);

     const newUser = new User({
        name: name,
        password: hashedPassword,
        email: email,
        phoneNumber:phoneNumber,
        address: address

    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

     return res.status(201).json({ token });
    }catch{
         return res.status(500).send({ error: err.message || 'User Registration Failed...!' });
    }
};