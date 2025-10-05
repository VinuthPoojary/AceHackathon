# Patient Dashboard and Check-in Implementation

## 1. Patient Profile and Dashboard
- [x] Create PatientDashboard.tsx component with profile view/edit
- [x] Add profile fields: image, fullName, dob, phone, address, sex, married/unmarried, age (calculated)
- [x] Implement unique patient ID generation (PAXXXX format)
- [x] Update AuthProvider to manage profile data in Firestore
- [x] Add profile completion check

## 2. Check-in Enhancements
- [x] Modify PatientPortal to use tabs: Profile, Check-in
- [x] Enforce profile completion before check-in access
- [x] Auto-fill patient name and ID in check-in form
- [x] Add department selection with prices (INR₹)
- [x] Add appointment type selection with prices
- [x] Integrate dummy Razorpay payment gateway
- [x] Handle successful payment and queue assignment

## 3. Staff Dashboard Updates
- [x] Create checkins collection in Firestore for check-in data
- [x] Update StaffDashboard to display recent check-ins with patient IDs
- [x] Modify QueueManagement component to show checked-in patients

## 4. Routing and Navigation
- [ ] Update App.tsx routing if needed
- [ ] Ensure proper navigation after login to dashboard

## 5. Patient Dashboard Enhancements
- [x] Add email field to patient profile and editing UI
- [x] Ensure patient ID generation if not present
- [x] Add check-in history list to patient dashboard (mock data for now)
- [x] Add real-time IST clock component to patient dashboard
- [ ] Display appointment confirmation status based on check-in status

## 6. Staff Dashboard Enhancements
- [ ] Make department status clickable to show patient lists with name and ID
- [ ] Add accept button for check-in requests (status "waiting")
- [ ] Update check-in status to "accepted" upon acceptance
- [ ] Show dynamic patient counts per department

## 7. Check-in Status Management
- [ ] Update checkins collection to include status field (waiting, accepted, completed)
- [ ] Implement real-time Firestore listeners for dynamic updates
- [ ] Update patient dashboard to show confirmation message for accepted appointments

## 8. Testing and Validation
- [ ] Test end-to-end flow: login -> profile -> check-in -> payment -> staff view -> acceptance -> patient confirmation
- [ ] Validate profile completion enforcement
- [ ] Test payment flow with dummy Razorpay
- [ ] Test real-time updates and dynamic features
