import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, text, type = 'email', phoneNumber, message } = req.body;

    // Handle different notification types
    if (type === 'sms') {
      // SMS notification using Twilio
      if (!phoneNumber || !message) {
        return res.status(400).json({
          error: 'Missing required fields for SMS: phoneNumber and message'
        });
      }

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !twilioPhoneNumber) {
        return res.status(500).json({
          error: 'Twilio configuration missing'
        });
      }

      const client = twilio(accountSid, authToken);

      const smsResult = await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: phoneNumber
      });

      console.log('SMS sent successfully:', smsResult.sid);

      return res.status(200).json({
        success: true,
        messageId: smsResult.sid,
        message: 'SMS sent successfully'
      });

    } else {
      // Email notification
      if (!to || !subject || (!html && !text)) {
        return res.status(400).json({
          error: 'Missing required fields: to, subject, and html or text'
        });
      }

      // Create transporter using environment variables
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Verify transporter configuration
      await transporter.verify();

      // Email options
      const mailOptions = {
        from: `"MedConnect" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html: html || undefined,
        text: text || undefined,
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);

      console.log('Email sent successfully:', info.messageId);

      return res.status(200).json({
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully'
      });
    }

  } catch (error: any) {
    console.error('Error sending notification:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send notification'
    });
  }
}
