import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Star,
  Shield,
  FileText,
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Baby,
  Eye,
  Ear,
  Zap,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  CreditCard as PaymentIcon,
  Building2,
  GraduationCap,
  Languages
} from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, query, where, onSnapshot } from "firebase/firestore";

interface BookingData {
  hospital: any;
  department: string;
  doctor: string;
  appointmentType: string;
  preferredDate: Date;
  preferredTime: string;
  reason: string;
  urgency: string;
  insuranceClaim: boolean;
  notes: string;
  paymentMethod: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  availability: string[];
  consultationFee: number;
  nextAvailable: string;
  hospitalId: string;
  qualifications: string[];
  languages: string[];
}

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

const DEPARTMENTS = [
  { id: "emergency", name: "Emergency", icon: "🚨", color: "text-red-500", bgColor: "bg-red-50" },
  { id: "cardiology", name: "Cardiology", icon: "❤️", color: "text-red-500", bgColor: "bg-red-50" },
  { id: "neurology", name: "Neurology", icon: "🧠", color: "text-blue-500", bgColor: "bg-blue-50" },
  { id: "orthopedics", name: "Orthopedics", icon: "🦴", color: "text-green-500", bgColor: "bg-green-50" },
  { id: "pediatrics", name: "Pediatrics", icon: "👶", color: "text-pink-500", bgColor: "bg-pink-50" },
  { id: "gynecology", name: "Gynecology", icon: "👩", color: "text-purple-500", bgColor: "bg-purple-50" },
  { id: "dermatology", name: "Dermatology", icon: "🧴", color: "text-orange-500", bgColor: "bg-orange-50" },
  { id: "ophthalmology", name: "Ophthalmology", icon: "👁️", color: "text-indigo-500", bgColor: "bg-indigo-50" },
  { id: "ent", name: "ENT", icon: "👂", color: "text-teal-500", bgColor: "bg-teal-50" },
  { id: "general", name: "General Medicine", icon: "🩺", color: "text-gray-500", bgColor: "bg-gray-50" }
];

// Enhanced hospital data with more realistic information
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

// Enhanced doctor data with hospital associations
const DOCTORS: Record<string, Doctor[]> = {
  emergency: [
    { id: "dr1", name: "Dr. Rajesh Kumar", specialty: "Emergency Medicine", experience: "15 years", rating: 4.8, availability: ["24/7"], consultationFee: 800, nextAvailable: "Available now", hospitalId: "h1", qualifications: ["MD Emergency Medicine", "MBBS"], languages: ["English", "Hindi", "Kannada"] },
    { id: "dr2", name: "Dr. Priya Sharma", specialty: "Emergency Medicine", experience: "12 years", rating: 4.6, availability: ["24/7"], consultationFee: 750, nextAvailable: "Available now", hospitalId: "h3", qualifications: ["MD Emergency Medicine", "MBBS"], languages: ["English", "Hindi", "Tulu"] }
  ],
  cardiology: [
    { id: "dr3", name: "Dr. Amit Patel", specialty: "Cardiology", experience: "20 years", rating: 4.9, availability: ["Mon-Fri 9AM-5PM", "Sat 9AM-1PM"], consultationFee: 1500, nextAvailable: "Today 2:00 PM", hospitalId: "h1", qualifications: ["DM Cardiology", "MD Medicine", "MBBS"], languages: ["English", "Hindi", "Gujarati"] },
    { id: "dr4", name: "Dr. Sunita Reddy", specialty: "Cardiology", experience: "18 years", rating: 4.7, availability: ["Mon-Wed-Fri 10AM-4PM"], consultationFee: 1400, nextAvailable: "Tomorrow 10:00 AM", hospitalId: "h3", qualifications: ["DM Cardiology", "MD Medicine", "MBBS"], languages: ["English", "Telugu", "Kannada"] }
  ],
  neurology: [
    { id: "dr5", name: "Dr. Vikram Singh", specialty: "Neurology", experience: "22 years", rating: 4.8, availability: ["Tue-Thu-Sat 9AM-3PM"], consultationFee: 1800, nextAvailable: "Tuesday 9:00 AM", hospitalId: "h1", qualifications: ["DM Neurology", "MD Medicine", "MBBS"], languages: ["English", "Hindi", "Punjabi"] }
  ],
  orthopedics: [
    { id: "dr6", name: "Dr. Meera Joshi", specialty: "Orthopedics", experience: "16 years", rating: 4.6, availability: ["Mon-Fri 8AM-6PM"], consultationFee: 1200, nextAvailable: "Today 3:30 PM", hospitalId: "h2", qualifications: ["MS Orthopedics", "MBBS"], languages: ["English", "Hindi", "Marathi"] },
    { id: "dr7", name: "Dr. Ravi Kumar", specialty: "Orthopedics", experience: "14 years", rating: 4.7, availability: ["Mon-Sat 9AM-5PM"], consultationFee: 1100, nextAvailable: "Today 4:00 PM", hospitalId: "h3", qualifications: ["MS Orthopedics", "MBBS"], languages: ["English", "Hindi", "Tamil"] }
  ],
  pediatrics: [
    { id: "dr8", name: "Dr. Kavitha Nair", specialty: "Pediatrics", experience: "14 years", rating: 4.7, availability: ["Mon-Sat 9AM-5PM"], consultationFee: 900, nextAvailable: "Today 4:00 PM", hospitalId: "h1", qualifications: ["MD Pediatrics", "MBBS"], languages: ["English", "Malayalam", "Kannada"] }
  ],
  gynecology: [
    { id: "dr9", name: "Dr. Anjali Gupta", specialty: "Gynecology", experience: "16 years", rating: 4.5, availability: ["Mon-Fri 10AM-6PM"], consultationFee: 1000, nextAvailable: "Tomorrow 11:00 AM", hospitalId: "h2", qualifications: ["MS Obstetrics & Gynecology", "MBBS"], languages: ["English", "Hindi", "Kannada"] }
  ]
};

const APPOINTMENT_TYPES = [
  { id: "consultation", name: "Consultation", price: 0, description: "General consultation with doctor" },
  { id: "followup", name: "Follow-up", price: 200, description: "Follow-up appointment" },
  { id: "emergency", name: "Emergency", price: 500, description: "Urgent medical attention" },
  { id: "surgery", name: "Surgery Consultation", price: 300, description: "Pre-surgery consultation" },
  { id: "checkup", name: "Health Checkup", price: 150, description: "Routine health examination" }
];

const URGENCY_LEVELS = [
  { id: "low", name: "Low", description: "Can wait 1-2 days", color: "text-green-600" },
  { id: "medium", name: "Medium", description: "Can wait few hours", color: "text-yellow-600" },
  { id: "high", name: "High", description: "Needs attention today", color: "text-orange-600" },
  { id: "urgent", name: "Urgent", description: "Immediate attention required", color: "text-red-600" }
];

const PAYMENT_METHODS = [
  { id: "razorpay", name: "Razorpay", description: "Credit/Debit Card, UPI, Net Banking", icon: "💳" },
  { id: "upi", name: "UPI", description: "PhonePe, Google Pay, Paytm", icon: "📱" },
  { id: "netbanking", name: "Net Banking", description: "Direct bank transfer", icon: "🏦" },
  { id: "wallet", name: "Digital Wallet", description: "Paytm Wallet, Amazon Pay", icon: "💼" }
];

interface EnhancedBookingFlowProps {
  selectedHospital?: any;
  onBookingComplete: (booking: any) => void;
}

export const EnhancedBookingFlow = ({ selectedHospital, onBookingComplete }: EnhancedBookingFlowProps) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    hospital: selectedHospital || null,
    department: "",
    doctor: "",
    appointmentType: "",
    preferredDate: new Date(),
    preferredTime: "",
    reason: "",
    urgency: "",
    insuranceClaim: false,
    notes: "",
    paymentMethod: ""
  });
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // New state to store patients in queue count per department
  const [patientsInQueueCount, setPatientsInQueueCount] = useState<Record<string, number>>({});

  useEffect(() => {
    if (currentUser) {
      fetchPatientProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    if (bookingData.hospital && bookingData.department) {
      // Filter doctors by hospital and department
      const hospitalDoctors = DOCTORS[bookingData.department] || [];
      const filteredDoctors = hospitalDoctors.filter(doctor =>
        doctor.hospitalId === bookingData.hospital.id
      );
      setAvailableDoctors(filteredDoctors);
      setSelectedDoctor(null);
    }
  }, [bookingData.hospital, bookingData.department]);

  // useEffect to listen to checkins collection and update patients in queue count
  useEffect(() => {
    if (!bookingData.hospital) return;

    const q = query(
      collection(db, "checkins"),
      where("hospitalId", "==", bookingData.hospital.id)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const counts: Record<string, number> = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const department = data.department;
        counts[department] = (counts[department] || 0) + 1;
      });
      setPatientsInQueueCount(counts);
    });

    return () => unsubscribe();
  }, [bookingData.hospital]);

  const fetchPatientProfile = async () => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "patients", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPatientProfile(docSnap.data());
      }
    } catch (error) {
      console.error("Error fetching patient profile:", error);
    }
  };

  const updateBookingData = (field: keyof BookingData, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalPrice = () => {
    const appointmentPrice = APPOINTMENT_TYPES.find(t => t.id === bookingData.appointmentType)?.price || 0;
    const doctorPrice = selectedDoctor?.consultationFee || 0;
    return appointmentPrice + doctorPrice;
  };

  const processPayment = async () => {
    setPaymentProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, you would integrate with Razorpay or other payment gateway
    const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo
    
    setPaymentProcessing(false);
    return paymentSuccess;
  };

  const handleBooking = async () => {
    if (!currentUser || !selectedDoctor || !bookingData.hospital) {
      alert("Please log in to book an appointment.");
      return;
    }

    setIsBooking(true);
    try {
      // Process payment first
      const paymentSuccess = await processPayment();
      
      if (!paymentSuccess) {
        alert("Payment failed. Please try again.");
        setIsBooking(false);
        return;
      }

      const booking = {
        patientId: currentUser.uid,
        patientName: patientProfile?.fullName || "Unknown",
        patientEmail: currentUser.email,
        patientPhone: patientProfile?.phone || "",
        hospital: bookingData.hospital,
        doctor: selectedDoctor,
        department: bookingData.department,
        appointmentType: bookingData.appointmentType,
        preferredDate: bookingData.preferredDate,
        preferredTime: bookingData.preferredTime,
        reason: bookingData.reason,
        urgency: bookingData.urgency,
        insuranceClaim: bookingData.insuranceClaim,
        notes: bookingData.notes,
        totalPrice: calculateTotalPrice(),
        paymentMethod: bookingData.paymentMethod,
        status: "confirmed",
        bookingDate: new Date(),
        bookingId: `BOOK${Date.now()}`,
        paymentStatus: "completed"
      };

      // Save booking to Firestore
      const bookingRef = await addDoc(collection(db, "bookings"), booking);
      
      setBookingSuccess(true);
      onBookingComplete({ ...booking, id: bookingRef.id });
    } catch (error: any) {
      console.error("Error creating booking:", error);
      
      // Provide more specific error messages
      let errorMessage = "Booking failed. Please try again.";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please make sure you're logged in and try again.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Service temporarily unavailable. Please try again in a moment.";
      } else if (error.code === 'unauthenticated') {
        errorMessage = "Please log in to book an appointment.";
      }
      
      alert(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getDepartmentIcon = (departmentId: string) => {
    const dept = DEPARTMENTS.find(d => d.id === departmentId);
    return dept?.icon || "🩺";
  };

  const getDepartmentColor = (departmentId: string) => {
    const dept = DEPARTMENTS.find(d => d.id === departmentId);
    return dept?.color || "text-gray-500";
  };

  if (bookingSuccess) {
    return (
      <Card className="text-center p-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground mb-4">
          Your appointment has been successfully booked and payment processed.
        </p>
        <div className="bg-muted p-4 rounded-lg mb-4">
          <p><strong>Booking ID:</strong> BOOK{Date.now()}</p>
          <p><strong>Hospital:</strong> {bookingData.hospital?.name}</p>
          <p><strong>Doctor:</strong> {selectedDoctor?.name}</p>
          <p><strong>Date:</strong> {bookingData.preferredDate.toLocaleDateString()}</p>
          <p><strong>Time:</strong> {bookingData.preferredTime}</p>
          <p><strong>Total Paid:</strong> ₹{calculateTotalPrice()}</p>
        </div>
        <Button onClick={() => setBookingSuccess(false)}>
          Book Another Appointment
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 animate-slide-in-right">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {step}
            </div>
            {step < 5 && (
              <div className={`w-16 h-1 mx-2 ${
                currentStep > step ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Hospital Selection */}
      {currentStep === 1 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Select Hospital</CardTitle>
            <CardDescription>Choose the hospital where you want to book your appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {HOSPITALS.map((hospital) => (
                <Card
                  key={hospital.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    bookingData.hospital?.id === hospital.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => updateBookingData('hospital', hospital)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{hospital.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {hospital.address}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="w-4 h-4" />
                          {hospital.phone}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {hospital.specialties.slice(0, 4).map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {hospital.specialties.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{hospital.specialties.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{hospital.rating}</span>
                        </div>
                        <p className="text-sm text-green-600 font-medium">{hospital.priceRange}</p>
                        <p className="text-xs text-muted-foreground">{hospital.operatingHours}</p>
                        {hospital.emergencyAvailable && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            <Heart className="w-3 h-3 mr-1" />
                            Emergency
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button 
                onClick={nextStep}
                disabled={!bookingData.hospital}
              >
                Next Step
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Department Selection */}
      {currentStep === 2 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Select Department</CardTitle>
            <CardDescription>Choose the department you need to visit at {bookingData.hospital?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {DEPARTMENTS.filter(dept => 
                bookingData.hospital?.specialties.includes(dept.name)
              ).map((department) => (
                <Card
                  key={department.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    bookingData.department === department.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => updateBookingData('department', department.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl ${department.color}`}>
                        {department.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{department.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {DOCTORS[department.id]?.filter(d => d.hospitalId === bookingData.hospital?.id).length || 0} doctors available
                        </p>
                        <p className="text-sm text-orange-600 font-medium">
                          {patientsInQueueCount[department.id] || 0} patients in queue
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!bookingData.department}
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Doctor Selection */}
      {currentStep === 3 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Select Doctor</CardTitle>
            <CardDescription>Choose your preferred doctor from {DEPARTMENTS.find(d => d.id === bookingData.department)?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableDoctors.length > 0 ? (
                availableDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedDoctor?.id === doctor.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{doctor.name}</h3>
                            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                            <p className="text-sm text-muted-foreground">{doctor.experience}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {doctor.qualifications.slice(0, 2).map((qual, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {qual}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-1 mt-1">
                              {doctor.languages.slice(0, 2).map((lang, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{doctor.rating}</span>
                          </div>
                          <p className="text-lg font-bold text-green-600">₹{doctor.consultationFee}</p>
                          <p className="text-xs text-muted-foreground">{doctor.nextAvailable}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex flex-wrap gap-1">
                          {doctor.availability.map((time, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No doctors available</h3>
                  <p className="text-muted-foreground">No doctors found for this department at the selected hospital</p>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!selectedDoctor}
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Appointment Details */}
      {currentStep === 4 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>Provide additional information for your appointment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointmentType">Appointment Type</Label>
                <Select
                  value={bookingData.appointmentType}
                  onValueChange={(value) => updateBookingData('appointmentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{type.name}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ₹{type.price}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select
                  value={bookingData.urgency}
                  onValueChange={(value) => updateBookingData('urgency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        <div>
                          <div className={level.color}>{level.name}</div>
                          <div className="text-xs text-muted-foreground">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Calendar
                  mode="single"
                  selected={bookingData.preferredDate}
                  onSelect={(date) => date && updateBookingData('preferredDate', date)}
                  disabled={(date) => date < new Date()}
                />
              </div>
              <div>
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Select
                  value={bookingData.preferredTime}
                  onValueChange={(value) => updateBookingData('preferredTime', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                    <SelectItem value="17:00">5:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                placeholder="Describe your symptoms or reason for the appointment..."
                value={bookingData.reason}
                onChange={(e) => updateBookingData('reason', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information for the doctor..."
                value={bookingData.notes}
                onChange={(e) => updateBookingData('notes', e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="insuranceClaim"
                checked={bookingData.insuranceClaim}
                onChange={(e) => updateBookingData('insuranceClaim', e.target.checked)}
              />
              <Label htmlFor="insuranceClaim">Insurance claim available</Label>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button onClick={nextStep}>
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Payment & Review */}
      {currentStep === 5 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Payment & Review</CardTitle>
            <CardDescription>Review your booking details and complete payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h3 className="font-medium">Booking Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Hospital:</strong> {bookingData.hospital?.name}</p>
                  <p><strong>Department:</strong> {DEPARTMENTS.find(d => d.id === bookingData.department)?.name}</p>
                  <p><strong>Doctor:</strong> {selectedDoctor?.name}</p>
                  <p><strong>Specialty:</strong> {selectedDoctor?.specialty}</p>
                </div>
                <div>
                  <p><strong>Date:</strong> {bookingData.preferredDate.toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {bookingData.preferredTime}</p>
                  <p><strong>Type:</strong> {APPOINTMENT_TYPES.find(t => t.id === bookingData.appointmentType)?.name}</p>
                  <p><strong>Urgency:</strong> {URGENCY_LEVELS.find(u => u.id === bookingData.urgency)?.name}</p>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <div className="grid md:grid-cols-2 gap-3 mt-2">
                {PAYMENT_METHODS.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      bookingData.paymentMethod === method.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => updateBookingData('paymentMethod', method.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <h4 className="font-medium">{method.name}</h4>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-3">Pricing Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Consultation Fee:</span>
                  <span>₹{selectedDoctor?.consultationFee || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Appointment Type:</span>
                  <span>₹{APPOINTMENT_TYPES.find(t => t.id === bookingData.appointmentType)?.price || 0}</span>
                </div>
                {bookingData.insuranceClaim && (
                  <div className="flex justify-between text-green-600">
                    <span>Insurance Coverage:</span>
                    <span>-₹{Math.round(calculateTotalPrice() * 0.8)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>₹{bookingData.insuranceClaim ? Math.round(calculateTotalPrice() * 0.2) : calculateTotalPrice()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={handleBooking}
                disabled={isBooking || paymentProcessing || !bookingData.paymentMethod}
                className="bg-green-600 hover:bg-green-700"
              >
                {paymentProcessing ? (
                  <>
                    <PaymentIcon className="w-4 h-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : isBooking ? (
                  "Creating Booking..."
                ) : (
                  <>
                    <PaymentIcon className="w-4 h-4 mr-2" />
                    Pay ₹{bookingData.insuranceClaim ? Math.round(calculateTotalPrice() * 0.2) : calculateTotalPrice()} & Book
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
