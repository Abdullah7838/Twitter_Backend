const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../Models/User');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Store reset tokens temporarily (in a real app, this would be in a database)
const passwordResetTokens = {};

// Configure nodemailer transporter
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email service
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with your email
      pass: process.env.EMAIL_PASS || 'your-email-password' // Replace with your email password or app password
    }
  });
} catch (error) {
  console.error('Error configuring nodemailer:', error);
  // We'll continue without the transporter and just log reset URLs
}

// Change password route
router.post('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Request password reset route
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Store the token (in a real app, this would be saved in the database)
    passwordResetTokens[email] = {
      token: resetToken,
      expiry: resetTokenExpiry
    };

    // Create reset URL
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    };

    // Only attempt to send email if transporter is configured
    if (transporter) {
      try {
        // In development, just log the reset URL
        console.log('Password reset URL:', resetUrl);
        
        // Uncomment to actually send the email in production
        /*
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);
        */
      } catch (error) {
        console.error('Error sending email:', error);
        // Continue anyway, we'll just log the URL
      }
    } else {
      // If transporter is not available, just log the URL
      console.log('Email service not configured. Password reset URL:', resetUrl);
    }

    return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Verify reset token and set new password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if token exists and is valid
    const resetData = passwordResetTokens[email];
    if (!resetData || resetData.token !== token || resetData.expiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    // Remove the used token
    delete passwordResetTokens[email];

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;