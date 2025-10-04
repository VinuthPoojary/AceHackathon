import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, CheckCircle, X, Search, Filter } from "lucide-react";

export const QueueManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const patients = [
    { id: "P001", name: "John Doe", department: "Cardiology", priority: "High", waitTime: 45, status: "Waiting" },
    { id: "P002", name: "Sarah Smith", department: "Emergency", priority: "Urgent", waitTime: 5, status: "In Progress" },
    { id: "P003", name: "Mike Johnson", department: "Orthopedics", priority: "Medium", waitTime: 30, status: "Waiting" },
    { id: "P004", name: "Emma Wilson", department: "Pediatrics", priority: "Low", waitTime: 20, status: "Waiting" },
    { id: "P005", name: "David Brown", department: "Cardiology", priority: "Medium", waitTime: 35, status: "Waiting" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-destructive text-destructive-foreground";
      case "High":
        return "bg-warning text-warning-foreground";
      case "Medium":
        return "bg-primary text-primary-foreground";
      case "Low":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "In Progress"
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground";
  };

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
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b hover:bg-accent/50 transition-colors">
                  <td className="py-4 px-4 font-medium">{patient.id}</td>
                  <td className="py-4 px-4">{patient.name}</td>
                  <td className="py-4 px-4 text-muted-foreground">{patient.department}</td>
                  <td className="py-4 px-4">
                    <Badge className={getPriorityColor(patient.priority)}>
                      {patient.priority}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{patient.waitTime} min</td>
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
                      <Button size="sm" variant="ghost" className="text-secondary" title="Complete">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" title="Cancel">
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
