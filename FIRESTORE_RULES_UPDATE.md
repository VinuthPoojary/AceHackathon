# Firestore Rules Update Required

## Issue
The staff registration is failing due to Firestore security rules. The rules are preventing the creation of staff documents during registration.

## Solution
You need to update your Firestore security rules in the Firebase Console.

### Steps to Update Rules:

1. **Go to Firebase Console:**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project (queuemanage-74b9c)

2. **Navigate to Firestore Rules:**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab

3. **Replace the existing rules with the updated version:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions for role-based access
    function isPatient() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/patients/$(request.auth.uid));
    }
    
    function isStaff() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/staff/$(request.auth.uid));
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    function isValidStaffId() {
      return request.auth != null && 
             get(/databases/$(database)/documents/staff/$(request.auth.uid)).data.staffId in ['STAFF001', 'STAFF002', 'STAFF003'];
    }
    
    // Patient profiles - patients can only access their own data
    match /patients/{userId} {
      allow read, write: if isOwner(userId);
      allow read: if isStaff(); // Staff can read patient profiles for medical purposes
    }
    
    // Staff profiles - staff can only access their own data
    match /staff/{userId} {
      allow read, write: if isOwner(userId) && isValidStaffId();
      allow read: if isStaff(); // Staff can read other staff profiles
      allow create: if isOwner(userId) && request.auth != null && 
                       request.resource.data.keys().hasAll(['name', 'email', 'staffId', 'hospitalId', 'createdAt']) &&
                       request.resource.data.staffId in ['STAFF001', 'STAFF002', 'STAFF003'];
    }
    
    // Bookings - patients can create/read their own, staff can read/update all
    match /bookings/{bookingId} {
      allow read: if isPatient() && resource.data.patientId == request.auth.uid;
      allow read: if isStaff();
      allow create: if isPatient() && 
                       request.auth.uid == request.resource.data.patientId &&
                       request.resource.data.keys().hasAll(['patientId', 'hospital', 'doctor', 'department', 'appointmentType', 'preferredDate', 'status', 'bookingDate', 'bookingId']) &&
                       request.resource.data.status in ['confirmed', 'pending'];
      allow update: if isStaff() && 
                       request.resource.data.keys().hasAll(['status']) &&
                       request.resource.data.status in ['confirmed', 'pending', 'completed', 'cancelled', 'rescheduled'];
      allow delete: if isStaff();
    }
    
    // Check-ins/Queue management - patients can create their own, staff can manage all
    match /checkins/{checkinId} {
      allow read: if isPatient() && resource.data.patientId == request.auth.uid;
      allow read: if isStaff();
      allow create: if isPatient() && 
                       request.auth.uid == request.resource.data.patientId &&
                       request.resource.data.keys().hasAll(['patientId', 'patientName', 'department', 'appointmentType', 'checkedInAt', 'status']) &&
                       request.resource.data.status == 'waiting';
      allow update: if isStaff() && 
                       request.resource.data.keys().hasAll(['status']) &&
                       request.resource.data.status in ['waiting', 'in_progress', 'completed', 'cancelled'];
      allow delete: if isStaff();
    }
    
    // Emergency records - patients can create their own, staff can read all for emergency response
    match /emergencies/{emergencyId} {
      allow read: if isPatient() && resource.data.patientId == request.auth.uid;
      allow read: if isStaff();
      allow create: if isPatient() && 
                       request.auth.uid == request.resource.data.patientId &&
                       request.resource.data.keys().hasAll(['patientId', 'emergencyType', 'location', 'timestamp', 'status']) &&
                       request.resource.data.status == 'active';
      allow update: if isStaff() && 
                       request.resource.data.keys().hasAll(['status']) &&
                       request.resource.data.status in ['active', 'responded', 'resolved', 'cancelled'];
    }
    
    // Hospital data - read-only for all authenticated users
    match /hospitals/{hospitalId} {
      allow read: if request.auth != null;
      allow write: if isStaff(); // Only staff can update hospital information
    }
    
    // Doctor profiles - read-only for patients, staff can manage
    match /doctors/{doctorId} {
      allow read: if request.auth != null;
      allow write: if isStaff();
    }
    
    // Analytics and reports - staff only
    match /analytics/{reportId} {
      allow read, write: if isStaff();
    }
    
    // System settings and configurations - staff only
    match /settings/{settingId} {
      allow read, write: if isStaff();
    }
    
    // Audit logs - read-only for staff
    match /audit_logs/{logId} {
      allow read: if isStaff();
      allow create: if request.auth != null; // System can create audit logs
    }
    
    // Deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. **Publish the Rules:**
   - Click "Publish" button
   - Wait for the rules to be deployed

### Key Changes Made:
- Added `allow create` rule for staff documents during registration
- Validates that the staff ID is one of the valid IDs (STAFF001, STAFF002, STAFF003)
- Ensures all required fields are present in the document

### After Updating Rules:
1. Try registering a staff member again with:
   - Email: `test.staff@hospital.com`
   - Password: `password123`
   - Staff ID: `STAFF001`
   - Hospital: Any hospital

2. The registration should now work successfully!

### Alternative: Temporary Test Rules
If you want to test quickly, you can temporarily use these permissive rules (NOT for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Remember to revert to the secure rules after testing!
