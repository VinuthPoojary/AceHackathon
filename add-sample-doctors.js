// Comprehensive script to add multiple doctors to Firestore
// Run this with: node add-sample-doctors.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleDoctors = [
  {
    name: "nithin",
    specialization: "Emergency",
    experience: 5,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    availableTime: "24/7",
    consultationFee: 200,
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    qualification: "done",
    status: "active",
    createdAt: new Date()
  },
  {
    name: "Dr. Sarah Johnson",
    specialization: "Cardiology",
    experience: 8,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTime: "9AM-5PM",
    consultationFee: 500,
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    qualification: "MD Cardiology",
    status: "active",
    createdAt: new Date()
  },
  {
    name: "Dr. Michael Chen",
    specialization: "Orthopedics",
    experience: 12,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTime: "10AM-4PM",
    consultationFee: 600,
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    qualification: "MS Orthopedics",
    status: "active",
    createdAt: new Date()
  },
  {
    name: "Dr. Emily Davis",
    specialization: "Pediatrics",
    experience: 6,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    availableTime: "9AM-5PM",
    consultationFee: 350,
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    qualification: "MD Pediatrics",
    status: "active",
    createdAt: new Date()
  }
];

async function addSampleDoctors() {
  try {
    console.log("Adding sample doctors to Firestore...");
    
    for (const doctor of sampleDoctors) {
      const docRef = await addDoc(collection(db, "doctors"), doctor);
      console.log(`Doctor "${doctor.name}" added with ID: ${docRef.id}`);
    }
    
    console.log("\nAll sample doctors added successfully!");
    console.log("\nDoctor data summary:");
    sampleDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} - ${doctor.specialization} - ₹${doctor.consultationFee}`);
    });
    
  } catch (error) {
    console.error("Error adding sample doctors: ", error);
  }
}

addSampleDoctors();
