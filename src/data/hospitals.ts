// Comprehensive hospital data for Mangalore and Udupi regions
export interface Hospital {
  id: string;
  hospitalName: string;
  location: string;
  address: string;
  email: string;
  contactNo: string;
  availableServices: string[];
  minimumPrice: number;
  timing: string;
  daysAvailable: string[];
  status: 'active' | 'suspended';
  hospitalId: string;
  password: string;
  region: 'Mangalore' | 'Udupi';
  specialties: string[];
  facilities: string[];
  rating: number;
  emergencyAvailable: boolean;
  operatingHours: string;
  priceRange: string;
}

// Mangalore Hospitals
export const MANGALORE_HOSPITALS: Hospital[] = [
  {
    id: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    location: "Kuntikana, Mangalore",
    address: "Kuntikana, Mangalore 575004, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 824 2225533",
    availableServices: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "General Medicine", "Surgery"],
    minimumPrice: 500,
    timing: "24/7",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    status: "active",
    hospitalId: "MGL001",
    password: "AJHosp2024!",
    region: "Mangalore",
    specialties: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "General Medicine", "Surgery"],
    facilities: ["ICU", "NICU", "Ambulance", "Pharmacy", "Laboratory", "Radiology", "MRI", "CT Scan", "Dialysis"],
    rating: 4.5,
    emergencyAvailable: true,
    operatingHours: "24/7",
    priceRange: "₹500-3000"
  },
  {
    id: "MGL002",
    hospitalName: "KMC Hospital",
    location: "Ambedkar Circle, Mangalore",
    address: "Ambedkar Circle, Mangalore 575001, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 824 2222222",
    availableServices: ["Emergency", "Internal Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
    minimumPrice: 400,
    timing: "6:00 AM - 10:00 PM",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    status: "active",
    hospitalId: "MGL002",
    password: "KMCHosp2024!",
    region: "Mangalore",
    specialties: ["Emergency", "Internal Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray", "Ultrasound"],
    rating: 4.2,
    emergencyAvailable: true,
    operatingHours: "6:00 AM - 10:00 PM",
    priceRange: "₹400-2000"
  },
  {
    id: "MGL003",
    hospitalName: "Yenepoya Medical College Hospital",
    location: "Nithyananda Nagar, Deralakatte, Mangalore",
    address: "Nithyananda Nagar, Deralakatte, Mangalore 575018, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 824 2206000",
    availableServices: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "Dermatology", "Ophthalmology", "ENT"],
    minimumPrice: 600,
    timing: "24/7",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    status: "active",
    hospitalId: "MGL003",
    password: "Yenepoya2024!",
    region: "Mangalore",
    specialties: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "Dermatology", "Ophthalmology", "ENT"],
    facilities: ["ICU", "NICU", "Ambulance", "Pharmacy", "Laboratory", "Radiology", "MRI", "CT Scan", "Dialysis", "Blood Bank"],
    rating: 4.4,
    emergencyAvailable: true,
    operatingHours: "24/7",
    priceRange: "₹600-2500"
  },
  {
    id: "MGL004",
    hospitalName: "Father Muller Medical College Hospital",
    location: "Father Muller Road, Kankanady, Mangalore",
    address: "Father Muller Road, Kankanady, Mangalore 575002, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 824 2238000",
    availableServices: ["Emergency", "Internal Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics", "ENT", "Ophthalmology"],
    minimumPrice: 450,
    timing: "6:00 AM - 10:00 PM",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    status: "active",
    hospitalId: "MGL004",
    password: "FatherMuller2024!",
    region: "Mangalore",
    specialties: ["Emergency", "Internal Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics", "ENT", "Ophthalmology"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray", "Ultrasound", "Blood Bank"],
    rating: 4.3,
    emergencyAvailable: true,
    operatingHours: "6:00 AM - 10:00 PM",
    priceRange: "₹450-1800"
  },
  {
    id: "MGL005",
    hospitalName: "Unity Health Complex",
    location: "Highlands, Mangalore",
    address: "P.B No.535, Highlands, Mangalore 575002, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 824 2225541",
    availableServices: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
    minimumPrice: 350,
    timing: "8:00 AM - 8:00 PM",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    status: "active",
    hospitalId: "MGL005",
    password: "UnityHealth2024!",
    region: "Mangalore",
    specialties: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray"],
    rating: 4.1,
    emergencyAvailable: true,
    operatingHours: "8:00 AM - 8:00 PM",
    priceRange: "₹350-1500"
  },
  {
    id: "MGL006",
    hospitalName: "Wenlock District Hospital",
    location: "Kankanady, Mangalore",
    address: "Kankanady, Mangalore 575002, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 824 2220000",
    availableServices: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics", "Dermatology"],
    minimumPrice: 200,
    timing: "24/7",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    status: "active",
    hospitalId: "MGL006",
    password: "Wenlock2024!",
    region: "Mangalore",
    specialties: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics", "Dermatology"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray", "Blood Bank"],
    rating: 3.8,
    emergencyAvailable: true,
    operatingHours: "24/7",
    priceRange: "₹200-1200"
  },
  {
    id: "MGL007",
    hospitalName: "Mangalore Institute of Oncology",
    location: "Bunts Hostel Road, Mangalore",
    address: "Bunts Hostel Road, Mangalore 575003, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 824 2210000",
    availableServices: ["Oncology", "Radiation Therapy", "Chemotherapy", "General Medicine", "Surgery"],
    minimumPrice: 800,
    timing: "8:00 AM - 6:00 PM",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    status: "active",
    hospitalId: "MGL007",
    password: "MIO2024!",
    region: "Mangalore",
    specialties: ["Oncology", "Radiation Therapy", "Chemotherapy", "General Medicine", "Surgery"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "Radiation Therapy", "Chemotherapy Unit"],
    rating: 4.6,
    emergencyAvailable: false,
    operatingHours: "8:00 AM - 6:00 PM",
    priceRange: "₹800-4000"
  },
  {
    id: "MGL008",
    hospitalName: "Alva's Health Centre",
    location: "Moodbidri, Mangalore",
    address: "Moodbidri, Mangalore 574227, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 8258 222000",
    availableServices: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
    minimumPrice: 300,
    timing: "8:00 AM - 8:00 PM",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    status: "active",
    hospitalId: "MGL008",
    password: "Alvas2024!",
    region: "Mangalore",
    specialties: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray"],
    rating: 4.0,
    emergencyAvailable: true,
    operatingHours: "8:00 AM - 8:00 PM",
    priceRange: "₹300-1600"
  }
];

// Udupi Hospitals
export const UDUPI_HOSPITALS: Hospital[] = [
  {
    id: "UDP001",
    hospitalName: "Kasturba Medical College Hospital",
    location: "NH 66, Near Hiriadka, Udupi",
    address: "NH 66, Near Hiriadka, Udupi, Karnataka 576104",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 820 292 2200",
    availableServices: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "Dermatology", "Ophthalmology", "ENT", "General"],
    minimumPrice: 500,
    timing: "24/7",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    status: "active",
    hospitalId: "UDP001",
    password: "KMCUdupi2024!",
    region: "Udupi",
    specialties: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "Dermatology", "Ophthalmology", "ENT", "General"],
    facilities: ["ICU", "NICU", "Ambulance", "Pharmacy", "Laboratory", "Radiology", "MRI", "CT Scan", "Dialysis"],
    rating: 4.2,
    emergencyAvailable: true,
    operatingHours: "24/7",
    priceRange: "₹500-2000"
  },
  {
    id: "UDP002",
    hospitalName: "Dr. TMA Pai Hospital",
    location: "Kunjibettu, Udupi",
    address: "Kunjibettu, Udupi, Karnataka 576102",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 820 429 8000",
    availableServices: ["Emergency", "Internal Medicine", "Surgery", "Gynecology", "Dermatology", "General"],
    minimumPrice: 400,
    timing: "6:00 AM - 10:00 PM",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    status: "active",
    hospitalId: "UDP002",
    password: "TMAPai2024!",
    region: "Udupi",
    specialties: ["Emergency", "Internal Medicine", "Surgery", "Gynecology", "Dermatology", "General"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray"],
    rating: 4.0,
    emergencyAvailable: true,
    operatingHours: "6:00 AM - 10:00 PM",
    priceRange: "₹400-1500"
  },
  {
    id: "UDP003",
    hospitalName: "Manipal Hospital Udupi",
    location: "Udupi-Hebri Road, Udupi",
    address: "Udupi-Hebri Road, Udupi, Karnataka 576101",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 820 429 9000",
    availableServices: ["Emergency", "Cardiology", "Orthopedics", "Pediatrics", "ENT", "Neurology"],
    minimumPrice: 600,
    timing: "24/7",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    status: "active",
    hospitalId: "UDP003",
    password: "ManipalUdupi2024!",
    region: "Udupi",
    specialties: ["Emergency", "Cardiology", "Orthopedics", "Pediatrics", "ENT", "Neurology"],
    facilities: ["ICU", "NICU", "Ambulance", "Pharmacy", "Laboratory", "MRI", "CT Scan"],
    rating: 4.3,
    emergencyAvailable: true,
    operatingHours: "24/7",
    priceRange: "₹600-2500"
  },
  {
    id: "UDP004",
    hospitalName: "Baliga Memorial Hospital",
    location: "Bejai Kapikad, Udupi",
    address: "Bejai Kapikad, Udupi, Karnataka 576101",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 820 429 7000",
    availableServices: ["Emergency", "General Medicine", "Pediatrics", "Gynecology", "Dermatology"],
    minimumPrice: 350,
    timing: "24/7",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    status: "active",
    hospitalId: "UDP004",
    password: "Baliga2024!",
    region: "Udupi",
    specialties: ["Emergency", "General Medicine", "Pediatrics", "Gynecology", "Dermatology"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray"],
    rating: 3.8,
    emergencyAvailable: true,
    operatingHours: "24/7",
    priceRange: "₹350-1200"
  },
  {
    id: "UDP005",
    hospitalName: "Adarsha Hospital",
    location: "Malpe Road, Udupi",
    address: "Malpe Road, Udupi, Karnataka 576101",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 820 252 0000",
    availableServices: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics"],
    minimumPrice: 300,
    timing: "8:00 AM - 8:00 PM",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    status: "active",
    hospitalId: "UDP005",
    password: "Adarsha2024!",
    region: "Udupi",
    specialties: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray"],
    rating: 3.9,
    emergencyAvailable: true,
    operatingHours: "8:00 AM - 8:00 PM",
    priceRange: "₹300-1400"
  },
  {
    id: "UDP006",
    hospitalName: "Mitra Hospital",
    location: "Old Post Office Road, Udupi",
    address: "Old Post Office Road, Udupi 576101, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 820 2520500",
    availableServices: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
    minimumPrice: 400,
    timing: "8:00 AM - 8:00 PM",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    status: "active",
    hospitalId: "UDP006",
    password: "Mitra2024!",
    region: "Udupi",
    specialties: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray", "Ultrasound"],
    rating: 4.1,
    emergencyAvailable: true,
    operatingHours: "8:00 AM - 8:00 PM",
    priceRange: "₹400-1600"
  },
  {
    id: "UDP007",
    hospitalName: "Hi-Tech Medicare Hospital & Research Centre",
    location: "NH 17, Ambalpady, Udupi",
    address: "NH 17, Ambalpady, Udupi 576103, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 820 2526600",
    availableServices: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "ENT"],
    minimumPrice: 550,
    timing: "24/7",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    status: "active",
    hospitalId: "UDP007",
    password: "HiTech2024!",
    region: "Udupi",
    specialties: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "ENT"],
    facilities: ["ICU", "NICU", "Ambulance", "Pharmacy", "Laboratory", "Radiology", "MRI", "CT Scan"],
    rating: 4.4,
    emergencyAvailable: true,
    operatingHours: "24/7",
    priceRange: "₹550-2200"
  },
  {
    id: "UDP008",
    hospitalName: "City Hospital",
    location: "Behind Alankar Theatre, Udupi",
    address: "Behind Alankar Theatre, Udupi 576101, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 820 2520300",
    availableServices: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics"],
    minimumPrice: 350,
    timing: "8:00 AM - 8:00 PM",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    status: "active",
    hospitalId: "UDP008",
    password: "CityHosp2024!",
    region: "Udupi",
    specialties: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray"],
    rating: 3.7,
    emergencyAvailable: true,
    operatingHours: "8:00 AM - 8:00 PM",
    priceRange: "₹350-1300"
  },
  {
    id: "UDP009",
    hospitalName: "CSI Lombard Memorial Hospital",
    location: "Post Box No 5, Udupi",
    address: "Post Box No 5, Udupi 576101, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 820 2520700",
    availableServices: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
    minimumPrice: 400,
    timing: "8:00 AM - 8:00 PM",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    status: "active",
    hospitalId: "UDP009",
    password: "Lombard2024!",
    region: "Udupi",
    specialties: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics", "Orthopedics"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray", "Ultrasound"],
    rating: 4.0,
    emergencyAvailable: true,
    operatingHours: "8:00 AM - 8:00 PM",
    priceRange: "₹400-1500"
  },
  {
    id: "UDP010",
    hospitalName: "Chinmayi Hospital",
    location: "Church Road, Kundapura, Udupi",
    address: "Church Road, Kundapura, Udupi 576201, Karnataka",
    email: "nithinpoojar606@gmail.com",
    contactNo: "+91 8254 230300",
    availableServices: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics"],
    minimumPrice: 300,
    timing: "8:00 AM - 8:00 PM",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    status: "active",
    hospitalId: "UDP010",
    password: "Chinmayi2024!",
    region: "Udupi",
    specialties: ["Emergency", "General Medicine", "Surgery", "Gynecology", "Pediatrics"],
    facilities: ["ICU", "Ambulance", "Pharmacy", "Laboratory", "X-Ray"],
    rating: 3.6,
    emergencyAvailable: true,
    operatingHours: "8:00 AM - 8:00 PM",
    priceRange: "₹300-1200"
  }
];

// Combined list of all hospitals
export const ALL_HOSPITALS: Hospital[] = [...MANGALORE_HOSPITALS, ...UDUPI_HOSPITALS];

// Helper functions
export const getHospitalsByRegion = (region: 'Mangalore' | 'Udupi'): Hospital[] => {
  return ALL_HOSPITALS.filter(hospital => hospital.region === region);
};

export const getHospitalById = (id: string): Hospital | undefined => {
  return ALL_HOSPITALS.find(hospital => hospital.id === id);
};

export const getHospitalsBySpecialty = (specialty: string): Hospital[] => {
  return ALL_HOSPITALS.filter(hospital => 
    hospital.availableServices.includes(specialty)
  );
};

export const getEmergencyHospitals = (): Hospital[] => {
  return ALL_HOSPITALS.filter(hospital => hospital.emergencyAvailable);
};
