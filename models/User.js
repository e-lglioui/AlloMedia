'use strict';

import mongoose from "mongoose";
import validator from 'validator';
const { isEmail } = validator;

import bcryptjs from 'bcryptjs';
import Role from './Role.js'; 
// import { boolean } from "joi"; 
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please enter name']
  },
  email: {
    type: String,
    required: [true, 'please enter email'],
    unique: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'please enter password'],
    select: false,
    minLength: [6, 'enter more than 6 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'please enter phoneNumber']
  },
  address: {
    type: String,
    required: [true, 'please enter address']
  },
  isVerified: {
    type: Boolean,
    required: false
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  two_fa_status: { type: String, default: 'on' },
  OTP_code: { type: String, default: null },
  password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6, select: false
  },
},
  { timestamps: true }
);

// Fire a function before doc saved to db
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

userSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRESIN })
}

userSchema.methods.matchPasswords = async function (password) {
  return await bcryptjs.compare(password, this.password);
}

export default mongoose.model('User', userSchema);
