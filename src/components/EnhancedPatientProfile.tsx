import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/sonner";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  AlertTriangle, 
  FileText, 
  Pill,
  Activity,
  Save,
  Edit,
  CheckCircle,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface PatientProfile {
  // Basic Information
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  sex: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContact: string;
  emergencyPhone: string;
  relationship: string;
  
  // Medical Information
  bloodGroup: string;
  allergies: string[];
  medicalConditions: string[];
  currentMedications: string[];
  pastSurgeries: string[];
  familyHistory: string[];
  
  // Insurance Information
  insuranceProvider: string;
  insuranceNumber: string;
  policyNumber: string;
  
  // Additional Information
  occupation: string;
  maritalStatus: string;
  preferredLanguage: string;
  patientId: string;
}

export const EnhancedPatientProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const docRef = doc(db, "patients", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as PatientProfile;
        // Ensure all array fields are properly initialized
        setProfile({
          ...data,
          allergies: data.allergies || [],
          medicalConditions: data.medicalConditions || [],
          currentMedications: data.currentMedications || [],
          pastSurgeries: data.pastSurgeries || [],
          familyHistory: data.familyHistory || []
        });
      } else {
        // Initialize with default values
        setProfile({
          fullName: currentUser.displayName || "",
          email: currentUser.email || "",
          phone: "",
          dob: "",
          sex: "",
          address: "",
          city: "Udupi",
          state: "Karnataka",
          pincode: "",
          emergencyContact: "",
          emergencyPhone: "",
          relationship: "",
          bloodGroup: "",
          allergies: [],
          medicalConditions: [],
          currentMedications: [],
          pastSurgeries: [],
          familyHistory: [],
          insuranceProvider: "",
          insuranceNumber: "",
          policyNumber: "",
          occupation: "",
          maritalStatus: "",
          preferredLanguage: "English",
          patientId: `PAT${Date.now()}`
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setSaveStatus('error');
      toast.error('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile || !currentUser) return;
    
    try {
      setIsSaving(true);
      await setDoc(doc(db, "patients", currentUser.uid), profile);
      setIsEditing(false);
      setSaveStatus('success');
      toast.success('Profile saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus('error');
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (field: keyof PatientProfile, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const addToArray = (field: 'allergies' | 'medicalConditions' | 'currentMedications' | 'pastSurgeries' | 'familyHistory', value: string) => {
    if (!value.trim()) return;
    setProfile(prev => prev ? {
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    } : null);
  };

  const removeFromArray = (field: 'allergies' | 'medicalConditions' | 'currentMedications' | 'pastSurgeries' | 'familyHistory', index: number) => {
    setProfile(prev => prev ? {
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    } : null);
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    const requiredFields = [
      "fullName", "phone", "dob", "sex", "address", "city", "pincode",
      "emergencyContact", "emergencyPhone", "bloodGroup"
    ];
    return requiredFields.every(field => profile[field as keyof PatientProfile]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load profile. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isProfileComplete() ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Profile Complete
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Profile Incomplete
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={saveProfile}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {saveStatus === 'success' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to save profile. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => updateProfile('fullName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => updateProfile('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={profile.dob}
                    onChange={(e) => updateProfile('dob', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="sex">Gender *</Label>
                  <Select
                    value={profile.sex}
                    onValueChange={(value) => updateProfile('sex', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bloodGroup">Blood Group *</Label>
                  <Select
                    value={profile.bloodGroup}
                    onValueChange={(value) => updateProfile('bloodGroup', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => updateProfile('address', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => updateProfile('city', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={profile.state}
                    onChange={(e) => updateProfile('state', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={profile.pincode}
                    onChange={(e) => updateProfile('pincode', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Information */}
        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Allergies */}
              <div>
                <Label>Allergies</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add allergy (e.g., Penicillin, Pollen)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('allergies', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      disabled={!isEditing}
                    />
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addToArray('allergies', input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies?.map((allergy, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {allergy}
                        {isEditing && (
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeFromArray('allergies', index)}
                          />
                        )}
                      </Badge>
                    )) || []}
                  </div>
                </div>
              </div>

              {/* Medical Conditions */}
              <div>
                <Label>Current Medical Conditions</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add medical condition (e.g., Diabetes, Hypertension)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('medicalConditions', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      disabled={!isEditing}
                    />
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addToArray('medicalConditions', input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.medicalConditions?.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {condition}
                        {isEditing && (
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeFromArray('medicalConditions', index)}
                          />
                        )}
                      </Badge>
                    )) || []}
                  </div>
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <Label>Current Medications</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add medication (e.g., Metformin 500mg)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('currentMedications', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      disabled={!isEditing}
                    />
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addToArray('currentMedications', input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.currentMedications?.map((medication, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Pill className="w-3 h-3" />
                        {medication}
                        {isEditing && (
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeFromArray('currentMedications', index)}
                          />
                        )}
                      </Badge>
                    )) || []}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Information */}
        <TabsContent value="insurance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={profile.insuranceProvider}
                    onChange={(e) => updateProfile('insuranceProvider', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., Apollo Munich, HDFC ERGO"
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceNumber">Insurance Number</Label>
                  <Input
                    id="insuranceNumber"
                    value={profile.insuranceNumber}
                    onChange={(e) => updateProfile('insuranceNumber', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    value={profile.policyNumber}
                    onChange={(e) => updateProfile('policyNumber', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Contact */}
        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Emergency Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                  <Input
                    id="emergencyContact"
                    value={profile.emergencyContact}
                    onChange={(e) => updateProfile('emergencyContact', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                  <Input
                    id="emergencyPhone"
                    value={profile.emergencyPhone}
                    onChange={(e) => updateProfile('emergencyPhone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select
                    value={profile.relationship}
                    onValueChange={(value) => updateProfile('relationship', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
