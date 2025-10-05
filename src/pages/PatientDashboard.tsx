import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Edit, Save, X, User, Clock } from "lucide-react";

interface PatientProfile {
  patientId: string;
  fullName: string;
  email: string;
  dob: string;
  phone: string;
  address: string;
  sex: string;
  married: string;
  image?: string;
  age?: number;
  profileComplete: boolean;
}

const PatientDashboard = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedProfile, setEditedProfile] = useState<Partial<PatientProfile>>({});
  const [currentTime, setCurrentTime] = useState<string>("");
  const [checkInHistory, setCheckInHistory] = useState<Array<{date: string, time: string, status: string}>>([]);
  const [latestCheckIn, setLatestCheckIn] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  // Fetch latest check-in for the patient
  useEffect(() => {
    if (!profile?.patientId) return;

    const q = query(
      collection(db, "checkins"),
      where("patientId", "==", profile.patientId),
      orderBy("checkedInAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const checkInData = querySnapshot.docs[0].data();
        setLatestCheckIn(checkInData);
      } else {
        setLatestCheckIn(null);
      }
    });

    return () => unsubscribe();
  }, [profile?.patientId]);

  // Fetch check-in history for the patient
  useEffect(() => {
    if (!profile?.patientId) return;

    const q = query(
      collection(db, "checkins"),
      where("patientId", "==", profile.patientId),
      orderBy("checkedInAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const history = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const checkInDate = data.checkedInAt?.toDate();
        return {
          date: checkInDate ? checkInDate.toLocaleDateString('en-IN') : '',
          time: checkInDate ? checkInDate.toLocaleTimeString('en-IN', { hour12: false }) : '',
          status: data.status || 'Unknown'
        };
      });
      setCheckInHistory(history);
    });

    return () => unsubscribe();
  }, [profile?.patientId]);

  const fetchProfile = async () => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'patients', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as PatientProfile;
        // Calculate age if dob exists
        if (data.dob) {
          const birthDate = new Date(data.dob);
          const today = new Date();
          data.age = today.getFullYear() - birthDate.getFullYear() -
            (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
        }
        setProfile(data);
        setEditedProfile(data);
      } else {
        // Create initial profile with generated ID
        const patientId = generatePatientId();
        const initialProfile: PatientProfile = {
          patientId,
          fullName: '',
          email: '',
          dob: '',
          phone: '',
          address: '',
          sex: '',
          married: '',
          profileComplete: false,
        };
        await setDoc(docRef, initialProfile);
        setProfile(initialProfile);
        setEditedProfile(initialProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Real-time IST clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Convert to IST timezone offset +5:30
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utc + (3600000 * 5.5));
      const timeString = istTime.toLocaleTimeString('en-IN', { hour12: false });
      setCurrentTime(timeString);
    };
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const generatePatientId = () => {
    // Generate PA followed by 4 random digits
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PA${randomNum}`;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!currentUser || !profile) return;

    try {
      const updatedProfile = { ...profile, ...editedProfile };

      // Calculate age
      if (updatedProfile.dob) {
        const birthDate = new Date(updatedProfile.dob);
        const today = new Date();
        updatedProfile.age = today.getFullYear() - birthDate.getFullYear() -
          (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
      }

      // Check if profile is complete
      updatedProfile.profileComplete = !!(
        updatedProfile.fullName &&
        updatedProfile.dob &&
        updatedProfile.phone &&
        updatedProfile.address &&
        updatedProfile.sex &&
        updatedProfile.married
      );

      await setDoc(doc(db, 'patients', currentUser.uid), updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const handleInputChange = (field: keyof PatientProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* IST Clock */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-card p-4 rounded-lg shadow-elevated">
            <Clock className="h-6 w-6 text-primary" />
            <span className="text-2xl font-mono font-bold text-foreground">{currentTime}</span>
            <span className="text-sm text-muted-foreground">IST</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="p-6 shadow-elevated">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-foreground">Patient Profile</h1>
              <Badge variant={profile.profileComplete ? "default" : "destructive"}>
                {profile.profileComplete ? "Complete" : "Incomplete"}
              </Badge>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.image} alt={profile.fullName} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{profile.fullName || 'Patient'}</h2>
                <p className="text-muted-foreground">ID: {profile.patientId}</p>
                {profile.age && <p className="text-sm text-muted-foreground">Age: {profile.age}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={editedProfile.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter full name"
                    />
                  ) : (
                    <p className="p-2 bg-muted rounded">{profile.fullName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  {isEditing ? (
                    <Input
                      id="dob"
                      type="date"
                      value={editedProfile.dob || ''}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                    />
                  ) : (
                    <p className="p-2 bg-muted rounded">{profile.dob || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email"
                    />
                  ) : (
                    <p className="p-2 bg-muted rounded">{profile.email || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editedProfile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="p-2 bg-muted rounded">{profile.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="sex">Sex</Label>
                  {isEditing ? (
                    <Select value={editedProfile.sex || ''} onValueChange={(value) => handleInputChange('sex', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="p-2 bg-muted rounded capitalize">{profile.sex || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="married">Marital Status</Label>
                  {isEditing ? (
                    <Select value={editedProfile.married || ''} onValueChange={(value) => handleInputChange('married', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="unmarried">Unmarried</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="p-2 bg-muted rounded capitalize">{profile.married || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="age">Age</Label>
                  <p className="p-2 bg-muted rounded">{profile.age || 'Not calculated'}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={editedProfile.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter address"
                    rows={3}
                  />
                ) : (
                  <p className="p-2 bg-muted rounded">{profile.address || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </Card>

          {/* Check-in History */}
          <Card className="p-6 shadow-elevated mt-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Check-in History</h2>
            <div className="space-y-2">
              {checkInHistory.map((checkIn, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{checkIn.date}</p>
                      <p className="text-sm text-muted-foreground">{checkIn.time}</p>
                    </div>
                  </div>
                  <Badge variant={checkIn.status === 'Completed' ? 'default' : 'destructive'}>
                    {checkIn.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Appointment Confirmation Status */}
          {latestCheckIn && (
            <Card className="p-6 shadow-elevated mt-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Appointment Status</h2>
              <div className="flex items-center space-x-4">
                <p className="text-lg">
                  Status:{" "}
                  <Badge variant={
                    latestCheckIn.status === "accepted"
                      ? "default"
                      : latestCheckIn.status === "waiting"
                      ? "secondary"
                      : latestCheckIn.status === "completed"
                      ? "default"
                      : "destructive"
                  }>
                    {latestCheckIn.status.charAt(0).toUpperCase() + latestCheckIn.status.slice(1)}
                  </Badge>
                </p>
                <p className="text-muted-foreground">
                  Department: {latestCheckIn.department} | Appointment Type: {latestCheckIn.appointmentType}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
