"use client";

import { useEffect, useState, useRef } from "react";
import { FiCheckCircle, FiActivity, FiArrowRight, FiCommand } from "react-icons/fi";

const STAGES = [
  { id: "typing", duration: 3000 },
  { id: "scrolling", duration: 2500 },
  { id: "result", duration: 3500 },
];

const LOG_LINES = [
  "Initializing verification engine v2.4...",
  "Cloning repository context...",
  "Analyzing semantic code patterns...",
  "Matching against Global Skill Graph...",
  "Evaluating contribution impact...",
  "Generating Zero-Knowledge Proof of Work...",
  "Syncing with Decentralized Identity Layer...",
  "Finalizing proof artifacts...",
];

export const DynamicShowcase = () => {
  const [stage, setStage] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const runShowcase = async () => {
      // ─── Stage 0: Typing ──────────────────────────────────────────
      setStage(0);
      setTypedText("");
      setVisibleLogs([]);
      const fullText = "kozeo verify --mission \"Secure API Refactor\"";
      for (let i = 0; i <= fullText.length; i++) {
        await new Promise(r => setTimeout(r, 45));
        setTypedText(fullText.slice(0, i));
      }
      await new Promise(r => setTimeout(r, 800));

      // ─── Stage 1: Scrolling/Logs ──────────────────────────────────
      setStage(1);
      for (let i = 0; i < LOG_LINES.length; i++) {
        await new Promise(r => setTimeout(r, 200));
        setVisibleLogs(prev => [...prev, LOG_LINES[i]]);
      }
      await new Promise(r => setTimeout(r, 1000));

      // ─── Stage 2: Result ──────────────────────────────────────────
      setStage(2);
      await new Promise(r => setTimeout(r, 4000));
      
      // Loop
      runShowcase();
    };

    runShowcase();
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll logic for stage 1
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  return (
    <div className="w-full max-w-4xl mx-auto aspect-[16/10] sm:aspect-[16/9] rounded-2xl border border-white/5 bg-[#0a0a0a] overflow-hidden shadow-2xl relative flex flex-col font-mono">
      {/* Window Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-white/5 border border-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/5 border border-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/5 border border-white/10" />
        </div>
        <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
           <FiCommand size={12} className="opacity-50" />
           Terminal v2.4
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={containerRef}
        className="flex-1 p-8 sm:p-12 overflow-y-auto scroll-smooth no-scrollbar"
      >
        {/* Stage 0 & 1 Content */}
        {stage < 2 ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4 text-white/90 text-[14px] sm:text-[16px]">
              <span className="text-cyan-400 font-bold shrink-0">❯</span>
              <div className="relative">
                {typedText}
                {stage === 0 && <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse align-middle" />}
              </div>
            </div>
            
            {visibleLogs.map((log, i) => (
              <div 
                key={i} 
                className="flex items-start gap-4 text-[13px] sm:text-[14px] animate-fadeIn"
              >
                <span className="text-white/10 shrink-0">{(i + 1).toString().padStart(2, '0')}</span>
                <span className={i === LOG_LINES.length - 1 ? "text-cyan-400 font-bold" : "text-white/40"}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Stage 2: The Proof Result */
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-scaleUp">
            <div className="relative">
              <div className="absolute inset-[-40px] bg-cyan-500/10 blur-[60px] rounded-full animate-pulse" />
              <FiCheckCircle className="text-cyan-400 w-20 h-20 sm:w-24 sm:h-24 relative z-10" />
            </div>
            
            <div className="space-y-3 relative z-10">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">PROOF RECORDED</h3>
              <p className="text-white/30 text-xs sm:text-sm tracking-[0.2em] font-bold uppercase">Transaction ID: KOZEO_SEC_99X2</p>
            </div>

            <div className="flex gap-4 pt-4 relative z-10">
               <div className="px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[9px] text-white/20 uppercase tracking-widest font-black">Reputation Gained</div>
                  <div className="text-xl font-black text-white">+850 XP</div>
               </div>
               <div className="px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[9px] text-white/20 uppercase tracking-widest font-black">Skill Confidence</div>
                  <div className="text-xl font-black text-white">99.4%</div>
               </div>
            </div>

            <div className="pt-6 relative z-10">
               <div className="px-5 py-2 rounded-full border border-cyan-400/30 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                 Verifiable On-Chain <FiActivity />
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-8 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-6 text-[9px] text-white/10 font-bold tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
            Ecosystem Connected
          </div>
          <div className="hidden sm:block">Status: Verified</div>
        </div>
        <div className="flex gap-1.5">
           {[0, 1, 2].map(s => (
             <div 
               key={s} 
               className={`h-1 rounded-full transition-all duration-500 ${stage === s ? "w-6 bg-cyan-400" : "w-1.5 bg-white/10"}`} 
             />
           ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
