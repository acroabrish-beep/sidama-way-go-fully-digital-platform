import React, { useState, useEffect } from "react";
import { 
  MapPin, Search, Compass, Navigation, Sliders, Shield, Hospital as HospIcon, 
  Car, Sun, Trees, Building2, Plus, Minus, AlertTriangle, Play 
} from "lucide-react";
import { db } from "../db";
import { TourismSite, Hotel, Hospital, Pharmacy, TaxiDriver, EmergencyRequest } from "../types";

interface PinEntity {
  id: string;
  name: string;
  type: "Tourism" | "Hotel" | "Hospital" | "Pharmacy" | "Taxi" | "Emergency" | "EcoShine";
  x: number; // Percent width 0-100
  y: number; // Percent height 0-100
  info: string;
}

export default function GisMap() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLayer, setSelectedLayer] = useState<string>("All");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [selectedPin, setSelectedPin] = useState<PinEntity | null>(null);
  const [activeRoute, setActiveRoute] = useState<{ code: string; label: string; coords: {x:number, y:number}[] } | null>(null);

  // Read data in real time from collections
  const [tourismSites, setTourismSites] = useState<TourismSite[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [taxiDrivers, setTaxiDrivers] = useState<TaxiDriver[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);

  useEffect(() => {
    const unsubTourism = db.subscribe("tourism_sites", (data) => setTourismSites(data));
    const unsubHotels = db.subscribe("hotels", (data) => setHotels(data));
    const unsubHospitals = db.subscribe("hospitals", (data) => setHospitals(data));
    const unsubPharmacies = db.subscribe("pharmacies", (data) => setPharmacies(data));
    const unsubTaxis = db.subscribe("taxi_drivers", (data) => setTaxiDrivers(data));
    const unsubEmergencies = db.subscribe("emergency_requests", (data) => setEmergencies(data));

    return () => {
      unsubTourism();
      unsubHotels();
      unsubHospitals();
      unsubPharmacies();
      unsubTaxis();
      unsubEmergencies();
    };
  }, []);

  // Assemble all entities into mapping pins
  const allPins: PinEntity[] = [];

  tourismSites.forEach(s => allPins.push({
    id: s.id, name: s.name, type: "Tourism", x: s.coords?.x || 30, y: s.coords?.y || 40, info: `${s.category} attraction. Rating: ${s.rating} ★`
  }));

  hotels.forEach(h => allPins.push({
    id: h.id, name: h.name, type: "Hotel", x: h.coords?.x || 20, y: h.coords?.y || 80, info: `Verified luxury lodge. Rated ${h.rating} ★. ${h.contact}`
  }));

  hospitals.forEach(hp => allPins.push({
    id: hp.id, name: hp.name, type: "Hospital", x: hp.coords?.x || 55, y: hp.coords?.y || 25, info: `Clinical / Emergency Services. Call: ${hp.emergencyNumber}`
  }));

  pharmacies.forEach(ph => allPins.push({
    id: ph.id, name: ph.name, type: "Pharmacy", x: ph.coords?.x || 42, y: ph.coords?.y || 48, info: `${ph.medicineCount} medicines. Open 24h: ${ph.open24h ? "Yes" : "No"}`
  }));

  taxiDrivers.forEach(tx => {
    // Generate pseudo relative coordinates from their dry GPS latitudes
    // Map bounds: Lat 7.03 - 7.07, Lon 38.46 - 38.50
    const xPct = ((tx.liveLongitude - 38.46) / 0.04) * 100;
    const yPct = ((7.07 - tx.liveLatitude) / 0.04) * 100;
    allPins.push({
      id: tx.id, name: tx.name, type: "Taxi", x: xPct, y: yPct, info: `Plate ${tx.plateNumber}. Status: ${tx.active ? "Online & GPS Active" : "In-Garage"}. ${tx.rating} ★`
    });
  });

  emergencies.forEach(em => allPins.push({
    id: em.id, name: `Emergency: ${em.type}`, type: "Emergency", x: em.coords?.x || 45, y: em.coords?.y || 50, info: `${em.description} (Status: ${em.status})`
  }));

  // Eco-shine nodes preloaded
  allPins.push(
    { id: "sc_sh_1", name: "Eco Shine Station Alpha", type: "EcoShine", x: 38, y: 55, info: "Solar Energy: 165W. Battery storage: 94%. Worker: Kasahun." },
    { id: "sc_sh_2", name: "Eco Shine Station Beta", type: "EcoShine", x: 24, y: 64, info: "Solar Energy: 120W. Battery storage: 82%. Worker: Dinkesa." }
  );

  // Filter system
  const filteredPins = allPins.filter(pin => {
    const matchesSearch = pin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pin.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLayer = selectedLayer === "All" || pin.type === selectedLayer;
    return matchesSearch && matchesLayer;
  });

  // Navigation route vectors
  const predefinedRoutes = [
    { code: "HW-AW", label: "Hawassa → Aleta Wondo", coords: [{ x: 30, y: 35 }, { x: 35, y: 50 }, { x: 42, y: 70 }, { x: 48, y: 88 }] },
    { code: "HW-BS", label: "Hawassa → Bensa", coords: [{ x: 30, y: 35 }, { x: 45, y: 38 }, { x: 60, y: 48 }, { x: 80, y: 65 }] },
    { code: "HW-BN", label: "Hawassa → Bona", coords: [{ x: 30, y: 35 }, { x: 50, y: 55 }, { x: 65, y: 72 }, { x: 75, y: 85 }] },
    { code: "HW-YG", label: "Hawassa → Yirgalem", coords: [{ x: 30, y: 35 }, { x: 33, y: 42 }, { x: 38, y: 52 }, { x: 42, y: 62 }] }
  ];

  // Drag and map controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 20, 240));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 20, 80));
  const resetMap = () => {
    setZoomLevel(100);
    setOffset({ x: 0, y: 0 });
    setSelectedPin(null);
    setActiveRoute(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full min-h-[500px]">
      {/* 1. Header Toolbar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-sky-400 animate-spin-slow" />
          <span className="font-semibold text-slate-100 tracking-tight text-sm md:text-base">Hawassa Interactive GIS Center</span>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px] uppercase px-1.5 py-0.5 rounded">GPS Online</span>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-850 pl-8 pr-3 py-1 text-xs text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-sky-500"
            placeholder="Search GIS node or taxi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* 2. Sub-Toolbar Layers */}
      <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-850 flex flex-wrap gap-1.5">
        {[
          { key: "All", label: "All Layers", icon: Sliders, color: "text-slate-400" },
          { key: "Tourism", label: "Tourism", icon: Trees, color: "text-emerald-400" },
          { key: "Hotel", label: "Hotels", icon: Building2, color: "text-sky-400" },
          { key: "Hospital", label: "Hospitals", icon: HospIcon, color: "text-rose-400" },
          { key: "Pharmacy", label: "Pharmacies", icon: Plus, color: "text-violet-400" },
          { key: "Taxi", label: "Live Taxis", icon: Car, color: "text-amber-400" },
          { key: "Emergency", label: "SOS Alerts", icon: AlertTriangle, color: "text-red-400" },
          { key: "EcoShine", label: "Eco-Shine", icon: Sun, color: "text-teal-400" }
        ].map((layer) => {
          const Icon = layer.icon;
          const isActive = selectedLayer === layer.key;
          return (
            <button
              key={layer.key}
              onClick={() => { setSelectedLayer(layer.key); setSelectedPin(null); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                isActive 
                  ? "bg-slate-800 text-slate-100 border border-slate-700" 
                  : "bg-slate-900/40 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-3 h-3 ${layer.color}`} />
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Stage Container */}
      <div className="flex-1 relative overflow-hidden bg-slate-950 flex">
        {/* The Map Canvas */}
        <div 
          className={`flex-1 relative cursor-grab active:cursor-grabbing select-none`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Blueprint Styling (Sidaama Regional Grid Lines) */}
          <div 
            className="absolute inset-0 transition-transform duration-75 origin-center"
            style={{
              backgroundImage: "radial-gradient(#1e293b 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomLevel / 100})`,
              width: "100%",
              height: "100%"
            }}
          >
            {/* Outline of Lake Hawassa (Decorative Topography) */}
            <svg className="absolute top-10 left-10 w-[240px] h-[340px] opacity-15 pointer-events-none fill-sky-850 stroke-sky-500 stroke-2 overflow-visible">
              <path d="M 10 100 Q 40 40, 100 80 T 200 120 T 220 220 T 150 280 T 50 250 Z" />
              <text x="70" y="180" className="fill-sky-400 font-sans tracking-widest uppercase font-bold text-[10px]">LAKE HAWASSA</text>
            </svg>

            {/* Sidaama Regional Municipal Outer Borders (Decorative) */}
            <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none stroke-emerald-500 stroke-1 stroke-dasharray" strokeDasharray="5,5">
              <rect x="5%" y="5%" width="90%" height="90%" rx="16" />
              <line x1="50%" y1="0" x2="50%" y2="100%" />
              <line x1="0" y1="50%" x2="100%" y2="50%" />
            </svg>

            {/* Simulated Regional Highways (Connecting Hawassa Core to other regions) */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none stroke-slate-700 stroke-1">
              {/* Route to Aleta Wondo */}
              <path d="M 300 240 Q 350 350, 420 500 T 480 700" fill="none" className="stroke-slate-650" />
              {/* Route to Bensa */}
              <path d="M 300 240 Q 450 260, 600 340 T 800 480" fill="none" className="stroke-slate-650" />
              {/* Route to Yirgalem */}
              <path d="M 300 240 Q 330 300, 380 400 T 420 500" fill="none" className="stroke-cyan-800" />
            </svg>

            {/* Draw active transportation module route (Phase 3 direction indicator) */}
            {activeRoute && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <g>
                  {/* Glowing Backing Path */}
                  <path 
                    d={`M ${activeRoute.coords.map(c => `${c.x * 6} ${c.y * 5}`).join(" L ")}`}
                    fill="none"
                    className="stroke-amber-500/35 stroke-[6px] stroke-linejoin-round"
                  />
                  {/* Main Animated Direction Path */}
                  <path 
                    id="map-route-lane"
                    d={`M ${activeRoute.coords.map(c => `${c.x * 6} ${c.y * 5}`).join(" L ")}`}
                    fill="none"
                    className="stroke-amber-400 stroke-[3px] stroke-linejoin-round"
                    strokeDasharray="10, 10"
                  >
                    <animate attributeName="stroke-dashoffset" values="200;0" dur="8s" repeatCount="indefinite" />
                  </path>
                  {/* Dynamic Pointer Moving along route */}
                  <circle r="6" className="fill-amber-300 stroke-amber-500 stroke-2 animate-ping">
                    <animateMotion
                      path={`M ${activeRoute.coords.map(c => `${c.x * 6} ${c.y * 5}`).join(" L ")}`}
                      dur="12s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              </svg>
            )}

            {/* Plot GIS Filtered Pins */}
            {filteredPins.map(pin => {
              // Dynamic Colors based on node categories
              let markerColor = "bg-sky-500 border-sky-300";
              let Icon = MapPin;

              if (pin.type === "Tourism") {
                markerColor = "bg-emerald-500 border-emerald-300";
                Icon = Trees;
              } else if (pin.type === "Hotel") {
                markerColor = "bg-indigo-500 border-indigo-300";
                Icon = Building2;
              } else if (pin.type === "Hospital") {
                markerColor = "bg-red-500 border-red-300";
                Icon = HospIcon;
              } else if (pin.type === "Pharmacy") {
                markerColor = "bg-rose-500 border-rose-300";
                Icon = Plus;
              } else if (pin.type === "Taxi") {
                markerColor = "bg-amber-500 border-amber-300";
                Icon = Car;
              } else if (pin.type === "Emergency") {
                markerColor = "bg-red-600 border-red-200 ring-4 ring-red-950/50";
                Icon = AlertTriangle;
              } else if (pin.type === "EcoShine") {
                markerColor = "bg-teal-500 border-teal-300";
                Icon = Sun;
              }

              const isSelected = selectedPin?.id === pin.id;

              return (
                <div
                  key={pin.id}
                  className={`absolute transition-all duration-300 select-none`}
                  style={{
                    left: `${pin.x}%`,
                    top: `${pin.y}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPin(pin);
                  }}
                >
                  {/* Hover or selected visual aura */}
                  <div className="relative -left-1/2 -top-1/2 group cursor-pointer flex flex-col items-center">
                    {/* Live pulsers for vehicles/emergencies */}
                    {(pin.type === "Taxi" || pin.type === "Emergency") && (
                      <span className={`absolute inline-flex h-full w-full rounded-full ${pin.type === 'Emergency' ? 'bg-red-400' : 'bg-amber-400'} opacity-35 animate-ping`} />
                    )}

                    <div className={`p-1.5 rounded-full border shadow-lg transition-transform ${markerColor} ${
                      isSelected ? "scale-125 ring-4 ring-sky-950/50" : "hover:scale-110"
                    }`}>
                      <Icon className="w-3.5 h-3.5 text-slate-950 font-bold" />
                    </div>

                    {/* Miniature label (Only shows on high zoom or filter selection) */}
                    <span className="bg-slate-950/90 text-slate-200 border border-slate-850 px-1 py-0.5 rounded text-[8px] font-mono mt-0.5 max-w-[80px] truncate whitespace-nowrap">
                      {pin.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Left Sidebar Mini Router Selector */}
        <div className="absolute left-3 top-3 bg-slate-950/90 border border-slate-800/80 p-3 rounded-xl max-w-[200px] hidden md:flex flex-col gap-2 shadow-2xl backdrop-blur-md">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Regional Route Planners</span>
          <div className="flex flex-col gap-1">
            {predefinedRoutes.map(item => (
              <button
                key={item.code}
                onClick={() => setActiveRoute(activeRoute?.code === item.code ? null : item)}
                className={`text-left text-xs px-2 py-1.5 rounded-lg transition border flex items-center justify-between gap-1 ${
                  activeRoute?.code === item.code 
                    ? "bg-amber-955 text-amber-400 border-amber-900/60" 
                    : "bg-slate-900/60 text-slate-350 border-transparent hover:bg-slate-900"
                }`}
              >
                <div className="truncate">
                  <div className="font-bold text-[10px]">{item.code}</div>
                  <div className="text-[9px] truncate">{item.label}</div>
                </div>
                <Play className="w-2.5 h-2.5 flex-shrink-0" />
              </button>
            ))}
          </div>
          {activeRoute && (
            <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg text-[9px] text-slate-400 mt-1">
              <div className="flex justify-between font-bold text-slate-200">
                <span>Distance:</span>
                <span>~94 km</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Speed:</span>
                <span>65 km/h</span>
              </div>
              <div className="text-amber-500 font-mono mt-1 text-[8px] flex items-center gap-1">
                <Navigation className="w-2 h-2 animate-bounce" /> Pulsing live coordinates...
              </div>
            </div>
          )}
        </div>

        {/* 5. HUD Overlay (Dynamic Details card when selecting pins) */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 md:left-[initial] md:right-4 bg-slate-900/95 border border-slate-750 p-4 rounded-xl shadow-2xl max-w-sm backdrop-blur-md shrink-0 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                  selectedPin.type === "Emergency" ? "bg-red-500 animate-pulse" : 
                  selectedPin.type === "Taxi" ? "bg-amber-500" : 
                  selectedPin.type === "Hospital" ? "bg-red-400" : "bg-emerald-500"
                }`} />
                <h4 className="font-bold text-slate-100 text-sm">{selectedPin.name}</h4>
              </div>
              <button 
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
                onClick={() => setSelectedPin(null)}
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedPin.info}</p>
            
            <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center text-[10px]">
              <div className="text-slate-400">GIS Coordinates</div>
              <div className="font-mono text-sky-400">
                {((selectedPin.y * 0.0004) + 7.032).toFixed(5)}°N, {((selectedPin.x * 0.0004) + 38.461).toFixed(5)}°E
              </div>
            </div>

            <div className="flex gap-1.5">
              <button 
                onClick={() => {
                  alert(`Direct navigation route computed to ${selectedPin.name}. Ready for bus dispatch.`);
                }}
                className="flex-1 bg-sky-600 hover:bg-sky-500 transition text-slate-950 font-semibold py-1 rounded text-[10px] flex items-center justify-center gap-1"
              >
                <Navigation className="w-3 h-3" /> Get Directions
              </button>
              {selectedPin.type === "Taxi" && (
                <button 
                  onClick={() => alert(`Simulated GPS ping packet sent to designated driver. Active frequency 433MHz.`)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 rounded text-[10px]"
                >
                  Ping GPS
                </button>
              )}
            </div>
          </div>
        )}

        {/* 6. Control Panel Overlay (Bottom-Right Zoom / HUD controllers) */}
        <div className="absolute right-3 top-3 flex flex-col gap-1 shadow-lg pointer-events-auto">
          <button 
            onClick={zoomIn} 
            className="p-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-200 rounded-lg transition"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={zoomOut} 
            className="p-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-200 rounded-lg transition"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={resetMap} 
            className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 font-mono text-[9px] text-slate-300 hover:text-slate-100 rounded-lg transition mt-2"
          >
            RESET
          </button>
        </div>
      </div>
      
      {/* 7. Footer Status line */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-450 font-mono">
        <div className="flex items-center gap-3">
          <span>Active Nodes: {filteredPins.length}</span>
          <span className="hidden sm:inline">●</span>
          <span className="hidden sm:inline">Map Projection: EPSG:4326/WGS84</span>
        </div>
        <div>
          <span>Lat: 7.0503 N | Lon: 38.4800 E (Center)</span>
        </div>
      </div>
    </div>
  );
}
