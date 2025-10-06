import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/sonner";
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
  Languages,
  Settings,
  FastForward
} from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { ALL_HOSPITALS, type Hospital } from "@/data/hospitals";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, query, where, onSnapshot, getDocs, updateDoc } from "firebase/firestore";
import { addToQueue, generateQueueNumber } from "@/lib/queueService";
import { isDoctorAvailableOnDate, formatAvailabilityStatus, isDoctorAvailableNow, isDoctorAvailableRightNow, getNextAvailableDate, getAvailableTimeSlots, isBookingAllowed, getMinimumBookingDate } from "@/lib/doctorAvailability";

interface BookingData {
  hospitalname: any;
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
  id?: string;
  name: string;
  specialization: string;
  experience: number;
  availableDays: string[];
  availableTime: string;
  consultationFee: number;
  hospitalId: string;
  hospitalName: string;
  qualification: string;
  status: string;
  holidays?: string[]; // Array of dates in YYYY-MM-DD format
  createdAt?: any; // Firestore timestamp
  // Optional fields for backward compatibility
  rating?: number;
  nextAvailable?: string;
  qualifications?: string[];
  languages?: string[];
}

// Using the Hospital interface from hospitals.ts

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

// Using the comprehensive hospital data from hospitals.ts
const HOSPITALS: Hospital[] = ALL_HOSPITALS;

// Enhanced doctor data with hospital associations (fallback data)
const DOCTORS: Record<string, Doctor[]> = {
  emergency: [
    { id: "dr1", name: "Dr. Rajesh Kumar", specialization: "Emergency Medicine", experience: 15, rating: 4.8, availableTime: "24/7", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], consultationFee: 800, nextAvailable: "Available now", hospitalId: "UDP001", hospitalName: "Kasturba Medical College Hospital", qualification: "MD Emergency Medicine", status: "active", qualifications: ["MD Emergency Medicine", "MBBS"], languages: ["English", "Hindi", "Kannada"] },
    { id: "dr2", name: "Dr. Priya Sharma", specialization: "Emergency Medicine", experience: 12, rating: 4.6, availableTime: "24/7", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], consultationFee: 750, nextAvailable: "Available now", hospitalId: "UDP003", hospitalName: "Manipal Hospital Udupi", qualification: "MD Emergency Medicine", status: "active", qualifications: ["MD Emergency Medicine", "MBBS"], languages: ["English", "Hindi", "Tulu"] },
    { id: "dr10", name: "Dr. Suresh Bhat", specialization: "Emergency Medicine", experience: 10, rating: 4.4, availableTime: "24/7", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], consultationFee: 600, nextAvailable: "Available now", hospitalId: "UDP004", hospitalName: "Baliga Memorial Hospital", qualification: "MD Emergency Medicine", status: "active", qualifications: ["MD Emergency Medicine", "MBBS"], languages: ["English", "Hindi", "Kannada"] },
    { id: "dr11", name: "Dr. Lakshmi Rao", specialization: "Emergency Medicine", experience: 13, rating: 4.5, availableTime: "24/7", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], consultationFee: 700, nextAvailable: "Available now", hospitalId: "UDP005", hospitalName: "Adarsha Hospital", qualification: "MD Emergency Medicine", status: "active", qualifications: ["MD Emergency Medicine", "MBBS"], languages: ["English", "Hindi", "Tulu"] }
  ],
  cardiology: [
    { id: "dr3", name: "Dr. Amit Patel", specialization: "Cardiology", experience: 20, rating: 4.9, availableTime: "9AM-5PM", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], consultationFee: 1500, nextAvailable: "Today 2:00 PM", hospitalId: "UDP001", hospitalName: "Kasturba Medical College Hospital", qualification: "DM Cardiology", status: "active", qualifications: ["DM Cardiology", "MD Medicine", "MBBS"], languages: ["English", "Hindi", "Gujarati"] },
    { id: "dr4", name: "Dr. Sunita Reddy", specialization: "Cardiology", experience: 18, rating: 4.7, availableTime: "10AM-4PM", availableDays: ["Monday", "Wednesday", "Friday"], consultationFee: 1400, nextAvailable: "Tomorrow 10:00 AM", hospitalId: "UDP003", hospitalName: "Manipal Hospital Udupi", qualification: "DM Cardiology", status: "active", qualifications: ["DM Cardiology", "MD Medicine", "MBBS"], languages: ["English", "Telugu", "Kannada"] },
    { id: "dr12", name: "Dr. Venkatesh Iyer", specialization: "Cardiology", experience: 16, rating: 4.6, availableTime: "9AM-5PM", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], consultationFee: 1200, nextAvailable: "Tomorrow 2:00 PM", hospitalId: "UDP005", hospitalName: "Adarsha Hospital", qualification: "DM Cardiology", status: "active", qualifications: ["DM Cardiology", "MD Medicine", "MBBS"], languages: ["English", "Hindi", "Tamil"] }
  ],
  neurology: [
    { id: "dr5", name: "Dr. Vikram Singh", specialization: "Neurology", experience: 22, rating: 4.8, availableTime: "9AM-3PM", availableDays: ["Tuesday", "Thursday", "Saturday"], consultationFee: 1800, nextAvailable: "Tuesday 9:00 AM", hospitalId: "UDP001", hospitalName: "Kasturba Medical College Hospital", qualification: "DM Neurology", status: "active", qualifications: ["DM Neurology", "MD Medicine", "MBBS"], languages: ["English", "Hindi", "Punjabi"] },
    { id: "dr13", name: "Dr. Nandini Shetty", specialization: "Neurology", experience: 15, rating: 4.5, availableTime: "10AM-4PM", availableDays: ["Monday", "Wednesday", "Friday"], consultationFee: 1600, nextAvailable: "Tomorrow 10:00 AM", hospitalId: "UDP005", hospitalName: "Adarsha Hospital", qualification: "DM Neurology", status: "active", qualifications: ["DM Neurology", "MD Medicine", "MBBS"], languages: ["English", "Hindi", "Kannada"] }
  ],
  orthopedics: [
    { id: "dr6", name: "Dr. Meera Joshi", specialization: "Orthopedics", experience: 16, rating: 4.6, availableTime: "8AM-6PM", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], consultationFee: 1200, nextAvailable: "Today 3:30 PM", hospitalId: "UDP002", hospitalName: "Dr. TMA Pai Hospital", qualification: "MS Orthopedics", status: "active", qualifications: ["MS Orthopedics", "MBBS"], languages: ["English", "Hindi", "Marathi"] },
    { id: "dr7", name: "Dr. Ravi Kumar", specialization: "Orthopedics", experience: 14, rating: 4.7, availableTime: "9AM-5PM", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], consultationFee: 1100, nextAvailable: "Today 4:00 PM", hospitalId: "UDP003", hospitalName: "Manipal Hospital Udupi", qualification: "MS Orthopedics", status: "active", qualifications: ["MS Orthopedics", "MBBS"], languages: ["English", "Hindi", "Tamil"] },
    { id: "dr14", name: "Dr. Ashok Kumar", specialization: "Orthopedics", experience: 18, rating: 4.4, availableTime: "9AM-5PM", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], consultationFee: 1000, nextAvailable: "Tomorrow 11:00 AM", hospitalId: "UDP005", hospitalName: "Adarsha Hospital", qualification: "MS Orthopedics", status: "active", qualifications: ["MS Orthopedics", "MBBS"], languages: ["English", "Hindi", "Kannada"] }
  ],
  pediatrics: [
    { id: "dr8", name: "Dr. Kavitha Nair", specialization: "Pediatrics", experience: 14, rating: 4.7, availableTime: "9AM-5PM", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], consultationFee: 900, nextAvailable: "Today 4:00 PM", hospitalId: "UDP001", hospitalName: "Kasturba Medical College Hospital", qualification: "MD Pediatrics", status: "active", qualifications: ["MD Pediatrics", "MBBS"], languages: ["English", "Malayalam", "Kannada"] },
    { id: "dr15", name: "Dr. Radha Menon", specialization: "Pediatrics", experience: 12, rating: 4.6, availableTime: "9AM-5PM", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], consultationFee: 800, nextAvailable: "Tomorrow 2:00 PM", hospitalId: "UDP004", hospitalName: "Baliga Memorial Hospital", qualification: "MD Pediatrics", status: "active", qualifications: ["MD Pediatrics", "MBBS"], languages: ["English", "Malayalam", "Kannada"] }
  ],
  gynecology: [
    { id: "dr9", name: "Dr. Anjali Gupta", specialization: "Gynecology", experience: 16, rating: 4.5, availableTime: "10AM-6PM", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], consultationFee: 1000, nextAvailable: "Tomorrow 11:00 AM", hospitalId: "UDP002", hospitalName: "Dr. TMA Pai Hospital", qualification: "MS Obstetrics & Gynecology", status: "active", qualifications: ["MS Obstetrics & Gynecology", "MBBS"], languages: ["English", "Hindi", "Kannada"] },
    { id: "dr16", name: "Dr. Shobha Reddy", specialization: "Gynecology", experience: 14, rating: 4.4, availableTime: "9AM-5PM", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], consultationFee: 900, nextAvailable: "Today 3:00 PM", hospitalId: "UDP004", hospitalName: "Baliga Memorial Hospital", qualification: "MS Obstetrics & Gynecology", status: "active", qualifications: ["MS Obstetrics & Gynecology", "MBBS"], languages: ["English", "Hindi", "Telugu"] }
  ],
  "general medicine": [
    { id: "dr17", name: "Dr. Ramesh Shetty", specialization: "General Medicine", experience: 20, rating: 4.6, availableTime: "9AM-6PM", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], consultationFee: 700, nextAvailable: "Today 2:00 PM", hospitalId: "UDP002", hospitalName: "Dr. TMA Pai Hospital", qualification: "MD Medicine", status: "active", qualifications: ["MD Medicine", "MBBS"], languages: ["English", "Hindi", "Kannada"] },
    { id: "dr18", name: "Dr. Geetha Prasad", specialization: "General Medicine", experience: 18, rating: 4.5, availableTime: "8AM-5PM", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], consultationFee: 600, nextAvailable: "Tomorrow 9:00 AM", hospitalId: "UDP004", hospitalName: "Baliga Memorial Hospital", qualification: "MD Medicine", status: "active", qualifications: ["MD Medicine", "MBBS"], languages: ["English", "Hindi", "Tulu"] },
    { id: "dr19", name: "Dr. Manjunath Rao", specialization: "General Medicine", experience: 15, rating: 4.4, availableTime: "10AM-6PM", availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], consultationFee: 650, nextAvailable: "Today 4:00 PM", hospitalId: "UDP005", hospitalName: "Adarsha Hospital", qualification: "MD Medicine", status: "active", qualifications: ["MD Medicine", "MBBS"], languages: ["English", "Hindi", "Kannada"] }
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
  onHospitalSelect?: (hospital: any) => void;
}

export const EnhancedBookingFlow = ({ selectedHospital, onBookingComplete, onHospitalSelect }: EnhancedBookingFlowProps) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    hospitalname: selectedHospital || null,
    department: "",
    doctor: "",
    appointmentType: "",
    preferredDate: new Date("2025-11-01"), // Set default date to November 1, 2025
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
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string>("");
  const [queueNumber, setQueueNumber] = useState<number | null>(null);

  // New state to store patients in queue count per department
  const [patientsInQueueCount, setPatientsInQueueCount] = useState<Record<string, number>>({});
  
  // State to control auto-advance behavior
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  // Debug logging
  console.log("EnhancedBookingFlow rendered with:", { selectedHospital, currentStep, bookingData: bookingData.hospitalname });

  useEffect(() => {
    if (currentUser) {
      fetchPatientProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    if (bookingData.hospitalname && bookingData.department) {
      setLoadingDoctors(true);
      setDoctorsError(null);
      setSelectedDoctor(null);
      
      // Fetch doctors from Firestore
      fetchDoctorsFromFirestore(bookingData.hospitalname.id, bookingData.department)
        .then((doctors) => {
          setAvailableDoctors(doctors);
          setLoadingDoctors(false);
          
          if (doctors.length === 0) {
            setDoctorsError("No doctors found for this department. Please try a different department or hospital.");
          }
        })
        .catch((error) => {
          console.error("Error loading doctors:", error);
          setLoadingDoctors(false);
          setDoctorsError("Failed to load doctors. Using fallback data.");
          
          // Fallback to hardcoded data if Firestore fails
          const hospitalDoctors = DOCTORS[bookingData.department] || [];
          const filteredDoctors = hospitalDoctors.filter(doctor =>
            doctor.hospitalId === bookingData.hospitalname.id
          );
          setAvailableDoctors(filteredDoctors);
        });
    } else {
      setAvailableDoctors([]);
      setSelectedDoctor(null);
      setLoadingDoctors(false);
      setDoctorsError(null);
    }
  }, [bookingData.hospitalname, bookingData.department]);

  // Update booking data when selectedHospital prop changes
  useEffect(() => {
    if (selectedHospital && selectedHospital !== bookingData.hospitalname) {
      setBookingData(prev => ({ ...prev, hospitalname: selectedHospital }));
    }
  }, [selectedHospital]);

  // useEffect to listen to checkins collection and update patients in queue count
  useEffect(() => {
    if (!bookingData.hospitalname) return;

    const q = query(
      collection(db, "checkins"),
      where("hospitalId", "==", bookingData.hospitalname.id)
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
  }, [bookingData.hospitalname]);

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

  const fetchDoctorsFromFirestore = async (hospitalId: string, department: string) => {
    try {
      // Map department ID to specialization name for querying
      const specializationMap: Record<string, string> = {
        "emergency": "Emergency",
        "cardiology": "Cardiology", 
        "neurology": "Neurology",
        "orthopedics": "Orthopedics",
        "pediatrics": "Pediatrics",
        "gynecology": "Gynecology",
        "dermatology": "Dermatology",
        "ophthalmology": "Ophthalmology",
        "ent": "ENT",
        "general": "General Medicine"
      };

      const specialization = specializationMap[department] || department;
      
      console.log("Fetching doctors for:", { hospitalId, department, specialization });
      
      // Query doctors from Firestore based on hospitalId and specialization
      const q = query(
        collection(db, "doctors"),
        where("hospitalId", "==", hospitalId),
        where("specialization", "==", specialization),
        where("status", "==", "active")
      );
      
      const querySnapshot = await getDocs(q);
      const doctors: Doctor[] = [];
      
      console.log("Found doctors:", querySnapshot.size);
      
      querySnapshot.forEach((doc) => {
        const doctorData = doc.data();
        console.log("Processing doctor:", doctorData);
        
        doctors.push({
          id: doc.id,
          name: doctorData.name || "Unknown Doctor",
          specialization: doctorData.specialization || specialization,
          experience: doctorData.experience || 0,
          availableDays: doctorData.availableDays || [],
          availableTime: doctorData.availableTime || "Not specified",
          consultationFee: doctorData.consultationFee || 0,
          hospitalId: doctorData.hospitalId || hospitalId,
          hospitalName: doctorData.hospitalName || "Unknown Hospital",
          qualification: doctorData.qualification || "Not specified",
          status: doctorData.status || "active",
          holidays: doctorData.holidays || [],
          createdAt: doctorData.createdAt,
          // Add default values for backward compatibility
          rating: doctorData.rating || 4.5,
          nextAvailable: doctorData.nextAvailable || "Available",
          qualifications: doctorData.qualifications || [doctorData.qualification || "Not specified"],
          languages: doctorData.languages || ["English", "Hindi"]
        } as Doctor);
      });
      
      console.log("Processed doctors:", doctors);
      return doctors;
    } catch (error) {
      console.error("Error fetching doctors from Firestore:", error);
      return [];
    }
  };

  const updateBookingData = (field: keyof BookingData, value: any, autoAdvance: boolean = true) => {
    setBookingData(prev => {
      const updated = { ...prev, [field]: value };
      
      // If appointment type changes, reset preferred date to meet new requirements
      if (field === 'appointmentType') {
        const minDate = getMinimumBookingDate(value || '');
        if (updated.preferredDate < minDate) {
          updated.preferredDate = minDate;
        }
      }
      
      return updated;
    });
    
    // If hospitalname is being selected, also update parent component
    if (field === 'hospitalname' && onHospitalSelect) {
      onHospitalSelect(value);
    }

    // Auto-advance to next step based on the field being updated
    if (autoAdvance && autoAdvanceEnabled) {
      setIsAutoAdvancing(true);
      setTimeout(() => {
        switch (field) {
          case 'hospitalname':
            if (value && currentStep === 1) {
              nextStep();
            }
            break;
          case 'department':
            if (value && currentStep === 2) {
              nextStep();
            }
            break;
          case 'appointmentType':
          case 'urgency':
          case 'preferredTime':
            // For step 4, advance when appointment type, urgency, and time are selected
            if (currentStep === 4) {
              const newData = { ...bookingData, [field]: value };
              if (newData.appointmentType && newData.urgency && newData.preferredTime && selectedDoctor) {
                nextStep();
              }
            }
            break;
          case 'paymentMethod':
            if (value && currentStep === 5) {
              // Don't auto-advance on payment method selection, let user review
            }
            break;
        }
        setIsAutoAdvancing(false);
      }, 500); // Small delay to allow UI to update
    }
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
    if (!currentUser || !selectedDoctor || !bookingData.hospitalname) {
      toast.error("Please log in to book an appointment.");
      return;
    }

    // Validate doctor availability before booking
    if (!isDoctorAvailableNow(selectedDoctor)) {
      toast.error("Selected doctor is not available for booking. Please select another doctor.");
      return;
    }

    // Check if the selected date is available for the doctor
    if (!isDoctorAvailableOnDate(selectedDoctor, bookingData.preferredDate)) {
      toast.error("Doctor is not available on the selected date. Please choose a different date.");
      return;
    }

    // Check booking time restrictions
    const bookingCheck = isBookingAllowed(bookingData.preferredDate, bookingData.appointmentType);
    if (!bookingCheck.allowed) {
      toast.error(bookingCheck.reason || "Booking not allowed for selected date and appointment type.");
      return;
    }

    setIsBooking(true);
    try {
      // Process payment first
      const paymentSuccess = await processPayment();
      
      if (!paymentSuccess) {
        toast.error("Payment failed. Please try again.");
        setIsBooking(false);
        return;
      }

      // Generate booking ID first
      const generatedBookingId = `BOOK${Date.now()}`;
      setBookingId(generatedBookingId);
      console.log("Generated booking ID:", generatedBookingId);

      const booking = {
        patientId: currentUser.uid,
        patientName: patientProfile?.fullName || "Unknown",
        patientEmail: currentUser.email,
        patientPhone: patientProfile?.phone || "",
        hospitalname: bookingData.hospitalname,
        hospitalId: bookingData.hospitalname.id, // Add hospitalId for hospital dashboard query
        hospitalName: bookingData.hospitalname.hospitalName || bookingData.hospitalname.name,
        doctor: selectedDoctor,
        doctorName: selectedDoctor?.name || "",
        doctorId: selectedDoctor?.id || "",
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
        bookingId: generatedBookingId,
        paymentStatus: "completed"
      };
      
      // Save booking to Firestore
      const bookingRef = await addDoc(collection(db, "bookings"), booking);
      
      // Add to queue system
      try {
        const generatedQueueNumber = await generateQueueNumber(bookingData.hospitalname.id, bookingData.department);
        setQueueNumber(generatedQueueNumber);
        
        const queueId = await addToQueue({
          patientId: currentUser.uid,
          patientName: patientProfile?.fullName || "Unknown",
          hospitalId: bookingData.hospitalname.id,
          hospitalName: bookingData.hospitalname.hospitalName,
          department: departmentName,
          doctorId: selectedDoctor?.id,
          doctorName: selectedDoctor?.name,
          appointmentType: bookingData.appointmentType,
          priority: bookingData.urgency === 'urgent' ? 'urgent' :
                   bookingData.urgency === 'high' ? 'high' : 'normal',
          bookingId: generatedBookingId,
          estimatedWaitTime: 20 + (generatedQueueNumber - 1) * 5 // Simple estimation based on queue position
        });
        
        // Update booking with queue information
        await updateDoc(bookingRef, {
          queueId,
          queueNumber: generatedQueueNumber,
          estimatedWaitTime: 20 + (generatedQueueNumber - 1) * 5,
          urgency: bookingData.urgency,
          priority: bookingData.urgency === 'urgent' ? 'urgent' : 
                   bookingData.urgency === 'high' ? 'high' : 'normal'
        });
        
        toast.success(`Booking confirmed! Your queue number is ${generatedQueueNumber}. Please arrive 15 minutes before your appointment.`);
      } catch (queueError) {
        console.error("Error adding to queue:", queueError);
        // Still proceed with booking even if queue fails
        toast.success("Booking confirmed! Queue system temporarily unavailable.");
      }
      
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
      
      toast.error(errorMessage);
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

  // Booking Success Popup Modal
  if (bookingSuccess) {
    console.log("Popup rendering with booking ID:", bookingId);
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        onClick={() => setBookingSuccess(false)}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-fade-in-up border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Success Icon */}
          <div className="text-center pt-8 pb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 text-sm">
              Your appointment has been successfully booked and payment processed.
            </p>
          </div>

          {/* Booking Details */}
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-mono font-medium text-gray-800">{bookingId || "Loading..."}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hospital:</span>
                  <span className="font-medium text-gray-800">{bookingData.hospitalname?.hospitalName || bookingData.hospitalname?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium text-gray-800">{selectedDoctor?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-800">{bookingData.preferredDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-800">{bookingData.preferredTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Queue Number:</span>
                  <span className="font-bold text-blue-600 text-lg">#{queueNumber || 'TBD'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-600 font-medium">Total Paid:</span>
                  <span className="font-bold text-green-600 text-lg">₹{calculateTotalPrice()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setBookingSuccess(false);
                  // Refresh the page to start fresh
                  window.location.reload();
                }} 
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                <span className="mr-2">📅</span>
                Book Another Appointment
              </Button>
              <Button 
                onClick={() => {
                  setBookingSuccess(false);
                  // Refresh the page to start fresh
                  window.location.reload();
                }}
                variant="outline" 
                className="flex-1 border-gray-300 hover:bg-gray-50 font-medium py-3 rounded-lg transition-all duration-200"
              >
                <span className="mr-2">✕</span>
                Close
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="bg-blue-50 px-6 py-3 rounded-b-xl">
            <p className="text-xs text-blue-700 text-center">
              💡 Please arrive 15 minutes before your appointment time. You'll receive a confirmation email shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* Progress Steps and Auto-Advance Toggle */}
      <div className="flex items-center justify-between mb-8 animate-slide-in-right">
        <div className="flex items-center">
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
        
        {/* Auto-Advance Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 cursor-help">
                <FastForward className={`w-4 h-4 ${autoAdvanceEnabled ? 'text-primary' : 'text-gray-600'} ${isAutoAdvancing ? 'animate-pulse' : ''}`} />
                <Label htmlFor="auto-advance" className="text-sm font-medium text-gray-700">
                  Auto-advance
                </Label>
                <Switch
                  id="auto-advance"
                  checked={autoAdvanceEnabled}
                  onCheckedChange={setAutoAdvanceEnabled}
                  className="data-[state=checked]:bg-primary"
                />
                {isAutoAdvancing && (
                  <div className="flex items-center gap-1 text-xs text-primary animate-pulse">
                    <FastForward className="w-3 h-3" />
                    <span>Advancing...</span>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                When enabled, automatically advances to the next step when you make a selection.<br/>
                Disable to manually control each step.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Step 1: Hospitalname Selection */}
      {currentStep === 1 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Select Hospital
              {autoAdvanceEnabled && (
                <Badge variant="outline" className="text-xs">
                  <FastForward className="w-3 h-3 mr-1" />
                  Auto-advance
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Choose the hospital where you want to book your appointment
              {autoAdvanceEnabled && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 Selecting a hospital will automatically advance to the next step
                </div>
              )}
              {bookingData.hospitalname && (
                <div className="mt-2 p-2 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium">Selected: {bookingData.hospitalname.hospitalName || bookingData.hospitalname.name}</p>
                  <p className="text-xs text-muted-foreground">{bookingData.hospitalname.address}</p>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {HOSPITALS.map((hospital) => (
                <Card
                  key={hospital.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    bookingData.hospitalname?.id === hospital.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => updateBookingData('hospitalname', hospital)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{hospital.hospitalName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {hospital.address}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="w-4 h-4" />
                          {hospital.contactNo}
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
                disabled={!bookingData.hospitalname}
                className={!autoAdvanceEnabled ? "bg-primary hover:bg-primary/90" : ""}
              >
                Next Step
                {!autoAdvanceEnabled && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
            {bookingData.hospitalname && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Selected Hospital:</strong> {bookingData.hospitalname.hospitalName || bookingData.hospitalname.name}
                </p>
                <p className="text-xs text-green-600">{bookingData.hospitalname.address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Department Selection */}
      {currentStep === 2 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Select Department
              {autoAdvanceEnabled && (
                <Badge variant="outline" className="text-xs">
                  <FastForward className="w-3 h-3 mr-1" />
                  Auto-advance
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Choose the department you need to visit at {bookingData.hospitalname?.hospitalName || bookingData.hospitalname?.name}
              {autoAdvanceEnabled && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 Selecting a department will automatically advance to the next step
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {DEPARTMENTS.filter(dept => 
                bookingData.hospitalname?.specialties?.includes(dept.name) || 
                bookingData.hospitalname?.availableServices?.includes(dept.name)
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
                          {DOCTORS[department.id]?.filter(d => d.hospitalId === bookingData.hospitalname?.id).length || 0} doctors available
                        </p>
                        <p className="text-xs text-blue-600">
                          {department.id === 'emergency' ? '24/7 Emergency Care' : 
                           department.id === 'cardiology' ? 'Heart & Vascular Care' :
                           department.id === 'neurology' ? 'Brain & Nervous System' :
                           department.id === 'orthopedics' ? 'Bone & Joint Care' :
                           department.id === 'pediatrics' ? 'Child Healthcare' :
                           department.id === 'gynecology' ? 'Women\'s Health' :
                           'General Medical Care'}
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
                className={!autoAdvanceEnabled ? "bg-primary hover:bg-primary/90" : ""}
              >
                Next Step
                {!autoAdvanceEnabled && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Doctor Selection */}
      {currentStep === 3 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Select Doctor
              {autoAdvanceEnabled && (
                <Badge variant="outline" className="text-xs">
                  <FastForward className="w-3 h-3 mr-1" />
                  Auto-advance
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Choose your preferred doctor from {DEPARTMENTS.find(d => d.id === bookingData.department)?.name}
              {autoAdvanceEnabled && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 Selecting a doctor will automatically advance to the next step
                </div>
              )}
              <br />
              <span className="text-sm text-muted-foreground mt-1 block">
                💡 Active doctors are available for booking. Working days and times are checked during appointment scheduling.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingDoctors ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium mb-2">Loading Doctors...</h3>
                  <p className="text-muted-foreground">Fetching available doctors for this department</p>
                </div>
              ) : doctorsError ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-lg font-medium mb-2">Unable to Load Doctors</h3>
                  <p className="text-muted-foreground">{doctorsError}</p>
                </div>
              ) : availableDoctors.length > 0 ? (
                availableDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className={`transition-all ${
                      isDoctorAvailableNow(doctor) 
                        ? `cursor-pointer hover:shadow-md ${
                            selectedDoctor?.id === doctor.id ? 'ring-2 ring-primary bg-primary/5' : ''
                          }`
                        : 'cursor-not-allowed opacity-60 bg-gray-50'
                    }`}
                    onClick={() => {
                      // Check if doctor is available for booking
                      if (!isDoctorAvailableNow(doctor)) {
                        alert('This doctor is not available for booking. Please select another doctor.');
                        return;
                      }
                      setSelectedDoctor(doctor);
                      // Auto-advance to next step after doctor selection
                      if (autoAdvanceEnabled) {
                        setIsAutoAdvancing(true);
                        setTimeout(() => {
                          if (currentStep === 3) {
                            nextStep();
                          }
                          setIsAutoAdvancing(false);
                        }, 500);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{doctor.name}</h3>
                            <p className="text-sm text-muted-foreground font-medium">{doctor.specialization}</p>
                            <p className="text-sm text-blue-600">{doctor.experience} years experience</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="outline" className="text-xs">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                {doctor.qualification}
                              </Badge>
                            </div>
                            <div className="flex gap-1 mt-2">
                              <Badge variant={doctor.availableTime === "24/7" ? "default" : "secondary"} className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {doctor.availableTime === "24/7" ? "Available 24/7" : `${doctor.availableTime}`}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                📅 {doctor.availableDays.length === 7 ? "All Days" : `${doctor.availableDays.length} Days`}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{doctor.rating?.toFixed(1)}</span>
                          </div>
                          <p className="text-xl font-bold text-green-600">₹{doctor.consultationFee}</p>
                          <p className="text-xs text-muted-foreground">{doctor.nextAvailable}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {doctor.status === 'active' ? 'Available' : doctor.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Booking Status:</span>
                            <Badge variant={isDoctorAvailableNow(doctor) ? "default" : "destructive"} className="text-xs">
                              {isDoctorAvailableNow(doctor) ? "Available for Booking" : "Not Available for Booking"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Working Days:</span>
                            <div className="flex flex-wrap gap-1">
                              {doctor.availableDays.map((day, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {day.substring(0, 3)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Current Status:</span>
                            <Badge variant={isDoctorAvailableRightNow(doctor) ? 'default' : 'secondary'} className="text-xs">
                              {isDoctorAvailableRightNow(doctor) ? 'Available Right Now' : 'Not Available Right Now'}
                            </Badge>
                          </div>
                          {doctor.holidays && doctor.holidays.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">Holidays:</span>
                              <Badge variant="outline" className="text-xs">
                                {doctor.holidays.length} day{doctor.holidays.length > 1 ? 's' : ''} marked
                              </Badge>
                            </div>
                          )}
                          {isDoctorAvailableNow(doctor) && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">Schedule:</span>
                              <Badge variant="outline" className="text-xs">
                                Book for any available day
                              </Badge>
                            </div>
                          )}
                          {!isDoctorAvailableNow(doctor) && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">Next Available:</span>
                              <Badge variant="outline" className="text-xs">
                                {getNextAvailableDate(doctor).toLocaleDateString()}
                              </Badge>
                            </div>
                          )}
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
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Tip:</strong> Try selecting a different department or hospital to find available doctors.
                    </p>
                  </div>
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
                className={!autoAdvanceEnabled ? "bg-primary hover:bg-primary/90" : ""}
              >
                Next Step
                {!autoAdvanceEnabled && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Appointment Details */}
      {currentStep === 4 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Appointment Details
              {autoAdvanceEnabled && (
                <Badge variant="outline" className="text-xs">
                  <FastForward className="w-3 h-3 mr-1" />
                  Auto-advance
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Provide additional information for your appointment
              {autoAdvanceEnabled && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 Completing appointment type, urgency, and time will automatically advance to the next step
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking Rules Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">📋 Booking Rules</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>• <strong>Emergency appointments:</strong> Can be booked anytime, including today</p>
                <p>• <strong>Regular appointments:</strong> Must be booked at least 24 hours in advance</p>
                <p>• <strong>Doctor availability:</strong> Only available dates will be shown</p>
              </div>
            </div>

            {/* Selected Doctor Summary */}
            {selectedDoctor && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">👨‍⚕️ Selected Doctor</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Name:</strong> {selectedDoctor.name}</p>
                    <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
                    <p><strong>Experience:</strong> {selectedDoctor.experience} years</p>
                  </div>
                  <div>
                    <p><strong>Qualification:</strong> {selectedDoctor.qualification}</p>
                    <p><strong>Consultation Fee:</strong> ₹{selectedDoctor.consultationFee}</p>
                    <p><strong>Available Time:</strong> {selectedDoctor.availableTime}</p>
                  </div>
                </div>
              </div>
            )}
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
                <Input
                  id="preferredDate"
                  type="date"
                  value={bookingData.preferredDate.toISOString().split('T')[0]}
                  onChange={(e) => updateBookingData('preferredDate', new Date(e.target.value))}
                  min={getMinimumBookingDate(bookingData.appointmentType || '').toISOString().split('T')[0]}
                  max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                {selectedDoctor && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>📅 Doctor's working days: {selectedDoctor.availableDays?.join(', ') || 'Not specified'}</p>
                    {selectedDoctor.holidays && selectedDoctor.holidays.length > 0 && (
                      <p className="text-orange-600">⚠️ Holidays: {selectedDoctor.holidays.join(', ')}</p>
                    )}
                    {bookingData.preferredDate && !isDoctorAvailableOnDate(selectedDoctor, bookingData.preferredDate) && (
                      <p className="text-red-600">❌ Doctor is not available on this date</p>
                    )}
                    {bookingData.preferredDate && isDoctorAvailableOnDate(selectedDoctor, bookingData.preferredDate) && (
                      <p className="text-green-600">✅ Doctor is available on this date</p>
                    )}
                    {bookingData.appointmentType && bookingData.preferredDate && (
                      (() => {
                        const bookingCheck = isBookingAllowed(bookingData.preferredDate, bookingData.appointmentType);
                        if (!bookingCheck.allowed) {
                          return <p className="text-red-600">⚠️ {bookingCheck.reason}</p>;
                        }
                        if (bookingData.appointmentType === 'emergency') {
                          return <p className="text-blue-600">🚨 Emergency appointment - can be booked anytime</p>;
                        }
                        return <p className="text-green-600">✅ Booking time requirement met (24+ hours advance)</p>;
                      })()
                    )}
                  </div>
                )}
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
                    {selectedDoctor ? (
                      getAvailableTimeSlots(selectedDoctor.availableTime).map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {selectedDoctor && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>⏰ Doctor's available time: {selectedDoctor.availableTime}</p>
                  </div>
                )}
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

            {/* Fee Breakdown */}
            {selectedDoctor && bookingData.appointmentType && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">💰 Fee Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Doctor Consultation Fee:</span>
                    <span>₹{selectedDoctor.consultationFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Appointment Type ({APPOINTMENT_TYPES.find(t => t.id === bookingData.appointmentType)?.name}):</span>
                    <span>₹{APPOINTMENT_TYPES.find(t => t.id === bookingData.appointmentType)?.price || 0}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-medium text-base">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotalPrice()}</span>
                  </div>
                  {bookingData.insuranceClaim && (
                    <div className="text-blue-600 text-xs">
                      💡 Insurance claim eligible - You'll pay 20% (₹{Math.round(calculateTotalPrice() * 0.2)})
                    </div>
                  )}
                </div>
              </div>
            )}

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
              <Button 
                onClick={nextStep}
                disabled={
                  selectedDoctor && bookingData.preferredDate && (
                    !isDoctorAvailableOnDate(selectedDoctor, bookingData.preferredDate) ||
                    !isBookingAllowed(bookingData.preferredDate, bookingData.appointmentType || '').allowed
                  )
                }
                className={!autoAdvanceEnabled ? "bg-primary hover:bg-primary/90" : ""}
              >
                Next Step
                {!autoAdvanceEnabled && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
            {selectedDoctor && bookingData.preferredDate && (
              (() => {
                const doctorAvailable = isDoctorAvailableOnDate(selectedDoctor, bookingData.preferredDate);
                const bookingAllowed = isBookingAllowed(bookingData.preferredDate, bookingData.appointmentType || '');
                
                if (!doctorAvailable || !bookingAllowed.allowed) {
                  return (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">
                        ⚠️ Please select a valid date to proceed:
                      </p>
                      <ul className="text-red-600 text-sm mt-2 ml-4">
                        {!doctorAvailable && <li>• Doctor must be available on this date</li>}
                        {!bookingAllowed.allowed && <li>• {bookingAllowed.reason}</li>}
                      </ul>
                    </div>
                  );
                }
                return null;
              })()
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Payment & Review */}
      {currentStep === 5 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Payment & Review
              {autoAdvanceEnabled && (
                <Badge variant="outline" className="text-xs">
                  <FastForward className="w-3 h-3 mr-1" />
                  Manual Step
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Review your booking details and complete payment
              {autoAdvanceEnabled && (
                <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  💡 This step requires manual review before proceeding to payment
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h3 className="font-medium">Booking Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Hospital:</strong> {bookingData.hospitalname?.hospitalName || bookingData.hospitalname?.name}</p>
                  <p><strong>Department:</strong> {DEPARTMENTS.find(d => d.id === bookingData.department)?.name}</p>
                  <p><strong>Doctor:</strong> {selectedDoctor?.name}</p>
                  <p><strong>Specialty:</strong> {selectedDoctor?.specialization}</p>
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
              <h3 className="font-medium mb-3">💰 Payment Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Doctor Consultation Fee:</span>
                  <span>₹{selectedDoctor?.consultationFee || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Appointment Type ({APPOINTMENT_TYPES.find(t => t.id === bookingData.appointmentType)?.name}):</span>
                  <span>₹{APPOINTMENT_TYPES.find(t => t.id === bookingData.appointmentType)?.price || 0}</span>
                </div>
                <div className="flex justify-between font-medium text-base border-t pt-2">
                  <span>Subtotal:</span>
                  <span>₹{calculateTotalPrice()}</span>
                </div>
                {bookingData.insuranceClaim && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Insurance Coverage (80%):</span>
                      <span>-₹{Math.round(calculateTotalPrice() * 0.8)}</span>
                    </div>
                    <div className="flex justify-between text-blue-600 font-medium">
                      <span>Your Payment (20%):</span>
                      <span>₹{Math.round(calculateTotalPrice() * 0.2)}</span>
                    </div>
                  </>
                )}
                {!bookingData.insuranceClaim && (
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Amount to Pay:</span>
                    <span>₹{calculateTotalPrice()}</span>
                  </div>
                )}
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
