import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  TrendingUp,
  Shield,
  Smartphone,
  Activity,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: "Real-Time Tracking",
      description: "Monitor queue positions and wait times with live updates",
    },
    {
      icon: Smartphone,
      title: "Remote Check-In",
      description: "Patients can check in from anywhere, reducing physical crowding",
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Data-driven insights for continuous improvement",
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Secure and private patient data management",
    },
    {
      icon: Users,
      title: "Staff Management",
      description: "Optimize resource allocation and patient prioritization",
    },
    {
      icon: Activity,
      title: "Flow Visualization",
      description: "Clear visibility into patient journey and bottlenecks",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Next-Generation Healthcare Technology</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            Digital Queue Management
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your hospital's patient flow with intelligent queue management, real-time
            analytics, and seamless communication
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/auth/patient")}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 text-lg px-8"
          >
            Patient Portal
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/auth/staff")}
            className="text-lg px-8"
          >
            Staff Dashboard
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/display")}
            className="text-lg px-8"
          >
            Queue Display
          </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 text-center shadow-card hover:shadow-elevated transition-shadow">
            <p className="text-4xl font-bold text-primary mb-2">40%</p>
            <p className="text-sm text-muted-foreground">Reduction in Wait Times</p>
          </Card>
          <Card className="p-6 text-center shadow-card hover:shadow-elevated transition-shadow">
            <p className="text-4xl font-bold text-secondary mb-2">98%</p>
            <p className="text-sm text-muted-foreground">Patient Satisfaction</p>
          </Card>
          <Card className="p-6 text-center shadow-card hover:shadow-elevated transition-shadow">
            <p className="text-4xl font-bold text-warning mb-2">60%</p>
            <p className="text-sm text-muted-foreground">Staff Efficiency Increase</p>
          </Card>
          <Card className="p-6 text-center shadow-card hover:shadow-elevated transition-shadow">
            <p className="text-4xl font-bold text-primary mb-2">24/7</p>
            <p className="text-sm text-muted-foreground">Real-Time Monitoring</p>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Comprehensive Solution</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to modernize your hospital's patient flow management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 shadow-card hover:shadow-elevated transition-all hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">Why Choose Our System?</h2>
            <div className="space-y-4">
              {[
                "Minimize patient frustration with transparent wait times",
                "Optimize staff allocation based on real-time data",
                "Reduce physical overcrowding in waiting areas",
                "Enable predictive analytics for better planning",
                "Seamless integration with existing hospital systems",
                "Mobile-first design for accessibility",
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-lg">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-8 shadow-elevated bg-gradient-to-br from-card to-accent/20">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Hospital?</h3>
            <p className="text-muted-foreground mb-6">
              Join leading healthcare institutions in providing exceptional patient experiences
              through intelligent queue management.
            </p>
            <Button
              size="lg"
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              Get Started Today
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-muted-foreground">
          <p>© 2025 Digital Queue Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
