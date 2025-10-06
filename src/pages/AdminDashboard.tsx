import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import { db, auth } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, setDoc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { sendEmailNotification } from '@/lib/emailService';
import { useNavigate } from 'react-router-dom';
import { createQueueFromBookings } from '@/lib/queueService';
import { ALL_HOSPITALS, MANGALORE_HOSPITALS, UDUPI_HOSPITALS } from '@/data/hospitals';
import { SAMPLE_DOCTORS, HOSPITAL_DEPARTMENTS, Doctor } from '@/data/doctors';
import { SAMPLE_BOOKINGS, Booking } from '@/data/bookings';

interface HospitalApplication {
  id: string;
  hospitalName: string;
  location: string;
  email: string;
  contactNo: string;
  availableServices: string[];
  minimumPrice: number;
  timing: string;
  daysAvailable: string[];
  additionalInfo?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  applicationId: string;
  rejectionReason?: string;
}

interface Hospital {
  id: string;
  hospitalName: string;
  location: string;
  email: string;
  contactNo: string;
  availableServices: string[];
  minimumPrice: number;
  timing: string;
  daysAvailable: string[];
  status: 'active' | 'suspended';
  approvedAt: any;
  hospitalId: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string[];
  allergies: string[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: any;
  lastLogin: any;
  totalAppointments: number;
  completedAppointments: number;
}

const AdminDashboard: React.FC = () => {
  const [applications, setApplications] = useState<HospitalApplication[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<HospitalApplication | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedApplicationToDelete, setSelectedApplicationToDelete] = useState<HospitalApplication | null>(null);
  const [selectedPatientToDelete, setSelectedPatientToDelete] = useState<Patient | null>(null);
  const [selectedDoctorToDelete, setSelectedDoctorToDelete] = useState<Doctor | null>(null);
  const [selectedBookingToDelete, setSelectedBookingToDelete] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteApplicationDialogOpen, setIsDeleteApplicationDialogOpen] = useState(false);
  const [isDeletePatientDialogOpen, setIsDeletePatientDialogOpen] = useState(false);
  const [isDeleteDoctorDialogOpen, setIsDeleteDoctorDialogOpen] = useState(false);
  const [isDeleteBookingDialogOpen, setIsDeleteBookingDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  const [isAddingSelected, setIsAddingSelected] = useState(false);
  const [isAddingDoctors, setIsAddingDoctors] = useState(false);
  const [isAddingBookings, setIsAddingBookings] = useState(false);
  const [isCreatingQueues, setIsCreatingQueues] = useState(false);
  const navigate = useNavigate();

  // Check admin authentication
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_auth');
    if (!adminAuth) {
      navigate('/admin-login');
      return;
    }

    try {
      const authData = JSON.parse(adminAuth);
      if (!authData.uid) {
        navigate('/admin-login');
        return;
      }
    } catch (error) {
      console.error('Invalid admin auth data:', error);
      navigate('/admin-login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    // Listen to hospital applications
    const applicationsQuery = query(collection(db, 'hospital_applications'));
    const unsubscribeApplications = onSnapshot(applicationsQuery, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HospitalApplication[];
      setApplications(apps);
    });

    // Listen to approved hospitals
    const hospitalsQuery = query(
      collection(db, 'hospitals'),
      where('status', '==', 'active')
    );
    const unsubscribeHospitals = onSnapshot(hospitalsQuery, (snapshot) => {
      const hosp = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Hospital[];
      setHospitals(hosp);
    });

    // Listen to patients
    const patientsQuery = query(collection(db, 'patients'));
    const unsubscribePatients = onSnapshot(patientsQuery, (snapshot) => {
      const pats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[];
      setPatients(pats);
    });

    // Listen to doctors
    const doctorsQuery = query(collection(db, 'doctors'));
    const unsubscribeDoctors = onSnapshot(doctorsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      setDoctors(docs);
    });

    // Listen to bookings
    const bookingsQuery = query(collection(db, 'bookings'));
    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const books = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      setBookings(books);
    });

    return () => {
      unsubscribeApplications();
      unsubscribeHospitals();
      unsubscribePatients();
      unsubscribeDoctors();
      unsubscribeBookings();
    };
  }, []);

  const generateHospitalId = (hospitalName: string): string => {
    const prefix = hospitalName.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  };

  const generatePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const addSelectedHospitals = async () => {
    if (selectedHospitals.length === 0) {
      toast.error('Please select at least one hospital to add');
      return;
    }

    setIsAddingSelected(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      const hospitalsToAdd = ALL_HOSPITALS.filter(hospital => selectedHospitals.includes(hospital.id));

      for (const hospital of hospitalsToAdd) {
        try {
          // Check if hospital already exists
          const existingHospitals = await getDocs(
            query(collection(db, 'hospitals'), where('hospitalId', '==', hospital.hospitalId))
          );

          if (!existingHospitals.empty) {
            console.log(`Hospital ${hospital.hospitalName} already exists, skipping...`);
            continue;
          }

          // Create Firebase Auth user for the hospital
          let firebaseUid = null;
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, hospital.email, hospital.password);
            firebaseUid = userCredential.user.uid;
            console.log(`✅ Firebase user created for hospital: ${hospital.hospitalName}`);
          } catch (authError: any) {
            console.log(`⚠️ Firebase user already exists or error for ${hospital.hospitalName}:`, authError.code);
            if (authError.code === 'auth/email-already-in-use') {
              console.log(`📧 Email already in use for ${hospital.hospitalName}, continuing...`);
            }
          }

          // Create hospital record in Firestore
          await setDoc(doc(db, 'hospitals', hospital.id), {
            hospitalName: hospital.hospitalName,
            location: hospital.location,
            address: hospital.address,
            email: hospital.email,
            contactNo: hospital.contactNo,
            availableServices: hospital.availableServices,
            minimumPrice: hospital.minimumPrice,
            timing: hospital.timing,
            daysAvailable: hospital.daysAvailable,
            status: 'active',
            approvedAt: new Date(),
            hospitalId: hospital.hospitalId,
            password: hospital.password,
            firebaseUid,
            region: hospital.region,
            specialties: hospital.specialties,
            facilities: hospital.facilities,
            rating: hospital.rating,
            emergencyAvailable: hospital.emergencyAvailable,
            operatingHours: hospital.operatingHours,
            priceRange: hospital.priceRange,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          console.log(`✅ Hospital record created: ${hospital.hospitalName}`);
          successCount++;

          console.log(hospital)

          // Send welcome email
          try {
            await sendEmailNotification({
              to: hospital.email,
              subject: 'Welcome to MedConnect Udupi',
              html: `
              <h2>Welcome to MedConnect Udupi!</h2>
              <p>Your hospital <strong>${hospital.hospitalName}</strong> has been successfully added to our platform.</p>
              
              <h3>Login Credentials:</h3>
              <ul>
                <li><strong>Hospital ID:</strong> ${hospital.hospitalId}</li>
                <li><strong>Email:</strong> ${hospital.email}</li>
                <li><strong>Password:</strong> ${hospital.password}</li>
              </ul>
              
              <h3>Next Steps:</h3>
              <ol>
                <li>Login to your hospital dashboard using the credentials above</li>
                <li>Add your doctors and staff members</li>
                <li>Configure your services and availability</li>
                <li>Start receiving patient appointments</li>
              </ol>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br>MedConnect Udupi Team</p>
              `
            });
            console.log(`✅ Welcome email sent to ${hospital.email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send email to ${hospital.email}:`, emailError);
          }

        } catch (error) {
          console.error(`❌ Error adding hospital ${hospital.hospitalName}:`, error);
          errorCount++;
        }
      }

      toast.success(`Selected hospitals added! Success: ${successCount}, Errors: ${errorCount}`);
      console.log(`Selected hospitals addition completed! Success: ${successCount}, Errors: ${errorCount}`);
      
      // Clear selection after successful addition
      setSelectedHospitals([]);

    } catch (error) {
      console.error('Error adding selected hospitals:', error);
      toast.error('Failed to add selected hospitals');
    } finally {
      setIsAddingSelected(false);
    }
  };

  const bulkAddHospitals = async () => {
    setIsBulkAdding(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const hospital of ALL_HOSPITALS) {
        try {
          // Check if hospital already exists
          const existingHospitals = await getDocs(
            query(collection(db, 'hospitals'), where('hospitalId', '==', hospital.hospitalId))
          );

          if (!existingHospitals.empty) {
            console.log(`Hospital ${hospital.hospitalName} already exists, skipping...`);
            continue;
          }

          // Create Firebase Auth user for the hospital
          let firebaseUid = null;
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, hospital.email, hospital.password);
            firebaseUid = userCredential.user.uid;
            console.log(`✅ Firebase user created for hospital: ${hospital.hospitalName}`);
          } catch (authError: any) {
            console.log(`⚠️ Firebase user already exists or error for ${hospital.hospitalName}:`, authError.code);
            if (authError.code === 'auth/email-already-in-use') {
              console.log(`📧 Email already in use for ${hospital.hospitalName}, continuing...`);
            }
          }

          // Create hospital record in Firestore
          await setDoc(doc(db, 'hospitals', hospital.id), {
            hospitalName: hospital.hospitalName,
            location: hospital.location,
            address: hospital.address,
            email: hospital.email,
            contactNo: hospital.contactNo,
            availableServices: hospital.availableServices,
            minimumPrice: hospital.minimumPrice,
            timing: hospital.timing,
            daysAvailable: hospital.daysAvailable,
            status: 'active',
            approvedAt: new Date(),
            hospitalId: hospital.hospitalId,
            password: hospital.password,
            firebaseUid,
            region: hospital.region,
            specialties: hospital.specialties,
            facilities: hospital.facilities,
            rating: hospital.rating,
            emergencyAvailable: hospital.emergencyAvailable,
            operatingHours: hospital.operatingHours,
            priceRange: hospital.priceRange,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          console.log(`✅ Hospital record created: ${hospital.hospitalName}`);
          successCount++;

          // Send welcome email
          try {
            await sendEmailNotification({
              to: hospital.email,
              subject: 'Welcome to MedConnect Udupi',
              html: `
              <h2>Welcome to MedConnect Udupi!</h2>
              <p>Your hospital <strong>${hospital.hospitalName}</strong> has been successfully added to our platform.</p>
              
              <h3>Login Credentials:</h3>
              <ul>
                <li><strong>Hospital ID:</strong> ${hospital.hospitalId}</li>
                <li><strong>Email:</strong> ${hospital.email}</li>
                <li><strong>Password:</strong> ${hospital.password}</li>
              </ul>
              
              <h3>Next Steps:</h3>
              <ol>
                <li>Login to your hospital dashboard using the credentials above</li>
                <li>Add your doctors and staff members</li>
                <li>Configure your services and availability</li>
                <li>Start receiving patient appointments</li>
              </ol>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br>MedConnect Udupi Team</p>
              `
            });
            console.log(`✅ Welcome email sent to ${hospital.email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send email to ${hospital.email}:`, emailError);
          }

        } catch (error) {
          console.error(`❌ Error adding hospital ${hospital.hospitalName}:`, error);
          errorCount++;
        }
      }

      toast.success(`Bulk hospital addition completed! Success: ${successCount}, Errors: ${errorCount}`);
      console.log(`Bulk hospital addition completed! Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error('Error in bulk hospital addition:', error);
      toast.error('Failed to add hospitals in bulk');
    } finally {
      setIsBulkAdding(false);
    }
  };

  const handleApproveApplication = async (application: HospitalApplication) => {
    setIsProcessing(true);
    try {
      const hospitalId = generateHospitalId(application.hospitalName);
      const password = generatePassword();

      // Update application status
      await updateDoc(doc(db, 'hospital_applications', application.id), {
        status: 'approved',
        approvedAt: new Date(),
        hospitalId,
        password
      });

      // Create Firebase Auth user for the hospital
      let firebaseUid = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, application.email, password);
        firebaseUid = userCredential.user.uid;
        console.log('✅ Firebase user created for hospital:', firebaseUid);
      } catch (authError: any) {
        console.log('⚠️ Firebase user already exists or error:', authError.code);
        // Continue with hospital record creation even if user exists
        if (authError.code === 'auth/email-already-in-use') {
          console.log('📧 Email already in use, continuing with hospital record creation');
        } else {
          console.error('❌ Unexpected Firebase error:', authError);
          // Don't throw error, continue with hospital record creation
        }
      }

      // Create hospital record in Firestore
      await setDoc(doc(db, 'hospitals', hospitalId), {
        hospitalName: application.hospitalName,
        location: application.location,
        email: application.email,
        contactNo: application.contactNo,
        availableServices: application.availableServices,
        minimumPrice: application.minimumPrice,
        timing: application.timing,
        daysAvailable: application.daysAvailable,
        status: 'approved',
        approvedAt: new Date(),
        hospitalId,
        password,
        firebaseUid,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Hospital record created in Firestore:', hospitalId);

      // Send approval email
      await sendEmailNotification({
        to: application.email,
        subject: '🎉 Hospital Application Approved - MedConnect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
                <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">Your hospital application has been approved</p>
              </div>
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
                <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">Hospital Details</h2>
                <p style="margin: 8px 0; color: #374151;"><strong>Hospital Name:</strong> ${application.hospitalName}</p>
                <p style="margin: 8px 0; color: #374151;"><strong>Location:</strong> ${application.location}</p>
                <p style="margin: 8px 0; color: #374151;"><strong>Contact Email:</strong> ${application.email}</p>
              </div>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">🔑 Your Login Credentials</h3>
                <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                  <p style="margin: 8px 0; font-size: 16px;"><strong>Hospital ID:</strong> <span style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${hospitalId}</span></p>
                  <p style="margin: 8px 0; font-size: 16px;"><strong>Password:</strong> <span style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</span></p>
                </div>
                <p style="color: #92400e; font-size: 14px; margin: 10px 0 0 0;">⚠️ Please keep these credentials secure and change your password after first login.</p>
              </div>
              
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">🚀 Next Steps</h3>
                <ol style="color: #374151; margin: 0; padding-left: 20px;">
                  <li style="margin: 8px 0;">Login to your hospital dashboard using the credentials above</li>
                  <li style="margin: 8px 0;">Complete your hospital profile setup</li>
                  <li style="margin: 8px 0;">Add your medical staff and doctors</li>
                  <li style="margin: 8px 0;">Configure your services and pricing</li>
                  <li style="margin: 8px 0;">Start accepting patient bookings!</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Login to Dashboard</a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <div style="text-align: center; color: #6b7280; font-size: 14px;">
                <p style="margin: 0;">MedConnect - Healthcare Management System</p>
                <p style="margin: 5px 0 0 0;">If you have any questions, please contact our support team.</p>
              </div>
            </div>
          </div>
        `
      });

      toast.success('Hospital application approved successfully!');
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'hospital_applications', selectedApplication.id), {
        status: 'rejected',
        rejectionReason,
        rejectedAt: new Date()
      });

      // Send rejection email
      await sendEmailNotification({
        to: selectedApplication.email,
        subject: 'Hospital Application Status Update - MedConnect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #dc2626; margin: 0; font-size: 28px;">📋 Application Status Update</h1>
                <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">Hospital application review completed</p>
              </div>
              
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
                <h2 style="color: #991b1b; margin: 0 0 15px 0; font-size: 20px;">Application Details</h2>
                <p style="margin: 8px 0; color: #374151;"><strong>Hospital Name:</strong> ${selectedApplication.hospitalName}</p>
                <p style="margin: 8px 0; color: #374151;"><strong>Location:</strong> ${selectedApplication.location}</p>
                <p style="margin: 8px 0; color: #374151;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Not Approved</span></p>
              </div>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">📝 Reason for Rejection</h3>
                <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                  <p style="color: #374151; margin: 0; line-height: 1.6;">${rejectionReason}</p>
                </div>
              </div>
              
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">🔄 Next Steps</h3>
                <ol style="color: #374151; margin: 0; padding-left: 20px;">
                  <li style="margin: 8px 0;">Review the feedback provided above</li>
                  <li style="margin: 8px 0;">Address the issues mentioned in the rejection reason</li>
                  <li style="margin: 8px 0;">Submit a new application with the required changes</li>
                  <li style="margin: 8px 0;">Ensure all required documents and information are complete</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Submit New Application</a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <div style="text-align: center; color: #6b7280; font-size: 14px;">
                <p style="margin: 0;">MedConnect - Healthcare Management System</p>
                <p style="margin: 5px 0 0 0;">If you have any questions, please contact our support team.</p>
              </div>
            </div>
          </div>
        `
      });

      toast.success('Hospital application rejected');
      setIsDialogOpen(false);
      setRejectionReason('');
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspendHospital = async (hospital: Hospital) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'hospitals', hospital.id), {
        status: 'suspended',
        suspendedAt: new Date()
      });

      toast.success('Hospital suspended successfully');
    } catch (error) {
      console.error('Error suspending hospital:', error);
      toast.error('Failed to suspend hospital');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteHospital = async () => {
    if (!selectedHospital) return;

    setIsProcessing(true);
    try {
      // Delete the hospital document
      await deleteDoc(doc(db, 'hospitals', selectedHospital.id));

      // Send deletion notification email
      await sendEmailNotification({
        to: selectedHospital.email,
        subject: 'Hospital Account Deleted - MedConnect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #dc2626; margin: 0; font-size: 28px;">🚫 Account Deleted</h1>
                <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">Hospital account has been removed from MedConnect</p>
              </div>
              
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
                <h2 style="color: #991b1b; margin: 0 0 15px 0; font-size: 20px;">Hospital Details</h2>
                <p style="margin: 8px 0; color: #374151;"><strong>Hospital Name:</strong> ${selectedHospital.hospitalName}</p>
                <p style="margin: 8px 0; color: #374151;"><strong>Location:</strong> ${selectedHospital.location}</p>
                <p style="margin: 8px 0; color: #374151;"><strong>Hospital ID:</strong> ${selectedHospital.hospitalId}</p>
                <p style="margin: 8px 0; color: #374151;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Deleted</span></p>
              </div>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">⚠️ Important Information</h3>
                <ul style="color: #374151; margin: 0; padding-left: 20px;">
                  <li style="margin: 8px 0;">Your hospital account has been permanently deleted from MedConnect</li>
                  <li style="margin: 8px 0;">All hospital data and records have been removed</li>
                  <li style="margin: 8px 0;">You will no longer be able to access the hospital dashboard</li>
                  <li style="margin: 8px 0;">Patients will no longer be able to book appointments with your hospital</li>
                </ul>
              </div>
              
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">🔄 Need to Rejoin?</h3>
                <p style="color: #374151; margin: 0; line-height: 1.6;">
                  If you wish to rejoin MedConnect in the future, you can submit a new hospital application through our website. 
                  Please note that you will need to go through the approval process again.
                </p>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <div style="text-align: center; color: #6b7280; font-size: 14px;">
                <p style="margin: 0;">MedConnect - Healthcare Management System</p>
                <p style="margin: 5px 0 0 0;">If you have any questions, please contact our support team.</p>
              </div>
            </div>
          </div>
        `
      });

      toast.success('Hospital deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedHospital(null);
    } catch (error) {
      console.error('Error deleting hospital:', error);
      toast.error('Failed to delete hospital');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!selectedApplicationToDelete) return;

    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, 'hospital_applications', selectedApplicationToDelete.id));
      toast.success(`Application for ${selectedApplicationToDelete.hospitalName} deleted successfully`);
      setIsDeleteApplicationDialogOpen(false);
      setSelectedApplicationToDelete(null);
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/admin-login');
    toast.info('Logged out successfully');
  };

  // Helper functions for hospital selection
  const handleSelectHospital = (hospitalId: string, checked: boolean) => {
    if (checked) {
      setSelectedHospitals(prev => [...prev, hospitalId]);
    } else {
      setSelectedHospitals(prev => prev.filter(id => id !== hospitalId));
    }
  };

  const handleSelectAllMangalore = () => {
    const allMangaloreIds = MANGALORE_HOSPITALS.map(h => h.id);
    setSelectedHospitals(prev => {
      const filtered = prev.filter(id => !allMangaloreIds.includes(id));
      return [...filtered, ...allMangaloreIds];
    });
  };

  const handleDeselectAllMangalore = () => {
    const allMangaloreIds = MANGALORE_HOSPITALS.map(h => h.id);
    setSelectedHospitals(prev => prev.filter(id => !allMangaloreIds.includes(id)));
  };

  const handleSelectAllUdupi = () => {
    const allUdupiIds = UDUPI_HOSPITALS.map(h => h.id);
    setSelectedHospitals(prev => {
      const filtered = prev.filter(id => !allUdupiIds.includes(id));
      return [...filtered, ...allUdupiIds];
    });
  };

  const handleDeselectAllUdupi = () => {
    const allUdupiIds = UDUPI_HOSPITALS.map(h => h.id);
    setSelectedHospitals(prev => prev.filter(id => !allUdupiIds.includes(id)));
  };

  const handleSelectAll = () => {
    const allHospitalIds = ALL_HOSPITALS.map(h => h.id);
    setSelectedHospitals(allHospitalIds);
  };

  const handleDeselectAll = () => {
    setSelectedHospitals([]);
  };

  // Patient management functions
  const handleSuspendPatient = async (patient: Patient) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'patients', patient.id), {
        status: 'suspended',
        suspendedAt: new Date()
      });

      toast.success('Patient suspended successfully');
    } catch (error) {
      console.error('Error suspending patient:', error);
      toast.error('Failed to suspend patient');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivatePatient = async (patient: Patient) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'patients', patient.id), {
        status: 'active',
        activatedAt: new Date()
      });

      toast.success('Patient activated successfully');
    } catch (error) {
      console.error('Error activating patient:', error);
      toast.error('Failed to activate patient');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!selectedPatientToDelete) return;

    setIsProcessing(true);
    try {
      // Delete the patient document
      await deleteDoc(doc(db, 'patients', selectedPatientToDelete.id));

      toast.success('Patient deleted successfully');
      setIsDeletePatientDialogOpen(false);
      setSelectedPatientToDelete(null);
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    } finally {
      setIsProcessing(false);
    }
  };

  // Doctor management functions
  const addSampleDoctors = async () => {
    setIsAddingDoctors(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const doctor of SAMPLE_DOCTORS) {
        try {
          // Check if doctor already exists
          const existingDoctors = await getDocs(
            query(collection(db, 'doctors'), where('id', '==', doctor.id))
          );

          if (!existingDoctors.empty) {
            console.log(`Doctor ${doctor.doctorName} already exists, skipping...`);
            continue;
          }

          // Create doctor record in Firestore
          await setDoc(doc(db, 'doctors', doctor.id), {
            ...doctor,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          console.log(`✅ Doctor record created: ${doctor.doctorName}`);
          successCount++;

        } catch (error) {
          console.error(`❌ Error adding doctor ${doctor.doctorName}:`, error);
          errorCount++;
        }
      }

      toast.success(`Sample doctors added! Success: ${successCount}, Errors: ${errorCount}`);
      console.log(`Sample doctors addition completed! Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error('Error adding sample doctors:', error);
      toast.error('Failed to add sample doctors');
    } finally {
      setIsAddingDoctors(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctorToDelete) return;

    setIsProcessing(true);
    try {
      // Delete the doctor document
      await deleteDoc(doc(db, 'doctors', selectedDoctorToDelete.id));

      toast.success('Doctor deleted successfully');
      setIsDeleteDoctorDialogOpen(false);
      setSelectedDoctorToDelete(null);
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Failed to delete doctor');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateDoctorStatus = async (doctor: Doctor, status: 'active' | 'inactive' | 'on_leave') => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'doctors', doctor.id), {
        status,
        updatedAt: new Date()
      });

      toast.success(`Doctor status updated to ${status}`);
    } catch (error) {
      console.error('Error updating doctor status:', error);
      toast.error('Failed to update doctor status');
    } finally {
      setIsProcessing(false);
    }
  };

  // Booking management functions
  const addSampleBookings = async () => {
    setIsAddingBookings(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const booking of SAMPLE_BOOKINGS) {
        try {
          // Check if booking already exists
          const existingBookings = await getDocs(
            query(collection(db, 'bookings'), where('id', '==', booking.id))
          );

          if (!existingBookings.empty) {
            console.log(`Booking ${booking.id} already exists, skipping...`);
            continue;
          }

          // Create booking record in Firestore
          await setDoc(doc(db, 'bookings', booking.id), {
            ...booking,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          console.log(`✅ Booking record created: ${booking.id}`);
          successCount++;

        } catch (error) {
          console.error(`❌ Error adding booking ${booking.id}:`, error);
          errorCount++;
        }
      }

      toast.success(`Sample bookings added! Success: ${successCount}, Errors: ${errorCount}`);
      console.log(`Sample bookings addition completed! Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error('Error adding sample bookings:', error);
      toast.error('Failed to add sample bookings');
    } finally {
      setIsAddingBookings(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBookingToDelete) return;

    setIsProcessing(true);
    try {
      // Delete the booking document
      await deleteDoc(doc(db, 'bookings', selectedBookingToDelete.id));

      toast.success('Booking deleted successfully');
      setIsDeleteBookingDialogOpen(false);
      setSelectedBookingToDelete(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateBookingStatus = async (booking: Booking, status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show') => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'bookings', booking.id), {
        status,
        updatedAt: new Date()
      });

      toast.success(`Booking status updated to ${status}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    } finally {
      setIsProcessing(false);
    }
  };

  // Queue management functions
  const handleCreateQueuesFromBookings = async () => {
    setIsCreatingQueues(true);
    try {
      await createQueueFromBookings();
      toast.success('Queue entries created successfully from confirmed bookings!');
    } catch (error) {
      console.error('Error creating queue entries:', error);
      toast.error('Failed to create queue entries from bookings');
    } finally {
      setIsCreatingQueues(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'suspended':
        return <Badge variant="secondary">Suspended</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage hospital applications and approved hospitals</p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Hospital Applications</TabsTrigger>
          <TabsTrigger value="hospitals">Approved Hospitals</TabsTrigger>
          <TabsTrigger value="patients">Patient Management</TabsTrigger>
          <TabsTrigger value="doctors">Doctor Management</TabsTrigger>
          <TabsTrigger value="bookings">Booking Management</TabsTrigger>
          <TabsTrigger value="bulk-add">Bulk Add Hospitals</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
              <CardDescription>
                Review and approve/reject hospital applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.hospitalName}</TableCell>
                      <TableCell>{application.location}</TableCell>
                      <TableCell>{application.email}</TableCell>
                      <TableCell>{application.contactNo}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {application.availableServices.join(', ')}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        {application.submittedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {application.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveApplication(application)}
                                disabled={isProcessing}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setIsDialogOpen(true);
                                }}
                                disabled={isProcessing}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApplicationToDelete(application);
                              setIsDeleteApplicationDialogOpen(true);
                            }}
                            disabled={isProcessing}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                          {application.status === 'rejected' && application.rejectionReason && (
                            <div className="text-sm text-red-600">
                              Reason: {application.rejectionReason}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hospitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Hospitals</CardTitle>
              <CardDescription>
                Manage active hospitals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Hospital ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitals.map((hospital) => (
                    <TableRow key={hospital.id}>
                      <TableCell className="font-medium">{hospital.hospitalName}</TableCell>
                      <TableCell>{hospital.location}</TableCell>
                      <TableCell>{hospital.email}</TableCell>
                      <TableCell>{hospital.hospitalId}</TableCell>
                      <TableCell>{getStatusBadge(hospital.status)}</TableCell>
                      <TableCell>
                        {hospital.approvedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {hospital.status === 'active' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSuspendHospital(hospital)}
                              disabled={isProcessing}
                            >
                              Suspend
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedHospital(hospital);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={isProcessing}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Management</CardTitle>
              <CardDescription>
                Manage doctors across all hospitals and departments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total Doctors: {doctors.length}
                </div>
                <Button
                  onClick={addSampleDoctors}
                  disabled={isAddingDoctors}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAddingDoctors ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Sample Doctors...
                    </>
                  ) : (
                    'Add Sample Doctors'
                  )}
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Patients</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.doctorName}</TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>{doctor.hospitalName}</TableCell>
                      <TableCell>{doctor.department}</TableCell>
                      <TableCell>{doctor.experience} years</TableCell>
                      <TableCell>₹{doctor.consultationFee}</TableCell>
                      <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-1">{doctor.rating}</span>
                          <span className="text-yellow-500">⭐</span>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.totalPatients}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {doctor.status === 'active' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateDoctorStatus(doctor, 'inactive')}
                                disabled={isProcessing}
                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                              >
                                Deactivate
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateDoctorStatus(doctor, 'on_leave')}
                                disabled={isProcessing}
                                className="text-orange-600 border-orange-600 hover:bg-orange-50"
                              >
                                On Leave
                              </Button>
                            </>
                          )}
                          {doctor.status === 'inactive' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateDoctorStatus(doctor, 'active')}
                              disabled={isProcessing}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              Activate
                            </Button>
                          )}
                          {doctor.status === 'on_leave' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateDoctorStatus(doctor, 'active')}
                              disabled={isProcessing}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              Return
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDoctorToDelete(doctor);
                              setIsDeleteDoctorDialogOpen(true);
                            }}
                            disabled={isProcessing}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>
                Manage patient bookings and appointments across all hospitals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total Bookings: {bookings.length}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={addSampleBookings}
                    disabled={isAddingBookings}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isAddingBookings ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding Sample Bookings...
                      </>
                    ) : (
                      'Add Sample Bookings'
                    )}
                  </Button>
                  <Button
                    onClick={handleCreateQueuesFromBookings}
                    disabled={isCreatingQueues}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isCreatingQueues ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Queues...
                      </>
                    ) : (
                      'Create Queues from Bookings'
                    )}
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Queue</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.patientName}</TableCell>
                      <TableCell>{booking.doctorName}</TableCell>
                      <TableCell>{booking.hospitalName}</TableCell>
                      <TableCell>{booking.department}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{booking.appointmentDate}</div>
                          <div className="text-gray-500">{booking.appointmentTime}</div>
                        </div>
                      </TableCell>
                      <TableCell>₹{booking.consultationFee}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        {booking.queueNumber ? (
                          <Badge variant="outline">#{booking.queueNumber}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {booking.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {booking.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateBookingStatus(booking, 'confirmed')}
                              disabled={isProcessing}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              Confirm
                            </Button>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateBookingStatus(booking, 'completed')}
                              disabled={isProcessing}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              Complete
                            </Button>
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'pending') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateBookingStatus(booking, 'cancelled')}
                              disabled={isProcessing}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBookingToDelete(booking);
                              setIsDeleteBookingDialogOpen(true);
                            }}
                            disabled={isProcessing}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Add Hospitals</CardTitle>
              <CardDescription>
                Add hospitals from Mangalore and Udupi regions to the system - select individual hospitals or add all at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selection Controls */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="text-sm font-medium">
                    Selected: {selectedHospitals.length} / {ALL_HOSPITALS.length} hospitals
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAll}
                      disabled={selectedHospitals.length === ALL_HOSPITALS.length}
                    >
                      Select All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDeselectAll}
                      disabled={selectedHospitals.length === 0}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mangalore Hospitals */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-primary">
                      Mangalore Hospitals ({MANGALORE_HOSPITALS.length})
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSelectAllMangalore}
                        disabled={MANGALORE_HOSPITALS.every(h => selectedHospitals.includes(h.id))}
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDeselectAllMangalore}
                        disabled={!MANGALORE_HOSPITALS.some(h => selectedHospitals.includes(h.id))}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {MANGALORE_HOSPITALS.map((hospital) => (
                      <div key={hospital.id} className="p-3 border rounded-lg bg-card">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedHospitals.includes(hospital.id)}
                            onCheckedChange={(checked) => handleSelectHospital(hospital.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{hospital.hospitalName}</h4>
                            <p className="text-sm text-muted-foreground">{hospital.address}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {hospital.region}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {hospital.rating} ⭐
                              </Badge>
                              {hospital.emergencyAvailable && (
                                <Badge variant="destructive" className="text-xs">
                                  Emergency
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Udupi Hospitals */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-primary">
                      Udupi Hospitals ({UDUPI_HOSPITALS.length})
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSelectAllUdupi}
                        disabled={UDUPI_HOSPITALS.every(h => selectedHospitals.includes(h.id))}
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDeselectAllUdupi}
                        disabled={!UDUPI_HOSPITALS.some(h => selectedHospitals.includes(h.id))}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {UDUPI_HOSPITALS.map((hospital) => (
                      <div key={hospital.id} className="p-3 border rounded-lg bg-card">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedHospitals.includes(hospital.id)}
                            onCheckedChange={(checked) => handleSelectHospital(hospital.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{hospital.hospitalName}</h4>
                            <p className="text-sm text-muted-foreground">{hospital.address}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {hospital.region}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {hospital.rating} ⭐
                              </Badge>
                              {hospital.emergencyAvailable && (
                                <Badge variant="destructive" className="text-xs">
                                  Emergency
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">ℹ️ What this will do:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Create Firebase Auth accounts for selected hospitals</li>
                  <li>• Add hospital records to Firestore with all details</li>
                  <li>• Send welcome emails with login credentials</li>
                  <li>• Skip hospitals that already exist</li>
                  <li>• Total: {ALL_HOSPITALS.length} hospitals available (8 Mangalore + 10 Udupi)</li>
                </ul>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={addSelectedHospitals}
                  disabled={isAddingSelected || selectedHospitals.length === 0}
                  size="lg"
                  className="px-8"
                >
                  {isAddingSelected ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Selected Hospitals...
                    </>
                  ) : (
                    <>
                      Add Selected ({selectedHospitals.length}) Hospitals
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={bulkAddHospitals}
                  disabled={isBulkAdding}
                  size="lg"
                  variant="outline"
                  className="px-8"
                >
                  {isBulkAdding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Adding All Hospitals...
                    </>
                  ) : (
                    <>
                      Add All {ALL_HOSPITALS.length} Hospitals
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>
                Manage all registered patients in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total Patients: {patients.length}
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Appointments</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => {
                    const age = patient.dateOfBirth ? 
                      new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'N/A';
                    
                    return (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>{patient.phoneNumber}</TableCell>
                        <TableCell>{age}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Total: {patient.totalAppointments || 0}</div>
                            <div>Completed: {patient.completedAppointments || 0}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {patient.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {patient.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSuspendPatient(patient)}
                                disabled={isProcessing}
                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                              >
                                Suspend
                              </Button>
                            )}
                            {patient.status === 'suspended' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleActivatePatient(patient)}
                                disabled={isProcessing}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                Activate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPatientToDelete(patient);
                                setIsDeletePatientDialogOpen(true);
                              }}
                              disabled={isProcessing}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Hospital Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Reason for Rejection</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setRejectionReason('');
                setSelectedApplication(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectApplication}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? 'Rejecting...' : 'Reject Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Hospital Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Hospital</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the hospital account and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedHospital && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Hospital Details:</h4>
                <p className="text-red-700"><strong>Name:</strong> {selectedHospital.hospitalName}</p>
                <p className="text-red-700"><strong>Location:</strong> {selectedHospital.location}</p>
                <p className="text-red-700"><strong>Hospital ID:</strong> {selectedHospital.hospitalId}</p>
                <p className="text-red-700"><strong>Email:</strong> {selectedHospital.email}</p>
              </div>
            )}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warning:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• All hospital data will be permanently deleted</li>
                <li>• All patient bookings will be cancelled</li>
                <li>• Hospital staff accounts will be deactivated</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedHospital(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteHospital}
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : 'Delete Hospital'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Application Dialog */}
      <Dialog open={isDeleteApplicationDialogOpen} onOpenChange={setIsDeleteApplicationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Hospital Application</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the hospital application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedApplicationToDelete && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Application Details:</h4>
                <p className="text-red-700"><strong>Hospital Name:</strong> {selectedApplicationToDelete.hospitalName}</p>
                <p className="text-red-700"><strong>Location:</strong> {selectedApplicationToDelete.location}</p>
                <p className="text-red-700"><strong>Email:</strong> {selectedApplicationToDelete.email}</p>
                <p className="text-red-700"><strong>Status:</strong> {selectedApplicationToDelete.status}</p>
              </div>
            )}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warning:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Application data will be permanently deleted</li>
                <li>• Hospital will need to submit a new application</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteApplicationDialogOpen(false);
                setSelectedApplicationToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteApplication}
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : 'Delete Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Patient Dialog */}
      <Dialog open={isDeletePatientDialogOpen} onOpenChange={setIsDeletePatientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Patient</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the patient account and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPatientToDelete && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Patient Details:</h4>
                <p className="text-red-700"><strong>Name:</strong> {selectedPatientToDelete.name}</p>
                <p className="text-red-700"><strong>Email:</strong> {selectedPatientToDelete.email}</p>
                <p className="text-red-700"><strong>Phone:</strong> {selectedPatientToDelete.phoneNumber}</p>
                <p className="text-red-700"><strong>Status:</strong> {selectedPatientToDelete.status}</p>
                <p className="text-red-700"><strong>Appointments:</strong> {selectedPatientToDelete.totalAppointments || 0}</p>
              </div>
            )}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warning:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• All patient data will be permanently deleted</li>
                <li>• All patient bookings will be cancelled</li>
                <li>• Medical history and records will be removed</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeletePatientDialogOpen(false);
                setSelectedPatientToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePatient}
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : 'Delete Patient'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Doctor Dialog */}
      <Dialog open={isDeleteDoctorDialogOpen} onOpenChange={setIsDeleteDoctorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Doctor</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the doctor account and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDoctorToDelete && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Doctor Details:</h4>
                <p className="text-red-700"><strong>Name:</strong> {selectedDoctorToDelete.doctorName}</p>
                <p className="text-red-700"><strong>Specialization:</strong> {selectedDoctorToDelete.specialization}</p>
                <p className="text-red-700"><strong>Hospital:</strong> {selectedDoctorToDelete.hospitalName}</p>
                <p className="text-red-700"><strong>Experience:</strong> {selectedDoctorToDelete.experience} years</p>
              </div>
            )}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warning:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• All doctor data will be permanently deleted</li>
                <li>• All patient bookings with this doctor will be cancelled</li>
                <li>• Doctor's medical records and history will be removed</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDoctorDialogOpen(false);
                setSelectedDoctorToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDoctor}
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : 'Delete Doctor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Booking Dialog */}
      <Dialog open={isDeleteBookingDialogOpen} onOpenChange={setIsDeleteBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Booking</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the booking and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBookingToDelete && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Booking Details:</h4>
                <p className="text-red-700"><strong>Patient:</strong> {selectedBookingToDelete.patientName}</p>
                <p className="text-red-700"><strong>Doctor:</strong> {selectedBookingToDelete.doctorName}</p>
                <p className="text-red-700"><strong>Hospital:</strong> {selectedBookingToDelete.hospitalName}</p>
                <p className="text-red-700"><strong>Date:</strong> {selectedBookingToDelete.appointmentDate}</p>
                <p className="text-red-700"><strong>Time:</strong> {selectedBookingToDelete.appointmentTime}</p>
                <p className="text-red-700"><strong>Status:</strong> {selectedBookingToDelete.status}</p>
              </div>
            )}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warning:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Booking data will be permanently deleted</li>
                <li>• Patient will need to create a new booking</li>
                <li>• Queue position will be lost</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteBookingDialogOpen(false);
                setSelectedBookingToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBooking}
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : 'Delete Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
