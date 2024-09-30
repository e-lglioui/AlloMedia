import { expect } from 'chai';
import sinon from 'sinon';
import transporter from '../utils/transporter.js'; // Adjust the path if needed
import { resendOTP } from '../controllers/authController.js';
import User from '../models/User.js';
import OTP from '../models/otp.js';
import { otpMessage } from '../utils/emailUtils.js';
import generateCode from '../utils/generateCode.js';

describe('resendOTP Function', () => {
    let req, res, next;
    let userStub, otpStub;

    beforeEach(() => {
        req = {
            params: { id: '12345' } // Simulate a user ID
        };
        res = {
            json: sinon.stub(), // Mocking the res.json method
        };
        next = sinon.stub(); // Mocking the next function to handle errors

        // Stubbing User.findById to simulate fetching the user
        userStub = sinon.stub(User, 'findById');

        // Stubbing OTP.prototype.save to simulate saving the OTP
        otpStub = sinon.stub(OTP.prototype, 'save').resolves({
            otp: '123456',
            userId: '12345',
        });

        // Stub the sendMail method of the transporter
        sinon.stub(transporter, 'sendMail').resolves();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should successfully resend OTP if two-factor authentication is enabled', async () => {
        const user = {
            _id: '12345',
            email: 'john@example.com',
            two_fa_status: 'on',
            save: sinon.stub().resolves(),
            OTP_code: '654321', // Previous OTP code
        };

        // Mocking User.findById to return the user object
        userStub.withArgs('12345').resolves(user);

        // Call the resendOTP function
        await resendOTP(req, res, next);

        // Assertions
        expect(userStub.calledOnce).to.be.true;
        expect(otpStub.calledOnce).to.be.true;
        expect(transporter.sendMail.calledOnce).to.be.true;

        // // Assert that res.json is called with the correct message and OTP status
        // expect(res.json.calledOnce).to.be.true;
        // expect(res.json.firstCall.args[0]).to.deep.equal({
        //     message: 'one-time login has been sent your email',
        //     otpStatus: 'on',
        // });
    });

    it('should return user if two-factor authentication is not enabled', async () => {
        const user = {
            _id: '12345',
            email: 'john@example.com',
            two_fa_status: 'off',
            save: sinon.stub().resolves(),
        };

        // Mocking User.findById to return the user object
        userStub.withArgs('12345').resolves(user);

        // Call the resendOTP function
        await resendOTP(req, res, next);

        // Assertions
        expect(userStub.calledOnce).to.be.true;
     
    });


    it('should call next with an error if OTP saving fails', async () => {
        const user = {
            _id: '12345',
            email: 'john@example.com',
            two_fa_status: 'on',
            save: sinon.stub().resolves(),
        };

        // Mocking User.findById to return the user object
        userStub.withArgs('12345').resolves(user);

        // Simulate an error being thrown by OTP.prototype.save
        otpStub.rejects(new Error('Failed to save OTP'));

        // Call the resendOTP function
        await resendOTP(req, res, next);

        // Assertions
        expect(next.calledOnce).to.be.true;
        expect(next.firstCall.args[0].message).to.equal('Failed to save OTP');
    });

    it('should call next with an error if sending email fails', async () => {
        const user = {
            _id: '12345',
            email: 'john@example.com',
            two_fa_status: 'on',
            save: sinon.stub().resolves(),
            OTP_code: '654321', // Previous OTP code
        };

        // Mocking User.findById to return the user object
        userStub.withArgs('12345').resolves(user);

        // Simulate an error being thrown by transporter.sendMail
        transporter.sendMail.rejects(new Error('Failed to send email'));

        // Call the resendOTP function
        await resendOTP(req, res, next);

        // Assertions
        expect(next.calledOnce).to.be.true;
        expect(next.firstCall.args[0].message).to.equal('Failed to send email');
    });
});
