/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Gamepad2, 
  Terminal,
  Sparkles,
  ShieldCheck,
  EyeOff,
  AlertTriangle,
  Info,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import GunGame from "./components/GunGame";

export default function App() {
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [decoyTitle, setDecoyTitle] = useState("Calculus II - Notes & Exercises");

  // Keep page title synced with panic status
  useEffect(() => {
    if (isPanicMode) {
      document.title = decoyTitle;
    } else {
      document.title = "Play Gun Game: Cyber Arena | Online Classic";
    }
  }, [isPanicMode, decoyTitle]);

  // Pressing Q anywhere in the window toggles panic mode instantly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === "q") {
        setIsPanicMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#02050b] text-slate-100 flex flex-col font-sans relative antialiased selection:bg-indigo-600 selection:text-white overflow-x-hidden">
      
      {/* Visual cyber neon lighting flares */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-950/15 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="crt-scanline absolute inset-0 z-40 pointer-events-none opacity-20" />

      {/* ⚡ THE MATH SPREADSHEET DISGUISE CLOAK SCREEN */}
      <AnimatePresence>
        {isPanicMode && (
          <motion.div 
            id="decoy-cover-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 bg-[#f9fbfd] text-slate-700 z-[9999] flex flex-col select-text font-sans p-6 text-sm overflow-auto"
          >
            {/* Academic Google Workspace Top Bar */}
            <div className="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-lg">X</div>
                <div>
                  <input 
                    type="text" 
                    value={decoyTitle} 
                    onChange={(e) => setDecoyTitle(e.target.value)}
                    className="font-semibold text-slate-800 text-base leading-tight focus:outline-none border-b border-transparent hover:border-gray-300 focus:border-indigo-500 px-1"
                    title="Change Decoy Document Name"
                  />
                  <div className="flex gap-4 text-xs text-slate-500 mt-1">
                    <span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Data</span><span>Tools</span><span>Extensions</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-slate-100 px-3 py-1.5 rounded text-slate-500 flex items-center gap-1.5 font-mono">
                  <ShieldCheck size={13} className="text-emerald-300 fill-emerald-600"/> Autosaved to cloud
                </span>
                <button 
                  onClick={() => setIsPanicMode(false)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  Resume Study Work
                </button>
              </div>
            </div>

            {/* Academic Calculus Study Guides */}
            <div className="max-w-5xl w-full mx-auto space-y-6 pt-2">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-center gap-3 text-yellow-800">
                <AlertTriangle className="shrink-0 text-yellow-600" size={18} />
                <p className="text-xs leading-relaxed">
                  <strong>DISGUISE SHEETS MODE ACTIVE:</strong> Screen is safely covered during lectures or study hours. Hit the 
                  <strong className="mx-1.5 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded font-mono">Q key</strong> 
                  on your keyboard or click the button above to resume playing the custom shooter instantaneously!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm">
                  <span className="text-xs text-slate-450 font-mono">INTEGRAL_SERIES _Z1</span>
                  <h4 className="text-base font-bold text-slate-800 mt-1">Riemann Approximation Sums</h4>
                  <div className="mt-2.5 font-mono text-xs text-slate-550 bg-slate-50 p-3 rounded border border-slate-100">
                    Lim(n→∞) Σ [ƒ(x_i) * Δx] = ∫ f(x) dx from a to b
                  </div>
                </div>
                <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm">
                  <span className="text-xs text-slate-450 font-mono">TANGENT_ARC _Z2</span>
                  <h4 className="text-base font-bold text-slate-800 mt-1">Derivative Arc Lengths</h4>
                  <div className="mt-2.5 font-mono text-xs text-slate-550 bg-slate-50 p-3 rounded border border-slate-100">
                    L = ∫ √( 1 + [ƒ'(x)]² ) dx from a to b
                  </div>
                </div>
                <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm">
                  <span className="text-xs text-slate-450 font-mono">PROBABILITY _B08</span>
                  <h4 className="text-base font-bold text-slate-800 mt-1">Standard Dev Distribution</h4>
                  <div className="mt-2.5 font-mono text-xs text-slate-550 bg-slate-50 p-3 rounded border border-slate-100">
                    Z = (X - μ) / σ , where α=0.05 confidence margin.
                  </div>
                </div>
              </div>

              {/* Fake Database spreadsheet values */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-150 border-b border-gray-250 text-slate-500 text-[10px]">
                      <th className="p-3 border-r border-gray-250">Sample Ref ID</th>
                      <th className="p-3 border-r border-gray-250">Derivative Input (x)</th>
                      <th className="p-3 border-r border-gray-250">Constant Offset (C)</th>
                      <th className="p-3 border-r border-gray-250">Integral Output F(x)</th>
                      <th className="p-3">Calculation Status Checks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-650">
                    <tr>
                      <td className="p-3 bg-slate-50 border-r border-slate-200 font-bold">CALC-101</td>
                      <td className="p-3 border-r border-slate-200">0.05149</td>
                      <td className="p-3 border-r border-slate-200">2.19047</td>
                      <td className="p-3 border-r border-slate-200">14.92819</td>
                      <td className="p-3 text-emerald-600 font-semibold">• Solved (Normal Convergence)</td>
                    </tr>
                    <tr>
                      <td className="p-3 bg-slate-50 border-r border-slate-200 font-bold">CALC-102</td>
                      <td className="p-3 border-r border-slate-200">0.09241</td>
                      <td className="p-3 border-r border-slate-200">2.18120</td>
                      <td className="p-3 border-r border-slate-200">14.88710</td>
                      <td className="p-3 text-emerald-600 font-semibold">• Solved (Normal Convergence)</td>
                    </tr>
                    <tr>
                      <td className="p-3 bg-slate-50 border-r border-slate-200 font-bold">CALC-103</td>
                      <td className="p-3 border-r border-slate-200">0.12984</td>
                      <td className="p-3 border-r border-slate-200">2.17983</td>
                      <td className="p-3 border-r border-slate-200">14.61204</td>
                      <td className="p-3 text-amber-600 font-semibold">• Recalculating (Stiff Matrix Error)</td>
                    </tr>
                    <tr>
                      <td className="p-3 bg-slate-50 border-r border-slate-200 font-bold">CALC-104</td>
                      <td className="p-3 border-r border-slate-200">0.18431</td>
                      <td className="p-3 border-r border-slate-200">2.20455</td>
                      <td className="p-3 border-r border-slate-200">15.11029</td>
                      <td className="p-3 text-emerald-600 font-semibold">• Solved (Normal Convergence)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER CONTROLS NAVIGATION */}
      <header className="border-b border-indigo-950/20 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo & Headings block */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/10 border border-indigo-400/20">
              <Gamepad2 size={18} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-medium text-sm tracking-tight text-white">
                  Cyber Arena: Gun Game
                </h1>
                <span className="bg-indigo-950/80 text-[9px] text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-900/30 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> CLIENT SECURE
                </span>
              </div>
              <p className="text-[10px] text-slate-450">HTML5 Native WebGL Simulator &mdash; 100% Unblocked & Offline Persisted</p>
            </div>
          </div>

          {/* Quick disguise button info */}
          <div className="flex items-center gap-3">
            <button 
              id="panic-cloak-btn"
              onClick={() => setIsPanicMode(true)}
              className="bg-slate-900 hover:bg-rose-950/20 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-350 transition-all flex items-center gap-2 cursor-pointer"
              title="Instantly swap viewport to mathematics spreadsheet. Hotkey: [Q]"
            >
              <EyeOff size={13} />
              <span>Hide Screen <kbd className="text-[9px] bg-slate-950 px-1 rounded ml-1 border border-slate-700 font-mono font-normal">Q</kbd></span>
            </button>
          </div>

        </div>
      </header>

      {/* CORE GAME ZONE */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col gap-6 relative z-30">
        
        {/* Play game block */}
        <section className="w-full">
          <GunGame onPanicActivate={() => setIsPanicMode(true)} />
        </section>

        {/* CONTROLS GUIDE ACCENT BENTO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
          
          <div className="bg-slate-900/25 p-4 rounded-xl border border-slate-900/40 flex gap-3.5 items-start">
            <div className="p-2.5 bg-indigo-950/40 rounded-xl border border-indigo-900/30 text-indigo-400 shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Procedural Ammunition Tiers</h4>
              <p className="text-[11px] text-slate-450 leading-relaxed mt-1">
                This is a local standard-authoritative **Gun Game mode**. Every time you destroy an enemy AI bot, your character instantly levels up and equips the next weapon in the tier list. Survive long enough to unlock the plasma launcher and continuous laser components!
              </p>
            </div>
          </div>

          <div className="bg-slate-900/25 p-4 rounded-xl border border-slate-900/40 flex gap-3.5 items-start">
            <div className="p-2.5 bg-purple-950/40 rounded-xl border border-purple-900/30 text-purple-400 shrink-0">
              <Terminal size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">School Wifi Approved Engine</h4>
              <p className="text-[11px] text-slate-450 leading-relaxed mt-1">
                Because this application runs directly in your local browser sandbox context using standard HTML5 and custom React hooks, it is **completely unblocked**! It accesses absolutely zero external resources, tracking domains, or blocked third-party script assets.
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-5 text-center px-4 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>&copy; 2026 Unblocked Games Client. Local Arena Mode.</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px]">
            <span>Active Port: 3000 (Local Ingress Router)</span>
            <span>&bull;</span>
            <span>Q Cloak active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
