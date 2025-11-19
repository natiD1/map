

// otp
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure email transporter (CORRECTED)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store OTPs temporarily
const otpStore = new Map();

router.post('/register', async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store OTP temporarily
    otpStore.set(email, { otp, expiry: otpExpiry, fullName, password });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Hello ${fullName},</p>
          <p>Thank you for registering. Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'OTP sent to your email. Please verify to complete registration.',
      email: email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }
  
  try {
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ message: 'OTP expired or invalid. Please register again.' });
    }
    
    // Check if OTP has expired
    if (Date.now() > storedData.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired. Please register again.' });
    }
    
    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // OTP is valid, create the user account
    const { fullName, password } = storedData;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      'INSERT INTO users (full_name, email, password_hash, status, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role, status',
      [fullName, email, passwordHash, 'pending', true]
    );

    // Remove OTP from store
    otpStore.delete(email);

    res.status(201).json({ 
      message: 'Registration successful! Awaiting admin approval.', 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resend OTP endpoint
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  try {
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ message: 'No registration found for this email. Please register again.' });
    }
    
    // Generate new OTP
    const newOtp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    
    // Update stored data
    otpStore.set(email, { 
      ...storedData, 
      otp: newOtp, 
      expiry: otpExpiry 
    });
    
    // Send new OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'New Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Verification Code</h2>
          <p>Hello ${storedData.fullName},</p>
          <p>Here is your new verification code:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${newOtp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'New OTP sent to your email.',
      email: email
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  try {
    // Check if user exists and is verified
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (rows.length === 0) {
      // Don't reveal that the user doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a reset code.',
        email: email 
      });
    }
    
    const user = rows[0];
    
    if (!user.is_verified) {
      return res.status(400).json({ message: 'Your email is not verified. Please verify your email first.' });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    
    // Store OTP with key for reset
    const key = `${email}:reset`;
    otpStore.set(key, { otp, expiry: otpExpiry });
    
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.full_name},</p>
          <p>We received a request to reset your password. Please use the following OTP to reset your password:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: 'If your email is registered, you will receive a reset code.',
      email: email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }
  
  try {
    const key = `${email}:reset`;
    const storedData = otpStore.get(key);
    
    if (!storedData) {
      return res.status(400).json({ message: 'OTP expired or invalid. Please try again.' });
    }
    
    // Check expiry
    if (Date.now() > storedData.expiry) {
      otpStore.delete(key);
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    
    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Hash the new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the user's password
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [passwordHash, email]
    );
    
    // Remove OTP from store
    otpStore.delete(key);
    
    res.status(200).json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update login to check for verification
// In your otp.js or auth routes file, replace the entire /login route

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    // If no user is found, it's still a login attempt.
    if (rows.length === 0) {
      // Security measure: Run a hash comparison to prevent timing attacks
      // that could reveal if a user email exists.
      await bcrypt.hash(password, 10); 
      console.log(`[Login Attempt] FAILED: No user found with email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

    // --- LOGS THE LOGIN ATTEMPT ---
    // This block runs for every attempt (both correct and incorrect passwords).
    console.log(`[Login Attempt] User: ${user.email}, Password Correct: ${isPasswordMatch}`);
    try {
      await db.query(
        'INSERT INTO login_attempts (user_id, success, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
        [user.id, isPasswordMatch, req.ip, req.get('User-Agent')]
      );
      console.log(`[Login Attempt] SUCCESS: Logged attempt for user ID ${user.id} to login_attempts table.`);
    } catch (dbError) {
      // This will catch errors like column name mismatches or database connection issues.
      console.error(`[Login Attempt] FAILED to insert into login_attempts:`, dbError);
    }
    // --- END LOGGING ---

    if (isPasswordMatch) {
      // Check for account status after a successful password match.
      if (!user.is_verified) {
        return res.status(403).json({ message: 'Email not verified. Please check your inbox for a verification code.' });
      }
      
      if (user.status === 'approved') {
        // --- UPDATES USER STATS ON SUCCESSFUL LOGIN ---
        // This block only runs after a successful login.
        try {
            await db.query(
              'UPDATE users SET login_count = login_count + 1, last_login = NOW() WHERE id = $1',
              [user.id]
            );
            console.log(`[Login Success] Updated login_count for user ID ${user.id}.`);
        } catch(updateError) {
            console.error(`[Login Success] FAILED to update login_count for user ID ${user.id}:`, updateError);
        }
        // --- END USER STATS UPDATE ---
        
        const payload = {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.full_name
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({
          message: 'Login successful!',
          token,
          user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            role: user.role,
            status: user.status
          }
        });
      }

      // Handle cases where the password is correct but the account is not approved.
      let message = 'Your account is pending admin approval.';
      if (user.status === 'rejected') message = 'Your account registration has been rejected.';
      else if (user.status === 'banned') message = 'This account has been banned.';

      return res.status(403).json({ message });
    }

    // This handles the case of an incorrect password.
    return res.status(401).json({ message: 'Invalid credentials' });

  } catch (error) {
    console.error('An unexpected error occurred in the /login route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;