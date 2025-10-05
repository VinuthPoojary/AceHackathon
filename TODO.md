# TODO: Hospital Queue Management System Enhancements

## 1. Automated Patient Notifications
- [x] Create Firebase Cloud Function for queue status change notifications
- [x] Integrate SMS provider (Twilio) for SMS notifications
- [x] Update email service to handle queue notifications
- [x] Add notification preferences UI component
- [x] Modify queue update logic to trigger notifications

## 2. Analytics and Reporting Dashboard
- [ ] Create AnalyticsDashboard.tsx component
- [ ] Implement Firestore queries for patient flow metrics
- [ ] Add average wait times calculation
- [ ] Add queue length analytics
- [ ] Add resource utilization metrics
- [ ] Integrate chart library for data visualization
- [ ] Add analytics tab to AdminDashboard.tsx

## 3. Priority-based Dynamic Queueing
- [ ] Enhance queueService.ts with priority recalculation logic
- [ ] Update QueueManagement.tsx for dynamic priority display
- [ ] Update RealTimeQueueDetails.tsx for dynamic wait times
- [ ] Implement backend queue order recalculation
- [ ] Add priority badges and indicators
- [ ] Test priority queueing functionality

## 4. Patient Feedback System
- [ ] Create FeedbackForm.tsx component
- [ ] Add feedback submission to EnhancedBookingFlow.tsx
- [ ] Create Firestore collection for feedback
- [ ] Add feedback review UI to AdminDashboard.tsx
- [ ] Implement feedback analytics and reports
- [ ] Add feedback ratings and comments

## General Tasks
- [x] Update QueueDisplay.tsx to show dynamic queue data instead of dummy data
- [x] Add department selection to QueueDisplay.tsx
- [ ] Update dependencies if needed (chart libraries, SMS providers)
- [ ] Test all new features thoroughly
- [ ] Update documentation
- [ ] Deploy and monitor
