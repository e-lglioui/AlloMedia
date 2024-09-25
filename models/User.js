'use strict';

const mongoose = require("mongoose");
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
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

module.exports = mongoose.model('User', userSchema);
