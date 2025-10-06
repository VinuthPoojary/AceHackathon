import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EnhancedBookingFlow } from "@/components/EnhancedBookingFlow";
import PatientNavigation from "@/components/PatientNavigation";

const Bookings = () => {
  const navigate = useNavigate();
  const [selectedHospital, setSelectedHospital] = useState<any>(null);

  const handleBookingComplete = (booking: any) => {
    console.log("Booking completed:", booking);
    // Navigate to dashboard to show the new booking
    navigate('/patient-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <PatientNavigation />
      <div className="container mx-auto px-4 py-8 md:ml-72">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/patient-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Book Appointment
              </h1>
              <p className="text-muted-foreground">Schedule your healthcare appointment with ease</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">5 Steps</p>
                    <p className="text-sm text-blue-600">Simple booking process</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">5+ Hospitals</p>
                    <p className="text-sm text-green-600">Multiple options available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Badge className="w-5 h-5 text-purple-600">⚡</Badge>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">Auto-Advance</p>
                    <p className="text-sm text-purple-600">Quick booking experience</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Appointment Booking
            </CardTitle>
            <CardDescription>
              Follow the steps below to book your appointment. The process is designed to be quick and easy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedBookingFlow
              selectedHospital={selectedHospital}
              onBookingComplete={handleBookingComplete}
              onHospitalSelect={setSelectedHospital}
            />
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Having trouble booking your appointment? We're here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📞</span>
                </div>
                <h4 className="font-semibold mb-2">Call Support</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Speak with our support team for assistance
                </p>
                <Button variant="outline" size="sm">
                  Call Now
                </Button>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💬</span>
                </div>
                <h4 className="font-semibold mb-2">Live Chat</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Chat with us in real-time for quick help
                </p>
                <Button variant="outline" size="sm">
                  Start Chat
                </Button>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📧</span>
                </div>
                <h4 className="font-semibold mb-2">Email Support</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Send us an email and we'll get back to you
                </p>
                <Button variant="outline" size="sm">
                  Send Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Bookings;
