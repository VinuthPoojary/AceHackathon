import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  List,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { addDoc, collection, query, where, onSnapshot, orderBy, getDocs } from "firebase/firestore";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  specialties: string[];
  rating: number;
  facilities: string[];
  emergencyAvailable: boolean;
  operatingHours: string;
  priceRange: string;
}

const HOSPITALS: Hospital[] = [
  {
    id: "h1",
    name: "Kasturba Medical College Hospital",
    address: "NH 66, Near Hiriadka, Udupi, Karnataka 576104",
    phone: "+91 820 292 2200",
    specialties: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "Dermatology", "Ophthalmology", "ENT", "General"],
    rating: 4.2,
    facilities: ["ICU", "NICU", "Ambulance", "Pharmacy", "Laboratory", "Radiology", "MRI", "CT Scan", "Dialysis"],
    emergencyAvailable: true,
    operatingHours: "24/7",
    priceRange: "₹500-2000"
  },
  {
    id: "h2",
    name: "Dr. TMA Pai Hospital",
    address: "Kunjibettu, Udupi, Karnataka 576102",
    phone: "+91 820 429 8000",
    specialties: ["Emergency", "Internal Medicine", "Surgery", "Gynecology", "Dermatology", "General"],
    rating: 4.0,
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray"],
    emergencyAvailable: true,
    operatingHours: "6:00 AM - 10:00 PM",
    priceRange: "₹300-1500"
  },
  {
    id: "h3",
    name: "Manipal Hospital Udupi",
    address: "Udupi-Hebri Road, Udupi, Karnataka 576101",
    phone: "+91 820 429 9000",
    specialties: ["Emergency", "Cardiology", "Orthopedics", "Pediatrics", "ENT", "Neurology"],
    rating: 4.3,
    facilities: ["ICU", "NICU", "Ambulance", "Pharmacy", "Laboratory", "MRI", "CT Scan"],
    emergencyAvailable: true,
    operatingHours: "24/7",
    priceRange: "₹800-2500"
  }
];

export const VirtualCheckIn = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(null);
  const [queueList, setQueueList] = useState<any[]>([]);
  const [showQueueList, setShowQueueList] = useState(false);

  useEffect(() => {
    if (selectedHospital) {
      fetchQueueData();
    }
  }, [selectedHospital]);

  const fetchQueueData = async () => {
    if (!selectedHospital) return;

    const q = query(
      collection(db, "checkins"),
      where("hospitalId", "==", selectedHospital.id),
      orderBy("checkInTime", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const checkins = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setQueueList(checkins);

      // Calculate position and wait time for current user
      if (currentUser) {
        const userCheckIn = checkins.find(checkin => checkin.patientId === currentUser.uid);
        if (userCheckIn) {
          const position = checkins.findIndex(checkin => checkin.patientId === currentUser.uid) + 1;
          setQueuePosition(position);
          // Estimate 15 minutes per patient
          setEstimatedWaitTime((position - 1) * 15);
        }
      }
    });

    return () => unsubscribe();
  };

  const handleCheckIn = async () => {
    if (!currentUser || !selectedHospital) {
      toast.error("Please select a hospital and ensure you're logged in.");
      return;
    }

    setIsCheckingIn(true);
    try {
      // Check if user is already in queue
      const existingCheckInQuery = query(
        collection(db, "checkins"),
        where("patientId", "==", currentUser.uid),
        where("hospitalId", "==", selectedHospital.id)
      );

      const existingCheckIns = await getDocs(existingCheckInQuery);
      if (!existingCheckIns.empty) {
        toast.error("You are already checked in at this hospital.");
        setIsCheckingIn(false);
        return;
      }

      const checkInData = {
        patientId: currentUser.uid,
        patientName: "Patient", // Could fetch from profile
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        checkInTime: new Date(),
        status: "waiting",
        estimatedWaitTime: 0 // Will be calculated after check-in
      };

      await addDoc(collection(db, "checkins"), checkInData);

      setCheckInSuccess(true);
      toast.success("Successfully checked in! Your position will be updated shortly.");
    } catch (error: any) {
      console.error("Error during check-in:", error);
      toast.error("Check-in failed. Please try again.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const toggleQueueList = () => {
    setShowQueueList(!showQueueList);
  };

  if (checkInSuccess && queuePosition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Check-in Successful!</h2>
            <p className="text-muted-foreground mb-6">
              You have been successfully checked in at {selectedHospital?.name}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card className="p-4">
                <CardContent className="p-0 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{queuePosition}</div>
                  <div className="text-sm text-muted-foreground">Your Position</div>
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardContent className="p-0 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{estimatedWaitTime} min</div>
                  <div className="text-sm text-muted-foreground">Estimated Wait Time</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Button onClick={toggleQueueList} variant="outline" className="w-full">
                <List className="w-4 h-4 mr-2" />
                {showQueueList ? "Hide" : "View"} Queue List
              </Button>

              {showQueueList && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Current Queue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {queueList.map((patient, index) => (
                        <div
                          key={patient.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            patient.patientId === currentUser?.uid
                              ? 'bg-blue-100 border border-blue-300'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant={patient.patientId === currentUser?.uid ? "default" : "secondary"}>
                              #{index + 1}
                            </Badge>
                            <span className="font-medium">
                              {patient.patientId === currentUser?.uid ? "You" : `Patient ${index + 1}`}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(patient.checkInTime.toDate()).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4">
                <Button onClick={() => navigate("/patient")} variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button onClick={() => setCheckInSuccess(false)} className="flex-1">
                  Check-in Again
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Virtual Check-in</h1>
          <p className="text-muted-foreground">
            Select your hospital and check-in to join the queue
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Hospital</CardTitle>
            <CardDescription>
              Choose the hospital where you have an appointment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Select
                value={selectedHospital?.id || ""}
                onValueChange={(value) => {
                  const hospital = HOSPITALS.find(h => h.id === value);
                  setSelectedHospital(hospital || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a hospital" />
                </SelectTrigger>
                <SelectContent>
                  {HOSPITALS.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{hospital.name}</div>
                          <div className="text-xs text-muted-foreground">{hospital.address}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedHospital && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{selectedHospital.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedHospital.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedHospital.operatingHours}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {queueList.length} in queue
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please ensure you have a confirmed appointment before checking in.
                Virtual check-in helps reduce your waiting time at the hospital.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleCheckIn}
              disabled={!selectedHospital || isCheckingIn}
              className="w-full"
              size="lg"
            >
              {isCheckingIn ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Checking In...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check In Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
