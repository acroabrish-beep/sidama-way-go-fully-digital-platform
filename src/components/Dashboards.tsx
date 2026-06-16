import React, { useState, useEffect } from "react";
import { 
  Bus, Car, Trees, Building2, Hospital as HospIcon, Plus, Trash2, 
  Check, X, Eye, Edit, MapPin, DollarSign, Users, AlertTriangle, Shield, 
  Search, ShieldAlert, Star, Calendar, RefreshCcw, Bell, Play, FileText, Sun,
  Droplets, Battery 
} from "lucide-react";
import { db } from "../db";
import { 
  Route, Schedule, Vehicle, Driver, TaxiDriver, TaxiStation, 
  TourismSite, Hotel, HotelBooking, Pharmacy, Hospital, 
  FoodOrder, EcoShineLocation, EmergencyRequest, Payment, Ticket 
} from "../types";

// ==========================================
// 1. TRANSPORTATION DASHBOARD (PHASE 3)
// ==========================================
export function TransportationDashboard() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // Route creation form states
  const [newOrigin, setNewOrigin] = useState("Hawassa");
  const [newDestination, setNewDestination] = useState("");
  const [newDistance, setNewDistance] = useState("80 km");
  const [newPrice, setNewPrice] = useState(150);
  const [newEstTime, setNewEstTime] = useState("1 hr 30 min");
  const [newCode, setNewCode] = useState("");

  useEffect(() => {
    const unsubR = db.subscribe("routes", (data) => setRoutes(data));
    const unsubS = db.subscribe("schedules", (data) => setSchedules(data));
    const unsubV = db.subscribe("vehicles", (data) => setVehicles(data));
    return () => { unsubR(); unsubS(); unsubV(); };
  }, []);

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestination.trim()) return;

    const code = newCode.trim() || `HW-${newDestination.slice(0, 2).toUpperCase()}`;
    db.addDoc("routes", {
      origin: newOrigin,
      destination: newDestination,
      distance: newDistance,
      estimatedTime: newEstTime,
      price: Number(newPrice),
      active: true,
      code
    });

    setNewDestination("");
    setNewCode("");
  };

  const handleToggleRoute = (route: Route) => {
    db.updateDoc("routes", route.id, { active: !route.active });
  };

  const handleDeleteRoute = (id: string) => {
    db.deleteDoc("routes", id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
          <div className="text-slate-400 text-xs uppercase font-mono">Total Regional Routes</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{routes.length} Active</div>
        </div>
        <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
          <div className="text-slate-400 text-xs uppercase font-mono">Current Scheduled Buses</div>
          <div className="text-2xl font-bold text-amber-500 mt-1">
            {schedules.filter(s => s.status !== "Completed").length} Pending
          </div>
        </div>
        <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
          <div className="text-slate-400 text-xs uppercase font-mono">Vehicle Capacity Utilization</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">84.2%</div>
        </div>
        <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
          <div className="text-slate-400 text-xs uppercase font-mono">Cashless Digital Sales (Today)</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">7,640 ETB</div>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Management List */}
        <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Bus className="w-4 h-4 text-sky-400" />
              Sidaama Regional Terminal Routes
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Hawassa Central Hub</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-850 text-slate-450 uppercase font-mono text-[9px]">
                  <th className="py-2">Route Code</th>
                  <th className="py-2">Terminal Path</th>
                  <th className="py-2">Metrics</th>
                  <th className="py-2">Fare</th>
                  <th className="py-2 text-center">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(r => (
                  <tr key={r.id} className="border-b border-slate-900 hover:bg-slate-900/40">
                    <td className="py-3 font-mono text-amber-500 font-bold">{r.code}</td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-100">{r.origin} ➔ {r.destination}</div>
                    </td>
                    <td className="py-3 text-slate-400">
                      <div>{r.distance}</div>
                      <div className="text-[10px] text-slate-500">{r.estimatedTime}</div>
                    </td>
                    <td className="py-3 font-semibold text-slate-200">{r.price} ETB</td>
                    <td className="py-3 text-center">
                      <button 
                        onClick={() => handleToggleRoute(r)}
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold transition ${
                          r.active ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-slate-900 text-slate-500 border border-slate-850"
                        }`}
                      >
                        {r.active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleDeleteRoute(r.id)}
                        className="p-1 hover:bg-red-950 rounded text-red-500 transition" 
                        title="Delete Route"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Route Addition Form */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
          <h3 className="font-bold text-slate-100 text-sm">Add New Regional Transit Route</h3>
          <form onSubmit={handleAddRoute} className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Departure Station</label>
              <input 
                type="text" 
                value={newOrigin}
                disabled
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Destination Station *</label>
              <input 
                type="text" 
                required
                value={newDestination}
                onChange={(e) => {
                  setNewDestination(e.target.value);
                  // Auto construct convenient short code
                  if (e.target.value.length > 1) {
                    setNewCode(`HW-${e.target.value.slice(0, 2).toUpperCase()}`);
                  }
                }}
                placeholder="e.g. Bursa, Yirgalem, Bona"
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Distance (km)</label>
                <input 
                  type="text" 
                  value={newDistance}
                  onChange={(e) => setNewDistance(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Transit Time</label>
                <input 
                  type="text" 
                  value={newEstTime}
                  onChange={(e) => setNewEstTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Ticket Fare (ETB)</label>
                <input 
                  type="number" 
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Route Shortcode</label>
                <input 
                  type="text" 
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-500 transition text-slate-950 font-bold rounded-lg py-2 mt-2 text-xs"
            >
              Add Route
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. CITY TAXI DASHBOARD (PHASE 4)
// ==========================================
export function CityTaxiDashboard() {
  const [taxiDrivers, setTaxiDrivers] = useState<TaxiDriver[]>([]);
  const [stations, setStations] = useState<TaxiStation[]>([]);
  const [taxiQueues, setTaxiQueues] = useState<any[]>([]);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [rate, setRate] = useState(50);
  const [status, setStatus] = useState<"Available" | "On Trip" | "Offline">("Available");

  // Queue form states
  const [queueDriverName, setQueueDriverName] = useState("");
  const [queuePlateNumber, setQueuePlateNumber] = useState("");
  const [selectedQueueStation, setSelectedQueueStation] = useState("Piazza Central");

  useEffect(() => {
    const unsubDrivers = db.subscribe("taxi_drivers", (data) => {
      // Ensure all loaded drivers have a status default
      const processed = data.map(drv => ({
        ...drv,
        status: drv.status || (drv.active ? "Available" : "Offline")
      }));
      setTaxiDrivers(processed);
    });
    const unsubStations = db.subscribe("taxi_stations", (data) => setStations(data));
    const unsubQueues = db.subscribe("taxi_queue", (data) => {
      // Sort in order of joining so queue index reflects actual waiting position
      const sorted = [...data].sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
      setTaxiQueues(sorted);
    });
    return () => { unsubDrivers(); unsubStations(); unsubQueues(); };
  }, []);

  const handleRegisterTaxi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !plate.trim() || !licenseNumber.trim()) return;

    db.addDoc("taxi_drivers", {
      name,
      phone: phone || "+251 9" + Math.floor(10000000 + Math.random() * 90000000),
      plateNumber: plate,
      licenseNumber: licenseNumber,
      liveLatitude: 7.0503 + (Math.random() - 0.5) * 0.02,
      liveLongitude: 38.4800 + (Math.random() - 0.5) * 0.02,
      active: status !== "Offline",
      status: status,
      fareRate: Number(rate),
      rating: Number((4.2 + Math.random() * 0.8).toFixed(1)),
      taxiId: `vh_tx_${Date.now()}`
    });

    setName("");
    setPhone("");
    setPlate("");
    setLicenseNumber("");
    setRate(50);
    setStatus("Available");
  };

  const handleStatusChange = (id: string, newStatus: "Available" | "On Trip" | "Offline") => {
    db.updateDoc("taxi_drivers", id, { 
      status: newStatus,
      active: newStatus !== "Offline"
    });
  };

  const handleMockDrift = () => {
    taxiDrivers.forEach(drv => {
      if (drv.status !== "Offline") {
        const dLat = (Math.random() - 0.5) * 0.002;
        const dLng = (Math.random() - 0.5) * 0.002;
        db.updateDoc("taxi_drivers", drv.id, {
          liveLatitude: drv.liveLatitude + dLat,
          liveLongitude: drv.liveLongitude + dLng
        });
      }
    });
  };

  const handleJoinQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queueDriverName.trim() || !queuePlateNumber.trim()) return;

    db.addDoc("taxi_queue", {
      driverName: queueDriverName,
      plateNumber: queuePlateNumber,
      station: selectedQueueStation,
      joinedAt: new Date().toISOString(),
      status: "Waiting"
    });

    setQueueDriverName("");
    setQueuePlateNumber("");
    alert(`Successfully registered taxi in ${selectedQueueStation} queue!`);
  };

  const handleDispatchNext = (station: string) => {
    const stationQueue = taxiQueues.filter(q => q.station === station && q.status === "Waiting");
    if (stationQueue.length === 0) {
      alert(`No taxis currently waiting in queue at ${station}.`);
      return;
    }

    const nextDriver = stationQueue[0];
    db.updateDoc("taxi_queue", nextDriver.id, { status: "Dispatched" });

    // Deduct standard queue slot cashless fee (30 ETB)
    const queueFee = 30;
    db.addDoc("payments", {
      amount: queueFee,
      currency: "ETB",
      method: "Telebirr",
      reference: "TLB-Q-" + Math.floor(1000000 + Math.random() * 9000000),
      status: "Completed",
      type: "Taxi Queue Charge",
      payerName: nextDriver.driverName,
      timestamp: new Date().toISOString()
    });

    // Send push bulletin notification
    db.addDoc("notifications", {
      title: "TAXI STATION DISPATCH",
      message: `Taxi driver ${nextDriver.driverName} (${nextDriver.plateNumber}) dispatched from ${station}.`,
      category: "System",
      isRead: false,
      timestamp: new Date().toISOString()
    });

    // Notify next driver in line that it's their turn!
    if (stationQueue.length > 1) {
      const turnDriver = stationQueue[1];
      db.addDoc("notifications", {
        title: "CURRENT TURN ALERT",
        message: `Driver ${turnDriver.driverName} (${turnDriver.plateNumber}): Please advance to loading dock. It is your turn!`,
        category: "Emergency",
        isRead: false,
        timestamp: new Date().toISOString()
      });
      alert(`Dispatched ${nextDriver.driverName}. Advanced ${turnDriver.driverName} (Pos 0) - Push alert sent.`);
    } else {
      alert(`Dispatched ${nextDriver.driverName} from terminal successfully.`);
    }
  };

  const handleRemoveFromQueue = (id: string) => {
    db.deleteDoc("taxi_queue", id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-950 text-amber-500 rounded-lg">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Register Smart Driver</h3>
              <p className="text-[10px] text-slate-500">Live dispatch fleet registry</p>
            </div>
          </div>
          <form onSubmit={handleRegisterTaxi} className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">Driver Name *</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samuel Alamu"
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">License Number *</label>
              <input 
                type="text" 
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. DL-ETH-708304"
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">Phone Number</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 9..."
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">Plate Number *</label>
                <input 
                  type="text" 
                  required
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  placeholder="AA-3-B..."
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">Fare (ETB/km)</label>
                <input 
                  type="number" 
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">Default Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
              >
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg py-2 mt-2 text-xs transition uppercase tracking-wider"
            >
              Verify & Register Driver
            </button>
          </form>
        </div>

        {/* Live Tracking Status Table */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Hawassa City Taxi Fleet</h3>
                <p className="text-[10px] text-slate-500">Instant database communication active</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleMockDrift}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                >
                  <RefreshCcw className="w-3.5 h-3.5 text-slate-400" />
                  Simulate GPS Drift
                </button>
                <span className="bg-amber-950 text-amber-400 text-[9px] uppercase font-mono px-2 py-1 rounded border border-amber-900 flex items-center">
                  Live Dispatch Active
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-450 uppercase font-mono text-[9px]">
                    <th className="py-2">Driver / License</th>
                    <th className="py-2">Plate / Fare</th>
                    <th className="py-2">Live Coords (GPS)</th>
                    <th className="py-2">Rating</th>
                    <th className="py-2 text-center">Duty Status</th>
                  </tr>
                </thead>
                <tbody>
                  {taxiDrivers.map(drv => (
                    <tr key={drv.id} className="border-b border-slate-900 hover:bg-slate-900/40">
                      <td className="py-3 font-semibold text-slate-200">
                        <div>{drv.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase">
                          {drv.licenseNumber || "No License"}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-mono text-slate-300 font-semibold">{drv.plateNumber}</div>
                        <div className="text-[10px] text-slate-500">{drv.fareRate} ETB/km</div>
                      </td>
                      <td className="py-3 text-[10px] font-mono text-cyan-400">
                        {drv.liveLatitude.toFixed(4)}°N, {drv.liveLongitude.toFixed(4)}°E
                      </td>
                      <td className="py-3 text-amber-400 font-semibold">
                        <span className="flex items-center gap-0.5">{drv.rating || 5.0} ★</span>
                      </td>
                      <td className="py-3 text-center">
                        <select 
                          value={drv.status || "Available"}
                          onChange={(e) => handleStatusChange(drv.id, e.target.value as any)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded transition bg-slate-900 border border-slate-800 ${
                            (drv.status || "Available") === "Available" ? "text-emerald-400" :
                            (drv.status || "Available") === "On Trip" ? "text-cyan-400" : "text-slate-450"
                          }`}
                        >
                          <option value="Available" className="bg-slate-900 text-emerald-400">Available</option>
                          <option value="On Trip" className="bg-slate-900 text-cyan-400">On Trip</option>
                          <option value="Offline" className="bg-slate-900 text-slate-450">Offline</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Placeholder/HUD live map tracking layout */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-3">
            <h4 className="text-slate-100 text-xs font-bold uppercase tracking-wider font-mono">GPS Mapping HUD (Hawassa District)</h4>
            <div className="relative h-44 bg-slate-900 border border-slate-880 rounded-xl overflow-hidden flex items-center justify-center">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
              <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
              
              {/* Radar Sweeper */}
              <div className="absolute w-[200px] h-[200px] border border-cyan-500/10 rounded-full animate-ping pointer-events-none" />
              <div className="absolute w-[100px] h-[100px] border border-cyan-500/20 rounded-full pointer-events-none" />
              
              <div className="absolute text-center select-none pointer-events-none">
                <div className="text-[10px] font-mono text-cyan-500 tracking-widest uppercase">Telemetry Vector Overlay</div>
                <div className="text-[9px] font-mono text-slate-555 mt-1">Active Trace Map Interfaced with Firebase Auth</div>
              </div>

              {/* Render pulsing dots for active drivers */}
              {taxiDrivers.map((drv, idx) => {
                if (drv.status === "Offline") return null;
                // Distribute slightly across map placeholder
                const leftPct = 15 + (idx * 16) % 70;
                const topPct = 25 + (idx * 19) % 55;
                const colorClass = drv.status === "Available" ? "bg-emerald-500" : "bg-cyan-500";
                return (
                  <div 
                    key={drv.id} 
                    className="absolute" 
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    title={`${drv.name} (${drv.plateNumber})`}
                  >
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${colorClass}`}></span>
                    </span>
                    <div className="absolute left-4 top-[-6px] bg-slate-950/90 border border-slate-800 rounded text-[7px] px-1 py-0.5 whitespace-nowrap text-slate-300 font-mono">
                      {drv.name.split(" ")[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REAL-TIME TAXI QUEUE MANAGEMENT CORE SYSTEM */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Live Taxi Queue Management Platform
                </h3>
                <p className="text-[10px] text-slate-450 mt-0.5">FIFO Array sorting of active vehicle license plates</p>
              </div>

              {/* Station filtering buttons */}
              <div className="flex flex-wrap gap-1.5 bg-slate-900/60 p-1 border border-slate-800 rounded-lg">
                {["Piazza Central", "Menaharia Terminal", "Tabor Overlook"].map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedQueueStation(st)}
                    className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition ${
                      selectedQueueStation === st 
                        ? "bg-amber-500 text-slate-950" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {st.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Queue Joiner Form */}
              <div className="lg:col-span-2 bg-slate-900/40 p-4 border border-slate-850 rounded-xl flex flex-col gap-3">
                <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider font-mono">Register & Enter Queue</h4>
                <form onSubmit={handleJoinQueue} className="flex flex-col gap-3">
                  {/* Option to select active driver from the registry */}
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1">Select Active Driver (Autocomplete)</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      onChange={(e) => {
                        const drv = taxiDrivers.find(d => d.name === e.target.value);
                        if (drv) {
                          setQueueDriverName(drv.name);
                          setQueuePlateNumber(drv.plateNumber);
                        } else {
                          setQueueDriverName(e.target.value);
                        }
                      }}
                    >
                      <option value="">-- Choose registered driver or custom --</option>
                      {taxiDrivers.map(d => (
                        <option key={d.id} value={d.name}>{d.name} ({d.plateNumber})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1">Driver Name *</label>
                    <input
                      type="text"
                      required
                      value={queueDriverName}
                      onChange={(e) => setQueueDriverName(e.target.value)}
                      placeholder="Enter driver name"
                      className="w-full bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1">Vehicle Plate Number *</label>
                    <input
                      type="text"
                      required
                      value={queuePlateNumber}
                      onChange={(e) => setQueuePlateNumber(e.target.value)}
                      placeholder="e.g. AA-3-A1254"
                      className="w-full bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1">Destined Terminal Station *</label>
                    <input
                      type="text"
                      disabled
                      value={selectedQueueStation}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-450 font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold rounded-lg py-1.5 text-xs transition uppercase mt-1 tracking-wider"
                  >
                    Enter Live Queue
                  </button>
                </form>
              </div>

              {/* FIFO Sorted Active Queue List */}
              <div className="lg:col-span-3 flex flex-col gap-3">
                <div className="flex justify-between items-center bg-slate-900/30 px-3 py-2 border border-slate-850 rounded-lg">
                  <span className="text-[10px] uppercase font-mono text-slate-450">
                    Station: <strong className="text-slate-250">{selectedQueueStation}</strong>
                  </span>
                  <button
                    onClick={() => handleDispatchNext(selectedQueueStation)}
                    className="bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 text-[10px] uppercase px-3 py-1 rounded transition"
                  >
                    Dispatch Next (Pos 0)
                  </button>
                </div>

                <div className="bg-slate-900/20 border border-slate-850 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-400 uppercase font-mono text-[9px] bg-slate-900/40">
                        <th className="py-2.5 px-3">Position</th>
                        <th className="py-2.5 px-2">Driver</th>
                        <th className="py-2.5 px-2 font-mono">Plate</th>
                        <th className="py-2.5 px-2">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxiQueues.filter(q => q.station === selectedQueueStation).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-[11px] text-slate-500 font-mono">
                            Zero vehicles currently queued at {selectedQueueStation.split(" ")[0]}.
                          </td>
                        </tr>
                      ) : (
                        taxiQueues
                          .filter(q => q.station === selectedQueueStation)
                          .map((q, idx) => {
                            const isTurn = idx === 0 && q.status === "Waiting";
                            return (
                              <tr 
                                key={q.id} 
                                className={`border-b border-slate-900 hover:bg-slate-900/20 ${
                                  isTurn ? "bg-amber-950/20" : ""
                                }`}
                              >
                                <td className="py-3 px-3">
                                  {q.status === "Dispatched" ? (
                                    <span className="text-[10px] font-bold text-slate-500">Dispatched</span>
                                  ) : idx === 0 ? (
                                    <span className="bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase animate-pulse">
                                      Turn (0)
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 font-mono font-bold">#{idx}</span>
                                  )}
                                </td>
                                <td className="py-3 px-2 font-semibold text-slate-200">
                                  {q.driverName}
                                  <div className="text-[8px] text-slate-500 font-mono">
                                    {new Date(q.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </td>
                                <td className="py-3 px-2 font-mono text-amber-500 font-bold">
                                  {q.plateNumber}
                                </td>
                                <td className="py-3 px-2">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    q.status === "Dispatched" 
                                      ? "bg-slate-800 text-slate-400" 
                                      : isTurn 
                                        ? "bg-emerald-950 text-emerald-400 border border-emerald-900" 
                                        : "bg-slate-900 text-slate-450"
                                  }`}>
                                    {q.status}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => handleRemoveFromQueue(q.id)}
                                    className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-red-400"
                                    title="Cancel Queue Entry"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. TOURISM BUREAU DASHBOARD (PHASE 5)
// ==========================================
export function TourismDashboard() {
  const [sites, setSites] = useState<TourismSite[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState("Nature");
  const [newHist, setNewHist] = useState("");

  useEffect(() => {
    const unsub = db.subscribe("tourism_sites", (data) => setSites(data));
    return () => unsub();
  }, []);

  const handleRegisterSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    db.addDoc("tourism_sites", {
      name: newName,
      description: newDesc,
      category: newCat,
      history: newHist,
      photoUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400",
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      coords: { x: 40 + Math.random() * 20, y: 30 + Math.random() * 20 },
      views: 120,
      rating: 5.0
    });

    setNewName("");
    setNewDesc("");
    setNewHist("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add/Register site */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
            <Trees className="w-4 h-4 text-emerald-400" />
            Register Tourism Spot / Asset
          </h3>
          <form onSubmit={handleRegisterSite} className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Site / Landmark Name *</label>
              <input 
                type="text" 
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Sidaama Cultural Complex"
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Classification Category</label>
              <select 
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              >
                <option value="Nature">Nature & Shorelines</option>
                <option value="Culture">Traditional Culture</option>
                <option value="Monuments">Statues & Mountain Overlooks</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Public Description</label>
              <textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                placeholder="Highlights of the spot..."
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Cultural History Background</label>
              <textarea 
                value={newHist}
                onChange={(e) => setNewHist(e.target.value)}
                rows={2}
                placeholder="Historic facts or elder knowledge..."
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 transition text-slate-950 font-bold rounded-lg py-2 mt-1 text-xs"
            >
              Verify Sidaama Landmark
            </button>
          </form>
        </div>

        {/* Sidaama Attractions list */}
        <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
          <h3 className="font-bold text-slate-100 text-sm">Hawassa Designated Cultural Landmarks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map(s => (
              <div key={s.id} className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden flex flex-col justify-between">
                <img src={s.photoUrl} className="h-28 w-full object-cover opacity-80" alt={s.name} />
                <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] bg-slate-950 text-emerald-400 font-bold px-1.5 py-0.5 rounded">{s.category}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5 text-amber-500">{s.rating} ★</span>
                    </div>
                    <h4 className="font-bold text-slate-200 text-xs mt-1.5">{s.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mt-1">{s.description}</p>
                  </div>
                  <div className="text-[9px] text-slate-500 border-t border-slate-850 pt-2 font-mono flex justify-between">
                    <span>Views: {s.views}</span>
                    <span>Coords X:{s.coords?.x || 0} Y:{s.coords?.y || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. HOTEL & RESERVATION DASHBOARD (PHASE 6)
// ==========================================
export function HotelDashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<HotelBooking[]>([]);

  useEffect(() => {
    const unsubH = db.subscribe("hotels", (data) => setHotels(data));
    const unsubB = db.subscribe("hotel_bookings", (data) => setBookings(data));
    return () => { unsubH(); unsubB(); };
  }, []);

  const handleToggleVerify = (id: string, current: boolean) => {
    db.updateDoc("hotels", id, { verified: !current });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Board */}
        <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
          <h3 className="font-bold text-slate-100 text-sm">Hawassa Grand Lodges Security Verification</h3>
          <div className="flex flex-col gap-3">
            {hotels.map(h => (
              <div key={h.id} className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <img src={h.photoUrl} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">{h.name}</h4>
                    <p className="text-[10px] text-slate-400">Contact: {h.contact} | Rating: {h.rating} ★</p>
                    <div className="flex gap-1 mt-1">
                      {h.amenities.map((a, i) => (
                        <span key={i} className="text-[8px] bg-slate-950 text-slate-400 px-1 rounded">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleVerify(h.id, h.verified)}
                  className={`text-[9px] px-2.5 py-1 rounded-lg font-bold transition ${
                    h.verified ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-red-950 text-red-500 border border-red-900"
                  }`}
                >
                  {h.verified ? "Verified Bureau" : "Unverified"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reservation Registers */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
          <h3 className="font-bold text-slate-100 text-sm">Active Tourist Reservations</h3>
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
            {bookings.map(b => (
              <div key={b.id} className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex flex-col gap-1.5">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-300">{b.hotelName}</span>
                  <span className="text-[9px] bg-sky-950 text-sky-400 font-bold px-1.5 rounded">{b.status}</span>
                </div>
                <div className="text-[11px] text-slate-100">Guest: {b.guestName}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {b.checkIn} to {b.checkOut} ● {b.roomType}
                </div>
                <div className="text-[9px] text-emerald-400 font-mono text-right flex justify-between border-t border-slate-850 pt-1.5">
                  <span className="text-slate-500">Ref: {b.paymentReference}</span>
                  <span>Paid: {b.totalPaid} ETB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. PHARMACY DASHBOARD (PHASE 7)
// ==========================================
export function PharmacyDashboard() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const [availabilityResults, setAvailabilityResults] = useState<string | null>(null);

  useEffect(() => {
    const unsub = db.subscribe("pharmacies", (data) => setPharmacies(data));
    return () => unsub();
  }, []);

  const handleSearchMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineSearch.trim()) return;

    // Simulate search analysis
    const randomPercent = Math.floor(Math.random() * 85) + 15;
    const count = Math.floor(Math.random() * 6) + 1;
    setAvailabilityResults(
      `Sidaama Red Cross Pharmacy holds ${count} boxes of [${medicineSearch}] (Availability: ${randomPercent}%). Ready for medical delivery dispatch.`
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Search Medicine Panel */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-violet-400" />
          Urgent Medicine Locator & Dispatch
        </h3>
        <form onSubmit={handleSearchMedicine} className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Medicine Name *</label>
            <input 
              type="text" 
              required
              value={medicineSearch}
              onChange={(e) => setMedicineSearch(e.target.value)}
              placeholder="e.g. Paracetamol, Insulin, Amoxicillin"
              className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
            />
          </div>
          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-500 transition text-slate-950 font-bold rounded-lg py-2 text-xs"
          >
            Query Regional Medicine Registry
          </button>
        </form>

        {availabilityResults && (
          <div className="bg-violet-950/40 border border-violet-900 p-3 rounded-xl text-xs text-violet-300 leading-relaxed">
            {availabilityResults}
          </div>
        )}
      </div>

      {/* Pharmacy List */}
      <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
        <h3 className="font-bold text-slate-100 text-sm">Hawassa Regional Pharmacy Partners</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-850 text-slate-450 uppercase font-mono text-[9px]">
                <th className="py-2">Pharmacy Store Name</th>
                <th className="py-2">Contact Details</th>
                <th className="py-2">Stock Variety</th>
                <th className="py-2 text-center">Open 24h</th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.map(p => (
                <tr key={p.id} className="border-b border-slate-900 hover:bg-slate-900/40">
                  <td className="py-3 font-semibold text-slate-150">{p.name}</td>
                  <td className="py-3 font-mono text-[11px] text-slate-400">{p.contact}</td>
                  <td className="py-2 font-mono text-cyan-400">{p.medicineCount} products registered</td>
                  <td className="py-3 text-center">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      p.open24h ? "bg-emerald-950 text-emerald-400" : "bg-slate-900 text-slate-500"
                    }`}>
                      {p.open24h ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. HOSPITAL & DISPATCH DASHBOARD (PHASE 8)
// ==========================================
export function HospitalDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctorSched, setDoctorSched] = useState([
    { doctor: "Dr. Selamawit Sida", specialty: "Emergency Cardiology", duty: "Mon/Wed/Fri", status: "On Duty" },
    { doctor: "Dr. Thomas Peterson", specialty: "Trauma General Surgeon", duty: "Tue/Thu/Sat", status: "Available" },
    { doctor: "Dr. Abraham Kassa", specialty: "Pediatrics Consultant", duty: "Daily On-Call", status: "On Duty" }
  ]);

  useEffect(() => {
    const unsub = db.subscribe("hospitals", (data) => setHospitals(data));
    return () => unsub();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Centers list */}
        <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
            <HospIcon className="w-4 h-4 text-red-400" />
            Admitted Referral Hospital Directory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitals.map(h => (
              <div key={h.id} className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <h4 className="font-bold text-slate-150">{h.name}</h4>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Direct Line: <span className="font-mono text-slate-200">{h.contact}</span><br />
                  Emergency Hotline: <strong className="text-red-400 text-xs font-mono">{h.emergencyNumber}</strong>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono text-right mt-1">
                  Active Doctors: {h.doctorsCount} staff
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Duty Roster */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
          <h3 className="font-bold text-slate-100 text-sm">Doctor Shift Duty Schedule</h3>
          <div className="flex flex-col gap-3">
            {doctorSched.map((d, i) => (
              <div key={i} className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">{d.doctor}</h4>
                  <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{d.specialty}</p>
                  <p className="text-[9px] text-slate-500 mt-1">Hours: {d.duty}</p>
                </div>
                <span className="text-[9px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. FOOD DELIVERY DASHBOARD (PHASE 9)
// ==========================================
export function FoodDeliveryDashboard() {
  const [orders, setOrders] = useState<FoodOrder[]>([]);

  useEffect(() => {
    const unsub = db.subscribe("food_orders", (data) => setOrders(data));
    return () => unsub();
  }, []);

  const handleAdvanceStatus = (id: string, current: string) => {
    let next: any = "Preparing";
    if (current === "Received") next = "Preparing";
    else if (current === "Preparing") next = "Dispatched";
    else if (current === "Dispatched") next = "Delivered";
    else return;

    db.updateDoc("food_orders", id, { status: next });
  };

  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
      <h3 className="font-bold text-slate-100 text-sm">Hawassa Gourmet Food Orders and Kitchen Dispatch</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="border-b border-slate-850 text-slate-450 uppercase font-mono text-[9px]">
              <th className="py-2">Order Refer</th>
              <th className="py-2">Restaurant / Address</th>
              <th className="py-2">Items Ordered</th>
              <th className="py-2 font-mono">Amount Paid</th>
              <th className="py-2 text-center">Status Line</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-slate-900">
                <td className="py-3 font-mono text-slate-350">{o.id}</td>
                <td className="py-3">
                  <div className="font-semibold text-slate-200">{o.restaurantName}</div>
                  <div className="text-[10px] text-slate-450">Destination: {o.deliveryAddress}</div>
                </td>
                <td className="py-3">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="text-slate-300">
                      {it.quantity}x {it.name}
                    </div>
                  ))}
                </td>
                <td className="py-3 font-semibold text-slate-100">{o.total} ETB</td>
                <td className="py-3 text-center">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    o.status === "Delivered" ? "bg-emerald-950 text-emerald-400" : "bg-sky-950 text-sky-400"
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  {o.status !== "Delivered" && (
                    <button
                      onClick={() => handleAdvanceStatus(o.id, o.status)}
                      className="bg-sky-600 hover:bg-sky-500 transition text-slate-950 px-2 py-1 rounded text-[10px] font-bold"
                    >
                      Advance Status
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 8. ECO SHINE MODULE (PHASE 10)
// ==========================================
export function EcoShineDashboard() {
  const [locations, setLocations] = useState<EcoShineLocation[]>([]);

  // Form states
  const [stationName, setStationName] = useState("");
  const [worker, setWorker] = useState("");
  const [battery, setBattery] = useState(90);
  const [generation, setGeneration] = useState(150);
  const [water, setWater] = useState(25);
  const [status, setStatus] = useState<"Online" | "Offline" | "Maintenance">("Online");
  const [revenue, setRevenue] = useState(240);

  useEffect(() => {
    const unsub = db.subscribe("eco_shine_locations", (data) => {
      // Bootstrap with default waterFiltration if missing
      const processed = data.map(sh => ({
        ...sh,
        waterFiltration: sh.waterFiltration !== undefined ? sh.waterFiltration : Math.floor(10 + Math.random() * 40)
      }));
      setLocations(processed);
    });
    return () => unsub();
  }, []);

  const handleRegisterStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationName.trim() || !worker.trim()) return;

    db.addDoc("eco_shine_locations", {
      name: stationName,
      workerName: worker,
      batteryStatus: Number(battery),
      solarGeneration: Number(generation),
      waterFiltration: Number(water),
      status: status,
      currentBookingsCount: Math.floor(Number(revenue) / 20),
      revenueToday: Number(revenue)
    });

    setStationName("");
    setWorker("");
    setBattery(90);
    setGeneration(150);
    setWater(25);
    setStatus("Online");
    setRevenue(240);
  };

  const handleSimulateInteractive = (action: "sun" | "shine" | "reset") => {
    locations.forEach(sh => {
      let updatedBattery = sh.batteryStatus;
      let updatedGeneration = sh.solarGeneration;
      let updatedWater = sh.waterFiltration || 0;
      let updatedRevenue = sh.revenueToday;
      let updatedBookings = sh.currentBookingsCount;

      if (action === "sun") {
        // Peak sun increases generation & battery storage
        updatedGeneration = Math.min(300, sh.solarGeneration + Math.floor(20 + Math.random() * 30));
        updatedBattery = Math.min(100, sh.batteryStatus + Math.floor(5 + Math.random() * 10));
      } else if (action === "shine") {
        // Shine service drains battery a bit, uses filtration water, increases book counts & revenues
        updatedBattery = Math.max(10, sh.batteryStatus - Math.floor(2 + Math.random() * 5));
        updatedWater = updatedWater + Math.floor(1 + Math.random() * 3);
        updatedRevenue = sh.revenueToday + Math.floor(30 + Math.random() * 50);
        updatedBookings = sh.currentBookingsCount + 1;
      } else if (action === "reset") {
        // Reset telemetry metrics
        updatedBattery = Math.floor(65 + Math.random() * 30);
        updatedGeneration = Math.floor(80 + Math.random() * 120);
        updatedWater = Math.floor(5 + Math.random() * 15);
        updatedRevenue = Math.floor(100 + Math.random() * 200);
        updatedBookings = Math.floor(updatedRevenue / 20);
      }

      db.updateDoc("eco_shine_locations", sh.id, {
        batteryStatus: updatedBattery,
        solarGeneration: updatedGeneration,
        waterFiltration: updatedWater,
        revenueToday: updatedRevenue,
        currentBookingsCount: updatedBookings
      });
    });
  };

  // Aggregated totals
  const overallBatteryAvg = locations.length > 0
    ? Math.round(locations.reduce((acc, current) => acc + current.batteryStatus, 0) / locations.length)
    : 0;
  const overallFiltrationSum = locations.reduce((acc, current) => acc + (current.waterFiltration || 25), 0);
  const overallRevenueSum = locations.reduce((acc, current) => acc + current.revenueToday, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Solar-powered station indicator */}
        <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs uppercase font-mono">Solar Battery Average</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{overallBatteryAvg}% Storage</div>
          </div>
          <Battery className="w-8 h-8 text-teal-400" />
        </div>

        {/* Clean water filtration status */}
        <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs uppercase font-mono">Today Active Water Filtered</div>
            <div className="text-2xl font-bold text-sky-400 mt-1">{overallFiltrationSum} Liters Used</div>
          </div>
          <Droplets className="w-8 h-8 text-sky-400 animate-pulse" />
        </div>

        {/* Dynamic youth revenue indicator */}
        <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs uppercase font-mono">Active Youth Daily Income</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{overallRevenueSum} ETB Collected</div>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Register New Station Form */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-950 text-teal-500 rounded-lg">
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Deploy New Eco Station</h3>
              <p className="text-[10px] text-slate-500">Register clean solar youth asset</p>
            </div>
          </div>
          <form onSubmit={handleRegisterStation} className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">Station Name / Block *</label>
              <input 
                type="text" 
                required
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                placeholder="e.g. Piassa Station Alpha"
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">Worker Assigned *</label>
              <input 
                type="text" 
                required
                value={worker}
                onChange={(e) => setWorker(e.target.value)}
                placeholder="e.g. Abraham Kebede"
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">Battery (%)</label>
                <input 
                  type="number" 
                  value={battery}
                  onChange={(e) => setBattery(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">Solar Gen (W)</label>
                <input 
                  type="number" 
                  value={generation}
                  onChange={(e) => setGeneration(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">Filtration Water (L)</label>
                <input 
                  type="number" 
                  value={water}
                  onChange={(e) => setWater(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">Revenue (ETB)</label>
                <input 
                  type="number" 
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-450 block mb-1 uppercase tracking-wider font-mono">Operating Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg py-2 mt-2 text-xs transition uppercase tracking-wider"
            >
              Verify & Boot Station
            </button>
          </form>
        </div>

        {/* Real-time monitors & simulation status list */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Solar Station Monitors</h3>
                <p className="text-[10px] text-slate-500">Live telemetry values streamed real-time</p>
              </div>

              {/* Simulation triggers */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSimulateInteractive("sun")}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] text-amber-400 px-2 py-1 rounded transition"
                  title="Simulate peaking solar sunshine conditions"
                >
                  🔆 Peak Sun
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateInteractive("shine")}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] text-teal-400 px-2 py-1 rounded transition"
                  title="Simulate direct citizen sessions utilizing water filtration and daily power"
                >
                  👞 Client Service
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateInteractive("reset")}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] text-slate-400 px-2 py-1 rounded transition"
                  title="Fluctuate/recycle station coordinates"
                >
                  🔄 Recalibrate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map(sh => {
                const waterFiltered = sh.waterFiltration !== undefined ? sh.waterFiltration : 25;
                return (
                  <div key={sh.id} className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-xs text-slate-250 truncate block max-w-[155px]">{sh.name}</span>
                        <span className={`text-[8px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded ${
                          sh.status === "Online" ? "bg-emerald-950 text-emerald-400" : 
                          sh.status === "Maintenance" ? "bg-amber-950 text-amber-500" : "bg-red-950 text-red-500"
                        }`}>
                          {sh.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-405">Worker Assigned: <strong className="text-white">{sh.workerName}</strong></div>
                    </div>

                    {/* Solar Battery stats */}
                    <div className="flex flex-col gap-1 bg-slate-950 p-2.5 border border-slate-850 rounded">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400 block font-mono">BATTERY STORAGE</span>
                        <span className="font-bold text-teal-400 font-mono">{sh.batteryStatus}%</span>
                      </div>
                      <div className="w-full bg-slate-850 h-1.5 rounded overflow-hidden">
                        <div 
                          className="bg-teal-500 h-full transition-all duration-300" 
                          style={{ width: `${sh.batteryStatus}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
                        <span>Solar Peak: {sh.solarGeneration}W</span>
                        <span className="text-sky-400">Filtration: {waterFiltered} Liters Used</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/60 pt-2 flex justify-between text-[10px] font-mono text-slate-450 uppercase">
                      <span>Bookings: {sh.currentBookingsCount} pax</span>
                      <span className="text-emerald-400">Revenue: {sh.revenueToday} ETB</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. EMERGENCY DISPATCHER BOARD (PHASE 11)
// ==========================================
export function EmergencyDashboard() {
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);

  useEffect(() => {
    const unsub = db.subscribe("emergency_requests", (data) => setEmergencies(data));
    return () => unsub();
  }, []);

  const handleDispatchActiveUnits = (id: string) => {
    db.updateDoc("emergency_requests", id, { status: "Dispatched" });
    // Push emergency notification summary to citizen board
    db.addDoc("notifications", {
      title: "AMBULANCE/POLICE EMERGENCY UNIT ASSIGNED",
      message: `Emergency response cruiser was assigned to direct active coordinates. Avoid Lake shores.`,
      category: "Emergency",
      isRead: false
    });
  };

  const handleResolveEmergency = (id: string) => {
    db.updateDoc("emergency_requests", id, { status: "Resolved" });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Emergency Action */}
      <div className="bg-red-950 border border-red-900 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-3 items-center">
          <ShieldAlert className="w-10 h-10 text-red-400 animate-pulse animate-duration-1000" />
          <div>
            <h4 className="font-bold text-red-200 text-sm md:text-base">Hawassa Regional Emergency Alert dispatcher</h4>
            <p className="text-xs text-red-350 max-w-lg mt-0.5">
              Warning: Tapping any emergency dispatcher directly transmits location coordinates to Regional Police, Ambulances, and Sidaama Fire Brigades.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              db.addDoc("emergency_requests", {
                type: "Police",
                reporterName: "Super Admin Command Controller",
                reporterPhone: "+251911SOS",
                gpsLocation: "7.0505 N, 38.4812 E",
                coords: { x: 30, y: 35 },
                description: "Immediate Police Patrol response required.",
                status: "Pending",
                time: new Date().toISOString()
              });
              alert("URGENT POLICE PATROL SIGNAL BROADCAST SUCCESS.");
            }}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-2 rounded-lg text-xs"
          >
            DISPATCH POLICE 🚨
          </button>
          <button 
            onClick={() => {
              db.addDoc("emergency_requests", {
                type: "Ambulance",
                reporterName: "Super Admin Command Controller",
                reporterPhone: "+251911SOS",
                gpsLocation: "7.0505 N, 38.4812 E",
                coords: { x: 35, y: 40 },
                description: "Urgent Medical Evacuation required.",
                status: "Pending",
                time: new Date().toISOString()
              });
              alert("URGENT AMBULANCE EVAC SIGNAL BROADCAST SUCCESS.");
            }}
            className="bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs"
          >
            DISPATCH AMBULANCE 🚑
          </button>
        </div>
      </div>

      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
        <h3 className="font-bold text-slate-100 text-sm">Municipal Active Distress Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-850 text-slate-450 uppercase font-mono text-[9px]">
                <th className="py-2">Type</th>
                <th className="py-2">Reporter</th>
                <th className="py-2">GPS Coordinates</th>
                <th className="py-2">Details</th>
                <th className="py-2 text-center">Dispatch Status</th>
                <th className="py-2 text-right">Emergency Actions</th>
              </tr>
            </thead>
            <tbody>
              {emergencies.map(em => (
                <tr key={em.id} className="border-b border-slate-900">
                  <td className="py-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      em.type === "Police" ? "bg-red-950 text-red-400" : 
                      em.type === "Ambulance" ? "bg-amber-950 text-amber-500" : "bg-orange-950 text-orange-400"
                    }`}>
                      {em.type}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-200">
                    <div>{em.reporterName}</div>
                    <div className="text-[10px] text-slate-500">{em.reporterPhone}</div>
                  </td>
                  <td className="py-3 font-mono text-cyan-400 text-[10px]">{em.gpsLocation}</td>
                  <td className="py-3 text-slate-300 max-w-xs truncate" title={em.description}>{em.description}</td>
                  <td className="py-3 text-center">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      em.status === "Pending" ? "bg-red-950 text-red-400 animate-pulse border border-red-910" : 
                      em.status === "Dispatched" ? "bg-amber-950 text-amber-400" : "bg-slate-900 text-slate-500"
                    }`}>
                      {em.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {em.status === "Pending" && (
                        <button
                          onClick={() => handleDispatchActiveUnits(em.id)}
                          className="bg-red-500 hover:bg-red-400 text-black px-2 py-1 rounded text-[10px] font-bold"
                        >
                          Dispatch Units
                        </button>
                      )}
                      {em.status === "Dispatched" && (
                        <button
                          onClick={() => handleResolveEmergency(em.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-black px-2 py-1 rounded text-[10px] font-bold"
                        >
                          Resolve Alert
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default TransportationDashboard;
