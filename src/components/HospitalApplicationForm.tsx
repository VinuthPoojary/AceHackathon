import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface HospitalApplicationData {
  hospitalName: string;
  location: string;
  email: string;
  contactNo: string;
  availableServices: string[];
  minimumPrice: number;
  timing: string;
  daysAvailable: string[];
  additionalInfo?: string;
}

const HospitalApplicationForm: React.FC = () => {
  const [formData, setFormData] = useState<HospitalApplicationData>({
    hospitalName: '',
    location: '',
    email: '',
    contactNo: '',
    availableServices: [],
    minimumPrice: 0,
    timing: '',
    daysAvailable: [],
    additionalInfo: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableServicesOptions = [
    'Emergency Care',
    'General Medicine',
    'Surgery',
    'Pediatrics',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Dermatology',
    'Ophthalmology',
    'ENT',
    'Gynecology',
    'Psychiatry',
    'Radiology',
    'Laboratory',
    'Pharmacy',
    'Physiotherapy',
    'Dental Care'
  ];

  const timingOptions = [
    '24/7',
    '8:00 AM - 8:00 PM',
    '9:00 AM - 9:00 PM',
    '7:00 AM - 7:00 PM',
    '10:00 AM - 6:00 PM'
  ];

  const daysOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const handleInputChange = (field: keyof HospitalApplicationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      availableServices: prev.availableServices.includes(service)
        ? prev.availableServices.filter(s => s !== service)
        : [...prev.availableServices, service]
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      daysAvailable: prev.daysAvailable.includes(day)
        ? prev.daysAvailable.filter(d => d !== day)
        : [...prev.daysAvailable, day]
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.hospitalName.trim()) {
      toast.error('Hospital name is required');
      return false;
    }
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Valid email is required');
      return false;
    }
    if (!formData.contactNo.trim()) {
      toast.error('Contact number is required');
      return false;
    }
    if (formData.availableServices.length === 0) {
      toast.error('Please select at least one service');
      return false;
    }
    if (formData.minimumPrice <= 0) {
      toast.error('Minimum price must be greater than 0');
      return false;
    }
    if (!formData.timing) {
      toast.error('Please select timing');
      return false;
    }
    if (formData.daysAvailable.length === 0) {
      toast.error('Please select at least one day');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const applicationData = {
        ...formData,
        status: 'pending',
        submittedAt: serverTimestamp(),
        applicationId: `HOSP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      await addDoc(collection(db, 'hospital_applications'), applicationData);
      
      toast.success('Application submitted successfully! You will receive an email with approval status.');
      
      // Reset form
      setFormData({
        hospitalName: '',
        location: '',
        email: '',
        contactNo: '',
        availableServices: [],
        minimumPrice: 0,
        timing: '',
        daysAvailable: [],
        additionalInfo: ''
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Hospital Application Form</CardTitle>
          <CardDescription className="text-center">
            Fill out this form to register your hospital with our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hospitalName">Hospital Name *</Label>
                <Input
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                  placeholder="Enter hospital name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter hospital location"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNo">Contact Number *</Label>
                <Input
                  id="contactNo"
                  value={formData.contactNo}
                  onChange={(e) => handleInputChange('contactNo', e.target.value)}
                  placeholder="Enter contact number"
                  required
                />
              </div>
            </div>

            {/* Available Services */}
            <div className="space-y-2">
              <Label>Available Services *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableServicesOptions.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={formData.availableServices.includes(service)}
                      onCheckedChange={() => handleServiceToggle(service)}
                    />
                    <Label htmlFor={service} className="text-sm">{service}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing and Timing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumPrice">Minimum Consultation Price (INR) *</Label>
                <Input
                  id="minimumPrice"
                  type="number"
                  value={formData.minimumPrice}
                  onChange={(e) => handleInputChange('minimumPrice', parseInt(e.target.value) || 0)}
                  placeholder="Enter minimum price"
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timing">Operating Hours *</Label>
                <Select value={formData.timing} onValueChange={(value) => handleInputChange('timing', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operating hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {timingOptions.map((timing) => (
                      <SelectItem key={timing} value={timing}>{timing}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Days Available */}
            <div className="space-y-2">
              <Label>Days Available *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {daysOptions.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={formData.daysAvailable.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label htmlFor={day} className="text-sm">{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder="Any additional information about your hospital..."
                rows={4}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalApplicationForm;
