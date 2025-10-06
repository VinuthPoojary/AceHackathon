import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Clock, Star, Navigation, Heart, Shield, Users, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_HOSPITALS, type Hospital } from "@/data/hospitals";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

// Using the Hospital interface from hospitals.ts

interface HospitalSelectorProps {
  selectedHospital?: any;
  onSelectHospital?: (hospital: any) => void;
  userLocation?: { lat: number; lng: number };
}

export const HospitalSelector = ({ selectedHospital, onSelectHospital, userLocation }: HospitalSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Debug logging
  console.log("HospitalSelector rendered with:", { selectedHospital, hospitals: hospitals.length, isLoading });

  useEffect(() => {
    // Use local hospital data for now, can be replaced with Firestore data later
    setHospitals(ALL_HOSPITALS);
    setIsLoading(false);
    
    // Optional: Also listen to Firestore for any additional hospitals
    // const hospitalsQuery = query(
    //   collection(db, 'hospitals'),
    //   where('status', '==', 'active')
    // );
    
    // const unsubscribe = onSnapshot(hospitalsQuery, (snapshot) => {
    //   const firestoreHospitals = snapshot.docs.map(doc => ({
    //     id: doc.id,
    //     ...doc.data()
    //   })) as Hospital[];
    //   setHospitals([...ALL_HOSPITALS, ...firestoreHospitals]);
    // });

    // return () => unsubscribe();
  }, []);

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || hospital.availableServices.includes(selectedSpecialty);
    const matchesRegion = !selectedRegion || hospital.region === selectedRegion;
    return matchesSearch && matchesSpecialty && matchesRegion;
  });

  const specialties = [...new Set(hospitals.flatMap(h => h.availableServices))];

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search hospitals by name, location, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger>
            <SelectValue placeholder="Select Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Regions</SelectItem>
            <SelectItem value="Mangalore">Mangalore</SelectItem>
            <SelectItem value="Udupi">Udupi</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger>
            <SelectValue placeholder="Select Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Specialties</SelectItem>
            {specialties.map(specialty => (
              <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading approved hospitals...</p>
        </div>
      )}

      {/* Hospital Cards */}
      {!isLoading && (
        <div className="grid gap-4">
          {filteredHospitals.map((hospital) => (
            <Card
              key={hospital.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedHospital?.id === hospital.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => onSelectHospital?.(hospital)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {hospital.hospitalName}
                      {hospital.emergencyAvailable && (
                        <Badge variant="destructive" className="text-xs">
                          <Heart className="w-3 h-3 mr-1" />
                          Emergency
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {hospital.address}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {hospital.region}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{hospital.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="default" className="text-xs">
                      Approved
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{hospital.contactNo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{hospital.timing}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>ID: {hospital.hospitalId}</span>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Available Services</h4>
                    <div className="flex flex-wrap gap-1">
                      {hospital.availableServices.slice(0, 3).map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {hospital.availableServices.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{hospital.availableServices.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Price & Days */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-green-600">
                      {hospital.priceRange}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {hospital.operatingHours}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Available: {hospital.daysAvailable.join(', ')}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <MapPin className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{hospital.hospitalName}</DialogTitle>
                          <DialogDescription>
                            Hospital details and contact information.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">Contact Information</h4>
                              <p>Phone: {hospital.contactNo}</p>
                              <p>Email: {hospital.email}</p>
                              <p>Location: {hospital.location}</p>
                            </div>
                            <div>
                              <h4 className="font-medium">Operating Hours</h4>
                              <p>Timing: {hospital.timing}</p>
                              <p>Days: {hospital.daysAvailable.join(', ')}</p>
                              <p>Minimum Price: ₹{hospital.minimumPrice}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium">Available Services</h4>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {hospital.availableServices.map((service) => (
                                <Badge key={service} variant="outline" className="text-xs">
                                  <Shield className="w-3 h-3 mr-1" />
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredHospitals.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No approved hospitals found</h3>
          <p className="text-muted-foreground">
            {hospitals.length === 0 
              ? "No hospitals have been approved yet. Please check back later."
              : "Try adjusting your search criteria"
            }
          </p>
        </div>
      )}
    </div>
  );
};
