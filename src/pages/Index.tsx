import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Clock, MapPin, ArrowRight, CheckCircle, Star, Shield, Phone, Calendar, AlertTriangle, Brain, Stethoscope, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "SOS Emergency",
      description: "24/7 emergency response with location tracking",
      color: "text-red-500"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Hospital Finder",
      description: "Find nearby hospitals with real-time availability",
      color: "text-blue-500"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Smart Booking",
      description: "Book appointments with preferred doctors",
      color: "text-green-500"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Queue Management",
      description: "Virtual check-in and real-time queue updates",
      color: "text-purple-500"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Health Records",
      description: "Complete medical history and test results",
      color: "text-pink-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Data Security",
      description: "HIPAA compliant with end-to-end encryption",
      color: "text-indigo-500"
    }
  ];

  const stats = [
    { label: "Hospitals in Udupi", value: "15+", icon: <MapPin className="w-4 h-4" /> },
    { label: "Patients Served", value: "50,000+", icon: <Users className="w-4 h-4" /> },
    { label: "Average Wait Time", value: "12 min", icon: <Clock className="w-4 h-4" /> },
    { label: "Emergency Response", value: "<5 min", icon: <Zap className="w-4 h-4" /> }
  ];

  const hospitals = [
    { name: "Kasturba Medical College", rating: 4.2, specialties: "Emergency, Cardiology", distance: "2.5 km" },
    { name: "Manipal Hospital Udupi", rating: 4.3, specialties: "Multi-specialty", distance: "1.8 km" },
    { name: "Dr. TMA Pai Hospital", rating: 4.0, specialties: "General Medicine", distance: "3.1 km" }
  ];

  const benefits = [
    "Reduce waiting times by up to 70%",
    "Access to 15+ hospitals in Udupi district",
    "24/7 emergency response system",
    "Complete digital health records",
    "Insurance integration and transparent pricing",
    "Multi-language support (English, Kannada, Tulu)"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                MedConnect Udupi
              </h1>
              <p className="text-xl text-muted-foreground">Your comprehensive healthcare companion</p>
            </div>
          </div>

          <Badge className="mb-6 bg-green-100 text-green-800 border-green-200 text-lg px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            HIPAA Compliant & Secure
          </Badge>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience the future of healthcare in Udupi. Connect with 15+ hospitals, 
            book appointments instantly, access emergency services, and manage your 
            health records all in one secure platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            size="lg"
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white hover:opacity-90 text-lg px-8 py-4"
            onClick={() => navigate("/auth/patient")}
          >
              <Heart className="mr-2 h-5 w-5" />
              Start as Patient
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
              className="text-lg px-8 py-4"
            onClick={() => navigate("/auth/staff")}
          >
              <Stethoscope className="mr-2 h-5 w-5" />
              Staff Portal
              <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          </div>

          {/* Emergency CTA */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Medical Emergency?</span>
            </div>
            <p className="text-sm text-red-700 mb-3">Call emergency services immediately</p>
          <Button
              variant="destructive" 
              size="sm"
              onClick={() => window.open("tel:108")}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 108 (Ambulance)
          </Button>
          </div>
        </div>

      {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
          </Card>
          ))}
        </div>

      {/* Features Section */}
        <div className="mb-16">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Comprehensive Healthcare Solutions</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              From emergency response to routine checkups, we've got all your healthcare needs covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className={`w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Hospital Network */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Hospital Network</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Partnered with leading hospitals across Udupi for comprehensive care
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {hospitals.map((hospital, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{hospital.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{hospital.rating}</span>
                        <span className="text-sm text-muted-foreground">• {hospital.distance}</span>
                      </div>
                    </div>
                </div>
                  <p className="text-sm text-muted-foreground">{hospital.specialties}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      {/* Benefits Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose MedConnect Udupi?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience healthcare like never before with our innovative platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Key Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-blue-600" />
                  Smart Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">AI-powered appointment scheduling</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm">Real-time queue optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-sm">Predictive wait time estimation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-sm">Smart emergency response routing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span className="text-sm">Automated health reminders</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple steps to better healthcare access
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="font-semibold mb-2">Sign Up & Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Create your secure account and complete your medical profile
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="font-semibold mb-2">Find & Select</h3>
                <p className="text-sm text-muted-foreground">
                  Browse hospitals, departments, and doctors in your area
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="font-semibold mb-2">Book & Pay</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule your appointment and make secure payments
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <h3 className="font-semibold mb-2">Track & Manage</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your queue position and access health records
                </p>
              </CardContent>
            </Card>
            </div>
          </div>

        {/* CTA Section */}
        <Card 
          className="p-12 text-center bg-gradient-to-r from-blue-600 to-green-600 text-white"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardContent className="p-0">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Healthcare Experience?</h2>
            <p className="text-blue-100 mb-8 max-w-3xl mx-auto text-lg">
              Join thousands of patients in Udupi who have already experienced the future of healthcare.
              Get started today and never wait in long queues again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-4 transform transition-transform hover:scale-105"
                onClick={() => navigate("/auth/patient")}
              >
                <Heart className="mr-2 h-5 w-5" />
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            <Button
              size="lg"
                variant="outline"
                className="text-lg px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => window.open("tel:108")}
            >
                <Phone className="mr-2 h-5 w-5" />
                Emergency: Call 108
            </Button>
            </div>
          </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default Index;