import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { sendEmailNotification } from '@/lib/emailService';

const EmailTest: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      await sendEmailNotification({
        to: testEmail,
        subject: 'MedConnect Email Test',
        html: `
          <h2>🎉 Email Test Successful!</h2>
          <p>This is a test email from MedConnect to verify that EmailJS is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Sent at: ${new Date().toLocaleString()}</li>
            <li>From: MedConnect Admin</li>
            <li>Status: ✅ Working</li>
          </ul>
          <p>If you received this email, your EmailJS configuration is working perfectly!</p>
        `
      });

      setResult('success');
      toast.success('Test email sent successfully! Check your inbox.');
    } catch (error) {
      console.error('Test email error:', error);
      setResult('error');
      toast.error('Failed to send test email. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkConfiguration = () => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    console.log('EmailJS Configuration:');
    console.log('Service ID:', serviceId);
    console.log('Template ID:', templateId);
    console.log('Public Key:', publicKey);

    if (serviceId === 'your_service_id' || templateId === 'your_template_id' || publicKey === 'your_public_key') {
      setResult('not-configured');
    } else {
      setResult('configured');
      toast.success('EmailJS is configured!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>EmailJS Test Page</CardTitle>
            <CardDescription>
              Test your EmailJS configuration and send a test email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={checkConfiguration}
                variant="outline"
                className="flex-1"
              >
                Check Config
              </Button>
              <Button
                onClick={handleTestEmail}
                disabled={isLoading || !testEmail}
                className="flex-1"
              >
                {isLoading ? 'Sending...' : 'Send Test Email'}
              </Button>
            </div>

            {result === 'not-configured' && (
              <Alert variant="destructive">
                <AlertDescription>
                  EmailJS is not configured. Please check your .env file and follow the setup guide.
                </AlertDescription>
              </Alert>
            )}

            {result === 'configured' && (
              <Alert>
                <AlertDescription>
                  ✅ EmailJS is properly configured! You can now send test emails.
                </AlertDescription>
              </Alert>
            )}

            {result === 'success' && (
              <Alert>
                <AlertDescription>
                  ✅ Test email sent successfully! Check your inbox and spam folder.
                </AlertDescription>
              </Alert>
            )}

            {result === 'error' && (
              <Alert variant="destructive">
                <AlertDescription>
                  ❌ Failed to send test email. Check the browser console for details.
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground">
              <p><strong>Instructions:</strong></p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>First, click "Check Config" to verify setup</li>
                <li>Enter your email address</li>
                <li>Click "Send Test Email"</li>
                <li>Check your inbox for the test email</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailTest;
