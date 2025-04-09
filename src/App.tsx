import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import AppLayout from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import InvoicesPage from "./pages/InvoicesPage";
import CustomersPage from "./pages/CustomersPage";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import EditInvoicePage from "./pages/EditInvoicePage";
import InvoiceDetailsPage from "./pages/InvoiceDetailsPage";
import CreateCustomerPage from "./pages/CreateCustomerPage";
import EditCustomerPage from "./pages/EditCustomerPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, session } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If we have a session but isAuthenticated is false, we might be in an inconsistent state
    // This is a failsafe to handle such cases
    if (session && !isAuthenticated) {
      console.log("Protected route: Session exists but not authenticated, attempting recovery");
      
      // Add a small delay to allow for auth state to settle
      const timer = setTimeout(() => {
        // If still not authenticated, force a page reload to recover
        if (!isAuthenticated && session) {
          console.log("Authentication state inconsistent, triggering manual reload");
          window.location.reload();
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [session, isAuthenticated]);
  
  if (!isAuthenticated && !session) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Special handler for the login route to prevent redirect loops
const LoginRouteHandler = () => {
  const { isAuthenticated, session } = useAuth();
  const location = useLocation();
  
  // Only redirect to app if fully authenticated
  if (isAuthenticated) {
    return <Navigate to="/app" />;
  }
  
  // Otherwise show login screen, even if there's a session
  // This helps break redirect loops
  return <Login />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginRouteHandler />} />
              
              {/* Protected app routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="invoices/new" element={<CreateInvoicePage />} />
                <Route path="invoices/edit/:id" element={<EditInvoicePage />} />
                <Route path="invoices/:id" element={<InvoiceDetailsPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="customers/new" element={<CreateCustomerPage />} />
                <Route path="customers/edit/:id" element={<EditCustomerPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
