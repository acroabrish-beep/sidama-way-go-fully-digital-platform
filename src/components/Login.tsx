import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { KeyRound, Mail, ShieldAlert, CheckCircle2, Languages, Cpu, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginProps {
  onSuccess: () => void;
}

type LangType = "en" | "am" | "sid";

export default function Login({ onSuccess }: LoginProps) {
  const [lang, setLang] = useState<LangType>("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const t = {
    en: {
      title: "Sidama Way Go",
      subtitle: "Super Admin Command Center",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      submitButton: "Sign In Securely",
      loggingIn: "Authenticating with Firebase...",
      bootstrapTitle: "Developer Provisioning",
      bootstrapDesc: "First launch in a clean Firebase environment? Provision a permanent Super Admin account to Firestore & Auth in 1-click.",
      bootstrapBtn: "Auto-Provision Default Admin"
    },
    am: {
      title: "ሲዳማ ዌይ ጎ",
      subtitle: "ፈርጣማው የቁጥጥር ማዕከል (Super Admin)",
      emailLabel: "የኢሜይል አድራሻ",
      passwordLabel: "የይለፍ ቃል",
      submitButton: "በደህንነት ይግቡ",
      loggingIn: "የደህንነት ምስክርነት በማረጋገጥ ላይ...",
      bootstrapTitle: "አስተዳዳሪ ማዘጋጃ",
      bootstrapDesc: "አዲስ የፋየርቤዝ አካባቢ ነው? የአስተዳዳሪውን መለያ በ1-ክሊክ ብቻ ወዲያውኑ ያዘጋጁ።",
      bootstrapBtn: "የመጀመሪያ አስተዳዳሪ ራስ-አቅርብ"
    },
    sid: {
      title: "Sidama Way Go",
      subtitle: "Super Admin Command Center",
      emailLabel: "Imeelte Keye",
      passwordLabel: "Sinu Kiiro",
      submitButton: "Alasado E'e",
      loggingIn: "Fajjite biddiishi'nanni...",
      bootstrapTitle: "Oolcho Siraata",
      bootstrapDesc: "Haaro Firebase gobaatenni? Super Admin qineessi hegerera kiiro hunda tunte.",
      bootstrapBtn: "Gosa Admin Umo-Oolchi"
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Validate user document exists in Firestore `/users` and has `role === 'super_admin'`
      const userDocRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        // Fallback for admin credentials
        if (user.email === "admin@hawassa.gov.et") {
          await setDoc(userDocRef, {
            name: "Super Admin Haile",
            email: "admin@hawassa.gov.et",
            role: "super_admin",
            createdAt: new Date().toISOString()
          });
          onSuccess();
        } else {
          throw new Error("No policy document found for this user in Firestore.");
        }
      } else {
        const data = docSnap.data();
        if (data.role !== "super_admin") {
          throw new Error("Unauthorized Access: Account does not possess 'super_admin' role.");
        }
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      let localError = err.message;
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        localError = "Invalid email or password credentials. Please verify your system tokens.";
      }
      setError(localError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBootstrap = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage("Connecting to Auth Server & Provisioning Firestore...");

    const adminEmail = "admin@hawassa.gov.et";
    const adminPass = "HawassaAdmin2026!";

    try {
      let user;
      try {
        // Attempt to create the user in Auth
        const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
        user = cred.user;
        setStatusMessage("Firebase Auth account successfully registered!");
      } catch (authErr: any) {
        if (authErr.code === "auth/email-already-in-use") {
          // If already exists in Auth, sign in to acquire UID
          const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPass);
          user = cred.user;
          setStatusMessage("Account already exists in Auth. Linking Firestore role...");
        } else {
          throw authErr;
        }
      }

      // Explicitly write the user document in Firestore users/{uid} with role: super_admin
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
        name: "Super Admin Haile",
        email: adminEmail,
        role: "super_admin",
        createdAt: new Date().toISOString()
      }, { merge: true });

      setStatusMessage("Success! Credentials established and mapped to role [super_admin].");
      setEmail(adminEmail);
      setPassword(adminPass);
    } catch (err: any) {
      console.error(err);
      setError("Setup failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4 font-sans relative overflow-hidden">
      {/* Absolute Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-full p-1 z-10">
        <Languages className="w-4 h-4 ml-2.5 text-slate-400" />
        <button 
          onClick={() => setLang("en")}
          className={`px-3 py-1 rounded-full text-xs font-semibold select-none ${lang === "en" ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : "text-slate-400 hover:text-white"}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLang("am")}
          className={`px-3 py-1 rounded-full text-xs font-semibold select-none ${lang === "am" ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : "text-slate-400 hover:text-white"}`}
        >
          አማ
        </button>
        <button 
          onClick={() => setLang("sid")}
          className={`px-3 py-1 rounded-full text-xs font-semibold select-none ${lang === "sid" ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : "text-slate-400 hover:text-white"}`}
        >
          SID
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-2"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl mb-4 shadow-lg shadow-teal-950/40">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-500 bg-clip-text text-transparent">
            {t[lang].title}
          </h1>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mt-2">
            {t[lang].subtitle}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
              {t[lang].emailLabel}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hawassa.gov.et"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 rounded-lg text-sm text-slate-200 placeholder-slate-600 transition outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
              {t[lang].passwordLabel}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <KeyRound className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-11 py-3 bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 rounded-lg text-sm text-slate-200 placeholder-slate-600 transition outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2.5 p-3.5 bg-red-950/30 border border-red-500/20 text-red-400 rounded-lg text-sm"
              >
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {statusMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2.5 p-3.5 bg-sky-950/30 border border-sky-500/20 text-sky-450 rounded-lg text-sm"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{statusMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-sm transition shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.99] flex items-center justify-center pointer-events-auto cursor-pointer"
          >
            {isLoading ? t[lang].loggingIn : t[lang].submitButton}
          </button>
        </form>

        {/* Demo Bootstrap Panel */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <h2 className="text-xs font-semibold tracking-wider text-teal-400/80 uppercase mb-2 flex items-center justify-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            {t[lang].bootstrapTitle}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-4 px-2">
            {t[lang].bootstrapDesc}
          </p>
          <button
            type="button"
            onClick={handleBootstrap}
            disabled={isLoading}
            className="w-full py-2 px-3 border border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-slate-700 disabled:opacity-50 text-slate-400 hover:text-teal-400 text-xs font-medium rounded-lg transition active:scale-[0.99] pointer-events-auto cursor-pointer"
          >
            {t[lang].bootstrapBtn}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
