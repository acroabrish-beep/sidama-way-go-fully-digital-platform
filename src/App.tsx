import React from "react";
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./components/LandingPage";
import UserLogin from "./components/UserLogin";
import UserDashboard from "./components/UserDashboard";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import SuperAdminCommand from "./components/SuperAdminCommand";
import AdminDashboardDemo from "./components/AdminDashboard";
import { TransportationModule } from "./components/TransportationModule";
import { TaxiModule } from "./components/TaxiModule";
import { TourismModule } from "./components/TourismModule";
import { HealthcareModule } from "./components/HealthcareModule";
import { EmergencyModule } from "./components/EmergencyModule";
import { SmartMap } from "./components/SmartMap";
import { AICommandCenter } from "./components/AICommandCenter";
import { SuperAdminDashboard } from "./components/SuperAdminDashboard";
import { AnalyticsReporting } from "./components/AnalyticsReporting";

// Custom security route protector for Super Admins
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider uppercase text-slate-400 animate-pulse">
          Starting Security Core...
        </p>
      </div>
    );
  }

  if (!user || role !== "super_admin") {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
}

// Custom route protector for authenticated Citizens
function CitizenProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider uppercase text-slate-400 animate-pulse">
          Loading Security Credentials...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/user-login" replace />;
  }

  return <>{children}</>;
}

// Wraps pre-defined Login to hook up react-router actions
function AdminLoginWrapper() {
  const navigate = useNavigate();
  return <Login onSuccess={() => navigate("/admin-dashboard")} />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="bg-slate-950 min-h-screen text-slate-100 selection:bg-teal-500/30">
          <Routes>
            {/* 1. Main Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Citizens Portal Auth and Dashboard routes */}
            <Route path="/user-login" element={<UserLogin />} />
            <Route 
              path="/user-dashboard" 
              element={
                <CitizenProtectedRoute>
                  <UserDashboard />
                </CitizenProtectedRoute>
              } 
            />

            {/* 3. Admin Dashboard and auth routes */}
            <Route path="/admin-login" element={<AdminLoginWrapper />} />
            <Route 
              path="/admin-dashboard" 
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } 
            />

            {/* Demo route for preview - remove in production */}
            <Route path="/admin-dashboard-demo" element={<AdminDashboardDemo />} />

            {/* Module Demo Routes */}
            <Route path="/transportation" element={<TransportationModule />} />
            <Route path="/taxi" element={<TaxiModule />} />
            <Route path="/tourism" element={<TourismModule />} />
            <Route path="/healthcare" element={<HealthcareModule />} />
            <Route path="/emergency" element={<EmergencyModule />} />
            <Route path="/smart-map" element={<SmartMap />} />
            <Route path="/ai-command" element={<AICommandCenter />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/analytics" element={<AnalyticsReporting />} />

            {/* Fallback wildcard to prevent broken links */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}
