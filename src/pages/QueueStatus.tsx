import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  Users, 
  Calendar, 
  MapPin, 
  User, 
  Phone,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Timer,
  TrendingUp,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { toast } from "@/components/ui/sonner";
import { ALL_HOSPITALS } from "@/data/hospitals";
import PatientNavigation from "@/components/PatientNavigation";

interface QueueEntry {
  id: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctorId?: string;
  doctorName?: string;
  appointmentType: string;
  priority: string;
  bookingId?: string;
  estimatedWaitTime?: number;
  checkedInAt: any;
  status: string;
  queueNumber?: number;
}

const QueueStatus = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [queueData, setQueueData] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [userBookings, setUserBookings] = useState<any[]>([]);

  const departments = [
    { id: "emergency", name: "Emergency" },
    { id: "cardiology", name: "Cardiology" },
    { id: "neurology", name: "Neurology" },
    { id: "orthopedics", name: "Orthopedics" },
    { id: "pediatrics", name: "Pediatrics" },
    { id: "gynecology", name: "Gynecology" },
    { id: "dermatology", name: "Dermatology" },
    { id: "ophthalmology", name: "Ophthalmology" },
    { id: "ent", name: "ENT" },
    { id: "general", name: "General Medicine" }
  ];

  // Fetch user's bookings
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "bookings"),
      where("patientId", "==", currentUser.uid),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookings: any[] = [];
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      setUserBookings(bookings);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const fetchQueueData = async () => {
    if (!selectedHospital || !selectedDepartment || !selectedDate) {
      toast.error("Please select hospital, department, and date");
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you would fetch queue data from Firestore
      // For now, we'll simulate queue data
      const mockQueueData: QueueEntry[] = [
        {
          id: "1",
          patientId: "patient1",
          patientName: "John Doe",
          hospitalId: selectedHospital,
          hospitalName: ALL_HOSPITALS.find(h => h.id === selectedHospital)?.hospitalName || "Unknown Hospital",
          department: selectedDepartment,
          doctorId: "dr1",
          doctorName: "Dr. Rajesh Kumar",
          appointmentType: "consultation",
          priority: "normal",
          bookingId: "BOOK123",
          estimatedWaitTime: 15,
          checkedInAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          status: "waiting",
          queueNumber: 1
        },
        {
          id: "2",
          patientId: "patient2",
          patientName: "Jane Smith",
          hospitalId: selectedHospital,
          hospitalName: ALL_HOSPITALS.find(h => h.id === selectedHospital)?.hospitalName || "Unknown Hospital",
          department: selectedDepartment,
          doctorId: "dr2",
          doctorName: "Dr. Priya Sharma",
          appointmentType: "follow-up",
          priority: "high",
          bookingId: "BOOK124",
          estimatedWaitTime: 5,
          checkedInAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          status: "in-progress",
          queueNumber: 2
        },
        {
          id: "3",
          patientId: "patient3",
          patientName: "Bob Johnson",
          hospitalId: selectedHospital,
          hospitalName: ALL_HOSPITALS.find(h => h.id === selectedHospital)?.hospitalName || "Unknown Hospital",
          department: selectedDepartment,
          doctorId: "dr1",
          doctorName: "Dr. Rajesh Kumar",
          appointmentType: "emergency",
          priority: "urgent",
          bookingId: "BOOK125",
          estimatedWaitTime: 0,
          checkedInAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          status: "waiting",
          queueNumber: 3
        }
      ];

      setQueueData(mockQueueData);
      toast.success("Queue data loaded successfully");
    } catch (error) {
      console.error("Error fetching queue data:", error);
      toast.error("Failed to load queue data");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'waiting':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <Activity className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) {
      return date.toDate().toLocaleTimeString();
    }
    return new Date(date).toLocaleTimeString();
  };

  const calculateWaitTime = (entry: QueueEntry) => {
    if (entry.estimatedWaitTime) {
      return entry.estimatedWaitTime;
    }
    // Calculate based on position in queue (simplified)
    return entry.queueNumber ? (entry.queueNumber - 1) * 15 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <PatientNavigation />
      <div className="container mx-auto px-4 py-8 md:ml-72">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/patient-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Queue Status
              </h1>
              <p className="text-muted-foreground">Check current queue status and wait times</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Filter Queue
                </CardTitle>
                <CardDescription>
                  Select hospital, department, and date to view queue status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hospital">Hospital</Label>
                  <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_HOSPITALS.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{hospital.hospitalName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <Button 
                  onClick={fetchQueueData}
                  disabled={loading || !selectedHospital || !selectedDepartment || !selectedDate}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Check Queue Status
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* User's Bookings */}
            {userBookings.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Your Bookings
                  </CardTitle>
                  <CardDescription>
                    Your upcoming appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{booking.doctorName}</p>
                            <p className="text-sm text-muted-foreground">{booking.department}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.preferredDate?.toDate ? 
                                booking.preferredDate.toDate().toLocaleDateString() : 
                                new Date(booking.preferredDate).toLocaleDateString()
                              }
                            </p>
                          </div>
                          {booking.queueNumber && (
                            <Badge variant="outline">
                              Queue #{booking.queueNumber}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Queue Data */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Current Queue
                </CardTitle>
                <CardDescription>
                  {selectedHospital && selectedDepartment && selectedDate ? 
                    `Queue for ${departments.find(d => d.id === selectedDepartment)?.name} at ${ALL_HOSPITALS.find(h => h.id === selectedHospital)?.hospitalName} on ${selectedDate}` :
                    "Select hospital, department, and date to view queue"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {queueData.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-medium mb-2">No queue data available</h3>
                    <p className="text-muted-foreground mb-4">
                      Please select hospital, department, and date to view the current queue status.
                    </p>
                    <Button onClick={fetchQueueData} disabled={!selectedHospital || !selectedDepartment || !selectedDate}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Load Queue Data
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Queue Statistics */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">{queueData.length}</p>
                        <p className="text-sm text-blue-600">Total in Queue</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-yellow-600">
                          {queueData.filter(q => q.status === 'waiting').length}
                        </p>
                        <p className="text-sm text-yellow-600">Waiting</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">
                          {queueData.filter(q => q.status === 'in-progress').length}
                        </p>
                        <p className="text-sm text-green-600">In Progress</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <Timer className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-600">
                          {Math.max(...queueData.map(q => calculateWaitTime(q)))}
                        </p>
                        <p className="text-sm text-red-600">Max Wait (min)</p>
                      </div>
                    </div>

                    {/* Queue Entries */}
                    <div className="space-y-3">
                      {queueData
                        .sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0))
                        .map((entry, index) => (
                        <Card key={entry.id} className={`transition-all ${
                          entry.status === 'in-progress' ? 'ring-2 ring-green-500 bg-green-50' : ''
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                    entry.queueNumber === 1 ? 'bg-green-500' :
                                    entry.queueNumber === 2 ? 'bg-blue-500' :
                                    entry.queueNumber === 3 ? 'bg-orange-500' :
                                    'bg-gray-500'
                                  }`}>
                                    {entry.queueNumber || index + 1}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{entry.patientName}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {entry.appointmentType} • {entry.doctorName || 'Any Doctor'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>Checked in: {formatTime(entry.checkedInAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Timer className="w-4 h-4 text-muted-foreground" />
                                    <span>Wait: {calculateWaitTime(entry)} min</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 items-end">
                                <Badge className={getPriorityColor(entry.priority)}>
                                  {entry.priority}
                                </Badge>
                                <Badge className={getStatusColor(entry.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(entry.status)}
                                    {entry.status}
                                  </div>
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;
