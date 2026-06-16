import React, { useState } from "react";
import { QrCode, Scan, ShieldCheck, CheckCircle2, AlertOctagon, RefreshCw, Smartphone } from "lucide-react";
import { db } from "../db";
import { Ticket } from "../types";

interface QrSystemProps {
  onValidated?: () => void;
}

export default function QrSystem({ onValidated }: QrSystemProps) {
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<{
    status: "idle" | "success" | "invalid" | "already_validated";
    ticket?: Ticket;
    error?: string;
  }>({ status: "idle" });

  const [simulatingScanning, setSimulatingScanning] = useState(false);

  const handleValidateTicket = (ticketId: string) => {
    setSimulatingScanning(true);
    setScanResult({ status: "idle" });

    setTimeout(() => {
      setSimulatingScanning(false);
      const tickets: Ticket[] = db.getCollection("tickets");
      const foundIdx = tickets.findIndex(t => t.id === ticketId || t.ticketNumber === ticketId || t.qrCode === ticketId);

      if (foundIdx === -1) {
        setScanResult({
          status: "invalid",
          error: "QR Signature Verification failed. Ticket Record does not match Sidaama Transit cryptography parameters."
        });
        return;
      }

      const ticket = tickets[foundIdx];
      if (ticket.status === "Validated") {
        setScanResult({
          status: "already_validated",
          ticket
        });
        return;
      }

      // Successful update in Db (Phase 13 Admin validation)
      db.updateDoc("tickets", ticket.id, { status: "Validated" });
      
      // Log ticket scan
      db.addDoc("ticket_scans", {
        ticketId: ticket.id,
        scanTime: new Date().toISOString(),
        scannedBy: "Super Admin Command Center",
        result: "Success"
      });

      setScanResult({
        status: "success",
        ticket: { ...ticket, status: "Validated" }
      });

      if (onValidated) onValidated();
    }, 1200);
  };

  // Helper code generator for mock visual QR grids
  const renderMockQrGrid = (payloadString: string) => {
    return (
      <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl flex flex-col items-center gap-2 max-w-[180px] mx-auto group">
        <div className="relative p-2 bg-white rounded-lg transition-transform group-hover:scale-105">
          {/* Customized SVG Matrix simulating genuine QR squares */}
          <svg className="w-28 h-28 text-slate-950 fill-current" viewBox="0 0 100 100">
            {/* Corner Anchors */}
            <rect x="0" y="0" width="30" height="30" fill="currentColor" rx="4" />
            <rect x="6" y="6" width="18" height="18" fill="white" />
            <rect x="10" y="10" width="10" height="10" fill="currentColor" />

            <rect x="70" y="0" width="30" height="30" fill="currentColor" rx="4" />
            <rect x="76" y="6" width="18" height="18" fill="white" />
            <rect x="80" y="10" width="10" height="10" fill="currentColor" />

            <rect x="0" y="70" width="30" height="30" fill="currentColor" rx="4" />
            <rect x="6" y="76" width="18" height="18" fill="white" />
            <rect x="10" y="80" width="10" height="10" fill="currentColor" />

            {/* Random high-density grid fields representing payload */}
            <rect x="35" y="5" width="8" height="8" />
            <rect x="45" y="12" width="12" height="6" />
            <rect x="40" y="24" width="20" height="8" />
            <rect x="5" y="35" width="16" height="8" />
            <rect x="25" y="35" width="12" height="20" />
            <rect x="42" y="38" width="18" height="12" />
            <rect x="65" y="42" width="8" height="16" />
            
            <rect x="35" y="60" width="24" height="10" />
            <rect x="70" y="70" width="8" height="8" />
            <rect x="85" y="75" width="12" height="12" />
            <rect x="75" y="88" width="15" height="6" />
            <rect x="15" y="62" width="10" height="5" />
            <rect x="55" y="80" width="12" height="15" />
          </svg>
          {/* Laser guide line animation */}
          <div className="absolute left-0 right-0 h-0.5 bg-red-500 animate-bounce top-2" />
        </div>
        <span className="font-mono text-[9px] text-slate-400 truncate max-w-[150px]">{payloadString}</span>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row gap-6">
      
      {/* SECTION 1: QR Generator Reference list (For demonstration/admins to get scan IDs) */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-sky-400" />
          <h3 className="font-bold text-slate-100 text-sm">Active QR Cryptography Keys</h3>
        </div>
        <p className="text-xs text-slate-400">
          The following transport tickets are loaded in our Firestore state. Grab an ID sequence to test the scanning hardware.
        </p>

        <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
          {db.getCollection("tickets").map((t: Ticket) => (
            <div 
              key={t.id} 
              onClick={() => setScanInput(t.id)}
              className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 hover:border-slate-700 cursor-pointer flex justify-between items-center transition"
            >
              <div>
                <div className="text-xs font-bold text-slate-200">{t.passengerName} ({t.ticketNumber})</div>
                <div className="text-[10px] text-slate-500">{t.routeLabel} ● {t.departureTime}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  t.status === "Validated" ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-500"
                }`}>
                  {t.status}
                </span>
                <span className="text-[8px] font-mono text-cyan-400">{t.paymentMethod}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Dynamic Scanner Simulator */}
      <div className="flex-1 bg-slate-950 p-4 border border-slate-850 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-100 text-sm">Hawassa Terminal Gate Validator</h3>
        </div>

        {/* Decoder Lens simulation frame */}
        <div className="relative border-2 border-dashed border-slate-700 p-4 rounded-xl flex items-center justify-center min-h-[160px] bg-slate-900 bg-opacity-30">
          {simulatingScanning ? (
            <div className="text-center flex flex-col items-center gap-2">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
              <div className="text-xs text-sky-300 font-mono">Decoding QR matrix packets...</div>
            </div>
          ) : scanResult.status === "idle" ? (
            <div className="text-center text-slate-450 p-6 flex flex-col items-center gap-1">
              <Smartphone className="w-8 h-8 text-slate-650 animate-pulse" />
              <div className="text-xs font-semibold">Ready for camera validation feed</div>
              <div className="text-[10px]">Select or type an active ticket QR ID below</div>
            </div>
          ) : scanResult.status === "success" && scanResult.ticket ? (
            <div className="text-center flex flex-col items-center gap-2 p-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
              <div className="text-sm font-bold text-emerald-400">TICKET VALIDATED SUCCESS</div>
              <div className="text-[11px] text-slate-300">
                Passenger: <strong className="text-white">{scanResult.ticket.passengerName}</strong><br />
                Route: <strong className="text-white">{scanResult.ticket.routeLabel}</strong><br />
                Gate Access: <strong className="text-emerald-400 uppercase">Granted</strong>
              </div>
            </div>
          ) : scanResult.status === "already_validated" && scanResult.ticket ? (
            <div className="text-center flex flex-col items-center gap-2 p-2 text-amber-400">
              <AlertOctagon className="w-10 h-10 animate-pulse" />
              <div className="text-sm font-bold">ALREADY VALIDATED PREVIOUSLY</div>
              <div className="text-[10px] text-slate-300">
                This ticket barcode was verified. Double gate entry prohibited.<br />
                Payer: {scanResult.ticket.passengerName}
              </div>
            </div>
          ) : (
            <div className="text-center flex flex-col items-center gap-2 p-2 text-red-400">
              <AlertOctagon className="w-10 h-10" />
              <div className="text-sm font-bold">SECURITY ENCRYPTION FAILURE</div>
              <div className="text-[10px] text-slate-300 leading-relaxed font-mono">
                {scanResult.error}
              </div>
            </div>
          )}
        </div>

        {/* Input Trigger Block */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs rounded-xl font-mono text-slate-300 focus:outline-none focus:border-amber-500"
            placeholder="Type code or ticket index..."
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
          />
          <button
            onClick={() => handleValidateTicket(scanInput)}
            disabled={!scanInput.trim() || simulatingScanning}
            className="bg-amber-500 hover:bg-amber-400 transition text-slate-950 font-semibold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Validate
          </button>
        </div>
      </div>
    </div>
  );
}
