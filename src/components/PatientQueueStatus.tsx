import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, MapPin, Phone, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { getPatientQueuePosition, type QueueEntry } from '@/lib/queueService';

interface PatientBooking {
  id: string;
  bookingId: string;
  patientName: string;
  hospitalName: string;
  department: string;
  doctorName: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  queueNumber?: number;
  queueId?: string;
  urgency?: string;
  priority?: string;
  estimatedWaitTime?: number;
  totalPrice: number;
  paymentStatus: string;
}

const PatientQueueStatus: React.FC = () => {
  const { currentUser } = useAuth();
  const [patientBookings, setPatientBookings] = useState<PatientBooking[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueEntry | null>(null);
  const [allTodayPatients, setAllTodayPatients] = useState<QueueEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Update clock every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to patient's bookings
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('patientId', '==', currentUser.uid),
      where('status', 'in', ['confirmed', 'pending'])
    );

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PatientBooking[];
      
      // Sort by booking date on the client side
      const sortedBookings = bookings.sort((a, b) => 
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );
      
      setPatientBookings(sortedBookings);
      setLoading(false);

      // Get queue status for the most recent active booking
      if (bookings.length > 0) {
        const activeBooking = bookings.find(b => b.queueId);
        if (activeBooking) {
          // Listen to queue status for this booking
          const unsubscribeQueue = getPatientQueuePosition(
            currentUser.uid, 
            activeBooking.hospitalId || '', 
            (position) => {
              setQueueStatus(position);
            }
          );

          return () => unsubscribeQueue();
        }
      }
    });

    // Fetch all patients for today from queue entries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayQueueQuery = query(
      collection(db, 'queue_entries'),
      where('createdAt', '>=', today),
      where('createdAt', '<', tomorrow)
    );

    const unsubscribeTodayPatients = onSnapshot(todayQueueQuery, (snapshot) => {
      const todayPatients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QueueEntry[];
      
      setAllTodayPatients(todayPatients);
    });

    return () => {
      unsubscribeBookings();
      unsubscribeTodayPatients();
    };
  }, [currentUser]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getQueueStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="secondary">Waiting</Badge>;
      case 'called':
        return <Badge variant="default" className="bg-blue-500">Called</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-green-500">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="default">High Priority</Badge>;
      case 'normal':
        return <Badge variant="secondary">Normal</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getQueuePositionMessage = (queueStatus: QueueEntry | null) => {
    if (!queueStatus) return null;

    switch (queueStatus.status) {
      case 'waiting':
        return {
          message: `You are #${queueStatus.queueNumber} in the queue`,
          color: 'text-blue-600',
          icon: <Clock className="w-5 h-5" />
        };
      case 'called':
        return {
          message: 'You have been called! Please proceed to the consultation room.',
          color: 'text-green-600',
          icon: <Bell className="w-5 h-5" />
        };
      case 'in_progress':
        return {
          message: 'Your consultation is in progress',
          color: 'text-purple-600',
          icon: <User className="w-5 h-5" />
        };
      case 'completed':
        return {
          message: 'Your consultation has been completed',
          color: 'text-gray-600',
          icon: <CheckCircle className="w-5 h-5" />
        };
      default:
        return {
          message: 'Queue status unknown',
          color: 'text-gray-600',
          icon: <AlertCircle className="w-5 h-5" />
        };
    }
  };

  const groupPatientsByHospitalAndDepartment = (patients: QueueEntry[]) => {
    const grouped = patients.reduce((acc, patient) => {
      const key = `${patient.hospitalId}-${patient.department}`;
      if (!acc[key]) {
        acc[key] = {
          hospitalId: patient.hospitalId,
          hospitalName: patient.hospitalName,
          department: patient.department,
          patients: []
        };
      }
      acc[key].patients.push(patient);
      return acc;
    }, {} as Record<string, { hospitalId: string; hospitalName: string; department: string; patients: QueueEntry[] }>);

    // Sort patients within each group by priority and queue number
    Object.values(grouped).forEach(group => {
      group.patients.sort((a, b) => {
        // Urgent patients first
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
        
        // High priority next
        if (a.priority === 'high' && b.priority === 'normal') return -1;
        if (b.priority === 'high' && a.priority === 'normal') return 1;
        
        // Then by queue number (first come, first serve)
        return a.queueNumber - b.queueNumber;
      });
    });

    return grouped;
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your queue status...</p>
        </CardContent>
      </Card>
    );
  }

  if (patientBookings.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6" />
            My Queue Status
          </CardTitle>
          <CardDescription>Your current appointments and queue positions</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium mb-2">No Active Appointments</h3>
          <p className="text-muted-foreground">You don't have any active appointments or queue positions.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Book an appointment to see your queue status here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeBooking = patientBookings.find(b => b.status === 'confirmed' && b.queueId);
  const queueMessage = getQueuePositionMessage(queueStatus);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Current Time Display */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Current Time</h3>
              <p className="text-sm text-muted-foreground">Live time reference</p>
            </div>
            <div className="text-2xl font-mono bg-white px-4 py-2 rounded-lg shadow-sm">
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: true, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Queue Summary */}
      {allTodayPatients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Patients Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{allTodayPatients.length}</div>
              <p className="text-xs text-muted-foreground">Across all hospitals</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {new Set(allTodayPatients.map(p => p.hospitalId)).size}
              </div>
              <p className="text-xs text-muted-foreground">With bookings today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Departments Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {new Set(allTodayPatients.map(p => p.department)).size}
              </div>
              <p className="text-xs text-muted-foreground">Different departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {allTodayPatients.filter(p => p.priority === 'urgent').length}
              </div>
              <p className="text-xs text-muted-foreground">Priority cases</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Queue Status */}
      {activeBooking && queueStatus && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              Current Queue Status
            </CardTitle>
            <CardDescription>Your live queue position and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Queue Number:</span>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    #{queueStatus.queueNumber}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {getQueueStatusBadge(queueStatus.status)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Priority:</span>
                  {getPriorityBadge(queueStatus.priority)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Est. Wait Time:</span>
                  <span className="text-orange-600 font-semibold">
                    {queueStatus.estimatedWaitTime} minutes
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Hospital:</span>
                  <p className="text-sm text-muted-foreground">{queueStatus.hospitalName}</p>
                </div>
                <div>
                  <span className="font-medium">Department:</span>
                  <p className="text-sm text-muted-foreground">{queueStatus.department}</p>
                </div>
                <div>
                  <span className="font-medium">Doctor:</span>
                  <p className="text-sm text-muted-foreground">{queueStatus.doctorName || 'Not assigned'}</p>
                </div>
                <div>
                  <span className="font-medium">Booking ID:</span>
                  <p className="text-sm font-mono text-muted-foreground">{queueStatus.bookingId}</p>
                </div>
              </div>
            </div>

            {queueMessage && (
              <div className={`flex items-center gap-2 p-4 rounded-lg bg-white border ${queueMessage.color}`}>
                {queueMessage.icon}
                <span className="font-medium">{queueMessage.message}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Today's Queue - All Patients */}
      {allTodayPatients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              Today's Queue - All Patients
              <Badge variant="secondary">{allTodayPatients.length} patients</Badge>
            </CardTitle>
            <CardDescription>
              View all patients booked for today across all hospitals and departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupPatientsByHospitalAndDepartment(allTodayPatients)).map(([key, group]) => (
                <Card key={key} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{group.hospitalName}</CardTitle>
                        <CardDescription>{group.department} Department</CardDescription>
                      </div>
                      <Badge variant="outline">
                        {group.patients.length} patients
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.patients.map((patient, index) => {
                        const isCurrentUser = currentUser && patient.patientId === currentUser.uid;
                        const isCurrent = patient.status === 'called' || patient.status === 'in_progress';
                        const isNext = patient.status === 'waiting' && 
                          group.patients.filter(p => p.status === 'waiting').indexOf(patient) === 0;
                        const isUpcoming = patient.status === 'waiting' && 
                          group.patients.filter(p => p.status === 'waiting').indexOf(patient) === 1;
                        
                        return (
                          <div
                            key={patient.id}
                            className={`p-4 rounded-lg border transition-all ${
                              isCurrentUser 
                                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400' 
                                : isCurrent 
                                ? 'bg-green-50 border-green-200 ring-2 ring-green-300' 
                                : isNext 
                                ? 'bg-yellow-50 border-yellow-200' 
                                : isUpcoming
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                  isCurrentUser 
                                    ? 'bg-blue-500' 
                                    : isCurrent 
                                    ? 'bg-green-500' 
                                    : isNext 
                                    ? 'bg-yellow-500' 
                                    : isUpcoming 
                                    ? 'bg-orange-500' 
                                    : 'bg-gray-500'
                                }`}>
                                  {patient.queueNumber}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className={`font-medium ${isCurrentUser ? 'text-blue-700' : ''}`}>
                                      {patient.patientName}
                                      {isCurrentUser && <span className="text-xs text-blue-600 ml-2">(You)</span>}
                                    </h4>
                                    {getPriorityBadge(patient.priority)}
                                    {isCurrentUser && <Badge variant="default" className="bg-blue-600">Your Booking</Badge>}
                                    {isCurrent && !isCurrentUser && <Badge variant="default">Ongoing</Badge>}
                                    {isNext && !isCurrentUser && <Badge variant="default">Up Next</Badge>}
                                    {isUpcoming && !isCurrentUser && <Badge variant="secondary">Be Ready</Badge>}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Booking ID: {patient.bookingId}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Doctor: {patient.doctorName || 'Not assigned'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Type: {patient.appointmentType} | Est. wait: {patient.estimatedWaitTime} min
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getQueueStatusBadge(patient.status)}
                                {patient.createdAt && (
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">
                                      Booked at: {new Date(patient.createdAt.toDate()).toLocaleTimeString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
          <CardDescription>All your booked appointments and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patientBookings.map((booking) => (
              <Card key={booking.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{booking.hospitalName}</h4>
                      <p className="text-sm text-muted-foreground">{booking.department}</p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(booking.status)}
                      {booking.queueNumber && (
                        <Badge variant="outline">Queue #{booking.queueNumber}</Badge>
                      )}
                      {booking.priority && getPriorityBadge(booking.priority)}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Doctor: {booking.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Date: {new Date(booking.preferredDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Time: {booking.preferredTime}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Booking ID: {booking.bookingId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Amount: ₹{booking.totalPrice}</span>
                        <Badge variant={booking.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                      {booking.estimatedWaitTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Est. Wait: {booking.estimatedWaitTime} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Queue Tips */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">Queue Tips & Information</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700">
          <ul className="space-y-2 text-sm">
            <li>• <strong>Arrive 15 minutes early:</strong> Please arrive at least 15 minutes before your scheduled time</li>
            <li>• <strong>Stay updated:</strong> This page updates in real-time with your queue status</li>
            <li>• <strong>Listen for announcements:</strong> You'll be notified when it's your turn</li>
            <li>• <strong>Priority cases:</strong> Urgent cases may be seen first regardless of queue number</li>
            <li>• <strong>Estimated wait times:</strong> Are approximate and may vary based on actual consultation times</li>
            <li>• <strong>Your position:</strong> Your booking is highlighted in blue in the queue list above</li>
            <li>• <strong>Queue order:</strong> Patients are ordered by urgency first, then by queue number (first come, first serve)</li>
            <li>• <strong>Real-time updates:</strong> Queue positions and statuses update automatically as patients are called</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientQueueStatus;
