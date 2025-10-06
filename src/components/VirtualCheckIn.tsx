import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, List } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

export const VirtualCheckIn = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [bookingId, setBookingId] = useState("");
  const [isCheckingBooking, setIsCheckingBooking] = useState(false);
  const [isBookingValid, setIsBookingValid] = useState(false);

  const validateBookingId = async () => {
    if (!bookingId) {
      toast.error("Please enter a booking ID.");
      setIsBookingValid(false);
      return;
    }
    setIsCheckingBooking(true);
    try {
      const q = query(
        collection(db, "checkins"),
        where("bookingId", "==", bookingId)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setIsBookingValid(true);
        toast.success("Booking ID is valid. You can view the queue.");
      } else {
        setIsBookingValid(false);
        toast.error("Invalid booking ID. Please check and try again.");
      }
    } catch (error) {
      console.error("Error validating booking ID:", error);
      toast.error("Error validating booking ID. Please try again.");
      setIsBookingValid(false);
    } finally {
      setIsCheckingBooking(false);
    }
  };

  const handleViewQueue = () => {
    if (!isBookingValid) {
      toast.error("Please enter a valid booking ID before viewing the queue.");
      return;
    }
    navigate("/displayqueue");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Virtual Check-in</h1>
          <p className="text-muted-foreground">
            Enter your booking ID to view your queue status
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking ID</CardTitle>
            <CardDescription>
              Please enter your booking ID to proceed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <input
              type="text"
              placeholder="Enter Booking ID"
              value={bookingId}
              onChange={(e) => {
                setBookingId(e.target.value);
                setIsBookingValid(false); // reset validity on change
              }}
              onBlur={validateBookingId}
              className="w-full px-4 py-2 border rounded-md"
              disabled={isCheckingBooking}
            />

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please ensure you have a confirmed booking ID before proceeding.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleViewQueue}
              disabled={!isBookingValid || isCheckingBooking}
              className="w-full"
              size="lg"
            >
              {isCheckingBooking ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <List className="w-4 h-4 mr-2" />
                  View Queue
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
