import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface NotificationData {
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  hospitalName: string;
  department: string;
  queueNumber: number;
  status: string;
  estimatedWaitTime?: number;
  message: string;
}

export const sendQueueNotification = async (notificationData: NotificationData): Promise<void> => {
  try {
    // Get patient preferences (assuming we have a preferences collection)
    const patientRef = doc(db, 'patients', notificationData.patientId);
    const patientSnap = await getDoc(patientRef);

    let emailEnabled = true;
    let smsEnabled = false;

    if (patientSnap.exists()) {
      const patientData = patientSnap.data();
      emailEnabled = patientData.notificationPreferences?.email !== false;
      smsEnabled = patientData.notificationPreferences?.sms === true;
      notificationData.patientEmail = patientData.email;
      notificationData.patientPhone = patientData.phoneNumber;
    }

    // Send email notification if enabled
    if (emailEnabled && notificationData.patientEmail) {
      await sendEmailNotification({
        to: notificationData.patientEmail,
        subject: `Queue Update - ${notificationData.hospitalName}`,
        html: generateEmailTemplate(notificationData)
      });
    }

    // Send SMS notification if enabled
    if (smsEnabled && notificationData.patientPhone) {
      await sendSMSNotification({
        phoneNumber: notificationData.patientPhone,
        message: generateSMSTemplate(notificationData)
      });
    }

  } catch (error) {
    console.error('Error sending queue notification:', error);
    // Don't throw error to avoid breaking queue operations
  }
};

const sendEmailNotification = async (emailData: { to: string; subject: string; html: string }): Promise<void> => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'email',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    const result = await response.json();
    console.log('Email notification sent:', result.messageId);
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

const sendSMSNotification = async (smsData: { phoneNumber: string; message: string }): Promise<void> => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'sms',
        phoneNumber: smsData.phoneNumber,
        message: smsData.message
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }

    const result = await response.json();
    console.log('SMS notification sent:', result.messageId);
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    throw error;
  }
};

const generateEmailTemplate = (data: NotificationData): string => {
  const statusMessages = {
    called: `Great news! Your number has been called. Please proceed to ${data.department} department.`,
    completed: `Your appointment has been completed. Thank you for visiting ${data.hospitalName}.`,
    cancelled: `Your appointment has been cancelled. Please contact the hospital for more information.`,
    waiting: `Your queue position has been updated. You are now number ${data.queueNumber} in line.`
  };

  const statusMessage = statusMessages[data.status as keyof typeof statusMessages] || data.message;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Queue Update - ${data.hospitalName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .status { font-size: 18px; font-weight: bold; margin: 20px 0; }
        .details { background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.hospitalName}</h1>
          <p>Queue Management System</p>
        </div>
        <div class="content">
          <h2>Hello ${data.patientName},</h2>
          <div class="status">${statusMessage}</div>
          <div class="details">
            <p><strong>Hospital:</strong> ${data.hospitalName}</p>
            <p><strong>Department:</strong> ${data.department}</p>
            <p><strong>Your Queue Number:</strong> ${data.queueNumber}</p>
            ${data.estimatedWaitTime ? `<p><strong>Estimated Wait Time:</strong> ${data.estimatedWaitTime} minutes</p>` : ''}
            <p><strong>Status:</strong> ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</p>
          </div>
          <p>Please arrive at the hospital on time and check in at the reception.</p>
          <p>If you have any questions, please contact the hospital directly.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from ${data.hospitalName}. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateSMSTemplate = (data: NotificationData): string => {
  const statusMessages = {
    called: `Your number has been called at ${data.hospitalName}. Please proceed to ${data.department}.`,
    completed: `Your appointment at ${data.hospitalName} is completed. Thank you for visiting.`,
    cancelled: `Your appointment at ${data.hospitalName} has been cancelled. Please contact hospital.`,
    waiting: `Queue update: You are now #${data.queueNumber} at ${data.hospitalName}. ${data.estimatedWaitTime ? `Est. wait: ${data.estimatedWaitTime}min.` : ''}`
  };

  return statusMessages[data.status as keyof typeof statusMessages] || data.message;
};
