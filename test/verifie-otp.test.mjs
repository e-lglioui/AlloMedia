import { expect } from 'chai';
import sinon from 'sinon';
import { verifyOTP } from '../controllers/authController.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import sendToken from '../utils/sendToken.js';

describe('Verify OTP Function', () => {
    let req, res, next;
    let userStub, saveStub, sendTokenStub;

    beforeEach(() => {
        req = {
            params: { id: '12345' },
            body: { otp: '123456' },
        };
        res = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub(),
            json: sinon.stub(),
        };
        next = sinon.stub();

        userStub = sinon.stub(User, 'findById');
        saveStub = sinon.stub(User.prototype, 'save');
        sendTokenStub = sinon.stub().resolves();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return a 400 error if user is not found', async () => {
        userStub.withArgs('12345').returns(null);  // Simulate user not found

        await verifyOTP(req, res, next);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.send.calledWith(sinon.match.has('message', 'invalid user'))).to.be.true;
    });

    it('should return a 400 error if OTP is expired', async () => {
        const user = {
            _id: '12345',
            OTP_code: '123456',
            updatedAt: new Date(Date.now() - 10 * 60 * 1000), // Simulate 10 minutes ago
            save: saveStub,
        };
        userStub.withArgs('12345').returns(user); // Simulate user found

        await verifyOTP(req, res, next);

        expect(next.calledWith(sinon.match.instanceOf(ErrorResponse))).to.be.true;
        expect(next.args[0][0].message).to.equal('OTP expired, please request a new one');
    });

    it('should return a 400 error if OTP is invalid', async () => {
        const user = {
            _id: '12345',
            OTP_code: '654321', // Simulate different OTP
            updatedAt: new Date(),
            save: saveStub,
        };
        userStub.withArgs('12345').returns(user); // Simulate user found

        await verifyOTP(req, res, next);

        expect(next.calledWith(sinon.match.instanceOf(ErrorResponse))).to.be.true;
        expect(next.args[0][0].message).to.equal('invalid token, please try again');
    });

    it('should clear OTP and return success if OTP is valid', async () => {
        const user = {
            _id: '12345',
            OTP_code: '123456', // Correct OTP
            updatedAt: new Date(),
            getSignedToken: sinon.stub().returns('mockedSignedToken'), 
            save: saveStub,
        };
        userStub.withArgs('12345').returns(user); // Simulate user found

        sendTokenStub.resolves(); // Simulate successful token sending

        await verifyOTP(req, res, next);

        expect(user.OTP_code).to.be.null;
        expect(saveStub.calledOnce).to.be.true;
        // expect(sendTokenStub.calledOnce).to.be.true;
    });
 
});
