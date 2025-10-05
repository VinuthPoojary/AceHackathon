// Sample script to add doctor data to Firestore
// Run this with: node add-sample-doctor.js

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

const sampleDoctor = {
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

async function addSampleDoctor() {
  try {
    const docRef = await addDoc(collection(db, "doctors"), sampleDoctor);
    console.log("Sample doctor added with ID: ", docRef.id);
    console.log("Doctor data:", sampleDoctor);
  } catch (error) {
    console.error("Error adding sample doctor: ", error);
  }
}

addSampleDoctor();
