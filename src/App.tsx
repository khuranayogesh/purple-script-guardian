import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import FolderManagement from "./pages/admin/FolderManagement";
import ScriptForm from "./pages/admin/ScriptForm";
import ScriptListing from "./pages/admin/ScriptListing";
import CreateProject from "./pages/user/CreateProject";
import ImportScripts from "./pages/user/ImportScripts";
import TestLab from "./pages/user/TestLab";
import IssueLog from "./pages/user/IssueLog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredUserType }: { 
  children: React.ReactNode; 
  requiredUserType?: 'Administrator' | 'User' 
}) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredUserType && user.userType !== requiredUserType) {
    return <Navigate to={user.userType === 'Administrator' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.userType === 'Administrator' ? '/admin/dashboard' : '/user/dashboard'} replace /> : <Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredUserType="Administrator"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/folders" element={<ProtectedRoute requiredUserType="Administrator"><FolderManagement /></ProtectedRoute>} />
      <Route path="/admin/scripts" element={<ProtectedRoute requiredUserType="Administrator"><ScriptListing /></ProtectedRoute>} />
      <Route path="/admin/scripts/new" element={<ProtectedRoute requiredUserType="Administrator"><ScriptForm /></ProtectedRoute>} />
      <Route path="/admin/scripts/edit/:id" element={<ProtectedRoute requiredUserType="Administrator"><ScriptForm /></ProtectedRoute>} />
      
      {/* User Routes */}
      <Route path="/user/dashboard" element={<ProtectedRoute requiredUserType="User"><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/projects/new" element={<ProtectedRoute requiredUserType="User"><CreateProject /></ProtectedRoute>} />
      <Route path="/user/projects/:projectId/import" element={<ProtectedRoute requiredUserType="User"><ImportScripts /></ProtectedRoute>} />
      <Route path="/user/projects/:projectId/test-lab" element={<ProtectedRoute requiredUserType="User"><TestLab /></ProtectedRoute>} />
      <Route path="/user/projects/:projectId/issues" element={<ProtectedRoute requiredUserType="User"><IssueLog /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
