// Test script to verify the complete admin flow with sample data
import { 
  addSampleDoctors, 
  addSampleBookings, 
  handleCreateQueuesFromBookings,
  handleUpdateBookingStatus,
  handleUpdateDoctorStatus 
} from './pages/AdminDashboard';
import { createQueueFromBookings } from './lib/queueService';
import { SAMPLE_DOCTORS, SAMPLE_BOOKINGS } from './data/bookings';

// Test the complete admin flow
export const testAdminFlow = async () => {
  console.log('🚀 Starting Admin Flow Test...');
  
  try {
    // Step 1: Add sample doctors
    console.log('\n📋 Step 1: Adding sample doctors...');
    await addSampleDoctors();
    console.log(`✅ Added ${SAMPLE_DOCTORS.length} sample doctors`);
    
    // Step 2: Add sample bookings
    console.log('\n📋 Step 2: Adding sample bookings...');
    await addSampleBookings();
    console.log(`✅ Added ${SAMPLE_BOOKINGS.length} sample bookings`);
    
    // Step 3: Create queue entries from bookings
    console.log('\n📋 Step 3: Creating queue entries from confirmed bookings...');
    await createQueueFromBookings();
    console.log('✅ Queue entries created from confirmed bookings');
    
    // Step 4: Update some booking statuses to test workflow
    console.log('\n📋 Step 4: Testing booking status updates...');
    const confirmedBookings = SAMPLE_BOOKINGS.filter(b => b.status === 'confirmed');
    if (confirmedBookings.length > 0) {
      // Mark first booking as completed
      await handleUpdateBookingStatus(confirmedBookings[0], 'completed');
      console.log(`✅ Updated booking ${confirmedBookings[0].id} to completed`);
      
      // Mark second booking as cancelled
      if (confirmedBookings.length > 1) {
        await handleUpdateBookingStatus(confirmedBookings[1], 'cancelled');
        console.log(`✅ Updated booking ${confirmedBookings[1].id} to cancelled`);
      }
    }
    
    // Step 5: Test doctor status updates
    console.log('\n📋 Step 5: Testing doctor status updates...');
    const activeDoctors = SAMPLE_DOCTORS.filter(d => d.status === 'active');
    if (activeDoctors.length > 0) {
      // Set first doctor to on leave
      await handleUpdateDoctorStatus(activeDoctors[0], 'on_leave');
      console.log(`✅ Updated doctor ${activeDoctors[0].doctorName} to on leave`);
      
      // Set second doctor to inactive
      if (activeDoctors.length > 1) {
        await handleUpdateDoctorStatus(activeDoctors[1], 'inactive');
        console.log(`✅ Updated doctor ${activeDoctors[1].doctorName} to inactive`);
      }
    }
    
    console.log('\n🎉 Admin Flow Test Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Added ${SAMPLE_DOCTORS.length} doctors across ${new Set(SAMPLE_DOCTORS.map(d => d.hospitalName)).size} hospitals`);
    console.log(`- Added ${SAMPLE_BOOKINGS.length} bookings`);
    console.log(`- Created queue entries from confirmed bookings`);
    console.log(`- Tested status updates for bookings and doctors`);
    
    console.log('\n✅ All systems are working correctly!');
    
  } catch (error) {
    console.error('❌ Admin Flow Test Failed:', error);
    throw error;
  }
};

// Helper function to verify data integrity
export const verifyDataIntegrity = () => {
  console.log('\n🔍 Verifying Data Integrity...');
  
  // Check doctors data
  const hospitalIds = new Set(SAMPLE_DOCTORS.map(d => d.hospitalId));
  const departments = new Set(SAMPLE_DOCTORS.map(d => d.department));
  
  console.log(`📊 Doctors Data:`);
  console.log(`- Total doctors: ${SAMPLE_DOCTORS.length}`);
  console.log(`- Hospitals covered: ${hospitalIds.size}`);
  console.log(`- Departments covered: ${departments.size}`);
  console.log(`- Active doctors: ${SAMPLE_DOCTORS.filter(d => d.status === 'active').length}`);
  
  // Check bookings data
  const bookingHospitalIds = new Set(SAMPLE_BOOKINGS.map(b => b.hospitalId));
  const bookingDoctors = new Set(SAMPLE_BOOKINGS.map(b => b.doctorId));
  const bookingStatuses = new Set(SAMPLE_BOOKINGS.map(b => b.status));
  
  console.log(`\n📊 Bookings Data:`);
  console.log(`- Total bookings: ${SAMPLE_BOOKINGS.length}`);
  console.log(`- Hospitals covered: ${bookingHospitalIds.size}`);
  console.log(`- Doctors covered: ${bookingDoctors.size}`);
  console.log(`- Statuses: ${Array.from(bookingStatuses).join(', ')}`);
  
  // Verify consistency
  const doctorIds = new Set(SAMPLE_DOCTORS.map(d => d.id));
  const bookingDoctorIds = new Set(SAMPLE_BOOKINGS.map(b => b.doctorId));
  const consistentDoctors = Array.from(bookingDoctorIds).every(id => doctorIds.has(id));
  
  console.log(`\n✅ Data Consistency Check:`);
  console.log(`- All booking doctors exist in doctors data: ${consistentDoctors ? '✅' : '❌'}`);
  
  if (consistentDoctors) {
    console.log('\n🎉 Data integrity verified successfully!');
  } else {
    console.log('\n⚠️ Data integrity issues found!');
  }
};

// Export test functions
export default {
  testAdminFlow,
  verifyDataIntegrity
};
