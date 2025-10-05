// Enhanced test script with proper availability and holiday data
// Run this with: node test-enhanced-doctor-data.js

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

// Enhanced doctor data with proper availability and holidays
const enhancedDoctors = [
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
    holidays: ["2025-12-25", "2025-01-01", "2025-08-15"], // Christmas, New Year, Independence Day
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
    holidays: ["2025-12-25", "2025-01-01"], // Christmas and New Year
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
    holidays: [], // No holidays
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
    holidays: ["2025-12-25", "2025-01-01", "2025-10-31"], // Christmas, New Year, Halloween
    createdAt: new Date()
  }
];

async function addEnhancedDoctors() {
  try {
    console.log("🚀 Adding enhanced doctor data with availability and holidays...\n");
    
    for (const doctor of enhancedDoctors) {
      const docRef = await addDoc(collection(db, "doctors"), doctor);
      console.log(`✅ Doctor "${doctor.name}" added with ID: ${docRef.id}`);
      console.log(`   📅 Available: ${doctor.availableDays.length} days (${doctor.availableDays.join(', ')})`);
      console.log(`   ⏰ Time: ${doctor.availableTime}`);
      console.log(`   🏖️  Holidays: ${doctor.holidays.length} days marked`);
      console.log(`   💰 Fee: ₹${doctor.consultationFee}`);
      console.log("");
    }
    
    console.log("🎉 All enhanced doctors added successfully!\n");
    
  } catch (error) {
    console.error("❌ Error adding enhanced doctors:", error);
  }
}

async function testAvailabilityQueries() {
  try {
    console.log("🔍 Testing availability queries...\n");
    
    // Test query for Emergency doctors at MGL001
    const emergencyQuery = query(
      collection(db, "doctors"),
      where("hospitalId", "==", "MGL001"),
      where("specialization", "==", "Emergency"),
      where("status", "==", "active")
    );
    
    const emergencySnapshot = await getDocs(emergencyQuery);
    console.log(`📊 Found ${emergencySnapshot.size} Emergency doctors at MGL001:`);
    
    emergencySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   👨‍⚕️  ${data.name}`);
      console.log(`      📅 Available: ${data.availableDays.join(', ')}`);
      console.log(`      ⏰ Time: ${data.availableTime}`);
      console.log(`      🏖️  Holidays: ${data.holidays?.length || 0} days`);
      console.log(`      💰 Fee: ₹${data.consultationFee}`);
      console.log(`      📊 Status: ${data.status}`);
      console.log("");
    });
    
    // Test query for all active doctors
    const allDoctorsQuery = query(
      collection(db, "doctors"),
      where("hospitalId", "==", "MGL001"),
      where("status", "==", "active")
    );
    
    const allDoctorsSnapshot = await getDocs(allDoctorsQuery);
    console.log(`📊 Found ${allDoctorsSnapshot.size} total active doctors at MGL001\n`);
    
    // Show availability summary
    console.log("📋 Availability Summary:");
    allDoctorsSnapshot.forEach((doc) => {
      const data = doc.data();
      const availability = data.availableTime === "24/7" ? "24/7 Emergency" : `${data.availableTime}`;
      const days = data.availableDays.length === 7 ? "All Days" : `${data.availableDays.length} Days`;
      console.log(`   ${data.name} (${data.specialization}): ${days} • ${availability}`);
    });
    
  } catch (error) {
    console.error("❌ Error testing queries:", error);
  }
}

async function main() {
  console.log("🏥 Enhanced Doctor Data Integration Test\n");
  console.log("This script will add doctors with proper availability and holiday management.\n");
  
  // Add enhanced doctors
  await addEnhancedDoctors();
  
  // Test queries
  await testAvailabilityQueries();
  
  console.log("\n✨ Enhanced doctor data setup complete!");
  console.log("\n📋 What's new:");
  console.log("✅ Clear availability status (Available Now / Currently Unavailable)");
  console.log("✅ Specific time ranges instead of confusing badges");
  console.log("✅ Holiday date management");
  console.log("✅ Working days display");
  console.log("✅ Real-time availability checking");
  
  console.log("\n🎯 Next steps:");
  console.log("1. Go to Patient Portal → Booking tab");
  console.log("2. Select 'A.J. Hospital & Research Centre' (MGL001)");
  console.log("3. Choose 'Emergency' department");
  console.log("4. You should see 'nithin' doctor with:");
  console.log("   - Clear availability status");
  console.log("   - 24/7 Emergency availability");
  console.log("   - All 7 days available");
  console.log("   - Holiday information");
  console.log("   - Proper time display");
}

main();
