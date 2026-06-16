import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Map, Bus, Car, Trees, Building2, Hospital as HospIcon, Utensils, 
  Sun, ShieldAlert, BadgeCent, QrCode, Bell, FileDown, Languages, Volume2, Cpu, Users,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../db";
import { 
  TransportationDashboard, CityTaxiDashboard, TourismDashboard, 
  HotelDashboard, PharmacyDashboard, HospitalDashboard, 
  FoodDeliveryDashboard, EcoShineDashboard, EmergencyDashboard 
} from "./Dashboards";
import GisMap from "./GisMap";
import QrSystem from "./QrSystem";
import AiAssistant from "./AiAssistant";
import { Payment, Notification, Report } from "../types";

export default function SuperAdminCommand() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("CommandDashboard");
  const [appLang, setAppLang] = useState<"English" | "Amharic" | "Sidaamu Afoo">("English");
  
  // Stats and list states
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  // Local state for active statistics counters
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [sosCount, setSosCount] = useState(0);

  useEffect(() => {
    const unsubPay = db.subscribe("payments", (data) => {
      setPayments(data);
      // Compute total regional revenue sum
      const total = data.reduce((acc, p) => acc + (p.status === "Completed" ? p.amount : 0), 0);
      setTotalRevenue(total);
    });

    const unsubNotif = db.subscribe("notifications", (data) => setNotifications(data));
    const unsubRep = db.subscribe("reports", (data) => setReports(data));
    const unsubSOS = db.subscribe("emergency_requests", (data) => {
      setSosCount(data.filter(e => e.status === "Pending").length);
    });

    return () => {
      unsubPay();
      unsubNotif();
      unsubRep();
      unsubSOS();
    };
  }, []);

  // Multi-language translation matrix (Phase 19)
  const t: { [key: string]: { [lang: string]: string } } = {
    title: { English: "SIDAAMA WAY GO", Amharic: "ሲዳማ ዌይ ጎ", "Sidaamu Afoo": "SIDAAMA WAY GO" },
    subtitle: { English: "HAWASSA SMART CITY PLATFORM", Amharic: "የሀዋሳ ከተማ ደህንነትና መቆጣጠሪያ ማዕከል", "Sidaamu Afoo": "HAWASSI SMART CITY PLATFORM" },
    dashboard: { English: "Command Control", Amharic: "ዋና መቆጣጠሪያ", "Sidaamu Afoo": "Command Control" },
    gis_map: { English: "GIS Spatial Map", Amharic: "የጂአይኤስ ካርታ", "Sidaamu Afoo": "Spatial GIS Map" },
    transit: { English: "Regional Logistics", Amharic: "የአውቶቡስ ትራንስፖርት", "Sidaamu Afoo": "Transit Logistics" },
    taxi: { English: "City Fleet Taxi", Amharic: "የታክሲ አገልግሎት", "Sidaamu Afoo": "City Fleet Taxi" },
    tourism: { English: "Tourism Bureau", Amharic: "የቱሪስት መስህቦች", "Sidaamu Afoo": "Tourism Sites" },
    hotels: { English: "Hotels Directory", Amharic: "የሆቴሎች ምዝገባ", "Sidaamu Afoo": "Verified Hotels" },
    medical: { English: "Health & Care", Amharic: "ሆስፒታሎችና ፋርማሲ", "Sidaamu Afoo": "Hospital & Pharmacy" },
    food: { English: "Food & Meals", Amharic: "ምግብ ማዘዣ ማዕከል", "Sidaamu Afoo": "Food Deliveries" },
    eco: { English: "Eco-Shine solar", Amharic: "ኢኮ-ሻይን ጫማ መጥረጊያ", "Sidaamu Afoo": "Eco-Shine solar" },
    sos: { English: "SOS Alert Room", Amharic: "የአደጋ ጊዜ መቆጣጠሪያ", "Sidaamu Afoo": "SOS Emergency" },
    qr_scanner: { English: "QR Valid Terminal", Amharic: "የቲኬት መቃኛ", "Sidaamu Afoo": "QR Gate Scan" },
    payments_title: { English: "Financial System", Amharic: "የክፍያ መዛግብቶች", "Sidaamu Afoo": "Cashless ledger" },
    export_rep: { English: "Report Export Center", Amharic: "የሪፖርት ማውረጃ ማዕከል", "Sidaamu Afoo": "Municipal Report Export" },
    revenue: { English: "Regional Revenue", Amharic: "አጠቃላይ የከተማ ገቢ", "Sidaamu Afoo": "Cashless Revenue" },
    notif_title: { English: "City Bulletin Alerts", Amharic: "የቅርብ ጊዜ መልእክቶች", "Sidaamu Afoo": "Bulletin Notifications" }
  };

  const getLabel = (key: string) => {
    return t[key]?.[appLang] || t[key]?.English || key;
  };

  // Physical dynamic csv report exporter
  const handlePhysicalExport = async (title: string, dataArray: any[]) => {
    try {
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dataJson: dataArray,
          format: "csv"
        })
      });

      if (!response.ok) throw new Error("Export request failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Error generating download sheet: " + e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans antialiased">
      
      {/* SIDEBAR NAVIGATION COLUMN */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-850 flex flex-col shrink-0">
        {/* Brand identity header */}
        <div className="p-5 border-b border-slate-850 flex items-center justify-between">
          <div>
            <span className="font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-450 to-amber-500 text-lg uppercase block">
              {getLabel("title")}
            </span>
            <span className="text-[9px] text-slate-500 font-mono tracking-wider font-bold block mt-0.5 uppercase">
              {getLabel("subtitle")}
            </span>
          </div>
        </div>

        {/* Global Language Panel */}
        <div className="px-4 py-2 border-b border-slate-850 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/45">
          <div className="flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-sky-400" />
            <span>Sys Region:</span>
          </div>
          <select 
            className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-slate-200 font-semibold"
            value={appLang}
            onChange={(e) => setAppLang(e.target.value as any)}
          >
            <option value="English">English</option>
            <option value="Amharic">አማርኛ (Amharic)</option>
            <option value="Sidaamu Afoo">Sidaamu Afoo</option>
          </select>
        </div>

        {/* Categories Tabs listing */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto">
          {[
            { id: "CommandDashboard", label: getLabel("dashboard"), icon: LayoutDashboard },
            { id: "GisSpatialMap", label: getLabel("gis_map"), icon: Map },
            { id: "RegionalLogistics", label: getLabel("transit"), icon: Bus },
            { id: "CityFleetTaxi", label: getLabel("taxi"), icon: Car },
            { id: "TourismBureau", label: getLabel("tourism"), icon: Trees },
            { id: "HotelsDirectory", label: getLabel("hotels"), icon: Building2 },
            { id: "HealthCare", label: getLabel("medical"), icon: HospIcon },
            { id: "FoodMeals", label: getLabel("food"), icon: Utensils },
            { id: "EcoShining", label: getLabel("eco"), icon: Sun },
            { id: "SOSEmergency", label: getLabel("sos"), icon: ShieldAlert, badge: sosCount > 0 ? sosCount : undefined },
            { id: "QRGateScan", label: getLabel("qr_scanner"), icon: QrCode }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition text-xs font-semibold ${
                  isActive 
                    ? "bg-gradient-to-r from-sky-900 to-slate-900/60 text-sky-400 border border-sky-850/50" 
                    : "text-slate-400 hover:text-slate-250 hover:bg-slate-900/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile and logout button */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/40 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-teal-400 text-xs border border-slate-700/60 uppercase">
              {user?.email?.slice(0, 2) || "SA"}
            </div>
            <div className="flex-1 overflow-hidden">
              <span className="text-xs font-bold text-slate-300 block truncate">{user?.email || "Super Admin"}</span>
              <span className="text-[9px] text-teal-500 font-mono tracking-wider font-semibold block uppercase">Sys Clearance Level 10</span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 hover:bg-red-950/30 active:bg-red-955 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out System</span>
          </button>
        </div>
      </aside>

      {/* CORE CONTENT CANVAS INTERFACE */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950 p-6 gap-6">
        
        {/* Dynamic Context Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-850 px-5 py-4 rounded-2xl">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <span>Sidaama Way Go Control Console</span>
              <span className="text-slate-500">/</span>
              <span className="text-sky-400 text-base">{activeTab.replace(/([A-Z])/g, ' $1').trim()}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Hawassa Municipality Management & City Admin Command Center. Live GPS Feed.
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                db.addDoc("notifications", {
                  title: "MANUAL BROADCAST ANNOUNCEMENT",
                  message: `Administrative broadcast issued to verified Sidaama citizens. Stay advised.`,
                  category: "System",
                  isRead: false
                });
                alert("Administrative Message broadcast to Sidaama citizen base successfully.");
              }}
              className="bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" /> Broadcast Alert
            </button>
            <button 
              onClick={() => handlePhysicalExport("Municipal Payments Split", payments)}
              className="bg-sky-600 hover:bg-sky-500 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <FileDown className="w-3.5 h-3.5" /> Export Ledgers
            </button>
          </div>
        </div>

        {/* 1. RENDER MAIN COMMAND OVERVIEW */}
        {activeTab === "CommandDashboard" && (
          <div className="flex flex-col gap-6">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-850/80 p-5 rounded-2xl">
                <div className="text-slate-450 text-[11px] uppercase tracking-wider font-semibold font-mono">Sidaama Region Cashless Income</div>
                <div className="text-3xl font-extrabold text-slate-100 mt-2">{totalRevenue} ETB</div>
                <div className="text-[10px] text-emerald-400 mt-1">● Real-time (Telebirr & CBE Birr Online)</div>
              </div>
              <div className="bg-slate-900 border border-slate-850/80 p-5 rounded-2xl">
                <div className="text-slate-450 text-[11px] uppercase tracking-wider font-semibold font-mono">Unresolved Emergency Alarms</div>
                <div className="text-3xl font-extrabold text-red-500 mt-2">{sosCount} SOS</div>
                <div className="text-[10px] text-red-400 mt-1">● Active incident dispatchers</div>
              </div>
              <div className="bg-slate-900 border border-slate-850/80 p-5 rounded-2xl">
                <div className="text-slate-450 text-[11px] uppercase tracking-wider font-semibold font-mono">Smart Solar Shoe-Shining Stations</div>
                <div className="text-3xl font-extrabold text-teal-400 mt-2">3 Terminals</div>
                <div className="text-[10px] text-teal-500 mt-1">● Cumulative charge level 91%</div>
              </div>
              <div className="bg-slate-900 border border-slate-850/80 p-5 rounded-2xl">
                <div className="text-slate-450 text-[11px] uppercase tracking-wider font-semibold font-mono">Municipal User Database</div>
                <div className="text-3xl font-extrabold text-indigo-400 mt-2">240 Verified</div>
                <div className="text-[10px] text-indigo-500 mt-1">● Roles: Admin, Drivers, CBE, Citizens</div>
              </div>
            </div>

            {/* Middle Section: GIS Map Preview & Digital ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: GIS Map preview frame */}
              <div className="lg:col-span-2 bg-slate-900 p-5 border border-slate-850 rounded-2xl flex flex-col gap-3 min-h-[350px]">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-200 text-sm">Spatial GIS Map HUD Visualizer</h3>
                  <button onClick={() => setActiveTab("GisSpatialMap")} className="text-xs text-sky-400 hover:underline">Launch Spatial Map →</button>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden border border-slate-800">
                  <GisMap />
                </div>
              </div>

              {/* Right Column: Mini notification Bulletin list */}
              <div className="bg-slate-900 p-5 border border-slate-850 rounded-2xl flex flex-col gap-4">
                <h3 className="font-bold text-slate-200 text-sm">{getLabel("notif_title")}</h3>
                <div className="flex flex-col gap-2.5 max-h-[330px] overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-bold px-1.5 rounded uppercase ${
                          n.category === "Emergency" ? "bg-red-950 text-red-400 animate-pulse" : "bg-sky-950 text-sky-400"
                        }`}>
                          {n.category}
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono">Active Feed</span>
                      </div>
                      <h4 className="font-bold text-[11px] text-slate-200 mt-1">{n.title}</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{n.message}</p>
                    </div>
                  ))}
                </div>
                {/* Manual alert generator for admin */}
                <button
                  onClick={() => {
                    db.addDoc("notifications", {
                      title: "Fichee Chambalaalla Grand Assembly Info",
                      message: "Hawassa Lakeside Promenade holds public celebrations. Traffic route HW-AW is reassigned dynamic gates.",
                      category: "Tourism",
                      isRead: false
                    });
                  }}
                  className="bg-slate-950 hover:bg-slate-900 text-slate-350 py-2 border border-slate-800 rounded-xl text-xs font-semibold"
                >
                  Generate Sidaama Culture Alert
                </button>
              </div>
            </div>

            {/* Bottom Section: Payment integrations (Telebirr & CBE Birr log ledger) */}
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                    <BadgeCent className="w-4 h-4 text-emerald-450" />
                    {getLabel("payments_title")}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Physical ledger checking transactions against regional banking channels.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handlePhysicalExport("Hawassa Core Cash Ledger", payments)}
                    className="bg-slate-950 hover:bg-slate-900 text-slate-300 text-[11px] border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold"
                  >
                    CSV Download
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-350">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-450 uppercase font-mono text-[9px]">
                      <th className="py-2">Payer Identity</th>
                      <th className="py-2">Payment Segment</th>
                      <th className="py-2">Transaction Ref</th>
                      <th className="py-2">Date Frame</th>
                      <th className="py-2">Income (ETB)</th>
                      <th className="py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id} className="border-b border-slate-900 hover:bg-slate-900/30">
                        <td className="py-3 font-semibold text-slate-200">{p.payerName}</td>
                        <td className="py-3 text-slate-400">{p.type} Module</td>
                        <td className="py-3 font-mono text-cyan-400 text-[10px]">{p.reference}</td>
                        <td className="py-3 text-slate-500 text-[10px] font-mono">{p.timestamp.slice(0, 16).replace('T', ' ')}</td>
                        <td className="py-3 font-extrabold text-slate-200">{p.amount} ETB</td>
                        <td className="py-3 text-center">
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB RENDERERS */}
        {activeTab === "GisSpatialMap" && (
          <div className="flex-1 h-[650px] relative">
            <GisMap />
          </div>
        )}

        {activeTab === "RegionalLogistics" && <TransportationDashboard />}
        {activeTab === "CityFleetTaxi" && <CityTaxiDashboard />}
        {activeTab === "TourismBureau" && <TourismDashboard />}
        {activeTab === "HotelsDirectory" && <HotelDashboard />}
        {activeTab === "HealthCare" && (
          <div className="flex flex-col gap-6">
            <HospitalDashboard />
            <PharmacyDashboard />
          </div>
        )}
        {activeTab === "FoodMeals" && <FoodDeliveryDashboard />}
        {activeTab === "EcoShining" && <EcoShineDashboard />}
        {activeTab === "SOSEmergency" && <EmergencyDashboard />}
        {activeTab === "QRGateScan" && <QrSystem />}

      </main>

      {/* FLOAT GLOBAL COMPREHENSIVE AI ASSISTANT (Accessible on EVERY view) */}
      <AiAssistant 
        currentDashboardName={activeTab} 
        currentMetrics={`Total Region Cashless Revenue: ${totalRevenue} ETB, Unresolved Emergencies: ${sosCount}, App Language: ${appLang}, GIS layers: active`}
      />
    </div>
  );
}
