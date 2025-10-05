import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Activity } from "lucide-react";
import { getHospitalQueues, QueueEntry } from "@/lib/queueService";

// Common departments available across hospitals
const COMMON_DEPARTMENTS = [
  "Emergency",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology",
  "General Medicine",
  "Surgery",
  "Internal Medicine",
  "Dermatology",
  "Ophthalmology",
  "ENT",
  "Oncology",
  "Radiation Therapy",
  "Chemotherapy"
];

const QueueDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [queues, setQueues] = useState<QueueEntry[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>("MGL001"); // Default to first hospital
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedHospital) return;

    // Subscribe to hospital queues dynamically
    const unsubscribe = getHospitalQueues(selectedHospital, (queuesData) => {
      // Flatten all currentQueue arrays from all departments into one array for display
      const allQueueEntries = queuesData.flatMap(queue => queue.currentQueue);
      // Sort by queueNumber ascending
      allQueueEntries.sort((a, b) => a.queueNumber - b.queueNumber);
      setQueues(allQueueEntries);
    });

    return () => unsubscribe();
  }, [selectedHospital]);

  // Filter queues by selected department
  const filteredQueues = selectedDepartment === "all"
    ? queues
    : queues.filter(queue => queue.department === selectedDepartment);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "called":
        return "bg-secondary text-secondary-foreground";
      case "in_progress":
        return "bg-primary text-primary-foreground";
      case "waiting":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "called":
        return "Ready";
      case "in_progress":
        return "Consulting";
      case "waiting":
        return "Waiting";
      default:
        return status;
    }
  };

  const calculateAverageWaitTime = () => {
    if (filteredQueues.length === 0) return 0;
    const totalWaitTime = filteredQueues.reduce((sum, entry) => sum + (entry.estimatedWaitTime || 0), 0);
    return Math.round(totalWaitTime / filteredQueues.length);
  };

  const getNowServing = () => {
    const calledEntry = filteredQueues.find(q => q.status === 'called');
    return calledEntry ? `Q${calledEntry.queueNumber}` : 'N/A';
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

        {/* Hospital and Department Selector */}
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="font-semibold">Hospital:</label>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="MGL001">A.J. Hospital & Research Centre</option>
                <option value="MGL002">KMC Hospital</option>
                <option value="MGL003">Yenepoya Medical College Hospital</option>
                <option value="UDP001">Kasturba Medical College Hospital</option>
                <option value="UDP002">Dr. TMA Pai Hospital</option>
                <option value="UDP003">Manipal Hospital Udupi</option>
                {/* Add more hospitals as needed */}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold">Department:</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Departments</option>
                {COMMON_DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-card bg-gradient-to-br from-card to-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-2">Total in Queue</p>
                <p className="text-5xl font-bold text-primary">{filteredQueues.length}</p>
              </div>
              <Users className="h-16 w-16 text-primary opacity-20" />
            </div>
          </Card>

          <Card className="p-6 shadow-card bg-gradient-to-br from-card to-warning/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-2">Avg Wait Time</p>
                <p className="text-5xl font-bold text-warning">{calculateAverageWaitTime()}</p>
                <p className="text-sm text-muted-foreground">minutes</p>
              </div>
              <Clock className="h-16 w-16 text-warning opacity-20" />
            </div>
          </Card>

          <Card className="p-6 shadow-card bg-gradient-to-br from-card to-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-2">Now Serving</p>
                <p className="text-5xl font-bold text-secondary">{getNowServing()}</p>
              </div>
              <Activity className="h-16 w-16 text-secondary opacity-20" />
            </div>
          </Card>
        </div>

        {/* Queue List */}
        <Card className="p-6 shadow-elevated">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Activity className="mr-3 h-8 w-8 text-primary" />
            Current Queue Status {selectedDepartment !== "all" && `- ${selectedDepartment}`}
          </h2>

          {filteredQueues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {selectedDepartment === "all" ? "No patients in queue" : `No patients in ${selectedDepartment} queue`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueues.map((patient, index) => (
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
                      <p className="text-3xl font-bold text-primary">Q{patient.queueNumber}</p>
                    </div>

                    <div className="h-12 w-px bg-border" />

                    <div className="flex-1">
                      <p className="text-2xl font-semibold mb-1">{patient.patientName}</p>
                      <div className="flex items-center space-x-4 text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {patient.estimatedWaitTime} min
                        </span>
                        {patient.department && (
                          <span className="font-medium text-foreground">{patient.department}</span>
                        )}
                      </div>
                    </div>

                    <Badge className={`${getStatusColor(patient.status)} text-lg px-4 py-2`}>
                      {getStatusDisplay(patient.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
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
