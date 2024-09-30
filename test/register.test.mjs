import express from 'express';
import * as chai from 'chai'; // Importer tous les exports
const { expect } = chai;      // Extraire `expect` de l'objet
import { register } from '../controllers/authController.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import transporter from '../utils/transporter.js';
import sinon from 'sinon';  
// import mongoose from 'mongoose';
describe('Register fuction user to do the singup the users', () => {

    let req, res;
   
   beforeEach (()=>{
    req = {
        body: {
          name: 'testuser',
          email: 'john@example.com',
          password: 'password123',
          phoneNumber: '123456789',
          address: '123 Main St'
        }
      };

      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      sinon.stub(User, 'findOne');
      sinon.stub(transporter, 'sendMail').resolves('Email sent');


   });


   afterEach(() => {
    sinon.restore(); 
  });

  
  it('should return a validation error if request is invalid', async () => {
    const registerValidation = sinon.stub().returns({ error: { details: [{ message: 'Invalid input' }] } });

    await register(req, res);
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith(sinon.match.has('message'))).to.be.true;
});



it('should return an error if the name already exists', async () => {

  User.findOne.withArgs({ name: 'testuser' }).returns({});
  await register(req, res);
  expect(res.status.calledWith(400)).to.be.true;
  // expect(res.json.calledWith({ message: 'This name ealrdy exists' })).to.be.true;
});

 

it('should return an error if the email already exists', async () => {
    User.findOne.withArgs({ email: 'john@example.com' }).returns({});

    await register(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    // expect(res.json.calledWith({ message: 'This email exist' })).to.be.true;
});


// it('should send a verification email after successful registration', async () => {
//   const newUser = { _id: '12345', email: 'john@example.com' };
  
//   // Stubbing necessary methods
//   const findOneStub = User.findOne.returns(null);
//   const saveStub = sinon.stub(User.prototype, 'save').returns(newUser);
//   const jwtStub = sinon.stub(jwt, 'sign').returns('token123');
//   const transporterStub = sinon.stub(nodemailer, 'createTransport').returns({
//     sendMail: sinon.stub().resolves(),  
//   });

//   // Call the register function
//   await register(req, res);

//   // Assert that sendMail was called once
//   expect(transporterStub().sendMail.calledOnce).to.be.true;
//   if (sendMailStub.calledOnce) {
//     const mailOptions = sendMailStub.args[0][0];
//     expect(mailOptions.to).to.equal('john@example.com');
//     expect(mailOptions.html).to.contain('token123');
//   }
//   findOneStub.restore();
//   saveStub.restore();
//   jwtStub.restore();
//   stubSendMail.restore();
// });


});