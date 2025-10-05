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
import { doc, getDoc, addDoc, collection } from "firebase/firestore";

const PatientPortal = () => {
  const { currentUser, isPatientLoggedIn } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [appointmentType, setAppointmentType] = useState("Walk-in");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [queuePosition, setQueuePosition] = useState(12);
  const [estimatedWait, setEstimatedWait] = useState(35);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");


  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

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

  const calculatePrice = () => {
    return (
      (departmentPrices[selectedDepartment] || 0) +
      (appointmentTypePrices[appointmentType] || 0)
    );
  };

  const handlePaymentSuccess = async () => {
    setIsCheckedIn(true);
    setQueuePosition(Math.floor(Math.random() * 20) + 5);
    setEstimatedWait(Math.floor(Math.random() * 60) + 15);
    setPaymentProcessing(false);

    // Add check-in to Firestore
    try {
      await addDoc(collection(db, "checkins"), {
        patientId: profile.patientId,
        patientName: profile.fullName,
        department: selectedDepartment,
        appointmentType,
        price: calculatePrice(),
        checkedInAt: new Date(),
        status: "waiting",
        queuePosition,
        estimatedWait,
      });
    } catch (error) {
      console.error("Error adding check-in:", error);
    }
  };

  const handleCheckIn = () => {
    if (!isProfileComplete()) {
      toast.error("Please complete your profile before check-in.");
      return;
    }
    const price = calculatePrice();
    if (price > 0) {
      // Simulate Razorpay payment gateway
      setPaymentProcessing(true);
      setTimeout(() => {
        toast.success(`Payment of ₹${price} successful!`);
        handlePaymentSuccess();
      }, 2000);
    } else {
      handlePaymentSuccess();
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Udupi Hospitals & Healthcare Centers
                </CardTitle>
                <p className="text-muted-foreground">
                  Select a hospital to view details, get directions, and book appointments
                </p>
              </CardHeader>
              <CardContent>
                <HospitalSelector
                  selectedHospital={selectedHospital}
                  onSelectHospital={setSelectedHospital}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="booking">
            <EnhancedBookingFlow
              selectedHospital={selectedHospital}
              onBookingComplete={(booking) => {
                console.log("Booking completed:", booking);
                setActiveTab("queue");
              }}
            />
          </TabsContent>

          <TabsContent value="queue">
            {!isCheckedIn ? (
              <Card className="p-6 shadow-elevated max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6 text-center">Virtual Check-In</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Patient Name</label>
                    <input
                      type="text"
                      value={profile?.fullName || ""}
                      readOnly
                      className="w-full px-4 py-2 border rounded-lg bg-muted cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Patient ID / Medical Record Number</label>
                    <input
                      type="text"
                      value={profile?.patientId || ""}
                      readOnly
                      className="w-full px-4 py-2 border rounded-lg bg-muted cursor-not-allowed"
                    />
                  </div>

                  <DepartmentSelector
                    selectedDepartment={selectedDepartment}
                    onSelect={setSelectedDepartment}
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">Appointment Type</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value)}
                    >
                      <option>Walk-in</option>
                      <option>Scheduled Appointment</option>
                      <option>Follow-up</option>
                      <option>Emergency</option>
                    </select>
                  </div>

                  <div className="text-lg font-semibold">
                    Price: ₹{calculatePrice()}
                  </div>

                  <Button
                    onClick={handleCheckIn}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white hover:opacity-90"
                    size="lg"
                    disabled={!selectedDepartment || paymentProcessing}
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {paymentProcessing ? "Processing Payment..." : "Complete Check-In"}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="p-6 shadow-elevated bg-gradient-to-br from-card to-accent/5">
                  <div className="flex items-center justify-between mb-6">
                    <Badge className="bg-secondary text-secondary-foreground">Checked In</Badge>
                    <span className="text-sm text-muted-foreground">Department: {selectedDepartment}</span>
                  </div>

                  <QueuePosition hospitalId={selectedHospital?.id} />

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
