import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { sendQueueNotification } from './notificationService';

export interface QueueEntry {
  id: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctorId?: string;
  doctorName?: string;
  appointmentType: string;
  queueNumber: number;
  status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'cancelled';
  estimatedWaitTime: number; // in minutes
  actualWaitTime?: number; // in minutes
  bookingId: string;
  createdAt: any;
  calledAt?: any;
  completedAt?: any;
  priority: 'normal' | 'high' | 'urgent';
  notes?: string;
}

export interface HospitalQueue {
  hospitalId: string;
  hospitalName: string;
  department: string;
  currentQueue: QueueEntry[];
  activeQueueNumber: number;
  totalPatientsToday: number;
  averageWaitTime: number;
  lastUpdated: any;
}

// Generate a unique queue number for a hospital and department
export const generateQueueNumber = async (hospitalId: string, department: string): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const queueQuery = query(
      collection(db, 'queue_entries'),
      where('hospitalId', '==', hospitalId),
      where('department', '==', department),
      where('createdAt', '>=', today)
    );
    
    const snapshot = await getDocs(queueQuery);
    
    if (snapshot.empty) {
      return 1; // First patient of the day
    }
    
    // Find the highest queue number from the results
    const entries = snapshot.docs.map(doc => doc.data());
    const maxQueueNumber = Math.max(...entries.map(entry => entry.queueNumber || 0));
    
    return maxQueueNumber + 1;
  } catch (error) {
    console.error('Error generating queue number:', error);
    throw new Error('Failed to generate queue number');
  }
};

// Add a patient to the queue
export const addToQueue = async (queueData: Omit<QueueEntry, 'id' | 'queueNumber' | 'createdAt' | 'status'>): Promise<string> => {
  try {
    const queueNumber = await generateQueueNumber(queueData.hospitalId, queueData.department);
    
    const queueEntry = {
      ...queueData,
      queueNumber,
      status: 'waiting' as const,
      createdAt: serverTimestamp(),
      estimatedWaitTime: calculateEstimatedWaitTime(queueData.department, queueNumber)
    };
    
    const docRef = await addDoc(collection(db, 'queue_entries'), queueEntry);
    return docRef.id;
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw new Error('Failed to add patient to queue');
  }
};

// Update queue entry status
export const updateQueueStatus = async (queueId: string, status: QueueEntry['status'], notes?: string): Promise<void> => {
  try {
    // Get current queue entry data before update
    const queueDoc = await getDocs(query(collection(db, 'queue_entries'), where('__name__', '==', queueId)));
    if (queueDoc.empty) {
      throw new Error('Queue entry not found');
    }

    const currentData = queueDoc.docs[0].data() as QueueEntry;
    const previousStatus = currentData.status;

    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'called') {
      updateData.calledAt = serverTimestamp();
    } else if (status === 'completed') {
      updateData.completedAt = serverTimestamp();
      // Calculate actual wait time
      const createdAt = currentData.createdAt?.toDate();
      const completedAt = new Date();
      if (createdAt) {
        updateData.actualWaitTime = Math.round((completedAt.getTime() - createdAt.getTime()) / (1000 * 60));
      }
    }

    if (notes) {
      updateData.notes = notes;
    }

    await updateDoc(doc(db, 'queue_entries', queueId), updateData);

    // Send notification if status changed
    if (previousStatus !== status) {
      try {
        await sendQueueNotification({
          patientId: currentData.patientId,
          patientName: currentData.patientName,
          hospitalName: currentData.hospitalName,
          department: currentData.department,
          queueNumber: currentData.queueNumber,
          status,
          estimatedWaitTime: currentData.estimatedWaitTime,
          message: `Your queue status has been updated to ${status}`
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't throw error to avoid breaking queue operations
      }
    }
  } catch (error) {
    console.error('Error updating queue status:', error);
    throw new Error('Failed to update queue status');
  }
};

// Get current queue for a hospital and department
export const getHospitalQueue = (hospitalId: string, department: string, callback: (queue: QueueEntry[]) => void) => {
  const queueQuery = query(
    collection(db, 'queue_entries'),
    where('hospitalId', '==', hospitalId),
    where('department', '==', department),
    where('status', 'in', ['waiting', 'called', 'in_progress'])
  );
  
  return onSnapshot(queueQuery, (snapshot) => {
    const queue = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as QueueEntry[];
    
    // Sort by queue number on the client side
    const sortedQueue = queue.sort((a, b) => a.queueNumber - b.queueNumber);
    callback(sortedQueue);
  });
};

// Get all queues for a hospital
export const getHospitalQueues = (hospitalId: string, callback: (queues: HospitalQueue[]) => void) => {
  const queueQuery = query(
    collection(db, 'queue_entries'),
    where('hospitalId', '==', hospitalId),
    where('status', 'in', ['waiting', 'called', 'in_progress'])
  );
  
  return onSnapshot(queueQuery, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as QueueEntry[];
    
    // Sort by department first, then by queue number
    const sortedEntries = entries.sort((a, b) => {
      if (a.department !== b.department) {
        return a.department.localeCompare(b.department);
      }
      return a.queueNumber - b.queueNumber;
    });
    
    // Group by department
    const departmentQueues = sortedEntries.reduce((acc, entry) => {
      const key = entry.department;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry);
      return acc;
    }, {} as Record<string, QueueEntry[]>);
    
    const queues: HospitalQueue[] = Object.entries(departmentQueues).map(([department, queue]) => ({
      hospitalId,
      hospitalName: queue[0]?.hospitalName || '',
      department,
      currentQueue: queue,
      activeQueueNumber: queue.find(entry => entry.status === 'called')?.queueNumber || 0,
      totalPatientsToday: queue.length,
      averageWaitTime: calculateAverageWaitTime(queue),
      lastUpdated: new Date()
    }));
    
    callback(queues);
  });
};

// Get patient's queue position
export const getPatientQueuePosition = (patientId: string, hospitalId: string, callback: (position: QueueEntry | null) => void) => {
  const queueQuery = query(
    collection(db, 'queue_entries'),
    where('patientId', '==', patientId),
    where('hospitalId', '==', hospitalId),
    where('status', 'in', ['waiting', 'called', 'in_progress']),
    limit(1)
  );
  
  return onSnapshot(queueQuery, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }
    
    const entry = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as QueueEntry;
    
    callback(entry);
  });
};

// Calculate estimated wait time based on department and queue position
const calculateEstimatedWaitTime = (department: string, queueNumber: number, doctorId?: string): number => {
  const baseWaitTimes: Record<string, number> = {
    'Emergency': 10,
    'Cardiology': 25,
    'Neurology': 30,
    'Orthopedics': 20,
    'Pediatrics': 15,
    'Gynecology': 20,
    'Dermatology': 15,
    'Ophthalmology': 15,
    'ENT': 15,
    'General Medicine': 20,
    'Internal Medicine': 20,
    'Surgery': 25,
    'Oncology': 30,
    'Radiation Therapy': 35,
    'Chemotherapy': 40
  };
  
  const baseTime = baseWaitTimes[department] || 20;
  return baseTime + (queueNumber - 1) * 5; // Each patient adds 5 minutes
};

// Calculate average wait time for a queue
const calculateAverageWaitTime = (queue: QueueEntry[]): number => {
  const completedEntries = queue.filter(entry => entry.actualWaitTime);
  if (completedEntries.length === 0) {
    return queue[0]?.estimatedWaitTime || 20;
  }
  
  const totalWaitTime = completedEntries.reduce((sum, entry) => sum + (entry.actualWaitTime || 0), 0);
  return Math.round(totalWaitTime / completedEntries.length);
};

// Get queue statistics for a hospital
export const getQueueStatistics = async (hospitalId: string, date?: Date): Promise<{
  totalPatients: number;
  averageWaitTime: number;
  completedPatients: number;
  cancelledPatients: number;
  departments: Record<string, number>;
}> => {
  try {
    const startDate = date || new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);
    
    const queueQuery = query(
      collection(db, 'queue_entries'),
      where('hospitalId', '==', hospitalId),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate)
    );
    
    const snapshot = await getDocs(queueQuery);
    const entries = snapshot.docs.map(doc => doc.data()) as QueueEntry[];
    
    const completedPatients = entries.filter(entry => entry.status === 'completed').length;
    const cancelledPatients = entries.filter(entry => entry.status === 'cancelled').length;
    
    const departments = entries.reduce((acc, entry) => {
      acc[entry.department] = (acc[entry.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const completedWithWaitTime = entries.filter(entry => 
      entry.status === 'completed' && entry.actualWaitTime
    );
    
    const averageWaitTime = completedWithWaitTime.length > 0 
      ? Math.round(completedWithWaitTime.reduce((sum, entry) => sum + (entry.actualWaitTime || 0), 0) / completedWithWaitTime.length)
      : 0;
    
    return {
      totalPatients: entries.length,
      averageWaitTime,
      completedPatients,
      cancelledPatients,
      departments
    };
  } catch (error) {
    console.error('Error getting queue statistics:', error);
    throw new Error('Failed to get queue statistics');
  }
};

// Cancel a queue entry
export const cancelQueueEntry = async (queueId: string, reason?: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'queue_entries', queueId), {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancellationReason: reason,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error cancelling queue entry:', error);
    throw new Error('Failed to cancel queue entry');
  }
};

// Call next patient in queue
export const callNextPatient = async (hospitalId: string, department: string): Promise<QueueEntry | null> => {
  try {
    const queueQuery = query(
      collection(db, 'queue_entries'),
      where('hospitalId', '==', hospitalId),
      where('department', '==', department),
      where('status', '==', 'waiting')
    );
    
    const snapshot = await getDocs(queueQuery);
    
    if (snapshot.empty) {
      return null; // No patients waiting
    }
    
    // Find the patient with the lowest queue number
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as QueueEntry[];
    
    const nextPatient = entries.reduce((min, current) => 
      current.queueNumber < min.queueNumber ? current : min
    );
    
    await updateDoc(doc(db, 'queue_entries', nextPatient.id), {
      status: 'called',
      calledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return nextPatient;
  } catch (error) {
    console.error('Error calling next patient:', error);
    throw new Error('Failed to call next patient');
  }
};

// Create queue entries from confirmed bookings
export const createQueueFromBookings = async (): Promise<void> => {
  try {
    // Get all confirmed bookings for today
    const today = new Date().toISOString().split('T')[0];
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('appointmentDate', '==', today),
      where('status', '==', 'confirmed')
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    
    for (const bookingDoc of bookingsSnapshot.docs) {
      const booking = bookingDoc.data();
      
      // Check if queue entry already exists for this booking
      const existingQueueQuery = query(
        collection(db, 'queue_entries'),
        where('bookingId', '==', booking.id)
      );
      
      const existingQueueSnapshot = await getDocs(existingQueueQuery);
      
      if (!existingQueueSnapshot.empty) {
        continue; // Queue entry already exists
      }
      
      // Create queue entry from booking
      const queueData = {
        patientId: booking.patientId,
        patientName: booking.patientName,
        hospitalId: booking.hospitalId,
        hospitalName: booking.hospitalName,
        department: booking.department,
        doctorId: booking.doctorId,
        doctorName: booking.doctorName,
        appointmentType: 'consultation',
        bookingId: booking.id,
        priority: booking.priority || 'normal',
        notes: booking.symptoms || booking.notes
      };
      
      await addToQueue(queueData);
      console.log(`✅ Created queue entry for booking ${booking.id}`);
    }
    
    console.log(`✅ Processed ${bookingsSnapshot.docs.length} bookings for queue creation`);
  } catch (error) {
    console.error('Error creating queue from bookings:', error);
    throw new Error('Failed to create queue entries from bookings');
  }
};

// Get queue entries for a specific doctor
export const getDoctorQueue = (doctorId: string, callback: (queue: QueueEntry[]) => void) => {
  const queueQuery = query(
    collection(db, 'queue_entries'),
    where('doctorId', '==', doctorId),
    where('status', 'in', ['waiting', 'called', 'in_progress'])
  );
  
  return onSnapshot(queueQuery, (snapshot) => {
    const queue = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as QueueEntry[];
    
    // Sort by queue number
    const sortedQueue = queue.sort((a, b) => a.queueNumber - b.queueNumber);
    callback(sortedQueue);
  });
};

// Update booking status when queue entry is completed
export const completeQueueEntry = async (queueId: string, notes?: string): Promise<void> => {
  try {
    // Update queue entry status
    await updateQueueStatus(queueId, 'completed', notes);
    
    // Get the queue entry to find the associated booking
    const queueDoc = await getDocs(query(collection(db, 'queue_entries'), where('__name__', '==', queueId)));
    
    if (!queueDoc.empty) {
      const queueData = queueDoc.docs[0].data();
      
      if (queueData.bookingId) {
        // Update the associated booking status
        await updateDoc(doc(db, 'bookings', queueData.bookingId), {
          status: 'completed',
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log(`✅ Updated booking ${queueData.bookingId} status to completed`);
      }
    }
  } catch (error) {
    console.error('Error completing queue entry:', error);
    throw new Error('Failed to complete queue entry');
  }
};
