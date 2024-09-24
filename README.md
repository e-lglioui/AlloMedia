# alloMedia - Home Delivery Service Application

alloMedia is a Single Page Application (SPA) built using the MERN stack with client-side rendering (CSR). The platform allows customers to place orders for home delivery, manage their deliveries, and pay after the service is rendered. The application features role-based access for admins, customers, and delivery personnel, ensuring a secure and smooth user experience with JWT and two-factor authentication (2FA).

## Features

### Manager (Admin):
- **Web Admin Portal**: View and manage new orders, assign delivery personnel, and monitor order statistics.
- **Product Announcements Management**: Create, edit, and delete available products for delivery.
- **User Management**: Manage customer and delivery personnel profiles, suspend accounts if necessary.

### Client (Customer):
- **Sign-Up & Email Verification**: Register with email verification and two-factor authentication.
- **Place Orders**: Customers can browse available products and place orders directly from the platform.
- **Delivery Address Selection**: Customers can provide or update their delivery address during order placement.
- **Payment After Delivery**: Payments are automatically processed after delivery, and an invoice is sent via email.
- **Order History**: Customers can view the history of their past deliveries.

### Delivery Personnel:
- **Sign-Up**: Delivery personnel can register but must be approved by the admin to activate their account.
- **Update Order Status**: Delivery personnel can update the status of orders (Accepted, Picked Up, Delivered).
- **Delivery History**: Delivery personnel can view their past deliveries, including canceled ones.

## Security Features

- **JWT Authentication**: Secure login for all users, with access controlled by role.
- **Two-Factor Authentication (2FA)**: After login, a one-time password (OTP) is sent to the user's email or phone for identity verification.
- **Password Reset**: Users can reset their passwords via a secure token sent by email.

## Authentication API

- `POST /api/auth/register`: Register a new user (Customer, Delivery Personnel).
- `POST /api/auth/login`: User login with email and password.
- `POST /api/auth/verify-otp`: Validate the OTP for two-factor authentication.
- `POST /api/auth/forgetpassword`: Initiate the password reset process.
- `POST /api/auth/resetpassword/:token`: Complete the password reset with a new password.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, Two-Factor Authentication (2FA) using OTP via email/SMS
- **Testing**: Mocha for unit testing
- **Other Libraries**:
  - **Bcryptjs**: For password hashing
  - **Nodemailer**: For sending emails (OTP, password resets)
  - **AWS SNS**: For sending SMS (OTP)
  - **Dotenv**: For environment variable management

## Installation

1. Clone the repository:

                        git clone https://github.com/e-lglioui/AlloMedia.git

2. Clone the repository:

                        cd alloMedia
                        npm install

3. Set up environment variables:

                        PORT=3000
                        DB_URI=your-mongodb-uri
                        JWT_SECRET=your-jwt-secret
                        EMAIL_USER=your-email@example.com
                        EMAIL_PASS=your-email-password
                        AWS_ACCESS_KEY=your-aws-access-key
                        AWS_SECRET_KEY=your-aws-secret-key

 4. Run the application:
                        npm start

## Testing 
To run unit tests for authentication and other critical features:

                        npm test


  ## Project Structure
/alloMedia
│
├── /controllers        # Business logic for handling routes
├── /models             # Mongoose schemas for Users, Orders, Deliveries
├── /routes             # Express routes for API endpoints
├── /middleware         # JWT verification and role-based access control
├── /utils              # Utility functions (sending emails, SMS)
├── /tests              # Unit tests
├── .env                # Environment variables
├── server.js           # Main server file
└── package.json        # Project dependencies and scripts

