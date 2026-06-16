import React, { useState, useEffect } from "react";
import { 
  Car, Trees, Sun, Battery, Droplets, MapPin, Star, Phone, 
  Layers, Compass, Search, LogOut, Heart, HelpCircle, Flame, Eye, Film, QrCode, Ticket as TktIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { db } from "../db";
import { TourismSite, TaxiDriver, EcoShineLocation } from "../types";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  
  // Tab states
  const [activeTab, setActiveTab] = useState<"tourism" | "taxis" | "ecoshine" | "tickets">("tourism");
  const [searchQuery, setSearchQuery] = useState("");

  // Firestore & local state data lists
  const [tourismSites, setTourismSites] = useState<TourismSite[]>([]);
  const [taxiDrivers, setTaxiDrivers] = useState<TaxiDriver[]>([]);
  const [ecoStations, setEcoStations] = useState<EcoShineLocation[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [userTickets, setUserTickets] = useState<any[]>([]);

  // Detailed view models
  const [selectedSite, setSelectedSite] = useState<TourismSite | null>(null);

  // Booking details
  const [bookingSchedule, setBookingSchedule] = useState<any | null>(null);
  const [bookingPassengerName, setBookingPassengerName] = useState("");
  const [bookingPassengerPhone, setBookingPassengerPhone] = useState("");
  const [bookingPaymentMethod, setBookingPaymentMethod] = useState<"Telebirr" | "CBE Birr">("Telebirr");

  const handleBookTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingSchedule) return;

    const ticketId = "tkt_" + Math.floor(Math.random() * 100000);
    const seatNum = Math.floor(Math.random() * 29) + 1;
    const tNum = "TKT-2026-" + Math.floor(Math.random() * 9000 + 1000);

    const newTicket = {
      id: ticketId,
      scheduleId: bookingSchedule.id,
      passengerName: bookingPassengerName.trim() || user?.email?.split("@")[0] || "Citizen passenger",
      passengerPhone: bookingPassengerPhone || "+251911002233",
      seatNumber: seatNum,
      price: bookingSchedule.price || 120,
      status: "Paid",
      paymentMethod: bookingPaymentMethod,
      qrCode: `QR_SCH${bookingSchedule.id}_SEAT${seatNum}_${ticketId}`,
      ticketNumber: tNum,
      bookingTime: new Date().toISOString(),
      routeLabel: bookingSchedule.routeLabel || "Hawassa Regional Terminal Route",
      departureTime: bookingSchedule.departureTime || "08:30 AM"
    };

    // Save ticket document directly to synced Firestore collection
    db.addDoc("tickets", newTicket);

    // Record cashless ledger payment entry
    db.addDoc("payments", {
      amount: bookingSchedule.price || 120,
      currency: "ETB",
      method: bookingPaymentMethod,
      reference: `${bookingPaymentMethod === "Telebirr" ? "TLB" : "CBE"}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      status: "Completed",
      type: "Transportation",
      payerName: bookingPassengerName.trim() || user?.email || "Citizen passenger",
      timestamp: new Date().toISOString()
    });

    setBookingSchedule(null);
    setBookingPassengerName("");
    setBookingPassengerPhone("");
    alert(`Ticket ${tNum} purchased successfully! Your secure QR Gate Ticket is now active below.`);
  };

  useEffect(() => {
    // 1. Subscribe to Live Tourism Sites
    const unsubTourism = db.subscribe("tourism_sites", (data) => {
      setTourismSites(data);
    });

    // 2. Subscribe to Live Taxi Drivers
    const unsubTaxis = db.subscribe("taxi_drivers", (data) => {
      const processed = data.map(drv => ({
        ...drv,
        status: drv.status || (drv.active ? "Available" : "Offline")
      }));
      setTaxiDrivers(processed);
    });

    // 3. Subscribe to Live Eco-Shine Solar deployment
    const unsubEco = db.subscribe("eco_shine_locations", (data) => {
      const processed = data.map(sh => ({
        ...sh,
        waterFiltration: sh.waterFiltration !== undefined ? sh.waterFiltration : Math.floor(10 + Math.random() * 40)
      }));
      setEcoStations(processed);
    });

    // 4. Subscribe to Live Bus/Transit Schedules
    const unsubSchedules = db.subscribe("schedules", (data) => {
      setSchedules(data);
    });

    // 5. Subscribe to Live Tickets (Filter for current logged-in user)
    const unsubTickets = db.subscribe("tickets", (data) => {
      setUserTickets(data);
    });

    return () => {
      unsubTourism();
      unsubTaxis();
      unsubEco();
      unsubSchedules();
      unsubTickets();
    };
  }, []);

  // Simulating user interactivity: Upvoting/Rating a site or placing a taxi call
  const [likedSites, setLikedSites] = useState<string[]>([]);
  const toggleLikeSite = (siteId: string) => {
    const isLiked = likedSites.includes(siteId);
    let newLikes = [...likedSites];
    if (isLiked) {
      newLikes = newLikes.filter(id => id !== siteId);
    } else {
      newLikes.push(siteId);
    }
    setLikedSites(newLikes);

    const site = tourismSites.find(s => s.id === siteId);
    if (site) {
      const currentViews = site.views || 0;
      db.updateDoc("tourism_sites", siteId, {
        views: isLiked ? currentViews - 1 : currentViews + 1
      });
    }
  };

  // Simulating custom citizen taxi request
  const [requestedTaxiId, setRequestedTaxiId] = useState<string | null>(null);
  const handleRequestTaxi = (drvId: string) => {
    setRequestedTaxiId(drvId);
    setTimeout(() => {
      setRequestedTaxiId(null);
      alert("A dispatch request has been submitted securely to the driver's smart terminal. Please stand by for GPS verification.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30">
      {/* Citizen Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl shadow-lg shadow-teal-500/5">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white uppercase font-sans">Sidama Way Go</h1>
            <p className="text-[10px] text-slate-450 uppercase font-mono tracking-wider">Citizen Interactive Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">{user?.email}</span>
            <span className="text-[9px] uppercase font-mono text-emerald-400">Verified Citizen Session</span>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition group"
            title="Log Out Session"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Quick Search & Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-900">
          {/* Navigation Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => { setActiveTab("tourism"); setSearchQuery(""); }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "tourism" 
                  ? "bg-slate-950 text-teal-400 shadow-md border border-slate-850" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Trees className="w-3.5 h-3.5" />
              Sidaama Sites
            </button>
            <button
              onClick={() => { setActiveTab("taxis"); setSearchQuery(""); }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "taxis" 
                  ? "bg-slate-950 text-amber-400 shadow-md border border-slate-850" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              Smart Taxis
            </button>
            <button
              onClick={() => { setActiveTab("ecoshine"); setSearchQuery(""); }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "ecoshine" 
                  ? "bg-slate-950 text-teal-400 shadow-md border border-slate-850" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Eco-Shine Hubs
            </button>
            <button
              onClick={() => { setActiveTab("tickets"); setSearchQuery(""); }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "tickets" 
                  ? "bg-slate-950 text-teal-400 shadow-md border border-slate-850" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TktIcon className="w-3.5 h-3.5 text-rose-500" />
              My Tickets & QR
            </button>
          </div>

          {/* Elegant Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab === "tourism" ? "destinations" : activeTab === "taxis" ? "taxis" : "stations"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Dynamic Context Render */}

        {/* 1. TOURISM EXPLORE SECTION */}
        {activeTab === "tourism" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-sans">
                <Compass className="w-5 h-5 text-teal-400" />
                Explore Sidaama Customs & Landmarks
              </h2>
              <p className="text-xs text-slate-450">Discover historical, cultural and scenic destinations mapped inside Hawassa</p>
            </div>

            {/* List Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tourismSites
                .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.category || "").toLowerCase().includes(searchQuery.toLowerCase()))
                .map((site) => (
                  <div 
                    key={site.id} 
                    className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-teal-500/30 rounded-2xl overflow-hidden flex flex-col justify-between transition"
                  >
                    <div>
                      {/* Photo Header placeholder or actual */}
                      <div className="relative h-44 bg-slate-950 overflow-hidden flex items-center justify-center">
                        {site.photoUrl ? (
                          <img 
                            src={site.photoUrl} 
                            alt={site.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                          />
                        ) : (
                          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-650 p-4 text-center">
                            <Trees className="w-10 h-10 mb-2 text-teal-500/20" />
                            <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Hawassa Scenic Capture</span>
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-850 px-2 py-0.5 rounded text-[9px] uppercase font-mono text-teal-400">
                          {site.category}
                        </span>
                        
                        {/* Rating block */}
                        <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur border border-slate-850 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono text-[10px] text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{site.rating || 5.0}</span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col gap-2">
                        <h3 className="font-bold text-sm text-slate-100 group-hover:text-teal-400 transition">
                          {site.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {site.description || "Historical monument asset registered via Super Admin directory."}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-900/80 flex items-center justify-between bg-slate-900/20">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-mono">
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>{site.views || 0} Votes</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLikeSite(site.id)}
                          className={`p-2 rounded-xl transition ${
                            likedSites.includes(site.id)
                              ? "bg-red-950/40 border border-red-500/20 text-red-400"
                              : "bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400"
                          }`}
                          title="Vote this landmark up"
                        >
                          <Heart className={`w-3.5 h-3.5 ${likedSites.includes(site.id) ? "fill-red-500" : ""}`} />
                        </button>

                        <button
                          onClick={() => setSelectedSite(site)}
                          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shadow-lg shadow-teal-950/40"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
              ))}

              {tourismSites.length === 0 && (
                <div className="col-span-3 text-center py-16 bg-slate-950 rounded-2xl border border-slate-900">
                  <Trees className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-mono">No scenic landmarks registered yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. TAXI TRACKING VIEW */}
        {activeTab === "taxis" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-sans">
                  <Car className="w-5 h-5 text-amber-500" />
                  Active City Fleet Taxis
                </h2>
                <p className="text-xs text-slate-450">Track available GPS dispatch smart taxis operating within the Hawassa district</p>
              </div>
              <div className="bg-amber-950/40 border border-amber-900/30 px-3 py-1 rounded-xl flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-emerald-400">
                  {taxiDrivers.filter(d => d.status === "Available" || d.active).length} Duty Taxis Ready
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: List of and filters for taxis */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 flex flex-col gap-3">
                  <h3 className="text-xs text-slate-400 uppercase font-mono tracking-wider block">Interactive Duty Directory</h3>
                  
                  <div className="flex flex-col gap-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {taxiDrivers
                      .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((drv) => {
                        const isAvailable = drv.status === "Available";
                        const isOnTrip = drv.status === "On Trip";
                        const statusColor = isAvailable ? "text-emerald-400 bg-emerald-950/40 border-emerald-900" : isOnTrip ? "text-cyan-400 bg-cyan-950/40 border-cyan-900" : "text-slate-450 bg-slate-950/40 border-slate-850";
                        return (
                          <div 
                            key={drv.id} 
                            className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-slate-950 text-amber-500 border border-slate-850 rounded-xl">
                                <Car className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-slate-200">{drv.name}</h4>
                                <div className="text-[10px] text-slate-500 font-mono tracking-tight flex items-center gap-2">
                                  <span>{drv.plateNumber}</span>
                                  <span>•</span>
                                  <span>{drv.licenseNumber || "No License"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-amber-400 font-bold">
                                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                                  <span>{drv.rating || 5.0} Score</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 text-right">
                              <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                                {drv.status || "Offline"}
                              </span>
                              <div className="text-[10px] text-slate-450 font-mono font-semibold">
                                {drv.fareRate || 50} ETB/km
                              </div>
                              {isAvailable && (
                                <button
                                  onClick={() => handleRequestTaxi(drv.id)}
                                  disabled={requestedTaxiId !== null}
                                  className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-850 text-slate-950 font-bold px-3 py-1 rounded-lg text-[10px] uppercase transition shadow-md shadow-amber-950"
                                >
                                  {requestedTaxiId === drv.id ? "Pinging..." : "Order"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                    })}

                    {taxiDrivers.length === 0 && (
                      <div className="text-center py-12 bg-slate-950/40 border border-slate-900 rounded-xl">
                        <Car className="w-10 h-10 text-slate-650 mx-auto mb-2" />
                        <span className="text-xs text-slate-500 font-mono">No taxi operators logged in.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Mini Vector Map for visual simulation overlay */}
              <div className="bg-slate-900 shadow-xl rounded-2xl border border-slate-850 p-5 flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider font-mono">Simulated GIS Radar</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Live localized trace of available/on-trip smart drivers</p>
                </div>

                <div className="relative h-64 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex items-center justify-center">
                  {/* Grid effect */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

                  {/* Pulsing ring */}
                  <div className="absolute w-[180px] h-[180px] border border-amber-500/10 rounded-full animate-pulse" />
                  <div className="absolute w-[100px] h-[100px] border border-amber-500/20 rounded-full" />

                  <div className="absolute text-center select-none pointer-events-none">
                    <span className="text-[9px] font-mono text-amber-500/40 uppercase tracking-widest block">Hawassa Sector telemetry</span>
                  </div>

                  {/* Render taxi spots dynamically */}
                  {taxiDrivers.map((drv, idx) => {
                    if (drv.status === "Offline") return null;
                    const leftPct = 15 + (idx * 21) % 70;
                    const topPct = 20 + (idx * 27) % 60;
                    const dotClass = drv.status === "Available" ? "bg-emerald-500" : "bg-cyan-500";
                    return (
                      <div 
                        key={drv.id} 
                        className="absolute cursor-help" 
                        style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                        onClick={() => alert(`Selected Driver: ${drv.name}\nPlate: ${drv.plateNumber}\nStatus: ${drv.status}`)}
                      >
                        <span className="relative flex h-3.5 w-3.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotClass}`}></span>
                          <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${dotClass}`}></span>
                        </span>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-800 text-[8px] font-mono rounded px-1 py-0.5 whitespace-nowrap text-slate-200 shadow-md">
                          {drv.name.split(" ")[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 block"></span>
                    <span>On Trip</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-550 block"></span>
                    <span>Offline</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ECO-SHINE SOLAR STATIONS SECTION */}
        {activeTab === "ecoshine" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-sans">
                <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />
                Solar Stations & Youth Sanitation Hubs
              </h2>
              <p className="text-xs text-slate-450">Track live clean solar battery statistics and daily water filtration metrics for micro-enterprises</p>
            </div>

            {/* General metrics aggregation HUD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ecoStations.map((station) => {
                const waterLit = station.waterFiltration !== undefined ? station.waterFiltration : 25;
                const isOnline = station.status === "Online";
                const isMaintenance = station.status === "Maintenance";
                const badgeClass = isOnline ? "bg-emerald-950 text-emerald-400 border-emerald-900" : isMaintenance ? "bg-amber-950 text-amber-500 border-amber-900" : "bg-red-950 text-red-500 border-red-900";
                return (
                  <div 
                    key={station.id} 
                    className="bg-slate-900/40 border border-slate-850 hover:border-teal-500/10 rounded-2xl p-5 flex flex-col justify-between gap-4 transition"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-sm text-slate-200">{station.name}</h3>
                        <span className={`text-[8px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded border ${badgeClass}`}>
                          {station.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Host Worker: <strong className="text-slate-300">{station.workerName}</strong></p>
                    </div>

                    {/* Battery progress stats */}
                    <div className="flex flex-col gap-1.5 bg-slate-950 p-3 rounded-xl border border-slate-850/80">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-450 uppercase flex items-center gap-1"><Battery className="w-3.5 h-3.5 text-teal-400" /> SOLAR CHARGE</span>
                        <span className="text-teal-400 font-bold font-mono">{station.batteryStatus}%</span>
                      </div>
                      <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-teal-500 h-full transition-all duration-300" 
                          style={{ width: `${station.batteryStatus}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-550 pt-1 font-mono">
                        <span>Generations: {station.solarGeneration}W</span>
                        <span className="text-sky-400 flex items-center gap-0.5"><Droplets className="w-3 h-3" /> {waterLit}L used</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Total Booked: {station.currentBookingsCount || 0} slots</span>
                      <span className="text-emerald-400 font-bold">{station.revenueToday || 0} ETB Rec</span>
                    </div>
                  </div>
                );
              })}

              {ecoStations.length === 0 && (
                <div className="col-span-3 text-center py-16 bg-slate-950 rounded-2xl border border-slate-900">
                  <Sun className="w-12 h-12 text-slate-650 mx-auto mb-2" />
                  <span className="text-sm text-slate-400 font-mono">No Solar Sanitation Stations active currently.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. PASSENGER TICKETS & SECURE QR GATE DEPLOYMENT */}
        {activeTab === "tickets" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-sans">
                <QrCode className="w-5 h-5 text-rose-500 animate-pulse" />
                Sidaama Regional Transit Booking & QR Pass
              </h2>
              <p className="text-xs text-slate-450">Reserve seat coordinates on municipal shuttle busses and check in with secure QR code gates</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Availabe Schedules and Booking Dialog */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest font-mono">1. Available Shuttle Schedules</h3>
                  
                  <div className="flex flex-col gap-3">
                    {/* Pre-installed or dynamic schedules */}
                    {[
                      { id: "sch_1", routeLabel: "Hawassa Main Terminal ⇄ Piazza Central", departureTime: "08:30 AM", price: 60, vehicle: "Municipal Bus SB-102", duration: "15 min" },
                      { id: "sch_2", routeLabel: "Piazza Central ⇄ Tabor Overlook Shuttles", departureTime: "11:15 AM", price: 45, vehicle: "Green Minibus GM-05", duration: "10 min" },
                      { id: "sch_3", routeLabel: "Menaharia Terminal ⇄ Aleta Wondo Regional", departureTime: "02:00 PM", price: 140, vehicle: "Sidaama Coaster Bus C-80", duration: "45 min" },
                      { id: "sch_4", routeLabel: "Hawassa University ⇄ Millennium Park", departureTime: "04:30 PM", price: 50, vehicle: "Electric Shuttle E-3", duration: "20 min" }
                    ].map((sch) => (
                      <div 
                        key={sch.id}
                        className={`p-4 rounded-xl border transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                          bookingSchedule?.id === sch.id 
                            ? "bg-rose-950/20 border-rose-500" 
                            : "bg-slate-950/60 border-slate-850 hover:bg-slate-950"
                        }`}
                      >
                        <div>
                          <span className="text-[9px] font-mono uppercase bg-slate-900 px-2 py-0.5 rounded text-amber-400 border border-slate-800">
                            {sch.vehicle}
                          </span>
                          <h4 className="font-bold text-xs text-slate-100 mt-1.5">{sch.routeLabel}</h4>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex gap-2.5">
                            <span>Departs: <strong className="text-slate-300">{sch.departureTime}</strong></span>
                            <span>•</span>
                            <span>Duration: {sch.duration}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                          <span className="text-sm font-extrabold text-emerald-400 font-mono">{sch.price} ETB</span>
                          <button
                            onClick={() => {
                              setBookingSchedule(sch);
                              setBookingPassengerName("");
                              setBookingPassengerPhone("");
                            }}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded-lg text-[10px] uppercase transition mt-1"
                          >
                            Book Seat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Input Dialog Form */}
                {bookingSchedule && (
                  <form 
                    onSubmit={handleBookTicketSubmit}
                    className="bg-gradient-to-br from-slate-900 to-slate-950 border border-rose-950 p-5 rounded-2xl flex flex-col gap-4 shadow-xl"
                  >
                    <div>
                      <h3 className="font-bold text-xs text-rose-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <TktIcon className="w-4 h-4 text-rose-500" /> Confirm Transit Seat Booking
                      </h3>
                      <p className="text-[10px] text-slate-450 mt-0.5">Booking seat reservation on `{bookingSchedule.routeLabel}`</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] text-slate-450 block mb-1">Passenger Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Abebe Kebede"
                          value={bookingPassengerName}
                          onChange={(e) => setBookingPassengerName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-450 block mb-1">Mobile Phone Number *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. +251 911 00 22 33"
                          value={bookingPassengerPhone}
                          onChange={(e) => setBookingPassengerPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-450 uppercase font-mono">Cashless Gateway Channel</span>
                        <div className="flex gap-2.5 mt-1.5">
                          {["Telebirr", "CBE Birr"].map((method: any) => (
                            <label 
                              key={method} 
                              className={`flex items-center gap-1.5 px-3 py-1 border rounded-lg text-xs font-bold cursor-pointer transition ${
                                bookingPaymentMethod === method 
                                  ? "bg-emerald-950/40 border-emerald-500 text-emerald-400" 
                                  : "bg-slate-950 border-slate-850 text-slate-450"
                              }`}
                            >
                              <input 
                                type="radio" 
                                name="payMethod" 
                                className="hidden" 
                                checked={bookingPaymentMethod === method} 
                                onChange={() => setBookingPaymentMethod(method)} 
                              />
                              {method}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setBookingSchedule(null)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-xs font-bold text-slate-300 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition uppercase font-mono"
                        >
                          Pay {bookingSchedule.price} ETB
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Column: Interactive passenger tickets stream & visual QR codes */}
              <div className="flex flex-col gap-4">
                <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4">
                  <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest font-mono mb-3">
                    2. My Gates Boarding Passes
                  </h3>

                  <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                    {userTickets.length === 0 ? (
                      <div className="text-center py-12 bg-slate-950/60 rounded-xl border border-slate-900">
                        <QrCode className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                        <span className="text-[11px] text-slate-500 font-mono block">Zero tickets purchased yet.</span>
                        <span className="text-[9px] text-slate-600 font-mono">Use the active schedules panel to book seats.</span>
                      </div>
                    ) : (
                      userTickets.map((t) => {
                        const isValidated = t.status === "Validated";
                        return (
                          <div 
                            key={t.id} 
                            className={`bg-slate-950 p-4 border rounded-xl flex flex-col gap-3 transition ${
                              isValidated ? "border-emerald-900 bg-emerald-950/5" : "border-slate-850 hover:border-slate-800"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-bold text-slate-450 uppercase font-mono">{t.ticketNumber}</span>
                                <h4 className="text-xs font-bold text-white mt-0.5">{t.routeLabel}</h4>
                                <div className="text-[9px] font-mono text-slate-500 mt-1">
                                  Seat: <strong className="text-amber-500">{t.seatNumber}</strong> 
                                  {" "}• Passenger: <strong className="text-slate-300">{t.passengerName}</strong>
                                </div>
                              </div>

                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                isValidated 
                                  ? "bg-emerald-950 border-emerald-900 text-emerald-400" 
                                  : "bg-rose-950 border-rose-900 text-rose-400 animate-pulse"
                              }`}>
                                {isValidated ? "Validated" : "Active Gate"}
                              </span>
                            </div>

                            {/* Custom visual vector QR Code frame right in the ticket */}
                            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 flex flex-col items-center gap-2">
                              {/* Vector QR code */}
                              <div className="p-1.5 bg-white rounded flex items-center justify-center">
                                <svg className="w-20 h-20 text-slate-950 fill-current" viewBox="0 0 100 100">
                                  {/* Top Left Corner Anchor */}
                                  <rect x="0" y="0" width="28" height="28" fill="currentColor" rx="2" />
                                  <rect x="5" y="5" width="18" height="18" fill="white" />
                                  <rect x="9" y="9" width="10" height="10" fill="currentColor" />

                                  {/* Top Right Corner Anchor */}
                                  <rect x="72" y="0" width="28" height="28" fill="currentColor" rx="2" />
                                  <rect x="77" y="5" width="18" height="18" fill="white" />
                                  <rect x="81" y="9" width="10" height="10" fill="currentColor" />

                                  {/* Bottom Left Corner Anchor */}
                                  <rect x="0" y="72" width="28" height="28" fill="currentColor" rx="2" />
                                  <rect x="5" y="77" width="18" height="18" fill="white" />
                                  <rect x="9" y="81" width="10" height="10" fill="currentColor" />

                                  {/* Cryptography density bytes */}
                                  <rect x="33" y="4" width="8" height="8" />
                                  <rect x="45" y="10" width="14" height="6" />
                                  <rect x="38" y="24" width="20" height="8" />
                                  <rect x="4" y="34" width="16" height="8" />
                                  <rect x="25" y="34" width="10" height="20" />
                                  <rect x="44" y="38" width="16" height="12" />
                                  
                                  <rect x="33" y="60" width="24" height="10" />
                                  <rect x="72" y="72" width="8" height="8" />
                                  <rect x="85" y="75" width="10" height="10" />
                                  <rect x="75" y="88" width="15" height="4" />
                                  <rect x="15" y="62" width="10" height="4" />
                                </svg>
                              </div>
                              <span className="font-mono text-[8px] text-slate-500">{t.qrCode}</span>
                            </div>

                            <div className="text-[10px] text-slate-500 font-mono flex justify-between items-center">
                              <span>Fee: {t.price} ETB • {t.paymentMethod}</span>
                              {isValidated ? (
                                <span className="text-emerald-400 flex items-center gap-1">✔ Verified Gate</span>
                              ) : (
                                <span className="text-amber-500">Scan at Gate Terminal</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DETAIL VIEW MODAL DIALOG */}
      <AnimatePresence>
        {selectedSite && (
          <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
              {/* Cover picture */}
              <div className="relative h-56 bg-slate-950 flex items-center justify-center">
                {selectedSite.photoUrl ? (
                  <img 
                    src={selectedSite.photoUrl} 
                    alt={selectedSite.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-center p-4">
                    <Trees className="w-12 h-12 text-teal-500/20 mb-2" />
                    <span className="text-[10px] uppercase tracking-widest font-mono text-slate-600">Landmark Backdrop Overlay</span>
                  </div>
                )}
                <button
                  onClick={() => setSelectedSite(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center hover:bg-slate-900 text-slate-300 transition"
                >
                  ✕
                </button>
                <span className="absolute bottom-4 left-4 bg-slate-950/90 text-[10px] uppercase font-mono tracking-wider font-bold px-3 py-1 rounded border border-slate-800 text-teal-400">
                  {selectedSite.category}
                </span>
              </div>

              {/* Information body */}
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedSite.name}</h3>
                  <div className="flex gap-2.5 items-center mt-1 text-[10px] font-mono text-slate-500">
                    <span className="text-amber-400 flex items-center gap-0.5">★ {selectedSite.rating}</span>
                    <span>•</span>
                    <span>{selectedSite.views || 0} registered votes</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 bg-slate-950 p-4 border border-slate-850 rounded-xl">
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-450 font-mono">Cultural Context & Sidaama Traditions</h4>
                  <p className="text-xs text-slate-350 leading-relaxed mt-1">
                    {selectedSite.history || `${selectedSite.name} is a vital public interest, cultural or natural landmark. It was authorized by the Sidaama Region Tourism and Hotels Bureau, preserved as heritage.`}
                  </p>
                </div>

                {selectedSite.videoUrl && (
                  <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-3 border border-slate-850 rounded-xl text-teal-400">
                    <Film className="w-4 h-4 text-teal-500" />
                    <span>Media Link Available:</span>
                    <a 
                      href={selectedSite.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline text-teal-300 hover:text-white font-mono"
                    >
                      {selectedSite.videoUrl}
                    </a>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => setSelectedSite(null)}
                    className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition"
                  >
                    Close Landmark
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
