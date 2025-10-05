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
import { toast } from '@/components/ui/sonner';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, where, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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
  doctorName: string;
  department: string;
  appointmentType: string;
  preferredDate: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled';
  bookingDate: string;
  bookingId: string;
}

const HospitalDashboard: React.FC = () => {
  const [hospitalData, setHospitalData] = useState<HospitalData | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
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
      where('hospitalId', '==', authData.hospitalId),
      orderBy('bookingDate', 'desc')
    );
    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const books = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      setBookings(books);
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

  const handleLogout = () => {
    localStorage.removeItem('hospital_auth');
    navigate('/hospital-login');
    toast.info('Logged out successfully');
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
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{doctors.length}</div>
                <p className="text-xs text-muted-foreground">Active doctors</p>
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
                    <TableHead>Status</TableHead>
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
                          <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
                            {doctor.status}
                          </Badge>
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
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.patientName}</TableCell>
                      <TableCell>{booking.doctorName}</TableCell>
                      <TableCell>{booking.department}</TableCell>
                      <TableCell>{booking.preferredDate}</TableCell>
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
    </div>
  );
};

export default HospitalDashboard;
