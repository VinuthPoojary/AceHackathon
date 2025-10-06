// Booking data structure and sample bookings for testing
export interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  specialization: string;
  appointmentDate: string; // YYYY-MM-DD format
  appointmentTime: string; // HH:MM format
  consultationFee: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  bookingDate: Date;
  symptoms?: string;
  notes?: string;
  queueNumber?: number;
  estimatedWaitTime?: number; // in minutes
  priority?: 'normal' | 'urgent' | 'emergency';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'online' | 'cash' | 'card';
  createdAt: Date;
  updatedAt: Date;
}

// Sample bookings for testing
export const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: "BOOK001",
    patientId: "PAT001",
    patientName: "John Smith",
    patientEmail: "john.smith@email.com",
    patientPhone: "+91 98765 12345",
    doctorId: "DOC001",
    doctorName: "Dr. Rajesh Kumar",
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    department: "Cardiology",
    specialization: "Cardiology",
    appointmentDate: "2025-01-15",
    appointmentTime: "09:00",
    consultationFee: 800,
    status: "confirmed",
    bookingDate: new Date("2025-01-10"),
    symptoms: "Chest pain and shortness of breath",
    notes: "Patient has history of hypertension",
    queueNumber: 1,
    estimatedWaitTime: 15,
    priority: "normal",
    paymentStatus: "paid",
    paymentMethod: "online",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10")
  },
  {
    id: "BOOK002",
    patientId: "PAT002",
    patientName: "Sarah Johnson",
    patientEmail: "sarah.johnson@email.com",
    patientPhone: "+91 98765 12346",
    doctorId: "DOC004",
    doctorName: "Dr. Sunita Reddy",
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    department: "Pediatrics",
    specialization: "Pediatrics",
    appointmentDate: "2025-01-15",
    appointmentTime: "10:00",
    consultationFee: 600,
    status: "confirmed",
    bookingDate: new Date("2025-01-11"),
    symptoms: "Fever and cough in 5-year-old child",
    notes: "Child is not eating properly",
    queueNumber: 2,
    estimatedWaitTime: 30,
    priority: "normal",
    paymentStatus: "paid",
    paymentMethod: "card",
    createdAt: new Date("2025-01-11"),
    updatedAt: new Date("2025-01-11")
  },
  {
    id: "BOOK003",
    patientId: "PAT003",
    patientName: "Michael Brown",
    patientEmail: "michael.brown@email.com",
    patientPhone: "+91 98765 12347",
    doctorId: "DOC003",
    doctorName: "Dr. Anil Kumar",
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    department: "Orthopedics",
    specialization: "Orthopedics",
    appointmentDate: "2025-01-15",
    appointmentTime: "11:00",
    consultationFee: 750,
    status: "confirmed",
    bookingDate: new Date("2025-01-12"),
    symptoms: "Knee pain after sports injury",
    notes: "Patient is an athlete",
    queueNumber: 3,
    estimatedWaitTime: 45,
    priority: "normal",
    paymentStatus: "paid",
    paymentMethod: "online",
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-12")
  },
  {
    id: "BOOK004",
    patientId: "PAT004",
    patientName: "Emma Wilson",
    patientEmail: "emma.wilson@email.com",
    patientPhone: "+91 98765 12348",
    doctorId: "DOC005",
    doctorName: "Dr. Vijay Kumar",
    hospitalId: "MGL002",
    hospitalName: "KMC Hospital",
    department: "Internal Medicine",
    specialization: "Internal Medicine",
    appointmentDate: "2025-01-16",
    appointmentTime: "09:00",
    consultationFee: 500,
    status: "confirmed",
    bookingDate: new Date("2025-01-13"),
    symptoms: "Diabetes management consultation",
    notes: "Regular follow-up for diabetes",
    queueNumber: 1,
    estimatedWaitTime: 10,
    priority: "normal",
    paymentStatus: "paid",
    paymentMethod: "cash",
    createdAt: new Date("2025-01-13"),
    updatedAt: new Date("2025-01-13")
  },
  {
    id: "BOOK005",
    patientId: "PAT005",
    patientName: "David Lee",
    patientEmail: "david.lee@email.com",
    patientPhone: "+91 98765 12349",
    doctorId: "DOC006",
    doctorName: "Dr. Meera Joshi",
    hospitalId: "MGL002",
    hospitalName: "KMC Hospital",
    department: "Gynecology",
    specialization: "Gynecology",
    appointmentDate: "2025-01-16",
    appointmentTime: "10:00",
    consultationFee: 650,
    status: "confirmed",
    bookingDate: new Date("2025-01-14"),
    symptoms: "Pregnancy consultation",
    notes: "First trimester checkup",
    queueNumber: 2,
    estimatedWaitTime: 25,
    priority: "normal",
    paymentStatus: "paid",
    paymentMethod: "online",
    createdAt: new Date("2025-01-14"),
    updatedAt: new Date("2025-01-14")
  },
  {
    id: "BOOK006",
    patientId: "PAT006",
    patientName: "Lisa Garcia",
    patientEmail: "lisa.garcia@email.com",
    patientPhone: "+91 98765 12350",
    doctorId: "DOC007",
    doctorName: "Dr. Ravi Shankar",
    hospitalId: "MGL003",
    hospitalName: "Yenepoya Medical College Hospital",
    department: "Dermatology",
    specialization: "Dermatology",
    appointmentDate: "2025-11-01",
    appointmentTime: "09:00",
    consultationFee: 700,
    status: "pending",
    bookingDate: new Date("2025-01-15"),
    symptoms: "Skin rash and itching",
    notes: "Allergic reaction suspected",
    queueNumber: 1,
    estimatedWaitTime: 20,
    priority: "normal",
    paymentStatus: "pending",
    paymentMethod: "online",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15")
  },
  {
    id: "BOOK007",
    patientId: "PAT007",
    patientName: "Robert Taylor",
    patientEmail: "robert.taylor@email.com",
    patientPhone: "+91 98765 12351",
    doctorId: "DOC008",
    doctorName: "Dr. Kavitha Rao",
    hospitalId: "MGL003",
    hospitalName: "Yenepoya Medical College Hospital",
    department: "Ophthalmology",
    specialization: "Ophthalmology",
    appointmentDate: "2025-11-01",
    appointmentTime: "10:00",
    consultationFee: 800,
    status: "confirmed",
    bookingDate: new Date("2025-01-15"),
    symptoms: "Blurred vision and eye strain",
    notes: "Computer work related eye problems",
    queueNumber: 2,
    estimatedWaitTime: 35,
    priority: "normal",
    paymentStatus: "paid",
    paymentMethod: "card",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15")
  },
  {
    id: "BOOK008",
    patientId: "PAT008",
    patientName: "Jennifer Martinez",
    patientEmail: "jennifer.martinez@email.com",
    patientPhone: "+91 98765 12352",
    doctorId: "DOC009",
    doctorName: "Dr. Suresh Kumar",
    hospitalId: "UDP001",
    hospitalName: "Kasturba Medical College Hospital",
    department: "General Medicine",
    specialization: "General Medicine",
    appointmentDate: "2025-11-01",
    appointmentTime: "09:00",
    consultationFee: 550,
    status: "confirmed",
    bookingDate: new Date("2025-01-16"),
    symptoms: "General health checkup",
    notes: "Annual health examination",
    queueNumber: 1,
    estimatedWaitTime: 15,
    priority: "normal",
    paymentStatus: "paid",
    paymentMethod: "online",
    createdAt: new Date("2025-01-16"),
    updatedAt: new Date("2025-01-16")
  },
  {
    id: "BOOK009",
    patientId: "PAT009",
    patientName: "Christopher Anderson",
    patientEmail: "christopher.anderson@email.com",
    patientPhone: "+91 98765 12353",
    doctorId: "DOC010",
    doctorName: "Dr. Radha Nair",
    hospitalId: "UDP001",
    hospitalName: "Kasturba Medical College Hospital",
    department: "ENT",
    specialization: "ENT",
    appointmentDate: "2025-11-01",
    appointmentTime: "10:00",
    consultationFee: 600,
    status: "confirmed",
    bookingDate: new Date("2025-01-16"),
    symptoms: "Ear infection and hearing loss",
    notes: "Swimming related ear problem",
    queueNumber: 2,
    estimatedWaitTime: 30,
    priority: "normal",
    paymentStatus: "paid",
    paymentMethod: "cash",
    createdAt: new Date("2025-01-16"),
    updatedAt: new Date("2025-01-16")
  },
  {
    id: "BOOK010",
    patientId: "PAT010",
    patientName: "Amanda White",
    patientEmail: "amanda.white@email.com",
    patientPhone: "+91 98765 12354",
    doctorId: "DOC013",
    doctorName: "Dr. Krishna Prasad",
    hospitalId: "UDP003",
    hospitalName: "Manipal Hospital Udupi",
    department: "Cardiology",
    specialization: "Cardiology",
    appointmentDate: "2025-01-19",
    appointmentTime: "09:00",
    consultationFee: 900,
    status: "confirmed",
    bookingDate: new Date("2025-01-17"),
    symptoms: "Heart palpitations and chest discomfort",
    notes: "Family history of heart disease",
    queueNumber: 1,
    estimatedWaitTime: 20,
    priority: "urgent",
    paymentStatus: "paid",
    paymentMethod: "online",
    createdAt: new Date("2025-01-17"),
    updatedAt: new Date("2025-01-17")
  },
  {
    id: "BOOK011",
    patientId: "PAT011",
    patientName: "James Thompson",
    patientEmail: "james.thompson@email.com",
    patientPhone: "+91 98765 12355",
    doctorId: "DOC014",
    doctorName: "Dr. Prema Kumari",
    hospitalId: "UDP003",
    hospitalName: "Manipal Hospital Udupi",
    department: "Pediatrics",
    specialization: "Pediatrics",
    appointmentDate: "2025-01-19",
    appointmentTime: "10:00",
    consultationFee: 650,
    status: "pending",
    bookingDate: new Date("2025-01-17"),
    symptoms: "Vaccination for 2-year-old child",
    notes: "Regular vaccination schedule",
    queueNumber: 2,
    estimatedWaitTime: 25,
    priority: "normal",
    paymentStatus: "pending",
    paymentMethod: "online",
    createdAt: new Date("2025-01-17"),
    updatedAt: new Date("2025-01-17")
  },
  {
    id: "BOOK012",
    patientId: "PAT012",
    patientName: "Maria Rodriguez",
    patientEmail: "maria.rodriguez@email.com",
    patientPhone: "+91 98765 12356",
    doctorId: "DOC015",
    doctorName: "Dr. Rajendra Shetty",
    hospitalId: "UDP007",
    hospitalName: "Hi-Tech Medicare Hospital & Research Centre",
    department: "Neurology",
    specialization: "Neurology",
    appointmentDate: "2025-01-20",
    appointmentTime: "09:00",
    consultationFee: 850,
    status: "confirmed",
    bookingDate: new Date("2025-01-18"),
    symptoms: "Frequent headaches and dizziness",
    notes: "Migraine-like symptoms",
    queueNumber: 1,
    estimatedWaitTime: 15,
    priority: "normal",
    paymentStatus: "paid",
    paymentMethod: "card",
    createdAt: new Date("2025-01-18"),
    updatedAt: new Date("2025-01-18")
  },
  {
    id: "BOOK013",
    patientId: "PAT013",
    patientName: "Kevin Johnson",
    patientEmail: "kevin.johnson@email.com",
    patientPhone: "+91 98765 12357",
    doctorId: "DOC016",
    doctorName: "Dr. Vijaya Lakshmi",
    hospitalId: "UDP007",
    hospitalName: "Hi-Tech Medicare Hospital & Research Centre",
    department: "Gynecology",
    specialization: "Gynecology",
    appointmentDate: "2025-01-20",
    appointmentTime: "10:00",
    consultationFee: 750,
    status: "completed",
    bookingDate: new Date("2025-01-18"),
    symptoms: "Irregular periods consultation",
    notes: "Treatment completed successfully",
    queueNumber: 2,
    estimatedWaitTime: 30,
    priority: "normal",
    paymentStatus: "paid",
    paymentMethod: "online",
    createdAt: new Date("2025-01-18"),
    updatedAt: new Date("2025-01-20")
  },
  {
    id: "BOOK014",
    patientId: "PAT014",
    patientName: "Samantha Davis",
    patientEmail: "samantha.davis@email.com",
    patientPhone: "+91 98765 12358",
    doctorId: "DOC002",
    doctorName: "Dr. Priya Sharma",
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    department: "Neurology",
    specialization: "Neurology",
    appointmentDate: "2025-01-21",
    appointmentTime: "10:00",
    consultationFee: 900,
    status: "cancelled",
    bookingDate: new Date("2025-01-19"),
    symptoms: "Memory problems consultation",
    notes: "Patient cancelled due to emergency",
    queueNumber: 0,
    estimatedWaitTime: 0,
    priority: "normal",
    paymentStatus: "refunded",
    paymentMethod: "online",
    createdAt: new Date("2025-01-19"),
    updatedAt: new Date("2025-01-20")
  },
  {
    id: "BOOK015",
    patientId: "PAT015",
    patientName: "Daniel Wilson",
    patientEmail: "daniel.wilson@email.com",
    patientPhone: "+91 98765 12359",
    doctorId: "DOC011",
    doctorName: "Dr. Ganesh Bhat",
    hospitalId: "UDP002",
    hospitalName: "Dr. TMA Pai Hospital",
    department: "Surgery",
    specialization: "Surgery",
    appointmentDate: "2025-01-22",
    appointmentTime: "09:00",
    consultationFee: 700,
    status: "confirmed",
    bookingDate: new Date("2025-01-20"),
    symptoms: "Gallbladder stone consultation",
    notes: "Surgery consultation required",
    queueNumber: 1,
    estimatedWaitTime: 20,
    priority: "normal",
    paymentStatus: "paid",
    paymentMethod: "cash",
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-20")
  }
];

// Helper functions
export const getBookingsByHospital = (hospitalId: string): Booking[] => {
  return SAMPLE_BOOKINGS.filter(booking => booking.hospitalId === hospitalId);
};

export const getBookingsByDoctor = (doctorId: string): Booking[] => {
  return SAMPLE_BOOKINGS.filter(booking => booking.doctorId === doctorId);
};

export const getBookingsByDate = (date: string): Booking[] => {
  return SAMPLE_BOOKINGS.filter(booking => booking.appointmentDate === date);
};

export const getBookingsByStatus = (status: string): Booking[] => {
  return SAMPLE_BOOKINGS.filter(booking => booking.status === status);
};

export const getBookingsByPatient = (patientId: string): Booking[] => {
  return SAMPLE_BOOKINGS.filter(booking => booking.patientId === patientId);
};

export const getBookingById = (id: string): Booking | undefined => {
  return SAMPLE_BOOKINGS.find(booking => booking.id === id);
};

export const getActiveBookings = (): Booking[] => {
  return SAMPLE_BOOKINGS.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'pending'
  );
};

export const getTodaysBookings = (): Booking[] => {
  const today = new Date().toISOString().split('T')[0];
  return SAMPLE_BOOKINGS.filter(booking => booking.appointmentDate === today);
};

// Queue management functions
export const getQueueForHospital = (hospitalId: string, date: string): Booking[] => {
  return SAMPLE_BOOKINGS
    .filter(booking => 
      booking.hospitalId === hospitalId && 
      booking.appointmentDate === date &&
      (booking.status === 'confirmed' || booking.status === 'pending')
    )
    .sort((a, b) => {
      // Sort by priority first, then by queue number
      const priorityOrder = { emergency: 0, urgent: 1, normal: 2 };
      const aPriority = priorityOrder[a.priority || 'normal'];
      const bPriority = priorityOrder[b.priority || 'normal'];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return (a.queueNumber || 999) - (b.queueNumber || 999);
    });
};

export const getQueueForDoctor = (doctorId: string, date: string): Booking[] => {
  return SAMPLE_BOOKINGS
    .filter(booking => 
      booking.doctorId === doctorId && 
      booking.appointmentDate === date &&
      (booking.status === 'confirmed' || booking.status === 'pending')
    )
    .sort((a, b) => {
      // Sort by priority first, then by queue number
      const priorityOrder = { emergency: 0, urgent: 1, normal: 2 };
      const aPriority = priorityOrder[a.priority || 'normal'];
      const bPriority = priorityOrder[b.priority || 'normal'];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return (a.queueNumber || 999) - (b.queueNumber || 999);
    });
};
