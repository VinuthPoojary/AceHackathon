# TODO for Enhanced Booking Flow - Patients in Queue Feature

## Completed
- Added Firestore listener on "checkins" collection filtered by selected hospital to track patients in queue count per department.
- Updated department selection UI to display patients in queue count alongside doctors available.
- Managed state for patientsInQueueCount and updated it in real-time using onSnapshot.
- Ensured proper cleanup of Firestore listener on component unmount or hospital change.

## Next Steps
- Test the feature end-to-end to verify real-time updates of patients in queue count.
- Verify UI responsiveness and correctness for different hospitals and departments.
- Optionally, add loading or error handling states for Firestore listener.
- Review and optimize Firestore query if needed for performance.
