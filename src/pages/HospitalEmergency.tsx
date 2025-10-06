import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Heart, 
  AlertCircle, 
  Navigation,
  Car,
  Ambulance,
  Shield,
  Zap,
  Users,
  Calendar,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SOSEmergency } from "@/components/SOSEmergency";
import { HospitalSelector } from "@/components/HospitalSelector";
import { toast } from "@/components/ui/sonner";
import PatientNavigation from "@/components/PatientNavigation";

const HospitalEmergency = () => {
  const navigate = useNavigate();
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("hospitals");

  const handleEmergencyCall = () => {
    // In a real app, this would trigger emergency services
    toast.success("Emergency services have been notified! Help is on the way.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <PatientNavigation />
      <div className="container mx-auto px-4 py-8 md:ml-72">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/patient-dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-blue-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                  Hospitals & Emergency
                </h1>
                <p className="text-muted-foreground">Find hospitals and access emergency services</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/bookings')}
                className="bg-primary hover:bg-primary/90"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </div>

        {/* Emergency Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-red-200 bg-red-50 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleEmergencyCall}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ambulance className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-700 mb-2">Emergency Call</h3>
              <p className="text-red-600 text-sm">Call emergency services immediately</p>
              <Badge className="mt-2 bg-red-100 text-red-800">24/7 Available</Badge>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("sos")}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-orange-700 mb-2">SOS Emergency</h3>
              <p className="text-orange-600 text-sm">Send emergency alerts to contacts</p>
              <Badge className="mt-2 bg-orange-100 text-orange-800">Quick Alert</Badge>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("hospitals")}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-2">Find Hospitals</h3>
              <p className="text-blue-600 text-sm">Locate nearby hospitals and clinics</p>
              <Badge className="mt-2 bg-blue-100 text-blue-800">Nearby</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="hospitals" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Find Hospitals
            </TabsTrigger>
            <TabsTrigger value="sos" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              SOS Emergency
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hospitals">
            <Card>
              <CardHeader className="mb-6">
                <CardTitle className="flex items-center gap-4 text-3xl font-extrabold">
                  <MapPin className="w-7 h-7" />
                  Udupi Hospitals & Healthcare Centers
                </CardTitle>
                <p className="text-lg text-muted-foreground mt-2">
                  Select a hospital to view details, get directions, and book appointments
                </p>
                {selectedHospital && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Selected Hospital:</strong> {selectedHospital.hospitalName || selectedHospital.name}
                    </p>
                    <p className="text-xs text-green-600">{selectedHospital.address}</p>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <HospitalSelector
                  selectedHospital={selectedHospital}
                  onSelectHospital={setSelectedHospital}
                />
                
                {selectedHospital && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Hospital Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Contact</p>
                            <p className="text-sm text-muted-foreground">{selectedHospital.contactNo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">Operating Hours</p>
                            <p className="text-sm text-muted-foreground">{selectedHospital.operatingHours}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium">Rating</p>
                            <p className="text-sm text-muted-foreground">{selectedHospital.rating}/5</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="font-medium">Specialties</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedHospital.specialties?.slice(0, 3).map((specialty: string) => (
                                <Badge key={specialty} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium">Emergency Services</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedHospital.emergencyAvailable ? 'Available 24/7' : 'Limited hours'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Car className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium">Distance</p>
                            <p className="text-sm text-muted-foreground">{selectedHospital.distance}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                      <Button 
                        onClick={() => navigate('/bookings')}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                      <Button variant="outline">
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </Button>
                      <Button variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Hospital
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-4 text-3xl font-extrabold">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                  SOS Emergency Services
                </CardTitle>
                <p className="text-lg text-muted-foreground mt-2">
                  Emergency assistance and quick alerts when you need help immediately
                </p>
              </CardHeader>
              <CardContent>
                <SOSEmergency />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Emergency Numbers */}
        <Card className="mt-8 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Emergency Contact Numbers
            </CardTitle>
            <CardDescription>
              Save these numbers for quick access during emergencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <Ambulance className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-bold text-red-700">Ambulance</h4>
                <p className="text-2xl font-bold text-red-600">108</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-bold text-blue-700">Police</h4>
                <p className="text-2xl font-bold text-blue-600">100</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-bold text-orange-700">Fire</h4>
                <p className="text-2xl font-bold text-orange-600">101</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-bold text-green-700">Women Helpline</h4>
                <p className="text-2xl font-bold text-green-600">1091</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalEmergency;
