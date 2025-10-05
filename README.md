# MedConnect Udupi - Comprehensive Healthcare Platform

A modern, feature-rich healthcare management platform designed specifically for Udupi district, Karnataka. This platform addresses the critical healthcare challenges of long waiting times, overcrowding, and inefficient resource management.

## 🏥 Problem Statement Addressed

- **Long waiting times** in hospitals and clinics
- **Overcrowding** and patient frustration  
- **Inefficient staff** and resource management
- **Lack of transparency** in patient flow

## ✨ Key Features

### 🚨 SOS Emergency System
- **24/7 Emergency Response** with GPS location tracking
- **Automatic hospital alerts** for nearby medical facilities
- **Emergency contact notifications** to family members
- **Real-time emergency status** tracking
- **Integration with emergency services** (108, 100, 101)

### 🏥 Hospital Network
- **15+ Partner Hospitals** across Udupi district
- **Real-time availability** and capacity information
- **Specialty-wise filtering** (Emergency, Cardiology, Neurology, etc.)
- **Distance-based sorting** with accurate location data
- **Hospital ratings** and patient reviews
- **Facility information** (ICU, NICU, Ambulance, Pharmacy, etc.)

### 📅 Smart Booking System
- **Multi-step booking flow** with department and doctor selection
- **Real-time appointment scheduling** with availability
- **Doctor profiles** with ratings, experience, and consultation fees
- **Appointment type selection** (Consultation, Follow-up, Emergency, Surgery)
- **Urgency level classification** (Low, Medium, High, Urgent)
- **Insurance integration** with transparent pricing

### 👤 Enhanced Patient Profiles
- **Comprehensive medical history** management
- **Allergy and medication tracking**
- **Insurance information** storage
- **Emergency contact** management
- **Multi-tab organization** (Basic Info, Medical, Insurance, Emergency)

### 📱 Queue Management
- **Virtual check-in** system
- **Real-time queue position** tracking
- **Estimated wait time** calculations
- **Progress timeline** visualization
- **Mobile notifications** for queue updates

## 🏗️ Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive design
- **Radix UI** components for accessibility
- **Lucide React** for consistent iconography
- **React Router** for navigation
- **React Hook Form** for form management

### Backend & Database
- **Firebase** for authentication and real-time database
- **Firestore** for data storage
- **Firebase Analytics** for insights

### Key Dependencies
```json
{
  "@radix-ui/react-*": "Modern, accessible UI components",
  "framer-motion": "Smooth animations and transitions",
  "react-hook-form": "Efficient form handling",
  "date-fns": "Date manipulation utilities",
  "recharts": "Data visualization",
  "sonner": "Toast notifications"
}
```

## 🏥 Hospital Network (Udupi District)

### Major Partner Hospitals
1. **Kasturba Medical College Hospital**
   - Address: NH 66, Near Hiriadka, Udupi, Karnataka 576104
   - Phone: +91 820 292 2200
   - Specialties: Emergency, Cardiology, Neurology, Orthopedics, Pediatrics
   - Rating: 4.2/5
   - Facilities: ICU, NICU, Ambulance, Pharmacy, Laboratory, Radiology

2. **Dr. TMA Pai Hospital**
   - Address: Kunjibettu, Udupi, Karnataka 576102
   - Phone: +91 820 429 8000
   - Specialties: Emergency, Internal Medicine, Surgery, Gynecology, Dermatology
   - Rating: 4.0/5
   - Facilities: ICU, Ambulance, Pharmacy, Laboratory, X-Ray

3. **Manipal Hospital Udupi**
   - Address: Udupi-Hebri Road, Udupi, Karnataka 576101
   - Phone: +91 820 429 9000
   - Specialties: Emergency, Cardiology, Orthopedics, Pediatrics, ENT
   - Rating: 4.3/5
   - Facilities: ICU, NICU, Ambulance, Pharmacy, Laboratory, MRI, CT Scan

4. **Baliga Memorial Hospital**
   - Address: Bejai Kapikad, Udupi, Karnataka 576101
   - Phone: +91 820 429 7000
   - Specialties: Emergency, General Medicine, Pediatrics, Gynecology
   - Rating: 3.8/5
   - Facilities: ICU, Ambulance, Pharmacy, Laboratory

5. **Adarsha Hospital**
   - Address: Malpe Road, Udupi, Karnataka 576101
   - Phone: +91 820 429 6000
   - Specialties: Emergency, Cardiology, Neurology, Orthopedics
   - Rating: 4.1/5
   - Facilities: ICU, NICU, Ambulance, Pharmacy, Laboratory, Radiology, Dialysis

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MedConnect-Udupi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_PUBLIC_FIREBASE_API_KEY=your_api_key
   VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_PUBLIC_FIREBASE_APP_ID=your_app_id
   VITE_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📱 User Journey

### For Patients
1. **Registration**: Create account with email/password
2. **Profile Setup**: Complete comprehensive medical profile
3. **Hospital Selection**: Browse and select preferred hospital
4. **Booking**: Choose department, doctor, and appointment time
5. **Payment**: Secure payment processing with insurance integration
6. **Virtual Check-in**: Check in remotely and track queue position
7. **Real-time Updates**: Receive notifications about queue status

### For Emergency Situations
1. **SOS Activation**: Press emergency button or use SOS tab
2. **Location Sharing**: Automatic GPS location sharing
3. **Emergency Contacts**: Automatic notification to family
4. **Hospital Alerts**: Nearby hospitals receive emergency notification
5. **Real-time Tracking**: Track emergency response status

## 🔒 Security & Compliance

- **HIPAA Compliant** data handling
- **End-to-end encryption** for sensitive data
- **Secure authentication** with Firebase Auth
- **Role-based access control** (Patient, Staff, Admin)
- **Audit trails** for all medical interactions

## 🌐 Multi-language Support

- **English** (Primary)
- **Kannada** (Local language)
- **Tulu** (Regional language)

## 📊 Analytics & Insights

- **Patient flow analytics**
- **Hospital capacity utilization**
- **Wait time optimization**
- **Emergency response metrics**
- **User engagement tracking**

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

- **Emergency**: Call 108 (Ambulance)
- **Police**: Call 100
- **Fire**: Call 101
- **Technical Support**: support@medconnectudupi.com

## 🔮 Future Roadmap

- [ ] **Telemedicine integration** for remote consultations
- [ ] **AI-powered symptom checker** for initial diagnosis
- [ ] **Wearable device integration** for health monitoring
- [ ] **Blockchain-based medical records** for enhanced security
- [ ] **Voice commands** for accessibility
- [ ] **Offline mode** for areas with poor connectivity
- [ ] **Integration with government health schemes** (Ayushman Bharat)
- [ ] **Multi-city expansion** across Karnataka

---

**MedConnect Udupi** - Transforming healthcare access in Karnataka, one patient at a time. 🏥💙