import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, CheckCircle, X, Search, Filter } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";

export const QueueManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for check-ins
    const q = query(collection(db, "checkins"), orderBy("checkedInAt", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const checkins = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(checkins);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updatePatientStatus = async (patientId: string, newStatus: string) => {
    try {
      const patientRef = doc(db, "checkins", patientId);
      await updateDoc(patientRef, {
        status: newStatus,
        ...(newStatus === "completed" && { completedAt: new Date() }),
        ...(newStatus === "cancelled" && { cancelledAt: new Date() }),
      });
    } catch (error) {
      console.error("Error updating patient status:", error);
    }
  };

  const getPriorityColor = (appointmentType: string) => {
    switch (appointmentType) {
      case "Emergency":
        return "bg-destructive text-destructive-foreground";
      case "Scheduled Appointment":
        return "bg-warning text-warning-foreground";
      case "Follow-up":
        return "bg-primary text-primary-foreground";
      case "Walk-in":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-muted text-muted-foreground";
      case "in-progress":
        return "bg-primary text-primary-foreground";
      case "completed":
        return "bg-secondary text-secondary-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted";
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-6 shadow-elevated">
      <div className="space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Patient ID</th>
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Department</th>
                <th className="text-left py-3 px-4 font-semibold">Priority</th>
                <th className="text-left py-3 px-4 font-semibold">Wait Time</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-right py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b hover:bg-accent/50 transition-colors">
                  <td className="py-4 px-4 font-medium">{patient.patientId}</td>
                  <td className="py-4 px-4">{patient.patientName}</td>
                  <td className="py-4 px-4 text-muted-foreground">{patient.department}</td>
                  <td className="py-4 px-4">
                    <Badge className={getPriorityColor(patient.appointmentType)}>
                      {patient.appointmentType}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{patient.estimatedWait} min</td>
                  <td className="py-4 px-4">
                    <Badge className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button size="sm" variant="ghost" title="Move up">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" title="Move down">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-secondary"
                        title="Complete"
                        onClick={() => updatePatientStatus(patient.id, "completed")}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        title="Cancel"
                        onClick={() => updatePatientStatus(patient.id, "cancelled")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button className="bg-gradient-primary text-primary-foreground">
            Call Next Patient
          </Button>
          <Button variant="outline">Add Walk-in</Button>
          <Button variant="outline">Export Queue Data</Button>
        </div>
      </div>
    </Card>
  );
};
