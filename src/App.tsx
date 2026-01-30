import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute, ProfileRequiredRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Discover from "./pages/Discover";
import Requests from "./pages/Requests";
import Matches from "./pages/Matches";
import Settings from "./pages/Settings";
import SeedDemo from "./pages/SeedDemo";
import NotFound from "./pages/NotFound";
import { isDevMode } from "./lib/dev";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={user ? <Navigate to="/discover" replace /> : <Landing />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/discover" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/discover" replace /> : <Register />}
      />

      {/* Protected routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProfileRequiredRoute>
            <PublicProfile />
          </ProfileRequiredRoute>
        }
      />
      <Route
        path="/discover"
        element={
          <ProfileRequiredRoute>
            <Discover />
          </ProfileRequiredRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProfileRequiredRoute>
            <Requests />
          </ProfileRequiredRoute>
        }
      />
      <Route
        path="/matches"
        element={
          <ProfileRequiredRoute>
            <Matches />
          </ProfileRequiredRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      {isDevMode && (
        <Route
          path="/seed-demo"
          element={
            <ProtectedRoute>
              <SeedDemo />
            </ProtectedRoute>
          }
        />
      )}

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
