// Utility functions for doctor availability management

export interface DoctorAvailability {
  availableDays: string[];
  availableTime: string;
  holidays?: string[];
  status: string;
}

/**
 * Check if a doctor is available on a specific date
 */
export function isDoctorAvailableOnDate(
  doctor: DoctorAvailability, 
  date: Date
): boolean {
  // Check if doctor status is active
  if (doctor.status !== 'active') {
    return false;
  }

  // Get day name (e.g., 'Monday', 'Tuesday', etc.)
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Check if the day is in available days
  if (!doctor.availableDays.includes(dayName)) {
    return false;
  }

  // Check if the date is a holiday
  if (doctor.holidays && doctor.holidays.length > 0) {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    if (doctor.holidays.includes(dateString)) {
      return false;
    }
  }

  return true;
}

/**
 * Get available time slots for a doctor
 */
export function getAvailableTimeSlots(availableTime: string): string[] {
  switch (availableTime) {
    case '24/7':
      return [
        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
        '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
      ];
    case '6:00 AM - 12:00 PM':
      return ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'];
    case '9:00 AM - 5:00 PM':
      return ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
    case '10:00 AM - 6:00 PM':
      return ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
    case '2:00 PM - 10:00 PM':
      return ['2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];
    case '8:00 AM - 4:00 PM':
      return ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM'];
    case '12:00 PM - 8:00 PM':
      return ['12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];
    default:
      return ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
  }
}

/**
 * Get the next available date for a doctor
 */
export function getNextAvailableDate(doctor: DoctorAvailability): Date {
  const today = new Date();
  let checkDate = new Date(today);
  
  // Check up to 30 days ahead
  for (let i = 0; i < 30; i++) {
    if (isDoctorAvailableOnDate(doctor, checkDate)) {
      return checkDate;
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  // If no date found in 30 days, return today + 30 days
  return new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
}

/**
 * Format availability status for display
 */
export function formatAvailabilityStatus(doctor: DoctorAvailability): string {
  if (doctor.status !== 'active') {
    return 'Currently Unavailable';
  }

  if (doctor.availableTime === '24/7') {
    return 'Available 24/7';
  }

  const daysCount = doctor.availableDays.length;
  const daysText = daysCount === 7 ? 'All Days' : `${daysCount} Days`;
  
  return `${daysText} • ${doctor.availableTime}`;
}

/**
 * Check if a doctor is available right now
 */
export function isDoctorAvailableNow(doctor: DoctorAvailability): boolean {
  if (doctor.status !== 'active') {
    return false;
  }

  const now = new Date();
  
  // Check if today is an available day
  if (!isDoctorAvailableOnDate(doctor, now)) {
    return false;
  }

  // For 24/7 doctors, they're always available
  if (doctor.availableTime === '24/7') {
    return true;
  }

  // For specific time ranges, check if current time falls within range
  // This is a simplified check - in a real app, you'd parse the time range more precisely
  const currentHour = now.getHours();
  
  if (doctor.availableTime.includes('6:00 AM - 12:00 PM')) {
    return currentHour >= 6 && currentHour < 12;
  }
  if (doctor.availableTime.includes('9:00 AM - 5:00 PM')) {
    return currentHour >= 9 && currentHour < 17;
  }
  if (doctor.availableTime.includes('10:00 AM - 6:00 PM')) {
    return currentHour >= 10 && currentHour < 18;
  }
  if (doctor.availableTime.includes('2:00 PM - 10:00 PM')) {
    return currentHour >= 14 && currentHour < 22;
  }
  if (doctor.availableTime.includes('8:00 AM - 4:00 PM')) {
    return currentHour >= 8 && currentHour < 16;
  }
  if (doctor.availableTime.includes('12:00 PM - 8:00 PM')) {
    return currentHour >= 12 && currentHour < 20;
  }

  return false;
}
