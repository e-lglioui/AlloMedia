'use strict';

const mongoose = require("mongoose");
const { isEmail } = require('validator');
const bcryptjs=require('bcryptjs');
const Role = require('./Role');
const { boolean } = require("joi");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true ,'please enter name']
  },
  email: {
    type: String,
    required:  [true ,'please enter email'],
    unique: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required:  [true ,'please enter password'],
    select: false,
    minLength:[6 ,'enter mor than 6 caracters']
  },
  phoneNumber: {
    type: String,
    required:  [true ,'please enter phoneNumber']
  },
  address: {
    type: String,
    required:  [true ,'please enter adress']
  },
  isVerified: {
    type: Boolean,
    required: false
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }
});

// fire a function before doc saved to db
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    try {
      const salt = await bcryptjs.genSalt(10);
      user.password = await bcryptjs.hash(user.password, salt);
    } catch (err) {
      return next(err); 
    }
  }

  next();
});


module.exports = mongoose.model('User', userSchema);
