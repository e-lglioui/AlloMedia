import * as chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import app from '../app.js'; 
import User from '../models/User.js'; 
import { verifyEmail } from '../controllers/authController.js'; 

chai.use(chaiHttp);
const { expect } = chai;

describe('Auth Controller', () => {

  describe('verifyEmail', () => {
    let user;

    beforeEach(() => {
      user = {
        _id: 'someUserId',
        isVerified: false,
        save: sinon.stub().resolves(),
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return 400 if no token is provided', async () => {
      const res = await chai.request(app).get('/api/auth/verify-user');

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'No token provided');
    });

    it('should return 400 if user is not found', async () => {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

      sinon.stub(User, 'findById').resolves(null);

      const res = await chai.request(app).get('/api/auth/verify-email?token=' + token);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'User not found');
    });

    it('should return 400 if email is already verified', async () => {
      user.isVerified = true;
      sinon.stub(User, 'findById').resolves(user);

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

      const res = await chai.request(app).get('/api/auth/verify-email?token=' + token);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Email already verified');
    });

    it('should verify the email successfully', async () => {
      sinon.stub(User, 'findById').resolves(user);
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

      const res = await chai.request(app).get('/api/auth/verify-email?token=' + token);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Email verified successfully');
      expect(user.isVerified).to.be.true;
    });

    it('should return 400 for an invalid or expired token', async () => {
      const invalidToken = 'invalidToken';

      const res = await chai.request(app).get('/api/auth/verify-email?token=' + invalidToken);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'Invalid or expired token');
    });
  });
});
