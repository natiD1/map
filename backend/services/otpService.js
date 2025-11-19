// services/otpService.js
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // For generating a more secure OTP
require('dotenv').config();

// In-memory store for OTPs (for production, use Redis or a temporary DB table)
const otpStore = new Map(); // Key: email, Value: { otp: string, expiresAt: Date }

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or 'outlook', 'sendgrid', etc. or configure SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOtp = () => {
  // Generate a 6-digit numeric OTP
  return crypto.randomInt(100000, 999999).toString();
};

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Registration',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">OTP Verification</h2>
        <p>Dear user,</p>
        <p>Thank you for registering with us. To complete your registration, please use the following One-Time Password (OTP):</p>
        <p style="font-size: 24px; font-weight: bold; color: #0056b3; background-color: #f0f0f0; padding: 10px 20px; border-radius: 5px; display: inline-block;">${otp}</p>
        <p>This OTP is valid for ${process.env.OTP_EXPIRATION_MINUTES || 5} minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>Your Application Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send OTP to ${email}:`, error);
    return false;
  }
};

const storeOtp = (email, otp) => {
  const expirationMinutes = parseInt(process.env.OTP_EXPIRATION_MINUTES || '5', 10);
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000); // 5 minutes from now
  otpStore.set(email, { otp, expiresAt });
  console.log(`OTP stored for ${email}. Expires at: ${expiresAt}`);
};

const verifyOtp = (email, userOtp) => {
  const stored = otpStore.get(email);
  if (!stored) {
    return { success: false, message: 'OTP not found or expired. Please request a new one.' };
  }

  if (stored.expiresAt < new Date()) {
    otpStore.delete(email); // Clean up expired OTP
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (stored.otp === userOtp) {
    otpStore.delete(email); // OTP successfully used, remove it
    return { success: true, message: 'OTP verified successfully.' };
  } else {
    return { success: false, message: 'Invalid OTP.' };
  }
};

module.exports = {
  generateOtp,
  sendOtpEmail,
  storeOtp,
  verifyOtp,
};