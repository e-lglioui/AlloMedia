import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import { resetPassword } from '../controllers/authController.js'; 
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js'; 

describe('resetPassword Function', () => {
    let req, res, next;
    let userStub;

    beforeEach(() => {
        req = {
            params: { token: 'someValidToken' }, // Simulated request params
            body: { newPassword: 'newPassword123' } // Simulated request body
        };
        res = {
            status: sinon.stub().returnsThis(), // Mocking the status method to return res for chaining
            json: sinon.stub(),
        };
        next = sinon.stub();

        // Stubbing User.findById to simulate finding a user
        userStub = sinon.stub(User, 'findById');
    });

    afterEach(() => {
        sinon.restore(); // Restore the original methods
    });

    it('should return an error if no token is provided', async () => {
        req.params.token = null; // Simulate no token provided

        await resetPassword(req, res, next);

        expect(res.status.calledOnce).to.be.true;
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({ message: 'No token provided' });
    });

    it('should return an error if the token is invalid or expired', async () => {
        sinon.stub(jwt, 'verify').throws(new Error('invalid token'));

        await resetPassword(req, res, next);

        expect(next.calledOnce).to.be.true;
        expect(next.firstCall.args[0]).to.be.an.instanceof(ErrorResponse);
        expect(next.firstCall.args[0].message).to.equal('Error resetting password');
    });

    it('should return an error if the token has expired', async () => {
        sinon.stub(jwt, 'verify').throws({ name: 'TokenExpiredError' });

        await resetPassword(req, res, next);

        expect(next.calledOnce).to.be.true;
        expect(next.firstCall.args[0]).to.be.an.instanceof(ErrorResponse);
        expect(next.firstCall.args[0].message).to.equal('Token has expired');
    });

    it('should return an error if the user does not exist', async () => {
        sinon.stub(jwt, 'verify').returns({ userId: 'someUserId' });
        userStub.resolves(null); // Simulate no user found

        await resetPassword(req, res, next);

        expect(next.calledOnce).to.be.true;
        expect(next.firstCall.args[0]).to.be.an.instanceof(ErrorResponse);
        expect(next.firstCall.args[0].message).to.equal('Invalid token or user does not exist');
    });

    it('should reset the password successfully', async () => {
        // Create a mock user object with a save method
        const user = { 
            _id: 'someUserId', 
            password: 'oldPassword', 
            save: sinon.stub().resolves() // Stub the save method
        };
    
        sinon.stub(jwt, 'verify').returns({ userId: user._id });
        userStub.resolves(user); // Simulate user found
    
        await resetPassword(req, res, next);
    
        expect(res.status.calledOnce).to.be.true;
        expect(res.status.firstCall.args[0]).to.equal(200);
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({ message: 'Password reset successfully!' });
    });
    
    it('should call next with an error if an exception occurs', async () => {
        const error = new Error('Database error');
        sinon.stub(jwt, 'verify').returns({ userId: 'someUserId' });
        userStub.throws(error); // Simulate an error being thrown by User.findById

        await resetPassword(req, res, next);

        expect(next.calledOnce).to.be.true;
        expect(next.firstCall.args[0]).to.be.an.instanceof(ErrorResponse);
        expect(next.firstCall.args[0].message).to.equal('Error resetting password');
    });
});
