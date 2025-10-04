import { Button } from "@/components/ui/button";
import { Heart, Bone, Baby, Activity, Brain, Eye } from "lucide-react";

interface DepartmentSelectorProps {
  selectedDepartment: string;
  onSelect: (department: string) => void;
}

export const DepartmentSelector = ({
  selectedDepartment,
  onSelect,
}: DepartmentSelectorProps) => {
  const departments = [
    { name: "Emergency", icon: Activity, color: "text-destructive" },
    { name: "Cardiology", icon: Heart, color: "text-primary" },
    { name: "Orthopedics", icon: Bone, color: "text-secondary" },
    { name: "Pediatrics", icon: Baby, color: "text-warning" },
    { name: "Neurology", icon: Brain, color: "text-accent-foreground" },
    { name: "Ophthalmology", icon: Eye, color: "text-primary" },
  ];

  return (
    <div>
      <label className="block text-sm font-medium mb-3">Select Department</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {departments.map((dept) => {
          const Icon = dept.icon;
          const isSelected = selectedDepartment === dept.name;
          
          return (
            <Button
              key={dept.name}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onSelect(dept.name)}
              className={`h-auto py-4 flex flex-col items-center space-y-2 ${
                isSelected
                  ? "bg-gradient-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <Icon className={`h-6 w-6 ${isSelected ? "" : dept.color}`} />
              <span className="text-sm font-medium">{dept.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
