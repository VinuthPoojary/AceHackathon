import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Timer,
  User,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { getPatientQueuePosition, type QueueEntry } from '@/lib/queueService';
import { toast } from '@/components/ui/sonner';

interface QueuePositionProps {
  hospitalId?: string;
}

export const QueuePosition = ({ hospitalId }: QueuePositionProps) => {
  const { currentUser } = useAuth();
  const [queuePosition, setQueuePosition] = useState<QueueEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!currentUser || !hospitalId) return;

    const unsubscribe = getPatientQueuePosition(
      currentUser.uid,
      hospitalId,
      (position) => {
        setQueuePosition(position);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, hospitalId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // The real-time listener will automatically update the position
    setTimeout(() => setIsRefreshing(false), 1000);
    toast.success('Queue position refreshed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'called':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-4 h-4" />;
      case 'called':
        return <AlertTriangle className="w-4 h-4" />;
      case 'in_progress':
        return <Stethoscope className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading your queue position...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!queuePosition) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Queue Position
          </CardTitle>
          <CardDescription>
            Your current position in the hospital queue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              No active queue position found. You may not have a current appointment or your appointment may have been completed.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      {/* Main Queue Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Queue Position
              </CardTitle>
              <CardDescription>
                Your current status at {queuePosition.hospitalName}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Queue Number and Status */}
          <div className="text-center space-y-2">
            <div className="text-6xl font-bold text-primary">
              {queuePosition.queueNumber}
            </div>
            <div className="flex items-center justify-center gap-2">
              {getStatusIcon(queuePosition.status)}
              <Badge className={getStatusColor(queuePosition.status)}>
                {queuePosition.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getPriorityColor(queuePosition.priority)}>
                {queuePosition.priority.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Department and Doctor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Department</h4>
              <p className="text-lg font-medium">{queuePosition.department}</p>
            </div>
            {queuePosition.doctorName && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Doctor</h4>
                <p className="text-lg font-medium">{queuePosition.doctorName}</p>
              </div>
            )}
          </div>

          {/* Hospital Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Hospital</h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-medium">{queuePosition.hospitalName}</p>
                <p className="text-sm text-muted-foreground">
                  Hospital ID: {queuePosition.hospitalId}
                </p>
              </div>
            </div>
          </div>

          {/* Wait Time Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Estimated Wait Time</h4>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-primary" />
                <span className="text-lg font-medium">
                  {queuePosition.estimatedWaitTime} minutes
                </span>
              </div>
            </div>
            {queuePosition.actualWaitTime && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Actual Wait Time</h4>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-medium">
                    {queuePosition.actualWaitTime} minutes
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Appointment Details */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Appointment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{queuePosition.patientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-muted-foreground" />
                <span>{queuePosition.appointmentType}</span>
              </div>
        </div>
      </div>

          {/* Status Messages */}
          {queuePosition.status === 'waiting' && (
            <Alert>
              <Clock className="w-4 h-4" />
              <AlertDescription>
                You are currently waiting. Please stay in the waiting area. We will call your number when it's your turn.
              </AlertDescription>
            </Alert>
          )}

          {queuePosition.status === 'called' && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Your number has been called!</strong> Please proceed to the consultation room immediately.
              </AlertDescription>
            </Alert>
          )}

          {queuePosition.status === 'in_progress' && (
            <Alert className="border-purple-200 bg-purple-50">
              <Stethoscope className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                Your consultation is currently in progress. Please wait for the doctor to complete your examination.
              </AlertDescription>
            </Alert>
          )}

          {queuePosition.status === 'completed' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your appointment has been completed. Thank you for visiting us!
              </AlertDescription>
            </Alert>
          )}

          {/* Notes */}
          {queuePosition.notes && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Notes</h4>
              <p className="text-sm bg-muted p-3 rounded-lg">{queuePosition.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Contact Hospital
            </Button>
      </div>
        </CardContent>
      </Card>
    </div>
  );
};