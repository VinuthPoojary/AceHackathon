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
  const [newDoctor, setNewDoctor] = useState<Partial<Doctor>>({
    name: '',
    specialization: '',
    experience: 0,
    qualification: '',
    consultationFee: 0,
    availableDays: [],
    availableTime: '',
    status: 'active'
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
    setHospitalData({
      hospitalId: authData.hospitalId,
      hospitalName: authData.hospitalName,
      email: authData.email,
      location: '',
      contactNo: '',
      availableServices: [],
      minimumPrice: 0,
      timing: '',
      daysAvailable: []
    });

    // Listen to doctors for this hospital
    const doctorsQuery = query(
      collection(db, 'doctors'),
      where('hospitalId', '==', authData.hospitalId),
      orderBy('name')
    );
    const unsubscribeDoctors = onSnapshot(doctorsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      setDoctors(docs);
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
        status: 'active'
      });
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error('Failed to add doctor');
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
        </div>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
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
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>{doctor.experience} years</TableCell>
                      <TableCell>{doctor.qualification}</TableCell>
                      <TableCell>₹{doctor.consultationFee}</TableCell>
                      <TableCell>
                        <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
                          {doctor.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
                <Input
                  id="specialization"
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="Specialization"
                />
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
                <Label htmlFor="availableTime">Available Time</Label>
                <Input
                  id="availableTime"
                  value={newDoctor.availableTime}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, availableTime: e.target.value }))}
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                />
              </div>
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
    </div>
  );
};

export default HospitalDashboard;
