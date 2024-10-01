import { expect } from 'chai';
import sinon from 'sinon';
import { login } from '../controllers/authController.js';
import User from '../models/User.js';
import OTP from '../models/otp.js';
import transporter from '../utils/transporter.js'; 
import ErrorResponse from '../utils/errorResponse.js';
import generateCode from '../utils/generateCode.js';  


describe('Login Function', () => {
    let req, res, next;
    let userStub, otpStub, sendMailStub, otpDeleteStub;

    beforeEach(() => {
        req = {
            body: {
                email: 'john@example.com',
                password: 'password123',
            },
        };
        res = {
            json: sinon.stub(),
        };
        next = sinon.stub();
        userStub = sinon.stub(User, 'findOne');
        otpStub = sinon.stub(OTP.prototype, 'save').resolves({
            otp: '123456',
            userId: '12345',
        });
        sendMailStub = sinon.stub(transporter, 'sendMail').resolves();
        otpDeleteStub = sinon.stub(OTP, 'findOneAndDelete').resolves();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return an error if email or password is missing', async () => {
        req.body.email = ''; // Simulate missing email
        await login(req, res, next);
        expect(next.calledWith(sinon.match.instanceOf(ErrorResponse))).to.be.true;
        expect(next.args[0][0].message).to.equal('Please provide an email and password');
    });

    it('should return an error if user is not found', async () => {

        userStub.withArgs({ email: 'john@example.com' }).returns({
            select: () => null,
        });
    //    console.log('fffffffffffffffffffffffffffffffff' ,r);
        await login(req, res, next);
        expect(next.calledWith(sinon.match.instanceOf(ErrorResponse))).to.be.true;
        expect(next.args[0][0].message).to.equal('Invalid Credentials');
        
    });

    it('should return an error if password does not match', async () => {
        const user = { 
            email: 'john@example.com',
            matchPasswords: sinon.stub().returns(false),
        };

        // Mocking findOne to return a user object
        userStub.withArgs({ email: 'john@example.com' }).returns({
            select: () => user, // Return the user object when select is called
        });
        await login(req, res, next);
        expect(next.calledWith(sinon.match.instanceOf(ErrorResponse))).to.be.true;
        expect(next.args[0][0].message).to.equal('Invalid Credentials');
    });

  

    it('should call next with an error if an exception occurs', async () => {
        userStub.throws(new Error('Database error'));
        await login(req, res, next);
        expect(next.called).to.be.true;
        expect(next.args[0][0].message).to.equal('Database error');
    });

    it('should generate and save an OTP if two_fa_status is true', async () => {
        const user = {
            _id: '12345',
            email: 'john@example.com',
            two_fa_status: true,
            OTP_code: null,
            matchPasswords: sinon.stub().returns(true), // Simulate password match
            save: sinon.stub().resolves(), // Stub save method for the user
        };

        userStub.withArgs({ email: 'john@example.com' }).returns({
            select: () => user,
        });

        await login(req, res, next);

        // Check if OTP was generated and saved
        expect(otpStub.calledOnce).to.be.true;
        // // Check if the user's OTP_code was updated and saved
        expect(user.OTP_code).to.equal('123456');
        expect(user.save.calledOnce).to.be.true;

        // // Ensure the response contains the OTP and correct flags
        expect(res.json.calledOnce).to.be.true;
        const response = res.json.firstCall.args[0];
        expect(response).to.deep.include({
            otp: '123456',
            success: false,
            otpStatus: true,
            id: '12345',
        });
    });

    it('should send an email with the OTP to the user', async () => {
        const user = {
            _id: '12345',
            email: 'john@example.com',
            two_fa_status: true,
            OTP_code: null,
            matchPasswords: sinon.stub().returns(true),
            save: sinon.stub().resolves(),
        };

        userStub.withArgs({ email: 'john@example.com' }).returns({
            select: () => user,
        });

        await login(req, res, next);

        // Check if email was sent with correct OTP
        expect(sendMailStub.calledOnce).to.be.true;
        const mailOptions = sendMailStub.firstCall.args[0];
        expect(mailOptions.to).to.equal('john@example.com');
        expect(mailOptions.subject).to.equal('One-Time Login Access');
        expect(mailOptions.text).to.include('123456'); // Assuming OTP is part of the message
    });

    it('should delete the OTP after it has been used', async () => {
        const user = {
            _id: '12345',
            email: 'john@example.com',
            two_fa_status: true,
            OTP_code: null,
            matchPasswords: sinon.stub().returns(true),
            save: sinon.stub().resolves(),
        };

        userStub.withArgs({ email: 'john@example.com' }).returns({
            select: () => user,
        });

        await login(req, res, next);

        // Check if OTP was deleted after use
        expect(otpDeleteStub.calledOnce).to.be.true;
        expect(otpDeleteStub.firstCall.args[0]).to.deep.include({
            userId: '12345',
            otp: '123456',
        });
    });

    it('should return an error if OTP generation fails', async () => {
        const user = {
            _id: '12345',
            email: 'john@example.com',
            two_fa_status: true,
            matchPasswords: sinon.stub().returns(true),
            save: sinon.stub().resolves(),
        };

        userStub.withArgs({ email: 'john@example.com' }).returns({
            select: () => user,
        });

        otpStub.rejects(new Error('OTP generation failed'));

        await login(req, res, next);

        // Check if next() was called with an error
        expect(next.calledOnce).to.be.true;
        expect(next.args[0][0].message).to.equal('OTP generation failed');
    });
});
