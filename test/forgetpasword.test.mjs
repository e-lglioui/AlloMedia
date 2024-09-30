import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken'; 
import { forgetpasword } from '../controllers/authController.js'; 
import User from '../models/User.js';
import transporter from '../utils/transporter.js'; // Ensure this path is correct

describe('forgetPassword Function', () => {
    let req, res, next;
    let userStub, transporterStub;

    beforeEach(() => {
        req = {
            body: { email: 'john@example.com' } // Simulated request body
        };
        res = {
            status: sinon.stub().returnsThis(), // Mocking the status method to return res for chaining
            json: sinon.stub(),
        };
        next = sinon.stub();

        // Stubbing User.findOne to simulate finding a user
        userStub = sinon.stub(User, 'findOne');

        // Stubbing transporter.sendMail to simulate sending an email
        transporterStub = sinon.stub(transporter, 'sendMail').resolves();
    });

    afterEach(() => {
        sinon.restore();  // Restore the original methods
    });

    it('should return an error if the email does not exist', async () => {
        userStub.resolves(null); // Simulate no user found

        await forgetpasword(req, res, next);

        expect(res.status.calledOnce).to.be.true;
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({ message: 'this email does not exist' });
    });

    it('should send a password reset email if the user exists', async () => {
        const user = { _id: '12345', email: 'john@example.com' };
        userStub.resolves(user); // Simulate user found

        await forgetpasword(req, res, next);

        // Verify that the email was sent
        expect(transporterStub.calledOnce).to.be.true;

        // Verify that the response was sent
        expect(res.status.calledOnce).to.be.true;
        expect(res.status.firstCall.args[0]).to.equal(201);
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({ message: ' isen you email to vrefie to resnd your code ,please check ur email.' });

        // Verify the email options
        const mailOptions = transporterStub.firstCall.args[0];
        const emailToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const verificationUrl = `${process.env.API_URL}?token=${emailToken}`;

        expect(mailOptions.from).to.equal(process.env.EMAIL_USER);
        expect(mailOptions.to).to.equal(user.email);
        expect(mailOptions.subject).to.equal('Reset ur pasword ');
        expect(mailOptions.html).to.include(verificationUrl);
    });

    it('should call next with an error if an exception occurs', async () => {
        const error = new Error('Database error');
        userStub.throws(error); // Simulate an error being thrown by User.findOne

        await forgetpasword(req, res, next);

        expect(next.calledOnce).to.be.true;
        expect(next.firstCall.args[0]).to.equal(error);
    });
});
