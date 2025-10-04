import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Activity } from "lucide-react";

const QueueDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const queues = [
    { id: "Q001", name: "John Doe", status: "Consulting", room: "Room 3", time: "10:30 AM" },
    { id: "Q002", name: "Sarah Smith", status: "Ready", room: "Room 1", time: "10:35 AM" },
    { id: "Q003", name: "Mike Johnson", status: "Waiting", room: "-", time: "10:40 AM" },
    { id: "Q004", name: "Emma Wilson", status: "Waiting", room: "-", time: "10:45 AM" },
    { id: "Q005", name: "David Brown", status: "Waiting", room: "-", time: "10:50 AM" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Consulting":
        return "bg-primary text-primary-foreground";
      case "Ready":
        return "bg-secondary text-secondary-foreground";
      case "Waiting":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 shadow-elevated bg-gradient-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Queue Management System</h1>
              <p className="text-primary-foreground/80">Real-time patient queue status</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold">{currentTime.toLocaleTimeString()}</p>
              <p className="text-primary-foreground/80">{currentTime.toLocaleDateString()}</p>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-card bg-gradient-to-br from-card to-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-2">Total in Queue</p>
                <p className="text-5xl font-bold text-primary">23</p>
              </div>
              <Users className="h-16 w-16 text-primary opacity-20" />
            </div>
          </Card>

          <Card className="p-6 shadow-card bg-gradient-to-br from-card to-warning/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-2">Avg Wait Time</p>
                <p className="text-5xl font-bold text-warning">18</p>
                <p className="text-sm text-muted-foreground">minutes</p>
              </div>
              <Clock className="h-16 w-16 text-warning opacity-20" />
            </div>
          </Card>

          <Card className="p-6 shadow-card bg-gradient-to-br from-card to-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-2">Now Serving</p>
                <p className="text-5xl font-bold text-secondary">Q002</p>
              </div>
              <Activity className="h-16 w-16 text-secondary opacity-20" />
            </div>
          </Card>
        </div>

        {/* Queue List */}
        <Card className="p-6 shadow-elevated">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Activity className="mr-3 h-8 w-8 text-primary" />
            Current Queue Status
          </h2>

          <div className="space-y-4">
            {queues.map((patient, index) => (
              <div
                key={patient.id}
                className={`flex items-center justify-between p-6 rounded-lg transition-all ${
                  index === 0
                    ? "bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-primary scale-105"
                    : index === 1
                    ? "bg-gradient-to-r from-secondary/20 to-secondary/5 border-2 border-secondary"
                    : "bg-accent/30 hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center space-x-6 flex-1">
                  <div className="text-center min-w-[100px]">
                    <p className="text-3xl font-bold text-primary">{patient.id}</p>
                  </div>

                  <div className="h-12 w-px bg-border" />

                  <div className="flex-1">
                    <p className="text-2xl font-semibold mb-1">{patient.name}</p>
                    <div className="flex items-center space-x-4 text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {patient.time}
                      </span>
                      {patient.room !== "-" && (
                        <span className="font-medium text-foreground">{patient.room}</span>
                      )}
                    </div>
                  </div>

                  <Badge className={`${getStatusColor(patient.status)} text-lg px-4 py-2`}>
                    {patient.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Announcements */}
        <Card className="p-6 shadow-card bg-gradient-to-r from-accent/50 to-background">
          <div className="flex items-start space-x-4">
            <Activity className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Important Notice</h3>
              <p className="text-muted-foreground">
                Please ensure your contact information is up to date. We will notify you via SMS when
                it's your turn. Thank you for your patience.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QueueDisplay;
