const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({ // FIXED: createTransport (not createTransporter)
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async renderTemplate(templateName, data) {
    try {
      const templatePath = path.join(__dirname, '..', 'email-templates', `${templateName}.ejs`);
      
      // Check if template file exists
      try {
        await fs.access(templatePath);
        console.log(`Template found: ${templatePath}`);
      } catch (accessError) {
        console.error(`Template not found: ${templatePath}`);
        throw new Error(`Email template ${templateName} not found`);
      }
      
      const template = await fs.readFile(templatePath, 'utf-8');
      return ejs.render(template, data);
    } catch (error) {
      console.error('Error rendering email template:', error);
      throw new Error('Failed to render email template');
    }
  }

  async sendEmail(to, subject, templateName, data) {
    try {
      // Validate inputs
      if (!to || !subject || !templateName) {
        throw new Error('Missing required email parameters');
      }

      const html = await this.renderTemplate(templateName, data);
      
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Admin System',
          address: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER
        },
        to,
        subject,
        html,
      };

      // Verify transporter is connected
      await this.transporter.verify();
      
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', {
        messageId: result.messageId,
        to: to,
        subject: subject,
        template: templateName
      });
      
      return result;
    } catch (error) {
      console.error('Email sending failed:', {
        error: error.message,
        to: to,
        subject: subject,
        template: templateName
      });
      
      // Don't throw for template rendering errors, try to send plain text
      if (error.message.includes('template')) {
        console.log('Attempting to send plain text email instead');
        return this.sendPlainTextEmail(to, subject, data);
      }
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendPlainTextEmail(to, subject, data) {
    try {
      const text = `Hello ${data.user.name},\n\n${data.message || 'Please check the admin panel for details.'}\n\nThank you.`;
      
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Admin System',
          address: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER
        },
        to,
        subject,
        text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Plain text email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Plain text email also failed:', error.message);
      throw error;
    }
  }

  // Specific email methods
  async sendApprovalNotification(user) {
    return this.sendEmail(
      user.email,
      'Your Account Has Been Approved',
      'approval',
      {
        user: {
          name: user.full_name,
          email: user.email,
        },
        approvalDate: new Date().toLocaleDateString(),
        loginUrl: process.env.FRONTEND_LOGIN_URL || 'http://localhost:3000/login'
      }
    );
  }

  async sendRejectionNotification(user, reason) {
    return this.sendEmail(
      user.email,
      'Regarding Your Account Application',
      'rejection',
      {
        user: {
          name: user.full_name,
          email: user.email,
        },
        rejectionDate: new Date().toLocaleDateString(),
        reason: reason || 'No specific reason provided',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
      }
    );
  }

  async sendCustomNotification(user, subject, message) {
    return this.sendEmail(
      user.email,
      subject,
      'custom',
      {
        user: {
          name: user.full_name,
          email: user.email,
        },
        message: message,
        sentDate: new Date().toLocaleDateString(),
        supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
      }
    );
  }

  async sendLockNotification(user, reason) {
    return this.sendEmail(
      user.email,
      'Your Account Has Been Locked',
      'account-locked',
      {
        user: {
          name: user.full_name,
          email: user.email,
        },
        lockDate: new Date().toLocaleDateString(),
        reason: reason || 'Security reasons',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
      }
    );
  }

  async sendUnlockNotification(user) {
    return this.sendEmail(
      user.email,
      'Your Account Has Been Unlocked',
      'account-unlocked',
      {
        user: {
          name: user.full_name,
          email: user.email,
        },
        unlockDate: new Date().toLocaleDateString(),
        loginUrl: process.env.FRONTEND_LOGIN_URL || 'http://localhost:3000/login'
      }
    );
  }
}

module.exports = new EmailService();