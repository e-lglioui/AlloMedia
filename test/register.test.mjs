import * as chai from 'chai'; // Importer tous les exports
const { expect } = chai;      // Extraire `expect` de l'objet
import { register } from '../controllers/authController.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import sinon from 'sinon';  
describe('Register fuction user to do the singup the users', () => {

    let req, res, stubFindOne, stubCreate, stubSendMail;

   beforeEach (()=>{
    req = {
        body: {
          name: 'John Doe',
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

      stubFindOne = sinon.stub(Role, 'findOne');
      stubCreate = sinon.stub(Role, 'create');
      stubSendMail = sinon.stub(nodemailer.createTransport().constructor.prototype, 'sendMail');
   });

   afterEach(() => {
    sinon.restore();
  });

  it('should return a validation error if request is invalid', async () => {
    const registerValidation = sinon.stub().returns({ error: { details: [{ message: 'Invalid input' }] } });
    await register(req, res);
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Invalid input' })).to.be.true;
});
it('should cree role si selement nexite pas',async() =>{
    stubFindOne.returns(null);
    stubCreate.returns({name:'client'});
    await register(req, res);
    expect(stubFindOne.calledOnce).to.be.true;
    expect(stubCreate.calledOnce).to.be.true;

});

it('should return an error if the name already exists', async () => {
    User.findOne.withArgs({ name: 'John Doe' }).returns({});

    await register(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'This name ealrdy exist' })).to.be.true;
});

it('should return an error if the email already exists', async () => {
    User.findOne.withArgs({ email: 'john@example.com' }).returns({});

    await register(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'This email exist' })).to.be.true;
});

it('should send a verification email after successful registration', async () => {
    const newUser = { _id: '12345', email: 'john@example.com' };
    User.findOne.returns(null);
    sinon.stub(User.prototype, 'save').returns(newUser);
    sinon.stub(jwt, 'sign').returns('token123');

    await register(req, res);

    expect(stubSendMail.calledOnce).to.be.true;
    const mailOptions = stubSendMail.args[0][0];
    expect(mailOptions.to).to.equal('john@example.com');
    expect(mailOptions.html).to.contain('token123');
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith({ message: 'User registered. Please check your email for verification.' })).to.be.true;
});

});