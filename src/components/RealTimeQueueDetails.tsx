import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { User, Clock, Calendar, Users, CheckCircle } from "lucide-react";

interface QueueEntry {
  id: string;
  patientId: string;
  patientName: string;
  checkedInAt: Date;
  status: string;
  queuePosition: number;
  estimatedWait: number;
}

interface RealTimeQueueDetailsProps {
  patientId: string;
  department: string;
}

const RealTimeQueueDetails: React.FC<RealTimeQueueDetailsProps> = ({ patientId, department }) => {
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [currentPosition, setCurrentPosition] = useState<number | null>(null);
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null);
  const [patientName, setPatientName] = useState<string>("");

  useEffect(() => {
    if (!department) return;

    const q = query(
      collection(db, "checkins"),
      where("department", "==", department),
      where("status", "==", "waiting"),
      orderBy("checkedInAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries: QueueEntry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          patientId: data.patientId,
          patientName: data.patientName,
          checkedInAt: data.checkedInAt.toDate(),
          status: data.status,
          queuePosition: data.queuePosition,
          estimatedWait: data.estimatedWait,
        });
      });
      setQueueEntries(entries);

      // Find patient entry by patientId field, not document id
      const patientEntry = entries.find((entry) => entry.patientId === patientId);
      if (patientEntry) {
        setCurrentPosition(patientEntry.queuePosition);
        setEstimatedWait(patientEntry.estimatedWait);
        setPatientName(patientEntry.patientName);
      } else {
        setCurrentPosition(null);
        setEstimatedWait(null);
        setPatientName("");
      }
    });

    return () => unsubscribe();
  }, [department, patientId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Queue Status</CardTitle>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {department} Department
          </Badge>
        </CardHeader>
      </Card>

      {/* Main Status Card */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          {currentPosition !== null ? (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Welcome, {patientName}</h3>
                <p className="text-sm text-gray-500">You are currently in the queue</p>
              </div>

              {/* Position Display */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-4">
                  <span className="text-2xl font-bold text-white">{currentPosition}</span>
                </div>
                <p className="text-lg font-medium text-gray-700">Your Position</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center bg-blue-50 border-blue-200">
                  <User className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Ahead</p>
                  <p className="text-xl font-bold text-blue-700">{currentPosition - 1}</p>
                </Card>

                <Card className="p-4 text-center bg-green-50 border-green-200">
                  <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Wait Time</p>
                  <p className="text-xl font-bold text-green-700">{estimatedWait ?? 0} min</p>
                </Card>

                <Card className="p-4 text-center bg-purple-50 border-purple-200">
                  <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total in Queue</p>
                  <p className="text-xl font-bold text-purple-700">{queueEntries.length}</p>
                </Card>

                <Card className="p-4 text-center bg-orange-50 border-orange-200">
                  <CheckCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-orange-700">Active</p>
                </Card>
              </div>

              {/* Progress Indicator */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Queue Progress</span>
                  <span>{Math.round(((queueEntries.length - currentPosition + 1) / queueEntries.length) * 100)}% remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((queueEntries.length - currentPosition + 1) / queueEntries.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Not in Queue</h3>
              <p className="text-gray-500">You are not currently checked in to any queue.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Button */}
      {currentPosition !== null && (
        <div className="flex justify-center">
          <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            Cancel Check-in
          </button>
        </div>
      )}
    </div>
  );
};

export default RealTimeQueueDetails;
