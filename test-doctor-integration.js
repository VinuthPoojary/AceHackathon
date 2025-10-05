// Test script to add your specific doctor data and test the integration
// Run this with: node test-doctor-integration.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs } = require('firebase/firestore');

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

// Your specific doctor data
const yourDoctor = {
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
};

// Test data for different departments
const testDoctors = [
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
  }
];

async function addTestDoctors() {
  try {
    console.log("Adding test doctors to Firestore...");
    
    for (const doctor of testDoctors) {
      const docRef = await addDoc(collection(db, "doctors"), doctor);
      console.log(`✅ Doctor "${doctor.name}" added with ID: ${docRef.id}`);
    }
    
    console.log("\n🎉 All test doctors added successfully!");
    
  } catch (error) {
    console.error("❌ Error adding test doctors:", error);
  }
}

async function testDoctorQuery() {
  try {
    console.log("\n🔍 Testing doctor queries...");
    
    // Test query for Emergency doctors at MGL001
    const emergencyQuery = query(
      collection(db, "doctors"),
      where("hospitalId", "==", "MGL001"),
      where("specialization", "==", "Emergency"),
      where("status", "==", "active")
    );
    
    const emergencySnapshot = await getDocs(emergencyQuery);
    console.log(`📊 Found ${emergencySnapshot.size} Emergency doctors at MGL001`);
    
    emergencySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.name}: ${data.specialization} (₹${data.consultationFee})`);
    });
    
    // Test query for Cardiology doctors
    const cardioQuery = query(
      collection(db, "doctors"),
      where("hospitalId", "==", "MGL001"),
      where("specialization", "==", "Cardiology"),
      where("status", "==", "active")
    );
    
    const cardioSnapshot = await getDocs(cardioQuery);
    console.log(`📊 Found ${cardioSnapshot.size} Cardiology doctors at MGL001`);
    
    cardioSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.name}: ${data.specialization} (₹${data.consultationFee})`);
    });
    
  } catch (error) {
    console.error("❌ Error testing queries:", error);
  }
}

async function main() {
  console.log("🚀 Starting Doctor Integration Test\n");
  
  // Add test doctors
  await addTestDoctors();
  
  // Test queries
  await testDoctorQuery();
  
  console.log("\n✨ Test completed! Your doctor data should now be available in the booking system.");
  console.log("\n📋 Next steps:");
  console.log("1. Go to Patient Portal → Booking tab");
  console.log("2. Select 'A.J. Hospital & Research Centre' (MGL001)");
  console.log("3. Choose 'Emergency' department");
  console.log("4. You should see 'nithin' doctor in the list");
}

main();
