import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PatientPortal from "./pages/PatientPortal";
import StaffDashboard from "./pages/StaffDashboard";
import QueueDisplay from "./pages/QueueDisplay";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPag";
import PatientAuth from "./pages/PatientAuth";
import StaffAuth from "./pages/StaffAuth";
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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/patient" element={<PatientAuth />} />
            <Route path="/auth/staff" element={<StaffAuth />} />
            <Route
              path="/patient"
              element={
                <ProtectedRoute type="patient">
                  <PatientPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute type="staff">
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/display" element={<QueueDisplay />} />
            <Route path="/direct-queue" element={<DirectQueueJoin />} />
            <Route path="/virtual-checkin" element={<VirtualCheckIn />} />
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
