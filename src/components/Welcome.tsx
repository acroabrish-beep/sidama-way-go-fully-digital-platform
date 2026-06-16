import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Shield, MapPin, Trees, Sun, Users, ArrowRight, Zap, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Decorative Top glow circles */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-teal-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      {/* Inline styling helper for grid backgrounds which Tailwind 4 handles natively but keeps as fallback */}
      <style>{`
        .bg-grid-pattern {
          background-size: 32px 32px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
      `}</style>

      {/* Header bar */}
      <header className="px-6 py-6 border-b border-slate-900/60 flex items-center justify-between relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-widest text-white uppercase font-sans">Sidama Way Go</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Hawassa Municipal Platform</p>
          </div>
        </div>

        <span className="hidden sm:inline bg-slate-900/80 border border-slate-800 text-[9px] uppercase font-mono px-3 py-1 rounded-full text-slate-450 tracking-wider">
          Region Sidaama • Live Systems Validated
        </span>
      </header>

      {/* Main hero cards */}
      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col items-center justify-center p-6 relative z-10 text-center gap-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-3 max-w-xl"
        >
          <span className="inline-block self-center bg-teal-950 text-teal-400 font-mono text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-teal-900 mb-2">
            Integrated Mobility & Heritage Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight font-sans">
            Streamlining Public Assets in Sidaama Region
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Welcome to <strong className="text-white font-medium">Sidama Way Go</strong>. A comprehensive smart city interface. Explore tourism hotspots, access live GPS digital taxi dispatch registers, or track clean solar shoestation micro-telemetries instantly.
          </p>
        </motion.div>

        {/* Choice Bento Card block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* USER / CITIZEN PORTAL */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="group relative bg-slate-900 border border-slate-850 hover:border-teal-500/45 p-6 rounded-3xl cursor-pointer text-left flex flex-col justify-between gap-8 transition shadow-lg shadow-slate-950/20"
            onClick={() => navigate("/user-login")}
          >
            <div className="flex flex-col gap-4">
              <div className="p-3.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl w-fit group-hover:bg-teal-550 group-hover:text-slate-950 transition-all duration-300">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition">
                  Explore Citizen Portal
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                  Browse tourism directories, locate active taxi operators with rate-caps, and survey solar-powered youth shoeshine hubs.
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-[10.5px] uppercase font-mono tracking-wider font-bold text-teal-400 group-hover:underline">
              Enter Citizen Portal
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.div>

          {/* ADMIN PORTAL */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="group relative bg-slate-900 border border-slate-850 hover:border-amber-500/45 p-6 rounded-3xl cursor-pointer text-left flex flex-col justify-between gap-8 transition shadow-lg shadow-slate-950/20"
            onClick={() => navigate("/admin-login")}
          >
            <div className="flex flex-col gap-4">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl w-fit group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-500 transition">
                  City Command Console
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                  Secure access for authorized municipal staff, super admin audits, database management, and dispatch overrides.
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-[10.5px] uppercase font-mono tracking-wider font-bold text-amber-500 group-hover:underline">
              Enter Admin Console
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="px-6 py-6 border-t border-slate-900/60 relative z-10 w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[10px] text-slate-550 uppercase font-mono">
          © 2026 Sidama Region Smart Transportation Bureau & Innovation Labs
        </span>
        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono uppercase">
          <span className="flex items-center gap-1 text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block animate-ping"></span>
            Telemetry Synchronized
          </span>
        </div>
      </footer>
    </div>
  );
}
