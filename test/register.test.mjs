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
import mongoose from 'mongoose';
describe('Register fuction user to do the singup the users', () => {

    let req, res,stubFindOne, stubCreate,   stubSendMail;

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

  
//   it('should return a validation error if request is invalid', async () => {
//     const registerValidation = sinon.stub().returns({ error: { details: [{ message: 'Invalid input' }] } });

//     await register(req, res);
//     expect(res.status.calledWith(400)).to.be.true;
//     expect(res.json.calledWith(sinon.match.has('message'))).to.be.true;
// });


it('should cree role si selement nexite pas', async () => {
  // Stub pour Role.findOne qui renvoie null (rôle non trouvé)
  const findOneStub = sinon.stub(Role, 'findOne').resolves(null);

  // Stub pour Role.create qui simule la création du rôle
  const createStub = sinon.stub(Role, 'create').resolves({ name: 'client' });

  console.log("Before register function");
  await register(req, res);
  console.log("After register function");

  // Vérifier si Role.create a été appelé
  console.log("Role.create called:", createStub.called);
  console.log("Role.create call count:", createStub.callCount);

  // Vérifie que Role.create a été appelé une fois
  expect(createStub.calledOnce).to.be.true;

  // Vérifie que le statut renvoyé est 201 (utilisateur créé avec succès)
  expect(res.status.calledWith(201)).to.be.true;

  // Restaurer les stubs après le test
  findOneStub.restore();
  createStub.restore();
});

// it('should return an error if the name already exists', async () => {
//   // Simuler l'existence du nom dans la base de données
//   User.findOne.withArgs({ name: 'testuser' }).returns({});
// // console.log(ex)
//   await register(req, res);

//   expect(res.status.calledWith(400)).to.be.true;
//   expect(res.json.calledWith({ message: 'This name ealrdy exists' })).to.be.true;
// });

 

// it('should return an error if the email already exists', async () => {
//     User.findOne.withArgs({ email: 'john@example.com' }).returns({});

//     await register(req, res);

//     expect(res.status.calledWith(400)).to.be.true;
//     expect(res.json.calledWith({ message: 'This email exist' })).to.be.true;
// });

// it('should send a verification email after successful registration', async () => {
//     const newUser = { _id: '12345', email: 'john@example.com' };
//     User.findOne.returns(null);
//     sinon.stub(User.prototype, 'save').returns(newUser);
//     sinon.stub(jwt, 'sign').returns('token123');

//     await register(req, res);

//     expect(stubSendMail.calledOnce).to.be.true;
//     const mailOptions = stubSendMail.args[0][0];
//     expect(mailOptions.to).to.equal('john@example.com');
//     expect(mailOptions.html).to.contain('token123');

//     expect(res.status.calledWith(400)).to.be.true;
//     expect(res.json.calledWith(sinon.match.has('message'))).to.be.true;
// });

});