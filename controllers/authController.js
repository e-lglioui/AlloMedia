const User=require('../models/User');
const Role=require('../models/Role');
const jwt=require('jsonwebtoken');
const bcryptjs=require('bcryptjs');
const nodemailer = require('nodemailer');

const hashPassword = async (password) => {
   const salt = await bcryptjs.genSalt(10); // Générer un sel
   return await bcryptjs.hash(password, salt); // Hacher le mot de passe
};

exports.register= async(req,res)=>{

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
     const hashedPassword = await hashPassword(password);

     const newUser = new User({
        name: name,
        password: hashedPassword,
        email: email,
        phoneNumber:phoneNumber,
        address: address,
        role: clientRole

    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

     return res.status(201).json({ token });
    }catch(err){
      console.error(err); 
         return res.status(500).send({ error: err.message || 'User Registration Failed...!' });
    }
};