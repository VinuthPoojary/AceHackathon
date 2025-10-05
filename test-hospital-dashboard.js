// Test script to add sample doctors for hospital dashboard testing
// Run this with: node test-hospital-dashboard.js

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

// Sample doctors for A.J. Hospital & Research Centre (MGL001)
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
    qualification: "MBBS",
    status: "active",
    holidays: ["2025-12-25", "2025-01-01", "2025-08-15"],
    createdAt: new Date()
  },
  {
    name: "Dr. Sarah Johnson",
    specialization: "Cardiology",
    experience: 8,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTime: "9:00 AM - 5:00 PM",
    consultationFee: 500,
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    qualification: "MD Cardiology",
    status: "active",
    holidays: ["2025-12-25", "2025-01-01"],
    createdAt: new Date()
  },
  {
    name: "Dr. Michael Chen",
    specialization: "Orthopedics",
    experience: 12,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTime: "10:00 AM - 6:00 PM",
    consultationFee: 600,
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    qualification: "MS Orthopedics",
    status: "active",
    holidays: [],
    createdAt: new Date()
  },
  {
    name: "Dr. Emily Davis",
    specialization: "Pediatrics",
    experience: 6,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    availableTime: "8:00 AM - 4:00 PM",
    consultationFee: 350,
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    qualification: "MD Pediatrics",
    status: "active",
    holidays: ["2025-12-25", "2025-01-01", "2025-10-31"],
    createdAt: new Date()
  },
  {
    name: "Dr. Rajesh Kumar",
    specialization: "General Medicine",
    experience: 15,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTime: "9:00 AM - 5:00 PM",
    consultationFee: 400,
    hospitalId: "MGL001",
    hospitalName: "A.J. Hospital & Research Centre",
    qualification: "MD Medicine",
    status: "active",
    holidays: ["2025-12-25", "2025-01-01"],
    createdAt: new Date()
  }
];

async function addSampleDoctors() {
  try {
    console.log("🏥 Adding sample doctors for A.J. Hospital & Research Centre...\n");
    
    for (const doctor of sampleDoctors) {
      const docRef = await addDoc(collection(db, "doctors"), doctor);
      console.log(`✅ Doctor "${doctor.name}" added with ID: ${docRef.id}`);
      console.log(`   📋 Specialization: ${doctor.specialization}`);
      console.log(`   ⏰ Available: ${doctor.availableTime}`);
      console.log(`   📅 Days: ${doctor.availableDays.length} days/week`);
      console.log(`   💰 Fee: ₹${doctor.consultationFee}`);
      console.log(`   🏖️  Holidays: ${doctor.holidays.length} days`);
      console.log("");
    }
    
    console.log("🎉 All sample doctors added successfully!\n");
    
  } catch (error) {
    console.error("❌ Error adding sample doctors:", error);
  }
}

async function testHospitalDashboard() {
  try {
    console.log("🔍 Testing hospital dashboard functionality...\n");
    
    // Test query for MGL001 doctors
    const doctorsQuery = query(
      collection(db, "doctors"),
      where("hospitalId", "==", "MGL001")
    );
    
    const doctorsSnapshot = await getDocs(doctorsQuery);
    console.log(`📊 Found ${doctorsSnapshot.size} doctors for A.J. Hospital & Research Centre:\n`);
    
    doctorsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`👨‍⚕️  ${data.name} (ID: ${doc.id})`);
      console.log(`   📋 ${data.specialization}`);
      console.log(`   ⏰ ${data.availableTime}`);
      console.log(`   📅 ${data.availableDays.join(', ')}`);
      console.log(`   💰 ₹${data.consultationFee}`);
      console.log(`   📊 ${data.status}`);
      console.log("");
    });
    
    // Show specialization distribution
    const specializations = {};
    doctorsSnapshot.forEach((doc) => {
      const specialization = doc.data().specialization;
      specializations[specialization] = (specializations[specialization] || 0) + 1;
    });
    
    console.log("📋 Specialization Distribution:");
    Object.entries(specializations).forEach(([spec, count]) => {
      console.log(`   ${spec}: ${count} doctor${count > 1 ? 's' : ''}`);
    });
    
  } catch (error) {
    console.error("❌ Error testing hospital dashboard:", error);
  }
}

async function main() {
  console.log("🏥 Hospital Dashboard Test Script\n");
  console.log("This script will add sample doctors to test the hospital dashboard functionality.\n");
  
  // Add sample doctors
  await addSampleDoctors();
  
  // Test functionality
  await testHospitalDashboard();
  
  console.log("✨ Hospital dashboard test completed!");
  console.log("\n📋 What's been set up:");
  console.log("✅ 5 sample doctors added to A.J. Hospital & Research Centre");
  console.log("✅ Different specializations (Emergency, Cardiology, Orthopedics, Pediatrics, General Medicine)");
  console.log("✅ Various availability schedules");
  console.log("✅ Different consultation fees");
  console.log("✅ Holiday management examples");
  
  console.log("\n🎯 Next steps:");
  console.log("1. Go to Hospital Dashboard");
  console.log("2. Login with A.J. Hospital credentials");
  console.log("3. Go to 'Doctors' tab");
  console.log("4. You should see all 5 doctors listed");
  console.log("5. Test the 'Edit' functionality on any doctor");
  console.log("6. Verify specialization dropdown shows only hospital services");
  
  console.log("\n🔧 Features to test:");
  console.log("• Doctor listing with all details");
  console.log("• Edit doctor functionality");
  console.log("• Specialization dropdown (only hospital services)");
  console.log("• Availability time and days management");
  console.log("• Holiday date management");
  console.log("• Status management");
}

main();
