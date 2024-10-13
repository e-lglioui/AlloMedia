
export const otpMessage = (otp, user) => {
    return `Dear ${user.name},

Your One-Time Password (OTP) for logging into your account is: ${otp.otp}

This OTP is valid for the next 5 minutes. Please do not share this OTP with anyone for security reasons.

Best regards,
Your Company Name`;
};
