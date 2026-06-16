import React from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  onRedirectToLogin: () => void;
}

export default function ProtectedRoute({ children, onRedirectToLogin }: ProtectedRouteProps) {
  const { user, role, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">
          Loading Security Credentials...
        </p>
      </div>
    );
  }

  // If not logged in
  if (!user) {
    // Automatically trigger redirect State
    setTimeout(() => {
      onRedirectToLogin();
    }, 0);
    return null;
  }

  // If logged in, but role is NOT super_admin
  if (role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6 text-center">
        <div className="p-4 bg-red-950/40 rounded-full border border-red-500/30 text-red-400 mb-6 animate-pulse">
          <ShieldAlert className="w-16 h-16" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-red-400 mb-2">
          Unauthorized Access Denied
        </h1>
        <p className="text-slate-400 max-w-md mb-8">
          Your credentials do not possess the required absolute clearance for the Sidama Way Go Super Admin Command Center. Access is strictly audited.
        </p>
        <button
          onClick={async () => {
            await logout();
            onRedirectToLogin();
          }}
          className="px-6 py-2.5 bg-red-650 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-red-900/40 pointer-events-auto cursor-pointer"
        >
          Sign Out & Return to Login
        </button>
      </div>
    );
  }

  // Authorized
  return <>{children}</>;
}
