import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { sendOTPEmail, sendPhoneOTP } from '@/lib/emailService';

interface OTPVerificationProps {
  email?: string;
  phoneNumber?: string;
  onVerificationComplete: (otp: string) => void;
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  phoneNumber,
  onVerificationComplete,
  onBack
}) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [error, setError] = useState('');

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTP = async (otpCode: string) => {
    try {
      if (email) {
        await sendOTPEmail(email, otpCode);
        toast.success('OTP sent to your email address');
      } else if (phoneNumber) {
        await sendPhoneOTP(phoneNumber, otpCode);
        toast.success('OTP sent to your phone number');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    }
  };

  const handleSendOTP = async () => {
    setIsResending(true);
    const otpCode = generateOTP();
    
    // Store OTP in localStorage temporarily (in production, use secure storage)
    localStorage.setItem('verification_otp', otpCode);
    localStorage.setItem('otp_timestamp', Date.now().toString());
    
    await sendOTP(otpCode);
    setTimeLeft(600); // Reset timer
    setIsResending(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const storedOTP = localStorage.getItem('verification_otp');
      const otpTimestamp = localStorage.getItem('otp_timestamp');
      
      if (!storedOTP || !otpTimestamp) {
        setError('OTP has expired. Please request a new one.');
        return;
      }

      const timeElapsed = Date.now() - parseInt(otpTimestamp);
      if (timeElapsed > 600000) { // 10 minutes
        setError('OTP has expired. Please request a new one.');
        localStorage.removeItem('verification_otp');
        localStorage.removeItem('otp_timestamp');
        return;
      }

      if (otp === storedOTP) {
        localStorage.removeItem('verification_otp');
        localStorage.removeItem('otp_timestamp');
        onVerificationComplete(otp);
        toast.success('OTP verified successfully!');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Verify Your {email ? 'Email' : 'Phone'}</CardTitle>
            <CardDescription>
              Enter the 6-digit OTP sent to {email || phoneNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  required
                />
              </div>

              <div className="text-center">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-600">
                    OTP expires in: <span className="font-mono">{formatTime(timeLeft)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600">OTP has expired</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <div className="text-center space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOTP}
                  disabled={isResending || timeLeft > 540} // Can resend after 1 minute
                  className="w-full"
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onBack}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTPVerification;
