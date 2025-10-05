import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthProvider";
import { QueuePosition } from "./QueuePosition";

const DEPARTMENTS = [
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

interface CheckinData {
  id: string;
  patientId: string;
  patientName: string;
  department: string;
  appointmentType: string;
  checkedInAt: Date;
  status: string;
  estimatedWait: number;
}

export const DirectQueueJoin = () => {
  const { currentUser } = useAuth();
  const [patientId, setPatientId] = useState("");
  const [department, setDepartment] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [queueData, setQueueData] = useState<CheckinData[]>([]);
  const [myPosition, setMyPosition] = useState<number | null>(null);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!department) return;

    const q = query(
      collection(db, "checkins"),
      where("department", "==", department),
      orderBy("checkedInAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const checkins = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        checkedInAt: doc.data().checkedInAt?.toDate() || new Date()
      })) as CheckinData[];

      setQueueData(checkins);

      if (joined && patientId) {
        const myIndex = checkins.findIndex(c => c.patientId === patientId);
        if (myIndex !== -1) {
          setMyPosition(myIndex + 1);
          setEstimatedWait((myIndex + 1) * 15); // 15 min per patient
        }
      }
    });

    return () => unsubscribe();
  }, [department, joined, patientId]);

  const handleJoinQueue = async () => {
    if (!patientId || !department) {
      setError("Please enter patient ID and select department");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      // Check if already in queue
      const existing = queueData.find(c => c.patientId === patientId);
      if (existing) {
        setError("You are already in the queue");
        setIsJoining(false);
        return;
      }

      // Add to checkins
      await addDoc(collection(db, "checkins"), {
        patientId,
        patientName: currentUser?.displayName || "Patient",
        department,
        appointmentType: "Walk-in",
        checkedInAt: new Date(),
        status: "waiting",
        estimatedWait: 0 // Will be calculated
      });

      setJoined(true);
    } catch (error) {
      console.error("Error joining queue:", error);
      setError("Failed to join queue. Please try again.");
    } finally {
      setIsJoining(false);
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

  if (joined && myPosition) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Successfully Joined Queue
            </CardTitle>
            <CardDescription>
              You have joined the queue for {DEPARTMENTS.find(d => d.id === department)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QueuePosition position={myPosition} estimatedWait={estimatedWait} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue List</CardTitle>
            <CardDescription>Current patients in queue for {DEPARTMENTS.find(d => d.id === department)?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {queueData.map((patient, index) => (
                <div key={patient.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                  patient.patientId === patientId ? 'bg-primary/5 border-primary' : 'bg-muted/50'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{patient.patientName}</p>
                      <p className="text-sm text-muted-foreground">ID: {patient.patientId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Wait time</p>
                      <p className="font-medium">{(index + 1) * 15} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Join Queue Directly</CardTitle>
          <CardDescription>
            Enter your patient ID and select department to join the queue without booking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              placeholder="Enter your patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleJoinQueue}
            disabled={isJoining || !patientId || !department}
            className="w-full"
          >
            {isJoining ? "Joining Queue..." : "Join Queue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
