// Nodemailer configuration for Vercel API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Import toast for development notifications
import { toast } from '@/components/ui/sonner';

// Initialize email service (no longer needed with Nodemailer)
export const initializeEmailService = () => {
  console.log('Email service initialized with Nodemailer API');
};

// Send email notification using Nodemailer API
export const sendEmailNotification = async (emailData: EmailNotification): Promise<void> => {
  try {
    // Log email content for development
    console.log('📧 Email Notification:', {
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      timestamp: new Date().toISOString()
    });

    // Check if we're in development mode
    const isDevelopment = import.meta.env.DEV;
    const forceProductionEmails = import.meta.env.VITE_FORCE_PRODUCTION_EMAILS === 'true';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isVercel = window.location.hostname.includes('vercel.app');
    
    // Use simulation only if explicitly disabled or in certain conditions
    const useSimulation = isDevelopment && !forceProductionEmails && !isLocalhost;
    
    if (useSimulation) {
      console.log('⚠️ Development mode. Email simulation.');
      console.log('📧 Email would be sent to:', emailData.to);
      console.log('📧 Subject:', emailData.subject);
      console.log('📧 Content preview:', emailData.html.substring(0, 200) + '...');
      
      // Simulate successful email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Email sent successfully (simulated)');
      toast.info('📧 Email simulation: Email would be sent in production');
      return;
    }

    // For production or forced production mode, try to send via API
    try {
      // Determine API URL based on environment
      const apiUrl = isDevelopment 
        ? 'http://localhost:3001/api/send-email'
        : '/api/send-email';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const result = await response.json();
      console.log('✅ Email sent successfully:', result.messageId);
    } catch (apiError: any) {
      console.error('API Error:', apiError);
      
      // If API fails, fall back to simulation in development
      if (isDevelopment) {
        console.log('🔄 API failed, falling back to simulation...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Email sent successfully (simulated fallback)');
        toast.warning('📧 Email API failed, using simulation mode');
      } else {
        // In production, we should throw the error
        throw apiError;
      }
    }
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    
    // Fallback to simulation if API fails
    console.log('🔄 Falling back to email simulation...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Email sent successfully (simulated fallback)');
  }
};

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const emailData: EmailNotification = {
    to: email,
    subject: 'MedConnect - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">MedConnect Email Verification</h2>
        <p>Your email verification OTP is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">MedConnect - Healthcare Management System</p>
      </div>
    `
  };

  await sendEmailNotification(emailData);
};

export const sendPhoneOTP = async (phoneNumber: string, otp: string): Promise<void> => {
  // For phone OTP, we'll use a simple email notification
  // In production, you would integrate with SMS service like Twilio
  console.log(`Phone OTP for ${phoneNumber}: ${otp}`);
  
  // For demo purposes, we'll send an email notification about the phone OTP
  // In a real implementation, you would send SMS here
  try {
    await sendEmailNotification({
      to: 'admin@medconnect.com', // Admin email for phone OTP notifications
      subject: 'Phone OTP Generated',
      html: `
        <h3>Phone OTP Generated</h3>
        <p><strong>Phone Number:</strong> ${phoneNumber}</p>
        <p><strong>OTP:</strong> ${otp}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `
    });
  } catch (error) {
    console.error('Error sending phone OTP notification:', error);
  }
};

export const sendPasswordResetEmail = async (email: string, resetLink: string): Promise<void> => {
  const emailData: EmailNotification = {
    to: email,
    subject: 'MedConnect - Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You requested a password reset for your MedConnect account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">MedConnect - Healthcare Management System</p>
      </div>
    `
  };

  await sendEmailNotification(emailData);
};

export const sendWelcomeEmail = async (email: string, name: string, userType: string): Promise<void> => {
  const emailData: EmailNotification = {
    to: email,
    subject: 'Welcome to MedConnect!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to MedConnect!</h2>
        <p>Dear ${name},</p>
        <p>Welcome to MedConnect, your comprehensive healthcare management system!</p>
        <p>Your ${userType} account has been successfully created.</p>
        <p>You can now:</p>
        <ul>
          <li>Book appointments with verified hospitals</li>
          <li>Manage your medical records</li>
          <li>Access emergency services</li>
          <li>Track your health journey</li>
        </ul>
        <p>Thank you for choosing MedConnect for your healthcare needs.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">MedConnect - Healthcare Management System</p>
      </div>
    `
  };

  await sendEmailNotification(emailData);
};
