import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Shareable in-memory data store for live CRUD backups if needed
// (mirroring modern state management)
let serverLogs: any[] = [];

// Gemini Client initialization
let aiClient: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY || "";

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log("Server-Side Gemini API client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize server-side Gemini API client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found, running in high-fidelity simulation fallback mode.");
}

// 1. Health API Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    apiInitialized: !!aiClient,
    platform: "Sidaama Way Go – Hawassa Smart City"
  });
});

// 2. Multilingual AI Assistant Chat Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  const { message, systemInstruction, language } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Record AI request logs for Phase 2 ai_logs collection
  const logItem = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    request: message,
    language: language || "English",
  };
  serverLogs.push(logItem);

  const defaultInstruction = `You are the global AI Assistant for the Sidaama Way Go - Hawassa Smart City Platform.
You assist city administrators, drivers, tourists, healthcare workers, and citizens.
You must speak fluently in the requested language: ${language || 'English'} (English, Amharic / አማርኛ, or Sidaamu Afoo).
Provide expert insights, system analysis, tourism guides for Hawassa (like Tabor Hill, Amora Gedel, Millennium Park), transportation status (Aleta Wondo, Bensa, Bona, Hager Selam, Yirgalem, Bursa), eco-friendly shoe-shining stations (Eco-Shine), emergency notifications, and CBE Birr/Telebirr payment tracking details. Keep responses helpful, professional, and clear. No markdown code wraps other than simple bold and bullet points.`;

  const finalInstruction = systemInstruction ? `${defaultInstruction}\n\nAdditional Instructions: ${systemInstruction}` : defaultInstruction;

  // If AI Client is active, query the real Gemini-3.5-flash model
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: finalInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "No response received";
      return res.json({
        success: true,
        reply: replyText,
        source: "gemini-3.5-flash",
        logId: logItem.id
      });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      // Propagate error but gracefully fall back to prevent complete interruption
      return res.json({
        success: false,
        error: err.message,
        reply: getSimulatedResponse(message, language || "English"),
        source: "simulated-fallback",
        logId: logItem.id
      });
    }
  } else {
    // Return high-fidelity Simulated Intelligent Assistance in English, Amharic, or Sidaamu Afoo
    const simulatedReply = getSimulatedResponse(message, language || "English");
    return res.json({
      success: true,
      reply: simulatedReply,
      source: "simulated-core",
      logId: logItem.id
    });
  }
});

// Helper response simulator for Hawassa Smart City domain
function getSimulatedResponse(prompt: string, lang: string): string {
  const p = prompt.toLowerCase();
  
  if (lang === "Amharic" || lang === "አማርኛ") {
    if (p.includes("ትራንስፖርት") || p.includes("ጉዞ") || p.includes("የመኪና")) {
      return "የሀዋሳ ከተማ ትራንስፖርት መቆጣጠሪያ ማዕከል፡ በአሁኑ ሰዓት ወደ አለታ ወንዶ፣ በንሳ፣ ቦና፣ ሀገረ ሰላም፣ ይርጋለም እና ቡርሳ የሚደረጉ ጉዞዎች በሰላም በመካሄድ ላይ ናቸው። CBE Birr ወይም Telebirr በመጠቀም ቲኬት መቁረጥ ይችላሉ።";
    }
    if (p.includes("ድንገተኛ") || p.includes("እርዳታ") || p.includes("ፖሊስ") || p.includes("አምቡላንስ")) {
      return "**ድንገተኛ አደጋ ማስጠንቀቂያ**፡ የድንገተኛ ጊዜ ጥሪዎ ተመዝግቧል። ፖሊስ፣ አምቡላንስ ወይም የእሳት አደጋ ቡድን ከተፈለገበት የጂፒኤስ መጋጠሚያ ቦታ ጋር ይጋራል። እባክዎን ይረጋጉ፤ እርዳታ በቅርቡ ይደርሳል።";
    }
    if (p.includes("ቱሪዝም") || p.includes("ሆቴል") || p.includes("ታቦር")) {
      return "እንኳን ወደ ሀዋሳ ከተማ በደህና መጡ! የሚጎበኙ ምርጥ ቦታዎች፡ አሞራ ገደል (የአእዋፋት መመልከቻ)፣ የታቦር ተራራ (የከተማዋ እይታ) እና የሀዋሳ ትልቅ ሃይቅ ናቸው። እዚህ ምርጥ ሆቴሎችንና ባህላዊ ምግቦችን ያገኛሉ።";
    }
    return `ሰላም! እኔ የሀዋሳ ዘመናዊ ከተማ (Hawassa Smart City) ረዳት ነኝ። በምን ልርዳዎት?
- ስለ ትራንስፖርት መርሐ ግብር
- ስለ ድንገተኛ አደጋዎች
- CBE Birr ወይም Telebirr ክፍያ
- የቱሪስት መስህቦች እና ሆቴሎች ጠይቁኝ።`;
  }
  
  if (lang === "Sidaamu Afoo") {
    if (p.includes("ha_ura") || p.includes("hadhe") || p.includes("dae") || p.includes("transport")) {
      return "Hawassi Giddo transportati qorootu deerrira: Gobbaanni Aleta Wondora, Bensara, Bonara, Hager Selamira, Yirgalemira, Bursa hadhe aana noonke. CBE Birr woy Telebiriitii tikeete hilate dandiitineemmo.";
    }
    if (p.includes("ka_a") || p.includes("polis") || p.includes("emergency") || p.includes("ambolans")) {
      return "**Kakao Keera** Sidaamu dargo: Polis woy Ambolanse haranfana hasidhino dargo GPS-ni qoroosamme qixxawaasineemmo. Maaxootu hee'ri; kasha daddaffano qoollaammetenni qixxeessineemmo.";
    }
    if (p.includes("turizme") || p.includes("hotela") || p.includes("hawasso") || p.includes("tabor")) {
      return "Hawassa Smart City-ra keere lagino! Lowo turizme dargo: Amora Gedel, Taborra Deera, Hawassi Baari. Bare hotella nolle, mulla daddafanno afate dandiitineemmo.";
    }
    return `Keere, ane Hawassa Smart City AI Assistancheti! Hiittooti kaa'lona hasidhino?
- Transportete looso fushsho
- Emergency ka'a keera
- CBE Birr woy Telebirr payments
- Hawassi turizme site-re xa'mitee.`;
  }

  // Defaults to English
  if (p.includes("transport") || p.includes("schedule") || p.includes("ticket") || p.includes("bus")) {
    return "💡 **Transportation Analytics**: Current active terminal routes from Hawassa to Aleta Wondo, Bensa, Bona, Hager Selam, Yirgalem, and Bursa are fully operational. Seat occupancy is currently at 84%, and revenue has increased by 14% today due to efficient digital ticket validations via CBE Birr and Telebirr.";
  }
  if (p.includes("emergency") || p.includes("police") || p.includes("fire") || p.includes("ambulance") || p.includes("dispatch")) {
    return "🚨 **Emergency Dispatch Triggered**: Hawassa Dispatch Center has logged an active incident code and broadcast live GPS coordinates to the nearest regional police precinct, mobile ambulance units, and fire suppression team. Response time is optimized at 4.2 minutes.";
  }
  if (p.includes("tourism") || p.includes("hotel") || p.includes("attraction") || p.includes("amora")) {
    return "🏞️ **Hawassa Tourism Guide**: Hawassa is famous for attractions like Amora Gedel (for birdwatching), Tabor Hill (panoramic sunset views), and Lake Hawassa. There are currently 24 verified eco-shining shoe stations and 15 direct tourism tour-guides ready to support regional visitors.";
  }
  if (p.includes("payment") || p.includes("telebirr") || p.includes("cbe") || p.includes("revenue")) {
    return "💳 **Digital Payment Audit**: Over 92% of city passenger transactions have migrated to cashless channels. Current split: Telebirr (54%), CBE Birr (38%), and direct Bank Transfers (8%). All generate digital receipts with verification QR codes instantly.";
  }
  if (p.includes("eco") || p.includes("shine") || p.includes("solar")) {
    return "☀️ **Eco Shine Project**: Solar-powered shoe-shining stations are situated at 6 key terminals in Hawassa. These clean energy modules support local youth workers, track solar battery storage level (currently at 91%), and are fully bookable via the smart application.";
  }

  return `Greetings! I am the global SIDAAMA WAY GO AI Assistant for Hawassa City Administration.
I provide insights on your command dashboard, including:
- **Smart Logistics**: Live tracking of regional routes and driver statuses (Aleta Wondo, Bensa, Bona, Hager Selam, Yirgalem, Bursa).
- **Public Safety**: Immediate SOS, Police, Fire, and Ambulance dispatcher analytics.
- **Municipal Services**: Solar Eco Shine battery metrics, Pharmacy search & delivery operations, and CBE Birr/Telebirr payment tracking.
- **Tourism & Hospitality**: Bookings and visitor density logs at Lake Hawassa and surrounding premium hotels.

How can I assist you with Hawassa's Smart City Operations today?`;
}

// 3. Simulated export API
app.post("/api/reports/export", (req, res) => {
  const { title, dataJson, format } = req.body;
  // Send back simulated binary headers to trigger an immediate formatted CSV/text file download on the client
  const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_report_${new Date().toISOString().slice(0, 10)}`;
  
  if (format === "csv") {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
    
    // Convert array structure simple csv text
    let csvContent = "";
    if (dataJson && Array.isArray(dataJson) && dataJson.length > 0) {
      const keys = Object.keys(dataJson[0]);
      csvContent += keys.join(",") + "\n";
      dataJson.forEach((item: any) => {
        csvContent += keys.map(k => {
          let val = item[k];
          if (typeof val === 'object') val = JSON.stringify(val).replace(/"/g, '""');
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(",") + "\n";
      });
    } else {
      csvContent = "No data,Report Empty,Date," + new Date().toISOString() + "\n";
    }
    return res.status(200).send(csvContent);
  } else {
    // Return mock PDF format summary
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.txt`);
    let textReport = `========================================================================\n`;
    textReport += `           SIDAAMA WAY GO - HAWASSA SMART CITY PLATFORM REPORT\n`;
    textReport += `========================================================================\n`;
    textReport += `Report Title: ${title}\n`;
    textReport += `Generation Time: ${new Date().toLocaleString()}\n`;
    textReport += `Format Type: Municipal Export File\n`;
    textReport += `------------------------------------------------------------------------\n\n`;
    textReport += `RECORDS EXPORTED:\n\n`;
    
    if (dataJson && Array.isArray(dataJson)) {
      dataJson.forEach((item: any, i: number) => {
        textReport += `[Record #${i+1}]\n`;
        Object.entries(item).forEach(([key, val]) => {
          textReport += `  ${key}: ${typeof val === 'object' ? JSON.stringify(val) : val}\n`;
        });
        textReport += `------------------------------------------------------------------------\n`;
      });
    } else {
      textReport += `(No records provided for this export batch.)\n`;
    }
    textReport += `\nEnd of Report. Hawassa City Administration © 2026.\n`;
    return res.status(200).send(textReport);
  }
});

// Start integration with Vite or production server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware attached in development mode.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving compiled static assets from dist/ in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server boot successful.`);
    console.log(`Development Server Active on: http://localhost:${PORT}`);
  });
}

startServer();
