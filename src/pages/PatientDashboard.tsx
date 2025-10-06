import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  FileText,
  CheckCircle,
  AlertCircle,
  Heart,
  ArrowRight,
  RefreshCw,
  Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { toast } from "@/components/ui/sonner";
import PatientNavigation from "@/components/PatientNavigation";

interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  hospitalname: any;
  hospitalId: string;
  hospitalName: string;
  doctor: any;
  doctorName: string;
  doctorId: string;
  department: string;
  appointmentType: string;
  preferredDate: any;
  preferredTime: string;
  reason: string;
  urgency: string;
  insuranceClaim: boolean;
  notes: string;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  bookingDate: any;
  bookingId: string;
  paymentStatus: string;
  queueNumber?: number;
  estimatedWaitTime?: number;
}

const PatientDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    if (!currentUser) return;

    // Fetch patient's bookings from Firestore
    const q = query(
      collection(db, "bookings"),
      where("patientId", "==", currentUser.uid),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookingsData: Booking[] = [];
      querySnapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
      });
      // Sort by preferred date on client side
      bookingsData.sort((a, b) => {
        const dateA = a.preferredDate?.toDate ? a.preferredDate.toDate() : new Date(a.preferredDate);
        const dateB = b.preferredDate?.toDate ? b.preferredDate.toDate() : new Date(b.preferredDate);
        return dateB.getTime() - dateA.getTime();
      });
      setBookings(bookingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (time: string) => {
    if (!time) return 'N/A';
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isUpcoming = (booking: Booking) => {
    const appointmentDate = booking.preferredDate?.toDate ? 
      booking.preferredDate.toDate() : 
      new Date(booking.preferredDate);
    return appointmentDate >= new Date() && booking.status === 'confirmed';
  };

  const isPast = (booking: Booking) => {
    const appointmentDate = booking.preferredDate?.toDate ? 
      booking.preferredDate.toDate() : 
      new Date(booking.preferredDate);
    return appointmentDate < new Date() || booking.status === 'completed';
  };

  const upcomingBookings = bookings.filter(isUpcoming);
  const pastBookings = bookings.filter(isPast);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <PatientNavigation />
      <div className="container mx-auto px-4 py-6 md:py-8 md:ml-72">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  My Appointments
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">Manage your healthcare appointments</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button 
                onClick={() => navigate('/bookings')}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-10 md:h-auto"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Book New Appointment</span>
                <span className="sm:hidden">Book Appointment</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/hospital-emergency')}
                className="h-10 md:h-auto"
                size="sm"
              >
                <MapPin className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Find Hospitals</span>
                <span className="sm:hidden">Hospitals</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{pastBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {bookings.filter(b => b.urgency === 'urgent' || b.urgency === 'high').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Urgent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{bookings.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Appointments ({upcomingBookings.length})
                </CardTitle>
                <CardDescription>
                  Your confirmed upcoming appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-medium mb-2">No upcoming appointments</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any upcoming appointments scheduled.
                    </p>
                    <Button onClick={() => navigate('/bookings')}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Your First Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <Card key={booking.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-xl font-semibold">{booking.doctorName}</h3>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                                <Badge className={getUrgencyColor(booking.urgency)}>
                                  {booking.urgency}
                                </Badge>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{booking.hospitalName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span>{booking.department}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{formatDate(booking.preferredDate)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>{formatTime(booking.preferredTime)}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span>{booking.appointmentType}</span>
                                  </div>
                                  {booking.queueNumber && (
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4 text-blue-600" />
                                      <span className="font-medium">Queue # {booking.queueNumber}</span>
                                    </div>
                                  )}
                                  {booking.estimatedWaitTime && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-orange-600" />
                                      <span>Est. wait: {booking.estimatedWaitTime} min</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Total: ₹{booking.totalPrice}</span>
                                  </div>
              </div>
            </div>

                              {booking.reason && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm">
                                    <span className="font-medium">Reason:</span> {booking.reason}
                                  </p>
                                </div>
              )}
            </div>
                            
                            <div className="flex flex-col gap-2 ml-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate('/queue-status')}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Check Queue
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate('/hospital-emergency')}
                              >
                                <MapPin className="w-4 h-4 mr-2" />
                                Hospital Info
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Past Appointments ({pastBookings.length})
                </CardTitle>
                <CardDescription>
                  Your completed and past appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pastBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-medium mb-2">No past appointments</h3>
                    <p className="text-muted-foreground">
                      Your completed appointments will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <Card key={booking.id} className="opacity-75 hover:opacity-100 transition-opacity">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-xl font-semibold">{booking.doctorName}</h3>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                                <Badge className={getUrgencyColor(booking.urgency)}>
                                  {booking.urgency}
                  </Badge>
                </div>
                              
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{booking.hospitalName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span>{booking.department}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{formatDate(booking.preferredDate)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>{formatTime(booking.preferredTime)}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span>{booking.appointmentType}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Total: ₹{booking.totalPrice}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-green-600">Payment: {booking.paymentStatus}</span>
                                  </div>
                                </div>
            </div>
                              
                              {booking.reason && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm">
                                    <span className="font-medium">Reason:</span> {booking.reason}
                </p>
              </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;