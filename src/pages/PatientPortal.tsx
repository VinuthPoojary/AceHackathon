
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, User, Calendar, CheckCircle, AlertCircle, Lock, MapPin, Heart, Phone, Bell } from "lucide-react";
import { DepartmentSelector } from "@/components/DepartmentSelector";
import { QueuePosition } from "@/components/QueuePosition";
import { HospitalSelector } from "@/components/HospitalSelector";
import { EnhancedPatientProfile } from "@/components/EnhancedPatientProfile";
import { SOSEmergency } from "@/components/SOSEmergency";
import { EnhancedBookingFlow } from "@/components/EnhancedBookingFlow";
import PatientDashboard from "./PatientDashboard";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "@/components/ui/sonner";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import RealTimeQueueDetails from "@/components/RealTimeQueueDetails";
import { useNavigate } from "react-router-dom";

// Hospital list copied from HospitalSelector component
const UDUPI_HOSPITALS = [
  {
    id: 1,
    name: "Kasturba Medical College Hospital",
    address: "NH 66, Near Hiriadka, Udupi, Karnataka 576104",
    phone: "+91 820 292 2200",
    coordinates: { lat: 13.3375, lng: 74.7458 },
    specialties: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics"],
    rating: 4.2,
    distance: "2.5 km",
    emergencyAvailable: true,
    operatingHours: "24/7",
    facilities: ["ICU", "NICU", "Ambulance", "Pharmacy", "Laboratory", "Radiology"],
    estimatedWait: "15-30 mins",
    priceRange: "₹500-2000"
  },
  {
    id: 2,
    name: "Dr. TMA Pai Hospital",
    address: "Kunjibettu, Udupi, Karnataka 576102",
    phone: "+91 820 429 8000",
    coordinates: { lat: 13.3400, lng: 74.7500 },
    specialties: ["Emergency", "Internal Medicine", "Surgery", "Gynecology", "Dermatology"],
    rating: 4.0,
    distance: "3.1 km",
    emergencyAvailable: true,
    operatingHours: "6:00 AM - 10:00 PM",
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray"],
    estimatedWait: "20-45 mins",
    priceRange: "₹300-1500"
  },
  {
    id: 3,
    name: "Manipal Hospital Udupi",
    address: "Udupi-Hebri Road, Udupi, Karnataka 576101",
    phone: "+91 820 429 9000",
    coordinates: { lat: 13.3350, lng: 74.7400 },
    specialties: ["Emergency", "Cardiology", "Orthopedics", "Pediatrics", "ENT"],
    rating: 4.3,
    distance: "1.8 km",
    emergencyAvailable: true,
    operatingHours: "24/7",
    facilities: ["ICU", "NICU", "Ambulance", "Pharmacy", "Laboratory", "MRI", "CT Scan"],
    estimatedWait: "10-25 mins",
    priceRange: "₹800-2500"
  },
  {
    id: 4,
    name: "Baliga Memorial Hospital",
    address: "Bejai Kapikad, Udupi, Karnataka 576101",
    phone: "+91 820 429 7000",
    coordinates: { lat: 13.3420, lng: 74.7520 },
    specialties: ["Emergency", "General Medicine", "Pediatrics", "Gynecology"],
    rating: 3.8,
    distance: "4.2 km",
    emergencyAvailable: true,
    operatingHours: "24/7",
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory"],
    estimatedWait: "30-60 mins",
    priceRange: "₹200-1200"
  },
  {
    id: 5,
    name: "Adarsha Hospital",
    address: "Malpe Road, Udupi, Karnataka 576101",
    phone: "+91 820 429 6000",
    coordinates: { lat: 13.3380, lng: 74.7480 },
    specialties: ["Emergency", "Cardiology", "Neurology", "Orthopedics"],
    rating: 4.1,
    distance: "2.8 km",
    emergencyAvailable: true,
    operatingHours: "24/7",
    facilities: ["ICU", "NICU", "Ambulance", "Pharmacy", "Laboratory", "Radiology", "Dialysis"],
    estimatedWait: "25-40 mins",
    priceRange: "₹600-2000"
  }
];

const PatientPortal = () => {
  const { currentUser, isPatientLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [editableName, setEditableName] = useState("");
  const [editableId, setEditableId] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [isValidatingBooking, setIsValidatingBooking] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [queuePosition, setQueuePosition] = useState(12);
  const [estimatedWait, setEstimatedWait] = useState(35);
  const [activeTab, setActiveTab] = useState("profile");


  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    if (profile) {
      setEditableName(profile.fullName || "");
      setEditableId(profile.patientId || "");
    }
  }, [profile]);

  const fetchProfile = async () => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "patients", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    const requiredFields = [
      "fullName",
      "dob",
      "phone",
      "address",
      "sex",
      "married",
    ];
    return requiredFields.every((field) => profile[field]);
  };

  const departmentPrices: Record<string, number> = {
    Emergency: 500,
    Cardiology: 1000,
    Orthopedics: 800,
    Pediatrics: 600,
    Radiology: 700,
  };

  const appointmentTypePrices: Record<string, number> = {
    "Walk-in": 0,
    "Scheduled Appointment": 200,
    "Follow-up": 100,
    Emergency: 300,
  };

  const validateBookingId = async () => {
    if (!bookingId.trim()) {
      toast.error("Please enter a booking ID.");
      setBookingData(null);
      return false;
    }

    setIsValidatingBooking(true);
    try {
      const q = query(
        collection(db, "bookings"),
        where("bookingId", "==", bookingId.trim())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const booking = querySnapshot.docs[0].data();
        setBookingData(booking);
        toast.success("Booking ID validated successfully.");
        return true;
      } else {
        setBookingData(null);
        toast.error("Invalid booking ID. Please check and try again.");
        return false;
      }
    } catch (error) {
      console.error("Error validating booking ID:", error);
      toast.error("Error validating booking ID. Please try again.");
      setBookingData(null);
      return false;
    } finally {
      setIsValidatingBooking(false);
    }
  };

  const handleViewQueue = async () => {
    const isValid = await validateBookingId();
    if (isValid && bookingData) {
      navigate("/display");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                MedConnect Udupi
              </h1>
              <p className="text-muted-foreground">Your comprehensive healthcare companion</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("sos")}>
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-medium">SOS Emergency</h3>
            <p className="text-sm text-muted-foreground">24/7 Emergency</p>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("hospitals")}>
            <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-medium">Find Hospitals</h3>
            <p className="text-sm text-muted-foreground">Nearby Care</p>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("booking")}>
            <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-medium">Book Appointment</h3>
            <p className="text-sm text-muted-foreground">Easy Scheduling</p>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("profile")}>
            <User className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-medium">My Profile</h3>
            <p className="text-sm text-muted-foreground">Health Records</p>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="sos">SOS Emergency</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="booking">Booking</TabsTrigger>
            <TabsTrigger value="queue">Queue Status</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <EnhancedPatientProfile />
          </TabsContent>

          <TabsContent value="sos">
            <SOSEmergency />
          </TabsContent>

          <TabsContent value="hospitals">
            <Card>
              <CardHeader className="mb-6">
                <CardTitle className="flex items-center gap-4 text-3xl font-extrabold">
                  <MapPin className="w-7 h-7" />
                  Udupi Hospitals & Healthcare Centers
                </CardTitle>
                <p className="text-lg text-muted-foreground mt-2">
                  View hospital details, get directions, and book appointments
                </p>
              </CardHeader>
              <CardContent>
                <HospitalSelector />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="booking">
            <EnhancedBookingFlow
              onBookingComplete={(booking) => {
                console.log("Booking completed:", booking);
                navigate("/display");
              }}
            />
          </TabsContent>

          <TabsContent value="queue">
          {!isCheckedIn ? (
            <Card className="p-4 shadow-elevated max-w-xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-center">Virtual Check-In</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Booking ID</label>
                  <input
                    type="text"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    disabled={isValidatingBooking}
                    onBlur={validateBookingId}
                    placeholder="Enter your booking ID"
                  />
                </div>

                <Button
                  onClick={handleViewQueue}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white hover:opacity-90"
                  size="lg"
                  disabled={isValidatingBooking || !bookingId.trim()}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {isValidatingBooking ? "Validating..." : "View Queue"}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="p-6 shadow-elevated bg-gradient-to-br from-card to-accent/5">
                <div className="flex items-center justify-between mb-6">
                  <Badge className="bg-secondary text-secondary-foreground">Checked In</Badge>
                  <span className="text-sm text-muted-foreground">Booking ID: {bookingId}</span>
                </div>

                {/* You can add more details about the booking or queue here */}

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <Card className="p-4 bg-background/50">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Patients Ahead</p>
                        <p className="text-2xl font-bold">{queuePosition - 1}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-background/50">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-warning" />
                      <div>
                        <p className="text-sm text-muted-foreground">Est. Wait Time</p>
                        <p className="text-2xl font-bold">{estimatedWait} min</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-background/50">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="text-lg font-semibold text-secondary">In Queue</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>

              {/* Progress Timeline */}
              <Card className="p-6 shadow-card">
                <h3 className="font-semibold mb-4">Your Journey</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Checked In</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-warning flex items-center justify-center">
                      <Clock className="h-5 w-5 text-warning-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Waiting in Queue</p>
                      <p className="text-sm text-muted-foreground">Current status</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Consultation</p>
                      <p className="text-sm text-muted-foreground">Upcoming</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setIsCheckedIn(false)}
                >
                  Cancel Check-In
                </Button>
              </div>
            </div>
          )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientPortal;
