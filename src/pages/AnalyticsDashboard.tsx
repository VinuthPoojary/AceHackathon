import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { db, auth } from '@/lib/firebase';
import { collection, query, onSnapshot, where, orderBy, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, TrendingUp, Users, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface AnalyticsData {
  totalPatients: number;
  averageWaitTime: number;
  completedPatients: number;
  cancelledPatients: number;
  departments: Record<string, number>;
  hourlyData: Array<{
    hour: string;
    patients: number;
    avgWaitTime: number;
  }>;
  dailyData: Array<{
    date: string;
    patients: number;
    avgWaitTime: number;
  }>;
  departmentStats: Array<{
    department: string;
    patients: number;
    avgWaitTime: number;
    completionRate: number;
  }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHospital, setSelectedHospital] = useState<string>('all');
  const [hospitals, setHospitals] = useState<Array<{id: string, hospitalName: string}>>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check admin authentication
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_auth');
    if (!adminAuth) {
      navigate('/admin-login');
      return;
    }

    try {
      const authData = JSON.parse(adminAuth);
      if (!authData.uid) {
        navigate('/admin-login');
        return;
      }
    } catch (error) {
      console.error('Invalid admin auth data:', error);
      navigate('/admin-login');
      return;
    }
  }, [navigate]);

  // Load hospitals
  useEffect(() => {
    const hospitalsQuery = query(collection(db, 'hospitals'));
    const unsubscribe = onSnapshot(hospitalsQuery, (snapshot) => {
      const hosp = snapshot.docs.map(doc => ({
        id: doc.id,
        hospitalName: doc.data().hospitalName
      }));
      setHospitals(hosp);
    });

    return () => unsubscribe();
  }, []);

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedDate, selectedHospital]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      let queueQuery = query(
        collection(db, 'queue_entries'),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate)
      );

      if (selectedHospital !== 'all') {
        queueQuery = query(queueQuery, where('hospitalId', '==', selectedHospital));
      }

      const snapshot = await getDocs(queueQuery);
      const entries = snapshot.docs.map(doc => doc.data());

      // Calculate basic stats
      const totalPatients = entries.length;
      const completedPatients = entries.filter(entry => entry.status === 'completed').length;
      const cancelledPatients = entries.filter(entry => entry.status === 'cancelled').length;

      // Department breakdown
      const departments = entries.reduce((acc, entry) => {
        acc[entry.department] = (acc[entry.department] || 0) + 1;
        return acc;
      }, {});

      // Average wait time
      const completedWithWaitTime = entries.filter(entry =>
        entry.status === 'completed' && entry.actualWaitTime
      );
      const averageWaitTime = completedWithWaitTime.length > 0
        ? Math.round(completedWithWaitTime.reduce((sum, entry) => sum + (entry.actualWaitTime || 0), 0) / completedWithWaitTime.length)
        : 0;

      // Hourly data
      const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourEntries = entries.filter(entry => {
          const entryHour = entry.createdAt?.toDate?.()?.getHours();
          return entryHour === hour;
        });

        const hourCompleted = hourEntries.filter(entry =>
          entry.status === 'completed' && entry.actualWaitTime
        );

        const avgWait = hourCompleted.length > 0
          ? Math.round(hourCompleted.reduce((sum, entry) => sum + (entry.actualWaitTime || 0), 0) / hourCompleted.length)
          : 0;

        return {
          hour: `${hour.toString().padStart(2, '0')}:00`,
          patients: hourEntries.length,
          avgWaitTime: avgWait
        };
      });

      // Department stats
      const departmentStats = Object.entries(departments).map(([department, count]) => {
        const deptEntries = entries.filter(entry => entry.department === department);
        const deptCompleted = deptEntries.filter(entry =>
          entry.status === 'completed' && entry.actualWaitTime
        );

        const avgWait = deptCompleted.length > 0
          ? Math.round(deptCompleted.reduce((sum, entry) => sum + (entry.actualWaitTime || 0), 0) / deptCompleted.length)
          : 0;

        const completionRate = deptEntries.length > 0
          ? Math.round((deptCompleted.length / deptEntries.length) * 100)
          : 0;

        return {
          department,
          patients: count,
          avgWaitTime: avgWait,
          completionRate
        };
      });

      // Daily data (for the selected week)
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - i);

        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        let dayQuery = query(
          collection(db, 'queue_entries'),
          where('createdAt', '>=', dayStart),
          where('createdAt', '<=', dayEnd)
        );

        if (selectedHospital !== 'all') {
          dayQuery = query(dayQuery, where('hospitalId', '==', selectedHospital));
        }

        const daySnapshot = await getDocs(dayQuery);
        const dayEntries = daySnapshot.docs.map(doc => doc.data());

        const dayCompleted = dayEntries.filter(entry =>
          entry.status === 'completed' && entry.actualWaitTime
        );

        const avgWait = dayCompleted.length > 0
          ? Math.round(dayCompleted.reduce((sum, entry) => sum + (entry.actualWaitTime || 0), 0) / dayCompleted.length)
          : 0;

        dailyData.push({
          date: format(date, 'MMM dd'),
          patients: dayEntries.length,
          avgWaitTime: avgWait
        });
      }

      setAnalyticsData({
        totalPatients,
        averageWaitTime,
        completedPatients,
        cancelledPatients,
        departments,
        hourlyData,
        dailyData,
        departmentStats
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into hospital queue performance</p>
        </div>
        <Button onClick={() => navigate('/admin-dashboard')} variant="outline">
          Back to Admin Dashboard
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-40 justify-start text-left font-normal">
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Select value={selectedHospital} onValueChange={setSelectedHospital}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select hospital" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hospitals</SelectItem>
            {hospitals.map((hospital) => (
              <SelectItem key={hospital.id} value={hospital.id}>
                {hospital.hospitalName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.completedPatients || 0} completed, {analyticsData?.cancelledPatients || 0} cancelled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.averageWaitTime || 0} min</div>
            <p className="text-xs text-muted-foreground">
              Average time patients waited
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.totalPatients ?
                Math.round((analyticsData.completedPatients / analyticsData.totalPatients) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Patients who completed their visit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(analyticsData?.departments || {}).length}</div>
            <p className="text-xs text-muted-foreground">
              Departments with patient activity
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Trends</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Distribution by Department</CardTitle>
                <CardDescription>Breakdown of patients across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analyticsData?.departments || {}).map(([department, count], index) => ({
                        name: department,
                        value: count,
                        fill: COLORS[index % COLORS.length]
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(analyticsData?.departments || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily Patient Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Patient Flow</CardTitle>
                <CardDescription>Patient arrivals throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="patients" fill="#8884d8" name="Patients" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Patient Activity</CardTitle>
              <CardDescription>Patient arrivals and wait times by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData?.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="patients" fill="#8884d8" name="Patients" />
                  <Line yAxisId="right" type="monotone" dataKey="avgWaitTime" stroke="#82ca9d" name="Avg Wait Time (min)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Detailed metrics for each department</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Patients</TableHead>
                    <TableHead>Avg Wait Time</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsData?.departmentStats.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell className="font-medium">{dept.department}</TableCell>
                      <TableCell>{dept.patients}</TableCell>
                      <TableCell>{dept.avgWaitTime} min</TableCell>
                      <TableCell>{dept.completionRate}%</TableCell>
                      <TableCell>
                        <Badge variant={dept.completionRate > 80 ? "default" : dept.completionRate > 60 ? "secondary" : "destructive"}>
                          {dept.completionRate > 80 ? "Excellent" : dept.completionRate > 60 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Trends</CardTitle>
              <CardDescription>Patient volume and wait times over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData?.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="patients" fill="#8884d8" name="Patients" />
                  <Line yAxisId="right" type="monotone" dataKey="avgWaitTime" stroke="#ff7300" name="Avg Wait Time (min)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
