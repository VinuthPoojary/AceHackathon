import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, where, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getHospitalQueues, updateQueueStatus, callNextPatient, type QueueEntry, type HospitalQueue } from '@/lib/queueService';

interface HospitalData {
  hospitalId: string;
  hospitalName: string;
  email: string;
  location: string;
  contactNo: string;
  availableServices: string[];
  specialties?: string[];
  minimumPrice: number;
  timing: string;
  daysAvailable: string[];
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  qualification: string;
  consultationFee: number;
  availableDays: string[];
  availableTime: string;
  status: 'active' | 'inactive';
  holidays?: string[]; // Array of dates in YYYY-MM-DD format
  hospitalId?: string;
  hospitalName?: string;
}

interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  doctorName: string;
  doctorId?: string;
  department: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled';
  bookingDate: string;
  bookingId: string;
  hospitalId?: string;
  hospitalName?: string;
  totalPrice?: number;
  reason?: string;
  urgency?: string;
  notes?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  queueNumber?: number;
  queueId?: string;
  estimatedWaitTime?: number;
}

const HospitalDashboard: React.FC = () => {
  const [hospitalData, setHospitalData] = useState<HospitalData | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [isQueuePopupOpen, setIsQueuePopupOpen] = useState(false);
  const [hospitalQueues, setHospitalQueues] = useState<HospitalQueue[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newDoctor, setNewDoctor] = useState<Partial<Doctor>>({
    name: '',
    specialization: '',
    experience: 0,
    qualification: '',
    consultationFee: 0,
    availableDays: [],
    availableTime: '',
    status: 'active',
    holidays: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Update clock every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    // Check if hospital is logged in
    const hospitalAuth = localStorage.getItem('hospital_auth');
    if (!hospitalAuth) {
      navigate('/hospital-login');
      return;
    }

    const authData = JSON.parse(hospitalAuth);
    console.log('🏥 Hospital auth data:', authData);
    
    // Set initial hospital data with available services from auth data or defaults
    const hospitalDataToSet = {
      hospitalId: authData.hospitalId,
      hospitalName: authData.hospitalName,
      email: authData.email,
      location: authData.location || '',
      contactNo: authData.contactNo || '',
      availableServices: authData.availableServices || [
        'Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 
        'Pediatrics', 'Gynecology', 'General Medicine', 'Surgery'
      ],
      specialties: authData.specialties || authData.availableServices || [
        'Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 
        'Pediatrics', 'Gynecology', 'General Medicine', 'Surgery'
      ],
      minimumPrice: authData.minimumPrice || 500,
      timing: authData.timing || '24/7',
      daysAvailable: authData.daysAvailable || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    };
    
    console.log('🏥 Setting hospital data:', hospitalDataToSet);
    setHospitalData(hospitalDataToSet);

    // Listen to doctors for this hospital
    console.log('🔍 Loading doctors for hospital:', authData.hospitalId);
    
    // Try with orderBy first, fallback without if it fails
    let doctorsQuery;
    try {
      doctorsQuery = query(
        collection(db, 'doctors'),
        where('hospitalId', '==', authData.hospitalId),
        orderBy('name')
      );
    } catch (error) {
      console.warn('⚠️ OrderBy query failed, trying without orderBy:', error);
      doctorsQuery = query(
        collection(db, 'doctors'),
        where('hospitalId', '==', authData.hospitalId)
      );
    }
    
    const unsubscribeDoctors = onSnapshot(doctorsQuery, (snapshot) => {
      console.log('📊 Doctors query result:', {
        size: snapshot.size,
        hospitalId: authData.hospitalId,
        docs: snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }))
      });
      
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      
      console.log('👨‍⚕️ Processed doctors:', docs);
      setDoctors(docs);
    }, (error) => {
      console.error('❌ Error loading doctors:', error);
      
      // Try fallback query without orderBy
      console.log('🔄 Trying fallback query without orderBy...');
      const fallbackQuery = query(
        collection(db, 'doctors'),
        where('hospitalId', '==', authData.hospitalId)
      );
      
      onSnapshot(fallbackQuery, (fallbackSnapshot) => {
        console.log('📊 Fallback query result:', {
          size: fallbackSnapshot.size,
          hospitalId: authData.hospitalId
        });
        
        const fallbackDocs = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Doctor[];
        
        console.log('👨‍⚕️ Fallback doctors:', fallbackDocs);
        setDoctors(fallbackDocs);
      });
    });

    // Listen to bookings for this hospital
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('hospitalId', '==', authData.hospitalId)
    );
    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const books = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      
      // Sort by booking date on the client side
      const sortedBookings = books.sort((a, b) => 
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );
      
      setBookings(sortedBookings);
    });

    return () => {
      unsubscribeDoctors();
      unsubscribeBookings();
    };
  }, [navigate]);

  const handleAddDoctor = async () => {
    if (!hospitalData || !newDoctor.name || !newDoctor.specialization) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'doctors'), {
        ...newDoctor,
        hospitalId: hospitalData.hospitalId,
        hospitalName: hospitalData.hospitalName,
        createdAt: new Date()
      });

      toast.success('Doctor added successfully!');
      setIsAddDoctorOpen(false);
      setNewDoctor({
        name: '',
        specialization: '',
        experience: 0,
        qualification: '',
        consultationFee: 0,
        availableDays: [],
        availableTime: '',
        status: 'active',
        holidays: []
      });
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error('Failed to add doctor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsEditDoctorOpen(true);
  };

  const updateDoctorStatus = async (doctorId: string, newStatus: 'active' | 'inactive') => {
    try {
      const doctorRef = doc(db, 'doctors', doctorId);
      await updateDoc(doctorRef, { status: newStatus });
      toast.success(`Doctor status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating doctor status:', error);
      toast.error('Failed to update doctor status');
    }
  };

  const handleUpdateDoctor = async () => {
    if (!editingDoctor || !newDoctor.name || !newDoctor.specialization) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const doctorRef = doc(db, 'doctors', editingDoctor.id);
      await updateDoc(doctorRef, {
        ...newDoctor,
        hospitalId: hospitalData?.hospitalId,
        hospitalName: hospitalData?.hospitalName,
        updatedAt: new Date()
      });

      toast.success('Doctor updated successfully!');
      setIsEditDoctorOpen(false);
      setEditingDoctor(null);
      setNewDoctor({
        name: '',
        specialization: '',
        experience: 0,
        qualification: '',
        consultationFee: 0,
        availableDays: [],
        availableTime: '',
        status: 'active',
        holidays: []
      });
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast.error('Failed to update doctor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updatedAt: new Date()
      });
      toast.success('Booking status updated successfully!');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleViewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsBookingDetailsOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('hospital_auth');
    navigate('/hospital-login');
    toast.info('Logged out successfully');
  };

  const handleViewQueue = () => {
    if (!hospitalData) return;
    
    // Listen to hospital queues
    const unsubscribe = getHospitalQueues(hospitalData.hospitalId, (queues) => {
      setHospitalQueues(queues);
    });
    
    setIsQueuePopupOpen(true);
    
    // Store unsubscribe function for cleanup
    (window as any).queueUnsubscribe = unsubscribe;
  };

  const handleCallNextPatient = async (department: string) => {
    if (!hospitalData) return;
    
    try {
      const nextPatient = await callNextPatient(hospitalData.hospitalId, department);
      if (nextPatient) {
        toast.success(`Called patient ${nextPatient.patientName} (Queue #${nextPatient.queueNumber})`);
      } else {
        toast.info('No patients waiting in queue');
      }
    } catch (error) {
      console.error('Error calling next patient:', error);
      toast.error('Failed to call next patient');
    }
  };

  const handleUpdateQueueStatus = async (queueId: string, status: QueueEntry['status']) => {
    try {
      await updateQueueStatus(queueId, status);
      toast.success('Queue status updated successfully');
    } catch (error) {
      console.error('Error updating queue status:', error);
      toast.error('Failed to update queue status');
    }
  };

  const getQueueStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="secondary">Waiting</Badge>;
      case 'called':
        return <Badge variant="default">Called</Badge>;
      case 'in_progress':
        return <Badge variant="outline">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="default">High</Badge>;
      case 'normal':
        return <Badge variant="secondary">Normal</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge variant="secondary">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!hospitalData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Hospital Dashboard</h1>
          <p className="text-gray-600">Welcome, {hospitalData.hospitalName}</p>
          <p className="text-sm text-gray-500">Hospital ID: {hospitalData.hospitalId} | Doctors: {doctors.length}</p>
        </div>
        <div className="flex gap-2">
          {/* <button
            onClick={() => {
              console.log('🔍 Manual debug - Hospital ID:', hospitalData.hospitalId);
              console.log('🔍 Manual debug - Doctors count:', doctors.length);
              console.log('🔍 Manual debug - Doctors data:', doctors);
            }}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            🐛 Debug
          </button> */}
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            🔄 Refresh
          </button>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="paid-bookings">Paid Bookings</TabsTrigger>
          <TabsTrigger value="queue">Queue Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{doctors.length}</div>
                <p className="text-xs text-muted-foreground">All doctors</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {doctors.filter(d => d.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">Available for booking</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Inactive Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {doctors.filter(d => d.status === 'inactive').length}
                </div>
                <p className="text-xs text-muted-foreground">Not available</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
                <p className="text-xs text-muted-foreground">All time bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bookings.filter(b => b.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Doctor Status Actions</CardTitle>
              <CardDescription>Quickly manage doctor availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const inactiveDoctors = doctors.filter(d => d.status === 'inactive');
                    if (inactiveDoctors.length === 0) {
                      toast.info('All doctors are already active');
                      return;
                    }
                    if (confirm(`Activate all ${inactiveDoctors.length} inactive doctors?`)) {
                      inactiveDoctors.forEach(doctor => {
                        updateDoctorStatus(doctor.id, 'active');
                      });
                      toast.success(`Activated ${inactiveDoctors.length} doctors`);
                    }
                  }}
                  disabled={doctors.filter(d => d.status === 'inactive').length === 0}
                >
                  ✅ Activate All Inactive Doctors
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const activeDoctors = doctors.filter(d => d.status === 'active');
                    if (activeDoctors.length === 0) {
                      toast.info('All doctors are already inactive');
                      return;
                    }
                    if (confirm(`Deactivate all ${activeDoctors.length} active doctors?`)) {
                      activeDoctors.forEach(doctor => {
                        updateDoctorStatus(doctor.id, 'inactive');
                      });
                      toast.success(`Deactivated ${activeDoctors.length} doctors`);
                    }
                  }}
                  disabled={doctors.filter(d => d.status === 'active').length === 0}
                >
                  ❌ Deactivate All Active Doctors
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const statusSummary = {
                      total: doctors.length,
                      active: doctors.filter(d => d.status === 'active').length,
                      inactive: doctors.filter(d => d.status === 'inactive').length
                    };
                    toast.info(`Status Summary: ${statusSummary.active} active, ${statusSummary.inactive} inactive out of ${statusSummary.total} total doctors`);
                  }}
                >
                  📊 Status Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Doctors</CardTitle>
                <CardDescription>Manage your hospital's doctors</CardDescription>
              </div>
              <Button onClick={() => setIsAddDoctorOpen(true)}>
                Add Doctor
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Consultation Fee</TableHead>
                    <TableHead>Available Time</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        Status
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => {
                              const inactiveDoctors = doctors.filter(d => d.status === 'inactive');
                              if (inactiveDoctors.length === 0) {
                                toast.info('All doctors are already active');
                                return;
                              }
                              if (confirm(`Activate all ${inactiveDoctors.length} inactive doctors?`)) {
                                inactiveDoctors.forEach(doctor => {
                                  updateDoctorStatus(doctor.id, 'active');
                                });
                              }
                            }}
                          >
                            Activate All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => {
                              const activeDoctors = doctors.filter(d => d.status === 'active');
                              if (activeDoctors.length === 0) {
                                toast.info('All doctors are already inactive');
                                return;
                              }
                              if (confirm(`Deactivate all ${activeDoctors.length} active doctors?`)) {
                                activeDoctors.forEach(doctor => {
                                  updateDoctorStatus(doctor.id, 'inactive');
                                });
                              }
                            }}
                          >
                            Deactivate All
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No doctors found. Add your first doctor to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    doctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{doctor.specialization}</Badge>
                        </TableCell>
                        <TableCell>{doctor.experience} years</TableCell>
                        <TableCell>{doctor.qualification}</TableCell>
                        <TableCell>₹{doctor.consultationFee}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{doctor.availableTime}</div>
                            <div className="text-xs text-muted-foreground">
                              {doctor.availableDays?.length || 0} days/week
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
                              {doctor.status}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={doctor.status === 'active'}
                                onCheckedChange={(checked) => {
                                  const newStatus = checked ? 'active' : 'inactive';
                                  updateDoctorStatus(doctor.id, newStatus);
                                }}
                                disabled={!doctor.id}
                              />
                              <span className="text-xs text-muted-foreground">
                                {doctor.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewDoctor({
                                name: doctor.name,
                                specialization: doctor.specialization,
                                experience: doctor.experience,
                                qualification: doctor.qualification,
                                consultationFee: doctor.consultationFee,
                                availableDays: doctor.availableDays || [],
                                availableTime: doctor.availableTime,
                                status: doctor.status,
                                holidays: doctor.holidays || []
                              });
                              handleEditDoctor(doctor);
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>Manage patient bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewBookingDetails(booking)}>
                      <TableCell className="font-mono text-xs">{booking.bookingId || booking.id}</TableCell>
                      <TableCell className="font-medium">{booking.patientName}</TableCell>
                      <TableCell>{booking.doctorName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{booking.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(booking.preferredDate).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{booking.preferredTime || 'Time not set'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{booking.appointmentType || 'Regular'}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">₹{booking.totalPrice || 0}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid-bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💰 Paid Bookings
                <Badge variant="default" className="bg-green-600">
                  {bookings.filter(b => b.paymentStatus === 'completed' || b.status === 'completed').length}
                </Badge>
              </CardTitle>
              <CardDescription>View all paid and completed bookings with payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Paid Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {bookings.filter(b => b.paymentStatus === 'completed' || b.status === 'completed').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Completed payments</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{bookings
                        .filter(b => b.paymentStatus === 'completed' || b.status === 'completed')
                        .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
                        .toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">From paid bookings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {bookings.filter(b => b.paymentStatus !== 'completed' && b.status !== 'completed').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Awaiting payment</p>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Booking Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings
                    .filter(b => b.paymentStatus === 'completed' || b.status === 'completed')
                    .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
                    .map((booking) => (
                    <TableRow key={booking.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewBookingDetails(booking)}>
                      <TableCell className="font-mono text-xs">{booking.bookingId || booking.id}</TableCell>
                      <TableCell className="font-medium">{booking.patientName}</TableCell>
                      <TableCell>{booking.doctorName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{booking.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(booking.preferredDate).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{booking.preferredTime || 'Time not set'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">₹{booking.totalPrice || 0}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {booking.paymentMethod === 'razorpay' ? '💳 Razorpay' :
                           booking.paymentMethod === 'upi' ? '📱 UPI' :
                           booking.paymentMethod === 'netbanking' ? '🏦 Net Banking' :
                           booking.paymentMethod === 'wallet' ? '💼 Digital Wallet' :
                           booking.paymentMethod || 'Not specified'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={booking.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                          {booking.paymentStatus === 'completed' ? '✅ Paid' : booking.paymentStatus || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewBookingDetails(booking)}
                          >
                            View Details
                          </Button>
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bookings.filter(b => b.paymentStatus === 'completed' || b.status === 'completed').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No paid bookings found. Payments will appear here once completed.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Queue Management</CardTitle>
              <CardDescription>Manage patient queues and monitor queue status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Patients in Queue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {hospitalQueues.reduce((sum, queue) => sum + queue.currentQueue.length, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Across all departments</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{hospitalQueues.length}</div>
                    <p className="text-xs text-muted-foreground">Departments with queues</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {hospitalQueues.length > 0 
                        ? Math.round(hospitalQueues.reduce((sum, queue) => sum + queue.averageWaitTime, 0) / hospitalQueues.length)
                        : 0
                      } min
                    </div>
                    <p className="text-xs text-muted-foreground">Estimated wait time</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-center">
                <Button onClick={handleViewQueue} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  📋 View Queue Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Doctor Dialog */}
      <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Add a new doctor to your hospital
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Doctor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <select
                  id="specialization"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, specialization: e.target.value }))}
                >
                  <option value="">Select specialization</option>
                  {/* Show hospital's available services first */}
                  {hospitalData?.availableServices?.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                  {/* Show hospital's specialties that aren't already in availableServices */}
                  {hospitalData?.specialties?.filter(specialty => 
                    !hospitalData?.availableServices?.includes(specialty)
                  ).map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                  {/* Fallback common specializations if hospital data is incomplete */}
                  {(!hospitalData?.availableServices?.length && !hospitalData?.specialties?.length) && [
                    "Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", 
                    "Gynecology", "General Medicine", "Dermatology", "Ophthalmology", "ENT"
                  ].map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Only services provided by your hospital are available
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (years)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={newDoctor.experience}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                  placeholder="Years of experience"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={newDoctor.qualification}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, qualification: e.target.value }))}
                  placeholder="MBBS, MD, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  value={newDoctor.consultationFee}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, consultationFee: parseInt(e.target.value) || 0 }))}
                  placeholder="Consultation fee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableTime">Available Time *</Label>
                <select
                  id="availableTime"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDoctor.availableTime}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, availableTime: e.target.value }))}
                >
                  <option value="">Select time range</option>
                  <option value="24/7">24/7 (Emergency)</option>
                  <option value="6:00 AM - 12:00 PM">6:00 AM - 12:00 PM</option>
                  <option value="9:00 AM - 5:00 PM">9:00 AM - 5:00 PM</option>
                  <option value="10:00 AM - 6:00 PM">10:00 AM - 6:00 PM</option>
                  <option value="2:00 PM - 10:00 PM">2:00 PM - 10:00 PM</option>
                  <option value="8:00 AM - 4:00 PM">8:00 AM - 4:00 PM</option>
                  <option value="12:00 PM - 8:00 PM">12:00 PM - 8:00 PM</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Available Days *</Label>
              <div className="grid grid-cols-7 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newDoctor.availableDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewDoctor(prev => ({
                            ...prev,
                            availableDays: [...prev.availableDays, day]
                          }));
                        } else {
                          setNewDoctor(prev => ({
                            ...prev,
                            availableDays: prev.availableDays.filter(d => d !== day)
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{day.substring(0, 3)}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500">Select the days when the doctor is available</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="holidays">Holiday Dates (Optional)</Label>
              <Input
                id="holidays"
                value={newDoctor.holidays?.join(', ') || ''}
                onChange={(e) => {
                  const dates = e.target.value.split(',').map(date => date.trim()).filter(date => date);
                  setNewDoctor(prev => ({ ...prev, holidays: dates }));
                }}
                placeholder="e.g., 2025-12-25, 2025-01-01, 2025-08-15"
              />
              <p className="text-xs text-gray-500">Enter holiday dates in YYYY-MM-DD format, separated by commas</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDoctorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDoctor}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Doctor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog open={isEditDoctorOpen} onOpenChange={setIsEditDoctorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>
              Update doctor information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Name *</Label>
                <Input
                  id="editName"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Doctor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSpecialization">Specialization *</Label>
                <select
                  id="editSpecialization"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, specialization: e.target.value }))}
                >
                  <option value="">Select specialization</option>
                  {hospitalData?.availableServices?.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                  {hospitalData?.specialties?.filter(specialty => 
                    !hospitalData?.availableServices?.includes(specialty)
                  ).map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editExperience">Experience (years)</Label>
                <Input
                  id="editExperience"
                  type="number"
                  value={newDoctor.experience}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                  placeholder="Years of experience"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editQualification">Qualification</Label>
                <Input
                  id="editQualification"
                  value={newDoctor.qualification}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, qualification: e.target.value }))}
                  placeholder="MBBS, MD, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editConsultationFee">Consultation Fee (₹)</Label>
                <Input
                  id="editConsultationFee"
                  type="number"
                  value={newDoctor.consultationFee}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, consultationFee: parseInt(e.target.value) || 0 }))}
                  placeholder="Consultation fee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAvailableTime">Available Time *</Label>
                <select
                  id="editAvailableTime"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDoctor.availableTime}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, availableTime: e.target.value }))}
                >
                  <option value="">Select time range</option>
                  <option value="24/7">24/7 (Emergency)</option>
                  <option value="6:00 AM - 12:00 PM">6:00 AM - 12:00 PM</option>
                  <option value="9:00 AM - 5:00 PM">9:00 AM - 5:00 PM</option>
                  <option value="10:00 AM - 6:00 PM">10:00 AM - 6:00 PM</option>
                  <option value="2:00 PM - 10:00 PM">2:00 PM - 10:00 PM</option>
                  <option value="8:00 AM - 4:00 PM">8:00 AM - 4:00 PM</option>
                  <option value="12:00 PM - 8:00 PM">12:00 PM - 8:00 PM</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Available Days *</Label>
              <div className="grid grid-cols-7 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newDoctor.availableDays?.includes(day) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewDoctor(prev => ({
                            ...prev,
                            availableDays: [...(prev.availableDays || []), day]
                          }));
                        } else {
                          setNewDoctor(prev => ({
                            ...prev,
                            availableDays: (prev.availableDays || []).filter(d => d !== day)
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{day.substring(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editHolidays">Holiday Dates (Optional)</Label>
              <Input
                id="editHolidays"
                value={newDoctor.holidays?.join(', ') || ''}
                onChange={(e) => {
                  const dates = e.target.value.split(',').map(date => date.trim()).filter(date => date);
                  setNewDoctor(prev => ({ ...prev, holidays: dates }));
                }}
                placeholder="e.g., 2025-12-25, 2025-01-01, 2025-08-15"
              />
              <p className="text-xs text-gray-500">Enter holiday dates in YYYY-MM-DD format, separated by commas</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDoctorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDoctor}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Doctor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Modal */}
      <Dialog open={isBookingDetailsOpen} onOpenChange={setIsBookingDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Complete information about this patient booking</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Booking Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Booking Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Booking ID:</strong> <span className="font-mono">{selectedBooking.bookingId}</span></div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedBooking.status)}</div>
                    <div><strong>Booking Date:</strong> {new Date(selectedBooking.bookingDate).toLocaleString()}</div>
                    <div><strong>Queue Number:</strong> {selectedBooking.queueNumber || 'Not assigned'}</div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">💰 Payment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Total Amount:</strong> ₹{selectedBooking.totalPrice || 0}</div>
                    <div><strong>Payment Method:</strong> {selectedBooking.paymentMethod || 'Not specified'}</div>
                    <div><strong>Payment Status:</strong> 
                      <Badge variant={selectedBooking.paymentStatus === 'completed' ? 'default' : 'secondary'} className="ml-2">
                        {selectedBooking.paymentStatus || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">👤 Patient Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div><strong>Name:</strong> {selectedBooking.patientName}</div>
                    <div><strong>Email:</strong> {selectedBooking.patientEmail || 'Not provided'}</div>
                  </div>
                  <div>
                    <div><strong>Phone:</strong> {selectedBooking.patientPhone || 'Not provided'}</div>
                    <div><strong>Patient ID:</strong> <span className="font-mono text-xs">{selectedBooking.patientId}</span></div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-3">🏥 Appointment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div><strong>Doctor:</strong> {selectedBooking.doctorName}</div>
                    <div><strong>Department:</strong> {selectedBooking.department}</div>
                    <div><strong>Type:</strong> {selectedBooking.appointmentType || 'Regular'}</div>
                  </div>
                  <div>
                    <div><strong>Date:</strong> {new Date(selectedBooking.preferredDate).toLocaleDateString()}</div>
                    <div><strong>Time:</strong> {selectedBooking.preferredTime || 'Not specified'}</div>
                    <div><strong>Urgency:</strong> {selectedBooking.urgency || 'Normal'}</div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {(selectedBooking.reason || selectedBooking.notes) && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-3">📝 Additional Information</h4>
                  <div className="space-y-2 text-sm">
                    {selectedBooking.reason && (
                      <div>
                        <strong>Reason for Visit:</strong>
                        <p className="mt-1 text-gray-700">{selectedBooking.reason}</p>
                      </div>
                    )}
                    {selectedBooking.notes && (
                      <div>
                        <strong>Notes:</strong>
                        <p className="mt-1 text-gray-700">{selectedBooking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsBookingDetailsOpen(false)}>
                  Close
                </Button>
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button onClick={() => {
                      handleUpdateBookingStatus(selectedBooking.id, 'confirmed');
                      setIsBookingDetailsOpen(false);
                    }}>
                      Confirm Booking
                    </Button>
                    <Button variant="destructive" onClick={() => {
                      handleUpdateBookingStatus(selectedBooking.id, 'cancelled');
                      setIsBookingDetailsOpen(false);
                    }}>
                      Cancel Booking
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <Button onClick={() => {
                    handleUpdateBookingStatus(selectedBooking.id, 'completed');
                    setIsBookingDetailsOpen(false);
                  }}>
                    Mark as Completed
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Queue Management Popup */}
      <Dialog open={isQueuePopupOpen} onOpenChange={(open) => {
        setIsQueuePopupOpen(open);
        if (!open && (window as any).queueUnsubscribe) {
          (window as any).queueUnsubscribe();
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Queue Management - {hospitalData?.hospitalName}</span>
              <div className="text-2xl font-mono bg-gray-100 px-3 py-1 rounded">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour12: true, 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </div>
            </DialogTitle>
            <DialogDescription>
              Real-time queue management for all departments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {hospitalQueues.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium mb-2">No Active Queues</h3>
                <p className="text-muted-foreground">No patients are currently waiting in any department queues.</p>
              </div>
            ) : (
              hospitalQueues.map((queue) => (
                <Card key={queue.department}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{queue.department}</CardTitle>
                        <CardDescription>
                          {queue.currentQueue.length} patients in queue | Avg wait: {queue.averageWaitTime} min
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={() => handleCallNextPatient(queue.department)}
                        disabled={queue.currentQueue.length === 0}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        📢 Call Next
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {queue.currentQueue.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No patients waiting in this department
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Sort queue by priority and queue number */}
                        {queue.currentQueue
                          .sort((a, b) => {
                            // Urgent patients first
                            if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
                            if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
                            // High priority next
                            if (a.priority === 'high' && b.priority === 'normal') return -1;
                            if (b.priority === 'high' && a.priority === 'normal') return 1;
                            // Then by queue number (first come, first serve)
                            return a.queueNumber - b.queueNumber;
                          })
                          .map((patient, index) => {
                            const isCurrent = patient.status === 'called' || patient.status === 'in_progress';
                            const isNext = index === 0 && patient.status === 'waiting';
                            const isUpcoming = index === 1 && patient.status === 'waiting';
                            
                            return (
                              <div
                                key={patient.id}
                                className={`p-4 rounded-lg border transition-all ${
                                  isCurrent 
                                    ? 'bg-green-50 border-green-200 ring-2 ring-green-300' 
                                    : isNext 
                                    ? 'bg-blue-50 border-blue-200' 
                                    : isUpcoming
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                      isCurrent ? 'bg-green-500' : isNext ? 'bg-blue-500' : isUpcoming ? 'bg-yellow-500' : 'bg-gray-500'
                                    }`}>
                                      {patient.queueNumber}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium">{patient.patientName}</h4>
                                        {getPriorityBadge(patient.priority)}
                                        {isCurrent && <Badge variant="default">Ongoing</Badge>}
                                        {isNext && <Badge variant="default">Up Next</Badge>}
                                        {isUpcoming && <Badge variant="secondary">Be Ready</Badge>}
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
                                    {patient.status === 'waiting' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateQueueStatus(patient.id, 'called')}
                                      >
                                        Call
                                      </Button>
                                    )}
                                    {patient.status === 'called' && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateQueueStatus(patient.id, 'in_progress')}
                                      >
                                        Start
                                      </Button>
                                    )}
                                    {(patient.status === 'called' || patient.status === 'in_progress') && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateQueueStatus(patient.id, 'completed')}
                                      >
                                        Complete
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQueuePopupOpen(false)}>
              Close Queue Management
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalDashboard;
