const User=require('../models/User');
const Role=require('../models/Role');
const jwt=require('jsonwebtoken');
const nodemailer = require('nodemailer');
const handleErrors= require('../validation/handleErrors');
const { registerValidation } = require('../validation/userValidator');
exports.register= async(req,res)=>{
   
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
        role: clientRole

    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

     return res.status(201).json({ token });
    }catch(err){
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
};