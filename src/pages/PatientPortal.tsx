import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { DepartmentSelector } from "@/components/DepartmentSelector";
import { QueuePosition } from "@/components/QueuePosition";

const PatientPortal = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [queuePosition, setQueuePosition] = useState(12);
  const [estimatedWait, setEstimatedWait] = useState(35);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    // Simulate queue position assignment
    setQueuePosition(Math.floor(Math.random() * 20) + 5);
    setEstimatedWait(Math.floor(Math.random() * 60) + 15);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Patient Portal</h1>
          <p className="text-muted-foreground">Virtual check-in and queue management</p>
        </div>

        {!isCheckedIn ? (
          /* Check-in Form */
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6 shadow-elevated">
              <h2 className="text-2xl font-semibold mb-6">Virtual Check-In</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Patient Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Patient ID / Medical Record Number</label>
                  <input
                    type="text"
                    placeholder="Enter your ID"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <DepartmentSelector
                  selectedDepartment={selectedDepartment}
                  onSelect={setSelectedDepartment}
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Appointment Type</label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Walk-in</option>
                    <option>Scheduled Appointment</option>
                    <option>Follow-up</option>
                    <option>Emergency</option>
                  </select>
                </div>

                <Button
                  onClick={handleCheckIn}
                  className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                  size="lg"
                  disabled={!selectedDepartment}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Complete Check-In
                </Button>
              </div>
            </Card>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4 shadow-card">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Save Time</h3>
                    <p className="text-sm text-muted-foreground">Check in from anywhere and reduce wait times</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 shadow-card">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-secondary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Real-Time Updates</h3>
                    <p className="text-sm text-muted-foreground">Get notifications about your queue status</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Queue Status Display */
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="p-6 shadow-elevated bg-gradient-to-br from-card to-accent/5">
              <div className="flex items-center justify-between mb-6">
                <Badge className="bg-secondary text-secondary-foreground">Checked In</Badge>
                <span className="text-sm text-muted-foreground">Department: {selectedDepartment}</span>
              </div>

              <QueuePosition position={queuePosition} estimatedWait={estimatedWait} />

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <Card className="p-4 bg-background/50">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Patients Ahead</p>
                      <p className="text-2xl font-bold">{queuePosition - 1}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-background/50">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-sm text-muted-foreground">Est. Wait Time</p>
                      <p className="text-2xl font-bold">{estimatedWait} min</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-background/50">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-semibold text-secondary">In Queue</p>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>

            {/* Progress Timeline */}
            <Card className="p-6 shadow-card">
              <h3 className="font-semibold mb-4">Your Journey</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Checked In</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-warning flex items-center justify-center">
                    <Clock className="h-5 w-5 text-warning-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Waiting in Queue</p>
                    <p className="text-sm text-muted-foreground">Current status</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Consultation</p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsCheckedIn(false)}
              >
                Cancel Check-In
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPortal;
