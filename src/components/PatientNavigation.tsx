import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Heart, 
  LogOut,
  Menu,
  X,
  Home
} from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";

const PatientNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      path: "/patient-dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Your appointments"
    },
    {
      path: "/hospital-emergency",
      label: "Hospitals & Emergency",
      icon: MapPin,
      description: "Find hospitals & emergency"
    },
    {
      path: "/bookings",
      label: "Book Appointment",
      icon: Calendar,
      description: "Schedule appointments"
    },
    {
      path: "/queue-status",
      label: "Queue Status",
      icon: Users,
      description: "Check queue status"
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block fixed top-4 left-4 z-50">
        <Card className="w-64 shadow-elevated border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">MedConnect</h3>
                <p className="text-xs text-muted-foreground">Patient Portal</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-3 transition-all duration-200 ${
                      isActive(item.path) 
                        ? "bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md" 
                        : "hover:bg-gray-100 hover:shadow-sm"
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive(item.path) ? "text-white" : "text-muted-foreground"}`} />
                      <div className="text-left">
                        <p className={`font-medium text-sm ${isActive(item.path) ? "text-white" : ""}`}>
                          {item.label}
                        </p>
                        <p className={`text-xs ${isActive(item.path) ? "text-white/80" : "text-muted-foreground"}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {currentUser?.displayName || currentUser?.email || 'User'}
                  </p>
                  <Badge variant="outline" className="text-xs mt-1">Patient</Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm">MedConnect</span>
              <p className="text-xs text-muted-foreground">Patient Portal</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t bg-white/95 backdrop-blur-sm">
            <nav className="p-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path) 
                        ? "bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md" 
                        : "hover:bg-gray-100 hover:shadow-sm"
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive(item.path) ? "text-white" : "text-muted-foreground"}`} />
                      <div className="text-left">
                        <p className={`font-medium text-sm ${isActive(item.path) ? "text-white" : ""}`}>
                          {item.label}
                        </p>
                        <p className={`text-xs ${isActive(item.path) ? "text-white/80" : "text-muted-foreground"}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
              
              <div className="pt-4 border-t mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {currentUser?.displayName || currentUser?.email || 'User'}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">Patient</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Mobile spacing */}
      <div className="md:hidden h-16" />
    </>
  );
};

export default PatientNavigation;
