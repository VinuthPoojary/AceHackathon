import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { QueueManagement } from "@/components/QueueManagement";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
          <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
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
