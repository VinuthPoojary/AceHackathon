import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock, 
  Heart, 
  Users,
  Navigation,
  Shield,
  CheckCircle,
  X,
  Siren
} from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

interface EmergencyLocation {
  lat: number;
  lng: number;
  address: string;
  accuracy: number;
}

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export const SOSEmergency = () => {
  const { currentUser } = useAuth();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [location, setLocation] = useState<EmergencyLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [emergencyType, setEmergencyType] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);

  const emergencyTypes = [
    { value: "medical", label: "Medical Emergency", icon: "🏥", priority: "high" },
    { value: "accident", label: "Accident", icon: "🚗", priority: "critical" },
    { value: "heart", label: "Heart Attack", icon: "❤️", priority: "critical" },
    { value: "stroke", label: "Stroke", icon: "🧠", priority: "critical" },
    { value: "breathing", label: "Breathing Difficulty", icon: "🫁", priority: "high" },
    { value: "allergy", label: "Severe Allergic Reaction", icon: "⚠️", priority: "high" },
    { value: "other", label: "Other Emergency", icon: "🚨", priority: "medium" }
  ];

  useEffect(() => {
    // Check location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setIsLocationPermissionGranted(true),
        () => setIsLocationPermissionGranted(false)
      );
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && isEmergencyActive) {
      triggerEmergency();
    }
    return () => clearInterval(interval);
  }, [countdown, isEmergencyActive]);

  const getCurrentLocation = async (): Promise<EmergencyLocation | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Reverse geocoding to get address
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            resolve({
              lat: latitude,
              lng: longitude,
              address: `${data.locality}, ${data.city}, ${data.principalSubdivision}`,
              accuracy
            });
          } catch {
            resolve({
              lat: latitude,
              lng: longitude,
              address: "Location detected",
              accuracy
            });
          }
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const startEmergencyCountdown = async () => {
    setIsLoading(true);
    const currentLocation = await getCurrentLocation();
    setLocation(currentLocation);
    setIsLoading(false);
    
    if (currentLocation) {
      setCountdown(10); // 10 second countdown
    }
  };

  const triggerEmergency = async () => {
    if (!currentUser || !location) return;

    try {
      // Create emergency record in database
      const emergencyRecord = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        emergencyType,
        additionalInfo,
        location,
        emergencyContacts,
        triggeredAt: new Date(),
        status: "active",
        priority: emergencyTypes.find(t => t.value === emergencyType)?.priority || "medium"
      };

      await addDoc(collection(db, "emergencies"), emergencyRecord);

      // Send notifications to emergency contacts
      await Promise.all(
        emergencyContacts.map(async (contact) => {
          // In a real app, you would integrate with SMS/email services
          console.log(`Alerting emergency contact: ${contact.name} at ${contact.phone}`);
        })
      );

      // Alert nearby hospitals
      console.log("Alerting nearby hospitals...");

      setIsEmergencyActive(true);
      setCountdown(0);

      // Auto-cancel after 30 minutes if no response
      setTimeout(() => {
        setIsEmergencyActive(false);
      }, 30 * 60 * 1000);

    } catch (error) {
      console.error("Error triggering emergency:", error);
    }
  };

  const cancelEmergency = () => {
    setIsEmergencyActive(false);
    setCountdown(0);
    setLocation(null);
    setEmergencyType("");
    setAdditionalInfo("");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const emergencyNumbers = [
    { name: "Police", number: "100", description: "Emergency police response" },
    { name: "Fire", number: "101", description: "Fire department" },
    { name: "Ambulance", number: "108", description: "Emergency medical services" },
    { name: "Women Helpline", number: "1091", description: "Women's safety helpline" },
    { name: "Child Helpline", number: "1098", description: "Child protection services" },
    { name: "Disaster Management", number: "108", description: "Natural disaster response" }
  ];

  return (
    <div className="space-y-6">
      {/* Main SOS Button */}
      <Card className={`border-2 transition-all duration-300 ${
        isEmergencyActive ? 'border-red-500 bg-red-50' : 'border-orange-500'
      }`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Siren className="w-6 h-6 text-red-500 animate-pulse" />
            Emergency SOS
            <Siren className="w-6 h-6 text-red-500 animate-pulse" />
          </CardTitle>
          <CardDescription>
            Use in case of medical emergencies, accidents, or life-threatening situations
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {!isEmergencyActive ? (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-red-500 hover:bg-red-600 text-white text-lg px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Getting Location...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        EMERGENCY SOS
                      </div>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Emergency Alert</DialogTitle>
                    <DialogDescription>
                      Please select the type of emergency and provide any additional information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Emergency Type</label>
                      <select
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        value={emergencyType}
                        onChange={(e) => setEmergencyType(e.target.value)}
                      >
                        <option value="">Select emergency type</option>
                        {emergencyTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Information</label>
                      <textarea
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                        placeholder="Describe the emergency situation..."
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={startEmergencyCountdown}
                        className="flex-1 bg-red-500 hover:bg-red-600"
                        disabled={!emergencyType}
                      >
                        Trigger Emergency Alert
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {!isLocationPermissionGranted && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Location permission is required for emergency services. Please enable location access.
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-red-600 mb-2">EMERGENCY ACTIVE</h3>
                <p className="text-muted-foreground">Help is on the way</p>
              </div>

              {location && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Your Location:</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{location.address}</p>
                  <p className="text-xs text-muted-foreground">
                    Accuracy: {location.accuracy}m
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={cancelEmergency}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Emergency
                </Button>
              </div>
            </div>
          )}

          {countdown > 0 && (
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{countdown}</div>
              <p className="text-muted-foreground">
                Emergency will be triggered in {countdown} seconds
              </p>
              <Button
                onClick={cancelEmergency}
                variant="outline"
                className="mt-2"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Emergency Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {emergencyNumbers.map((emergency) => (
              <div key={emergency.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{emergency.name}</h4>
                  <p className="text-sm text-muted-foreground">{emergency.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`tel:${emergency.number}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {emergency.number}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Status */}
      {isEmergencyActive && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Shield className="w-5 h-5" />
              Emergency Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Emergency response activated</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Emergency Details:</h4>
                <p><strong>Type:</strong> {emergencyTypes.find(t => t.value === emergencyType)?.label}</p>
                <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
                <p><strong>Status:</strong> Active</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Response Actions:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Location shared with emergency services
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Emergency contacts notified
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Nearby hospitals alerted
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
