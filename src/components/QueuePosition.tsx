import { Progress } from "@/components/ui/progress";

interface QueuePositionProps {
  position: number;
  estimatedWait: number;
}

export const QueuePosition = ({ position, estimatedWait }: QueuePositionProps) => {
  const totalPatients = 25; // Mock total
  const progress = ((totalPatients - position) / totalPatients) * 100;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-muted-foreground mb-2">Your Position in Queue</p>
        <div className="inline-flex items-baseline space-x-2">
          <span className="text-6xl font-bold text-primary">{position}</span>
          <span className="text-2xl text-muted-foreground">/ {totalPatients}</span>
        </div>
      </div>

      <Progress value={progress} className="h-3" />

      <div className="text-center">
        <p className="text-sm text-muted-foreground">Estimated wait time</p>
        <p className="text-3xl font-bold text-warning">{estimatedWait} minutes</p>
      </div>
    </div>
  );
};
