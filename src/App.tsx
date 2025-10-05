import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PatientPortal from "./pages/PatientPortal";
import QueueDisplay from "./pages/QueueDisplay";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPag";
import PatientAuth from "./pages/PatientAuth";
import MainApp from "./pages/MainApp";
import HospitalApplicationForm from "./components/HospitalApplicationForm";
import HospitalLogin from "./components/HospitalLogin";
import HospitalDashboard from "./pages/HospitalDashboard";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSetup from "./pages/AdminSetup";
import OTPVerification from "./components/OTPVerification";
import EmailTest from "./pages/EmailTest";
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthDebugger } from "./components/AuthDebugger";
import { DirectQueueJoin } from "./components/DirectQueueJoin";
import { VirtualCheckIn } from "./components/VirtualCheckIn";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainApp />} />
            <Route path="/booking" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/patient" element={<PatientAuth />} />
            {/* Patient Routes */}
            <Route path="/patient-auth" element={<PatientAuth />} />
            <Route
              path="/patient"
              element={
                <ProtectedRoute type="patient">
                  <PatientPortal />
                </ProtectedRoute>
              }
            />
            
            {/* Hospital Routes */}
            <Route path="/hospital-application" element={<HospitalApplicationForm />} />
            <Route path="/hospital-login" element={<HospitalLogin />} />
            <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
            
            {/* Admin Routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            
            {/* OTP Verification */}
            <Route path="/verify-otp" element={<OTPVerification onVerificationComplete={() => {}} onBack={() => {}} />} />
            
            {/* Email Test */}
            <Route path="/email-test" element={<EmailTest />} />
            
            {/* Display Routes */}
            <Route path="/display" element={<QueueDisplay />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* <AuthDebugger /> */}
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
