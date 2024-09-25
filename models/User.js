'use strict';

const mongoose = require("mongoose");
const { isEmail } = require('validator');
const bcryptjs=require('bcryptjs');
const Role = require('./Role');

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
 
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }
});

// fire a function before doc saved to db
userSchema.pre('save', async function(next) {
  const salt = await bcryptjs.genSalt();
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});


module.exports = mongoose.model('User', userSchema);
