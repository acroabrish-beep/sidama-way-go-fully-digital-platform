import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase";
import { KeyRound, Mail, User, Phone, CheckCircle2, AlertCircle, Compass, Shield, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function UserLogin() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isRegistering) {
        // Sign-Up Flow
        if (!fullName.trim()) {
          throw new Error("Full name is required to initialize citizen directory trace.");
        }
        
        // 1. Create User in Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = cred.user;

        // 2. Map Profile Role to Firestore user document
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, {
          name: fullName.trim(),
          email: email.trim(),
          phone: phoneNumber || "",
          role: "user",
          createdAt: new Date().toISOString()
        });

        setSuccessMessage("Citizen account created successfully! Transitioning to dashboard...");
        setTimeout(() => {
          navigate("/user-dashboard");
        }, 1500);

      } else {
        // Sign-In Flow
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMessage("Authentication verified. Loading profile dashboard...");
        setTimeout(() => {
          navigate("/user-dashboard");
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message;
      if (err.code === "auth/email-already-in-use") {
        errMsg = "This email is already registered in the municipal database. Try logging in.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password must be at least 6 characters in length.";
      } else if (err.code === "auth/invalid-credential") {
        errMsg = "Unrecognized or incorrect password credentials. Please verify your typing.";
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4 font-sans relative overflow-hidden">
      {/* Absolute Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Back button */}
      <div className="w-full max-w-md mb-4 flex">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-mono text-slate-500 hover:text-slate-350 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Gateway Menu
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl shadow-lg shadow-teal-500/5">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white uppercase">Sidama Way Go</h2>
            <p className="text-[10px] text-teal-400 uppercase tracking-widest font-mono font-bold mt-0.5">
              {isRegistering ? "Citizen Registry Portal" : "Citizen Portal Login"}
            </p>
          </div>
        </div>

        {/* Display Status Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-950/40 border border-red-500/20 p-3 rounded-xl mb-4 text-xs text-red-400 flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-950/40 border border-emerald-500/20 p-3 rounded-xl mb-4 text-xs text-emerald-400 flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 animate-bounce" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {isRegistering && (
            <>
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 block mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-550" />
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Abebe Balcha"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 block mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-550" />
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +251 9..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 block mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-550" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@hawassa.org"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 block mb-1.5">
              Password *
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-550" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[10px] text-slate-450 hover:text-white transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition uppercase tracking-wider mt-2 shadow-lg shadow-teal-950"
          >
            {isLoading 
              ? "Connecting Database..." 
              : isRegistering 
                ? "Register & Create Account" 
                : "Secure Sign In"
            }
          </button>
        </form>

        <div className="mt-6 border-t border-slate-850 pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setSuccessMessage(null);
            }}
            className="text-xs text-teal-400 hover:text-teal-300 underline transition"
          >
            {isRegistering 
              ? "Already possess an active citizen profile? Sign in" 
              : "New to Sidama Way Go? Register dynamic account"
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}
