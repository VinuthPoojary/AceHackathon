# Doctor Data Integration Guide

## Overview
The patient booking system has been updated to integrate with your doctor data structure from Firestore. The system now supports real-time doctor data fetching and displays doctors based on your data structure.

## Your Doctor Data Structure
```javascript
{
  availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  availableTime: "24/7",
  consultationFee: 200,
  createdAt: "October 5, 2025 at 11:25:30 PM UTC+5:30",
  experience: 5,
  hospitalId: "MGL001",
  hospitalName: "A.J. Hospital & Research Centre",
  name: "nithin",
  qualification: "done",
  specialization: "Emergency",
  status: "active"
}
```

## What Was Updated

### 1. Doctor Interface
- Updated the `Doctor` interface to match your data structure
- Added backward compatibility for existing fields
- Support for `availableDays` array and `availableTime` string

### 2. Firestore Integration
- Added `fetchDoctorsFromFirestore()` function
- Queries doctors by `hospitalId`, `specialization`, and `status`
- Falls back to hardcoded data if Firestore is unavailable

### 3. UI Updates
- Doctor cards now display:
  - Experience as number of years
  - Available days and time
  - Qualification information
  - Status-based filtering (only active doctors)

## How to Add Your Doctor Data

### Option 1: Use the Sample Script
1. Update the Firebase config in `add-sample-doctor.js`
2. Run: `node add-sample-doctor.js`
3. This will add the "nithin" doctor with Emergency specialization

### Option 2: Use Firebase Console
1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Create a collection called "doctors"
4. Add documents with your doctor data structure

### Option 3: Use the Comprehensive Script
1. Update the Firebase config in `add-sample-doctors.js`
2. Run: `node add-sample-doctors.js`
3. This will add multiple doctors with different specializations

## Testing the Integration

1. **Add Sample Data**: Use one of the scripts above to add doctor data
2. **Test Booking Flow**: 
   - Go to Patient Portal → Booking tab
   - Select a hospital
   - Choose a department that matches your doctor's specialization
   - Verify that your doctor appears in the list
3. **Verify Display**: Check that doctor information displays correctly:
   - Name, specialization, experience
   - Available days and time
   - Consultation fee

## Department Mapping
Make sure your doctor's `specialization` field matches the department IDs:
- "Emergency" → Emergency department
- "Cardiology" → Cardiology department
- "Orthopedics" → Orthopedics department
- "Pediatrics" → Pediatrics department
- "General Medicine" → General Medicine department

## Important Notes

1. **Hospital ID Matching**: Ensure your `hospitalId` in doctor data matches the hospital IDs in your system
2. **Status Field**: Only doctors with `status: "active"` will be displayed
3. **Fallback System**: If Firestore is unavailable, the system falls back to hardcoded data
4. **Real-time Updates**: Doctor availability is fetched in real-time from Firestore

## Troubleshooting

1. **No Doctors Showing**: Check that:
   - Hospital ID matches between doctor and hospital data
   - Specialization matches department name
   - Status is set to "active"

2. **Firestore Errors**: Check Firebase configuration and permissions

3. **Data Display Issues**: Verify that all required fields are present in your doctor documents

## Next Steps

1. Add your actual doctor data to Firestore
2. Test the booking flow with real data
3. Customize the display as needed
4. Add more doctors as required
