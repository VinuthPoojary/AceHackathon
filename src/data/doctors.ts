// Doctor data structure and sample doctors for each hospital and department
export interface Doctor {
  id: string;
  doctorName: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  department: string;
  hospitalId: string;
  hospitalName: string;
  experience: number; // in years
  qualification: string;
  consultationFee: number;
  availableDays: string[];
  availableTimeSlots: string[];
  status: 'active' | 'inactive' | 'on_leave';
  rating: number;
  totalPatients: number;
  bio?: string;
  languages: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Sample doctors for each hospital and department
export const SAMPLE_DOCTORS: Doctor[] = [
  // A.J. Hospital & Research Centre (MGL001)
  {
    id: "DOC001",
    doctorName: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@ajhospital.com",
    phoneNumber: "+91 98765 43210",
    specialization: "Cardiology",
    department: "Cardiology",
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    experience: 15,
    qualification: "MD, DM Cardiology",
    consultationFee: 800,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:00-12:00", "14:00-17:00"],
    status: "active",
    rating: 4.8,
    totalPatients: 1250,
    bio: "Senior Cardiologist with expertise in interventional cardiology",
    languages: ["English", "Hindi", "Kannada"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "DOC002",
    doctorName: "Dr. Priya Sharma",
    email: "priya.sharma@ajhospital.com",
    phoneNumber: "+91 98765 43211",
    specialization: "Neurology",
    department: "Neurology",
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    experience: 12,
    qualification: "MD, DM Neurology",
    consultationFee: 900,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTimeSlots: ["10:00-13:00", "15:00-18:00"],
    status: "active",
    rating: 4.7,
    totalPatients: 980,
    bio: "Specialist in stroke management and neurological disorders",
    languages: ["English", "Hindi", "Kannada"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "DOC003",
    doctorName: "Dr. Anil Kumar",
    email: "anil.kumar@ajhospital.com",
    phoneNumber: "+91 98765 43212",
    specialization: "Orthopedics",
    department: "Orthopedics",
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    experience: 18,
    qualification: "MS Orthopedics",
    consultationFee: 750,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["08:00-11:00", "13:00-16:00"],
    status: "active",
    rating: 4.6,
    totalPatients: 1450,
    bio: "Expert in joint replacement and sports medicine",
    languages: ["English", "Hindi", "Kannada"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "DOC004",
    doctorName: "Dr. Sunita Reddy",
    email: "sunita.reddy@ajhospital.com",
    phoneNumber: "+91 98765 43213",
    specialization: "Pediatrics",
    department: "Pediatrics",
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    experience: 14,
    qualification: "MD Pediatrics",
    consultationFee: 600,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTimeSlots: ["09:00-12:00", "14:00-17:00"],
    status: "active",
    rating: 4.9,
    totalPatients: 2100,
    bio: "Pediatric specialist with focus on child development",
    languages: ["English", "Hindi", "Kannada", "Tulu"],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // KMC Hospital (MGL002)
  {
    id: "DOC005",
    doctorName: "Dr. Vijay Kumar",
    email: "vijay.kumar@kmchospital.com",
    phoneNumber: "+91 98765 43214",
    specialization: "Internal Medicine",
    department: "Internal Medicine",
    hospitalId: "MGL002",
    hospitalName: "KMC Hospital",
    experience: 16,
    qualification: "MD Internal Medicine",
    consultationFee: 500,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:00-12:00", "15:00-18:00"],
    status: "active",
    rating: 4.5,
    totalPatients: 1180,
    bio: "General medicine specialist with expertise in diabetes management",
    languages: ["English", "Hindi", "Kannada"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "DOC006",
    doctorName: "Dr. Meera Joshi",
    email: "meera.joshi@kmchospital.com",
    phoneNumber: "+91 98765 43215",
    specialization: "Gynecology",
    department: "Gynecology",
    hospitalId: "MGL002",
    hospitalName: "KMC Hospital",
    experience: 13,
    qualification: "MS Gynecology",
    consultationFee: 650,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTimeSlots: ["10:00-13:00", "14:00-17:00"],
    status: "active",
    rating: 4.7,
    totalPatients: 920,
    bio: "Gynecologist specializing in high-risk pregnancies",
    languages: ["English", "Hindi", "Kannada"],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Yenepoya Medical College Hospital (MGL003)
  {
    id: "DOC007",
    doctorName: "Dr. Ravi Shankar",
    email: "ravi.shankar@yenepoya.com",
    phoneNumber: "+91 98765 43216",
    specialization: "Dermatology",
    department: "Dermatology",
    hospitalId: "MGL003",
    hospitalName: "Yenepoya Medical College Hospital",
    experience: 11,
    qualification: "MD Dermatology",
    consultationFee: 700,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:00-12:00", "14:00-17:00"],
    status: "active",
    rating: 4.4,
    totalPatients: 850,
    bio: "Dermatologist with expertise in cosmetic dermatology",
    languages: ["English", "Hindi", "Kannada"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "DOC008",
    doctorName: "Dr. Kavitha Rao",
    email: "kavitha.rao@yenepoya.com",
    phoneNumber: "+91 98765 43217",
    specialization: "Ophthalmology",
    department: "Ophthalmology",
    hospitalId: "MGL003",
    hospitalName: "Yenepoya Medical College Hospital",
    experience: 17,
    qualification: "MS Ophthalmology",
    consultationFee: 800,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTimeSlots: ["08:00-11:00", "13:00-16:00"],
    status: "active",
    rating: 4.8,
    totalPatients: 1350,
    bio: "Eye specialist with expertise in cataract surgery",
    languages: ["English", "Hindi", "Kannada"],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Kasturba Medical College Hospital (UDP001)
  {
    id: "DOC009",
    doctorName: "Dr. Suresh Kumar",
    email: "suresh.kumar@kmcudupi.com",
    phoneNumber: "+91 98765 43218",
    specialization: "General Medicine",
    department: "General Medicine",
    hospitalId: "UDP001",
    hospitalName: "Kasturba Medical College Hospital",
    experience: 20,
    qualification: "MD General Medicine",
    consultationFee: 550,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTimeSlots: ["09:00-12:00", "14:00-17:00"],
    status: "active",
    rating: 4.6,
    totalPatients: 1650,
    bio: "Senior physician with extensive experience in general medicine",
    languages: ["English", "Hindi", "Kannada", "Tulu"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "DOC010",
    doctorName: "Dr. Radha Nair",
    email: "radha.nair@kmcudupi.com",
    phoneNumber: "+91 98765 43219",
    specialization: "ENT",
    department: "ENT",
    hospitalId: "UDP001",
    hospitalName: "Kasturba Medical College Hospital",
    experience: 14,
    qualification: "MS ENT",
    consultationFee: 600,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["10:00-13:00", "15:00-18:00"],
    status: "active",
    rating: 4.5,
    totalPatients: 1100,
    bio: "ENT specialist with expertise in hearing disorders",
    languages: ["English", "Hindi", "Kannada", "Malayalam"],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Dr. TMA Pai Hospital (UDP002)
  {
    id: "DOC011",
    doctorName: "Dr. Ganesh Bhat",
    email: "ganesh.bhat@tmapai.com",
    phoneNumber: "+91 98765 43220",
    specialization: "Surgery",
    department: "Surgery",
    hospitalId: "UDP002",
    hospitalName: "Dr. TMA Pai Hospital",
    experience: 16,
    qualification: "MS Surgery",
    consultationFee: 700,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTimeSlots: ["09:00-12:00", "14:00-17:00"],
    status: "active",
    rating: 4.7,
    totalPatients: 980,
    bio: "General surgeon with expertise in laparoscopic surgery",
    languages: ["English", "Hindi", "Kannada"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "DOC012",
    doctorName: "Dr. Lakshmi Devi",
    email: "lakshmi.devi@tmapai.com",
    phoneNumber: "+91 98765 43221",
    specialization: "Dermatology",
    department: "Dermatology",
    hospitalId: "UDP002",
    hospitalName: "Dr. TMA Pai Hospital",
    experience: 12,
    qualification: "MD Dermatology",
    consultationFee: 650,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["10:00-13:00", "15:00-18:00"],
    status: "active",
    rating: 4.3,
    totalPatients: 750,
    bio: "Dermatologist specializing in skin disorders",
    languages: ["English", "Hindi", "Kannada"],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Manipal Hospital Udupi (UDP003)
  {
    id: "DOC013",
    doctorName: "Dr. Krishna Prasad",
    email: "krishna.prasad@manipaludupi.com",
    phoneNumber: "+91 98765 43222",
    specialization: "Cardiology",
    department: "Cardiology",
    hospitalId: "UDP003",
    hospitalName: "Manipal Hospital Udupi",
    experience: 19,
    qualification: "MD, DM Cardiology",
    consultationFee: 900,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:00-12:00", "14:00-17:00"],
    status: "active",
    rating: 4.8,
    totalPatients: 1400,
    bio: "Cardiologist with expertise in heart surgery",
    languages: ["English", "Hindi", "Kannada"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "DOC014",
    doctorName: "Dr. Prema Kumari",
    email: "prema.kumari@manipaludupi.com",
    phoneNumber: "+91 98765 43223",
    specialization: "Pediatrics",
    department: "Pediatrics",
    hospitalId: "UDP003",
    hospitalName: "Manipal Hospital Udupi",
    experience: 15,
    qualification: "MD Pediatrics",
    consultationFee: 650,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTimeSlots: ["09:00-12:00", "14:00-17:00"],
    status: "active",
    rating: 4.9,
    totalPatients: 1800,
    bio: "Pediatric specialist with focus on neonatal care",
    languages: ["English", "Hindi", "Kannada", "Malayalam"],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Hi-Tech Medicare Hospital (UDP007)
  {
    id: "DOC015",
    doctorName: "Dr. Rajendra Shetty",
    email: "rajendra.shetty@hitechmedicare.com",
    phoneNumber: "+91 98765 43224",
    specialization: "Neurology",
    department: "Neurology",
    hospitalId: "UDP007",
    hospitalName: "Hi-Tech Medicare Hospital & Research Centre",
    experience: 13,
    qualification: "MD, DM Neurology",
    consultationFee: 850,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTimeSlots: ["10:00-13:00", "15:00-18:00"],
    status: "active",
    rating: 4.6,
    totalPatients: 1050,
    bio: "Neurologist specializing in epilepsy management",
    languages: ["English", "Hindi", "Kannada"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "DOC016",
    doctorName: "Dr. Vijaya Lakshmi",
    email: "vijaya.lakshmi@hitechmedicare.com",
    phoneNumber: "+91 98765 43225",
    specialization: "Gynecology",
    department: "Gynecology",
    hospitalId: "UDP007",
    hospitalName: "Hi-Tech Medicare Hospital & Research Centre",
    experience: 17,
    qualification: "MS Gynecology",
    consultationFee: 750,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:00-12:00", "14:00-17:00"],
    status: "active",
    rating: 4.7,
    totalPatients: 1200,
    bio: "Gynecologist with expertise in infertility treatment",
    languages: ["English", "Hindi", "Kannada"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Helper functions
export const getDoctorsByHospital = (hospitalId: string): Doctor[] => {
  return SAMPLE_DOCTORS.filter(doctor => doctor.hospitalId === hospitalId);
};

export const getDoctorsByDepartment = (department: string): Doctor[] => {
  return SAMPLE_DOCTORS.filter(doctor => doctor.department === department);
};

export const getDoctorsBySpecialization = (specialization: string): Doctor[] => {
  return SAMPLE_DOCTORS.filter(doctor => doctor.specialization === specialization);
};

export const getActiveDoctors = (): Doctor[] => {
  return SAMPLE_DOCTORS.filter(doctor => doctor.status === 'active');
};

export const getDoctorById = (id: string): Doctor | undefined => {
  return SAMPLE_DOCTORS.find(doctor => doctor.id === id);
};

// Department mappings for each hospital
export const HOSPITAL_DEPARTMENTS = {
  "MGL001": ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "General Medicine", "Surgery"],
  "MGL002": ["Internal Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
  "MGL003": ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "Dermatology", "Ophthalmology", "ENT"],
  "MGL004": ["Internal Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics", "ENT", "Ophthalmology"],
  "MGL005": ["General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
  "MGL006": ["General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics", "Dermatology"],
  "MGL007": ["Oncology", "Radiation Therapy", "Chemotherapy", "General Medicine", "Surgery"],
  "MGL008": ["General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
  "UDP001": ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "Dermatology", "Ophthalmology", "ENT", "General"],
  "UDP002": ["Internal Medicine", "Surgery", "Gynecology", "Dermatology"],
  "UDP003": ["Cardiology", "Orthopedics", "Pediatrics", "ENT", "Neurology"],
  "UDP004": ["General Medicine", "Pediatrics", "Gynecology", "Dermatology"],
  "UDP005": ["General Medicine", "Surgery", "Gynecology", "Pediatrics"],
  "UDP006": ["General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
  "UDP007": ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "ENT"],
  "UDP008": ["General Medicine", "Surgery", "Gynecology", "Pediatrics"],
  "UDP009": ["General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
  "UDP010": ["General Medicine", "Surgery", "Gynecology", "Pediatrics"]
};
