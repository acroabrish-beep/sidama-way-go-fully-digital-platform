import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Sparkles, Volume2, VolumeX, Mic, MicOff, Languages, ShieldAlert, Cpu } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  source?: string;
  timestamp: string;
}

interface AiAssistantProps {
  currentDashboardName: string;
  currentMetrics?: string; // Stringified stats to feed Gemini context
}

export default function AiAssistant({ currentDashboardName, currentMetrics }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "wel_1", sender: "ai", text: "Ayanya! Welcome to Hawassa Smart City Voice & Text Assistant. I speak English, Amharic (አማርኛ), and Sidaamu Afoo. How can I help optimize municipal services for you today?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeLang, setActiveLang] = useState<"English" | "Amharic" | "Sidaamu Afoo">("English");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Handle active voice synthesizer (Text-to-Speech)
  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    try {
      // Clear previous spoken queue
      window.speechSynthesis?.cancel();
      const cleanMsg = text.replace(/[*#]/g, ""); // Strip markdown formatting
      const utterance = new SpeechSynthesisUtterance(cleanMsg);
      
      // Attempt to pick a suitable voice based on language
      if (activeLang === "Amharic") {
        utterance.lang = "am-ET";
      } else if (activeLang === "Sidaamu Afoo") {
        utterance.lang = "or-ET"; // Approximated with Oromo or regional voice
      } else {
        utterance.lang = "en-US";
      }
      window.speechSynthesis?.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis is unavailable or blocked within this browser environment.", e);
    }
  };

  const handleLanguageSwitch = (lang: "English" | "Amharic" | "Sidaamu Afoo") => {
    setActiveLang(lang);
    
    // Automatically post introductory greeting in selected language
    let text = "";
    if (lang === "Amharic") {
      text = "ሰላም! የሀዋሳ ከተማ ድምፅና ፅሁፍ ረዳት ነው። በአማርኛ ቋንቋ ምን አገልግሎት ልስጥዎት?";
    } else if (lang === "Sidaamu Afoo") {
      text = "Keere! Hawassa Smart City AI Assistancheti. Sidaamu Afonni hiittooti kaa'lona hasidhino?";
    } else {
      text = "Greetings! I'm your SIDAAMA WAY GO AI Assistant. How can I help with smart command analytics today?";
    }

    const introMsg: Message = {
      id: `intro_${Date.now()}`,
      sender: "ai",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, introMsg]);
    speakText(text);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage;
    setInputMessage("");

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setIsLoading(true);

    try {
      // Assemble full custom query context with active tab metrics to make Gemini context-aware
      const requestPayload = {
        message: userText,
        language: activeLang,
        systemInstruction: `We are currently viewing the [${currentDashboardName}] Admin Panel. Here are the live dashboard metrics right now: ${currentMetrics || 'N/A'}. Answer with specific reference to this screen and offer practical optimization steps.`
      };

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload)
      });

      const data = await response.json();

      const aiReplyText = data.reply || "Sorry, I am experiencing temporary connectivity problems.";
      
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: aiReplyText,
        source: data.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Auto-narrate reply if voice is enabled
      if (voiceEnabled) {
        speakText(aiReplyText);
      }
    } catch (error) {
      console.error(error);
      const errReply = "An error occurred connecting to the server-side controller. Check that your dev server is active on Port 3000.";
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        sender: "ai",
        text: errReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. Floating Action Launcher Button (Available on EVERY screen) */}
      <div className="fixed bottom-5 right-5 z-50 pointer-events-auto">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            // Cancel audio on close
            if (isOpen) window.speechSynthesis?.cancel();
          }}
          className="relative bg-gradient-to-r from-sky-600 to-amber-600 hover:from-sky-500 hover:to-amber-500 text-slate-100 p-4 rounded-full shadow-2xl flex items-center justify-center border border-sky-400/30 transition-transform active:scale-95 group"
          title="Open Municipal AI Assistant"
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <Cpu className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-semibold text-xs ml-0 group-hover:ml-2">
            Ask Hawassa AI
          </span>
        </button>
      </div>

      {/* 2. Slideout Chat Interface Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 w-92 md:w-100 bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col h-[520px] backdrop-blur-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-950 to-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-sky-500/10 p-1.5 rounded-lg border border-sky-500/20">
                <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-xs md:text-sm">Hawassa Smart AI</h3>
                <p className="text-[10px] text-slate-400 font-mono">Status: Connected to Server Core</p>
              </div>
            </div>

            {/* Language switches */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
              {(["English", "Amharic", "Sidaamu Afoo"] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguageSwitch(lang)}
                  className={`text-[9px] px-1.5 py-1 rounded transition-all font-medium ${
                    activeLang === lang 
                      ? "bg-sky-600 text-slate-950 font-semibold" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {lang === "Amharic" ? "አማርኛ" : lang === "Sidaamu Afoo" ? "Sidaamu" : "English"}
                </button>
              ))}
            </div>
          </div>

          {/* Context Banner */}
          <div className="bg-slate-950/60 px-4 py-1.5 border-b border-slate-850 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Context: <strong className="text-amber-400">{currentDashboardName} Metrics</strong></span>
            
            {/* Voice toggle button */}
            <button
              onClick={() => {
                const newState = !voiceEnabled;
                setVoiceEnabled(newState);
                if (!newState) window.speechSynthesis?.cancel();
                else speakText("Voice synthesiser active. Reading future municipal replies.");
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-all ${
                voiceEnabled 
                  ? "bg-emerald-950/50 text-emerald-400 border-emerald-800 animate-pulse" 
                  : "bg-slate-900 text-slate-500 border-slate-800"
              }`}
              title="Toggle Voice (Text-to-Speech) Assistant"
            >
              {voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              <span>Voice</span>
            </button>
          </div>

          {/* Messages Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    isUser 
                      ? "bg-slate-800 text-slate-100 rounded-tr-none" 
                      : "bg-slate-950 border border-slate-850 text-slate-300 rounded-tl-none font-sans"
                  }`}>
                    {/* Preserve rich formatting / paragraphs nicely */}
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    
                    {/* Source engine metadata tag */}
                    {!isUser && m.source && (
                      <div className="text-[9px] text-sky-400/50 text-right mt-1 font-mono">
                        via {m.source}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 font-mono px-1">{m.timestamp}</span>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex gap-1.5 items-center bg-slate-950/60 self-start px-3 py-2 border border-slate-850/50 rounded-xl rounded-tl-none">
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[10px] text-slate-450 font-mono ml-1">Analyzing Sidaama grid...</span>
              </div>
            )}
          </div>

          {/* Input Panel */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/90 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 rounded-xl focus:outline-none focus:border-sky-500"
              placeholder={
                activeLang === "Amharic" ? "ጥያቄዎን እዚህ ይፃፉ..." : 
                activeLang === "Sidaamu Afoo" ? "Xa'mo kewa iitisse..." : 
                "Ask anything about Hawassa city..."
              }
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-sky-600 hover:bg-sky-500 transition text-slate-950 p-2.5 rounded-xl disabled:opacity-45 h-9"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
