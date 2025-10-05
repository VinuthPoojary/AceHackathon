import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowRight,
  LogOut,
  UserCheck,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw
} from "lucide-react";
import { QueueManagement } from "@/components/QueueManagement";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, where, updateDoc, doc } from "firebase/firestore";

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Listen for recent check-ins
    const checkinsQuery = query(collection(db, "checkins"), orderBy("checkedInAt", "desc"), limit(10));
    const checkinsUnsubscribe = onSnapshot(checkinsQuery, (querySnapshot) => {
      const checkins = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentCheckins(checkins);
    });

    // Listen for appointments
    const appointmentsQuery = query(collection(db, "bookings"), orderBy("bookingDate", "desc"));
    const appointmentsUnsubscribe = onSnapshot(appointmentsQuery, (querySnapshot) => {
      const appointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAppointments(appointments);
    });

    return () => {
      checkinsUnsubscribe();
      appointmentsUnsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const appointmentRef = doc(db, "bookings", appointmentId);
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.bookingId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || appointment.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = [
    { name: "Emergency", patients: 18, avgWait: 45, status: "high" },
    { name: "Cardiology", patients: 12, avgWait: 30, status: "medium" },
    { name: "Orthopedics", patients: 8, avgWait: 20, status: "low" },
    { name: "Pediatrics", patients: 15, avgWait: 25, status: "medium" },
    { name: "Radiology", patients: 6, avgWait: 15, status: "low" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Staff Dashboard</h1>
            <p className="text-muted-foreground">Real-time queue monitoring and resource management</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 shadow-card bg-gradient-to-br from-card to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-primary">59</p>
                <p className="text-xs text-secondary mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> +12% from yesterday
                </p>
              </div>
              <Users className="h-12 w-12 text-primary opacity-20" />
            </div>
          </Card>

          <Card className="p-6 shadow-card bg-gradient-to-br from-card to-warning/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Wait Time</p>
                <p className="text-3xl font-bold text-warning">28 min</p>
                <p className="text-xs text-secondary mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> -5 min improvement
                </p>
              </div>
              <Clock className="h-12 w-12 text-warning opacity-20" />
            </div>
          </Card>

          <Card className="p-6 shadow-card bg-gradient-to-br from-card to-secondary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed Today</p>
                <p className="text-3xl font-bold text-secondary">127</p>
                <p className="text-xs text-muted-foreground mt-1">92% on-time</p>
              </div>
              <CheckCircle className="h-12 w-12 text-secondary opacity-20" />
            </div>
          </Card>

          <Card className="p-6 shadow-card bg-gradient-to-br from-card to-destructive/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Urgent Cases</p>
                <p className="text-3xl font-bold text-destructive">3</p>
                <p className="text-xs text-destructive mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Requires attention
                </p>
              </div>
              <Activity className="h-12 w-12 text-destructive opacity-20" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Department Status */}
            <Card className="p-6 shadow-elevated">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Activity className="mr-2 h-6 w-6 text-primary" />
                Department Status
              </h2>
              <div className="space-y-4">
                {departments.map((dept) => (
                  <div
                    key={dept.name}
                    className="flex items-center justify-between p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{dept.name}</p>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {dept.patients} patients
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {dept.avgWait} min avg
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(dept.status)}>
                        {dept.status.toUpperCase()}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Check-ins */}
            <Card className="p-6 shadow-elevated">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <UserCheck className="mr-2 h-6 w-6 text-primary" />
                Recent Check-ins
              </h2>
              <div className="space-y-3">
                {recentCheckins.length > 0 ? (
                  recentCheckins.map((checkin) => (
                    <div
                      key={checkin.id}
                      className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{checkin.patientName}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {checkin.patientId} • {checkin.department} • {checkin.appointmentType}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">₹{checkin.price}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(checkin.checkedInAt.seconds * 1000).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent check-ins</p>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
                <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
                <h3 className="font-semibold mb-2">Priority Queue</h3>
                <p className="text-sm text-muted-foreground">Manage urgent cases</p>
              </Card>

              <Card className="p-6 shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
                <Users className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Staff Allocation</h3>
                <p className="text-sm text-muted-foreground">Optimize resources</p>
              </Card>

              <Card className="p-6 shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
                <TrendingUp className="h-8 w-8 text-secondary mb-3" />
                <h3 className="font-semibold mb-2">Flow Analysis</h3>
                <p className="text-sm text-muted-foreground">View patient flow</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            {/* Appointments Management Header */}
            <Card className="p-6 shadow-elevated">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold flex items-center">
                    <Calendar className="mr-2 h-6 w-6 text-primary" />
                    Appointment Management
                  </h2>
                  <p className="text-muted-foreground">Manage all patient appointments and bookings</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Appointment
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="gynecology">Gynecology</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  {filteredAppointments.length} appointments
                </div>
              </div>

              {/* Appointments List */}
              <div className="space-y-4">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                            <Badge className={getAppointmentStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p><strong>Booking ID:</strong> {appointment.bookingId}</p>
                              <p><strong>Hospital:</strong> {appointment.hospital?.name}</p>
                              <p><strong>Doctor:</strong> {appointment.doctor?.name}</p>
                              <p><strong>Department:</strong> {appointment.department}</p>
                            </div>
                            <div>
                              <p><strong>Date:</strong> {new Date(appointment.preferredDate?.seconds * 1000).toLocaleDateString()}</p>
                              <p><strong>Time:</strong> {appointment.preferredTime}</p>
                              <p><strong>Type:</strong> {appointment.appointmentType}</p>
                              <p><strong>Amount:</strong> ₹{appointment.totalPrice}</p>
                            </div>
                          </div>
                          {appointment.reason && (
                            <div className="mt-2">
                              <p className="text-sm"><strong>Reason:</strong> {appointment.reason}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                              disabled={appointment.status === "completed"}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                              disabled={appointment.status === "cancelled"}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(appointment.bookingDate?.seconds * 1000).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                    <p className="text-muted-foreground">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="queue">
            <QueueManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsChart />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StaffDashboard;
