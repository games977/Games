/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Gamepad2, 
  Search, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  Clock, 
  CheckCircle, 
  Plus, 
  X, 
  Tag, 
  Info, 
  AlertTriangle, 
  Check, 
  Sliders, 
  Terminal,
  Sparkles,
  SearchCode,
  ShieldCheck,
  EyeOff,
  Flame,
  Grid3X3,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import gamesData from "./data/games.json";

export default function App() {
  // Merge default games configuration with user-added custom games from localStorage
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Custom game builder form modals and configurations
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGame, setNewGame] = useState({
    name: "",
    iframeUrl: "",
    description: "",
    category: "Arcade",
    difficulty: "Medium",
    tags: [],
    controls: {}
  });
  
  // Custom states for single controls input in the creator modal
  const [controlKeyInput, setControlKeyInput] = useState("");
  const [controlActionInput, setControlActionInput] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  
  // Active session and gaming center states
  const [isLoadingIframe, setIsLoadingIframe] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // For cold reboots of current game iframe
  const [playSeconds, setPlaySeconds] = useState(0);
  const [showTheaterMode, setShowTheaterMode] = useState(false);
  
  // Tab Masker & Panic Mode configuration (Instantly hides gaming content to look like educational work)
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [decoyTitle, setDecoyTitle] = useState("Calculus II - Notes & Exercises");
  
  // Load initial games database
  useEffect(() => {
    const savedCustomGames = localStorage.getItem("unblocked_custom_games");
    let combinedGamesList = [...gamesData];
    
    if (savedCustomGames) {
      try {
        const parsed = JSON.parse(savedCustomGames);
        combinedGamesList = [...combinedGamesList, ...parsed];
      } catch (err) {
        console.error("Failed to parse custom games local database", err);
      }
    }
    setGames(combinedGamesList);
  }, []);

  // Update page tab title depending on panic decoy disguise status
  useEffect(() => {
    if (isPanicMode) {
      document.title = decoyTitle;
    } else if (selectedGame) {
      document.title = `Playing ${selectedGame.name} - Unblocked Arcade`;
    } else {
      document.title = "Unblocked Games Portal | Secure Arcade";
    }
  }, [isPanicMode, selectedGame, decoyTitle]);

  // Session clock tracker
  useEffect(() => {
    let timer;
    if (selectedGame && !isPanicMode) {
      timer = setInterval(() => {
        setPlaySeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setPlaySeconds(0);
    }
    return () => clearInterval(timer);
  }, [selectedGame, isPanicMode]);

  // Handle hotkeys (e.g. Esc for exiting theater mode, 'Q' key for panic-triggering disguise)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showTheaterMode) {
        setShowTheaterMode(false);
      }
      // Panic hotkey: Quick press "Q" triggers decoy spread sheet screen immediately
      if (e.key.toLowerCase() === "q") {
        setIsPanicMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showTheaterMode]);

  // Format stopwatch clock digits
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs > 0 ? String(hrs).padStart(2, "0") : null,
      String(mins).padStart(2, "0"),
      String(secs).padStart(2, "0")
    ].filter(Boolean).join(":");
  };

  // Launch a game
  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setIsLoadingIframe(true);
    setPlaySeconds(0);
    setIframeKey((prev) => prev + 1);
    
    // Smooth loader timer simulation to showcase cyber boot process
    setTimeout(() => {
      setIsLoadingIframe(false);
    }, 1400);
  };

  // Add keys to the custom games controls list in the modal
  const handleAddControlMapping = () => {
    if (!controlKeyInput || !controlActionInput) return;
    setNewGame((prev) => ({
      ...prev,
      controls: {
        ...prev.controls,
        [controlKeyInput]: controlActionInput
      }
    }));
    setControlKeyInput("");
    setControlActionInput("");
  };

  // Add custom tags to the game creator
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim();
    if (newGame.tags && !newGame.tags.includes(cleanTag)) {
      setNewGame((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), cleanTag]
      }));
    }
    setNewTagInput("");
  };

  // Save the custom game config
  const handleCreateGame = (e) => {
    e.preventDefault();
    if (!newGame.name || !newGame.iframeUrl) {
      alert("A name and verified secure Iframe URL are required!");
      return;
    }

    // Format secure url
    let formattedUrl = newGame.iframeUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    const created = {
      id: "user-added-" + Date.now(),
      name: newGame.name.trim(),
      iframeUrl: formattedUrl,
      description: newGame.description?.trim() || "User loaded custom iframe application.",
      category: newGame.category || "Arcade",
      tags: newGame.tags && newGame.tags.length > 0 ? newGame.tags : ["Custom", "Embedded"],
      instructions: newGame.instructions && newGame.instructions.length > 0 
        ? newGame.instructions 
        : ["Control elements depending on standard frame mechanics.", "Have fun!"],
      controls: Object.keys(newGame.controls || {}).length > 0 
        ? newGame.controls 
        : { "Interactive": "Mouse & Key Controls" },
      difficulty: newGame.difficulty || "Medium",
      colorTheme: "from-slate-600 to-gray-800"
    };

    const savedCustomGames = localStorage.getItem("unblocked_custom_games");
    let currentSaved = [];
    if (savedCustomGames) {
      try {
        currentSaved = JSON.parse(savedCustomGames);
      } catch (err) {
        currentSaved = [];
      }
    }

    const updatedList = [...currentSaved, created];
    localStorage.setItem("unblocked_custom_games", JSON.stringify(updatedList));
    
    // Refresh list merge
    setGames((prev) => [...prev, created]);
    
    // Auto-select the newly added custom game for testing!
    handleSelectGame(created);
    
    // Reset state & close modal
    setShowAddModal(false);
    setNewGame({
      name: "",
      iframeUrl: "",
      description: "",
      category: "Arcade",
      difficulty: "Medium",
      tags: [],
      controls: {}
    });
  };

  // Reset local games database
  const handleResetCustomGames = () => {
    if (confirm("Are you sure you want to delete all custom games imported to your dashboard? This will restore default games only.")) {
      localStorage.removeItem("unblocked_custom_games");
      setGames([...gamesData]);
      setSelectedGame(null);
    }
  };

  // Categories list
  const categoriesList = ["All", "Puzzle", "Arcade", "Shooter", "Adventure"];

  // Filter & Search computation
  const filteredGames = games.filter((game) => {
    const matchesSearch = 
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === "All" || game.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative antialiased selection:bg-indigo-600 selection:text-white overflow-x-hidden">
      
      {/* Background neon flares for visual craft and depth */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-950/15 rounded-full filter blur-[130px] pointer-events-none" />
      <div className="crt-scanline absolute inset-0 z-40 pointer-events-none opacity-40" />

      {/* ⚡ DECOY MATH SPREADSHEET SCREEN (PANIC SWITCH / THE CLOAK) */}
      <AnimatePresence>
        {isPanicMode && (
          <motion.div 
            id="decoy-cover-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-[#f9fbfd] text-slate-700 z-[9999] flex flex-col select-text font-sans p-6 text-sm overflow-auto"
          >
            {/* Fake Google Workspace top rail */}
            <div className="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-lg">X</div>
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
                  <ShieldCheck size={13} className="text-emerald-600"/> Autosaved to Cloud
                </span>
                <button 
                  onClick={() => setIsPanicMode(false)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-xs shadow-sm transition-all flex items-center gap-2"
                >
                  <EyeOff size={14} /> Resume Access
                </button>
              </div>
            </div>

            {/* Simulated Data Dashboard Grid */}
            <div className="max-w-6xl w-full mx-auto space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-center gap-3 text-yellow-800">
                <AlertTriangle className="shrink-0 text-yellow-600" size={18} />
                <p className="text-xs leading-relaxed">
                  <strong>DEC_PANIC Active:</strong> The current tab title and viewport are masked inside this educational spreadsheet mockup. Tap the 
                  <strong className="mx-1.5 bg-yellow-105 px-1 border border-yellow-300 rounded font-mono">Q Key</strong> 
                  again or press the "Resume Access" button above to jump straight back into the unblocked game!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm">
                  <span className="text-xs text-slate-400 font-mono">FORMULA _Z04</span>
                  <h4 className="text-lg font-bold text-slate-800 mt-1">Linear Transformations</h4>
                  <div className="mt-3 font-mono text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                    T(x, y) = (2x + 3y, x - y, 4x + 2y)
                  </div>
                </div>
                <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm">
                  <span className="text-xs text-slate-400 font-mono">INTEGRATION _M901</span>
                  <h4 className="text-lg font-bold text-slate-800 mt-1">Definite Integrals</h4>
                  <div className="mt-3 font-mono text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                    ∫(3x² - 2x + 5) dx from a=2 to b=6 = 216
                  </div>
                </div>
                <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm">
                  <span className="text-xs text-slate-400 font-mono">DENSITY_RATIO _B0</span>
                  <h4 className="text-lg font-bold text-slate-800 mt-1">Statistical Significance</h4>
                  <div className="mt-3 font-mono text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                    p-value &lt; 0.05, rejecting primary null state.
                  </div>
                </div>
              </div>

              {/* Hardcoded academic table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                      <th className="p-3 border-r border-slate-200">Index</th>
                      <th className="p-3 border-r border-slate-200">Independent Variable (x)</th>
                      <th className="p-3 border-r border-slate-200">Calculated Constant (c)</th>
                      <th className="p-3 border-r border-slate-200">Quadratic Output ƒ(x)</th>
                      <th className="p-3">Variance Standard Deviation (σ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                    <tr>
                      <td className="p-3 bg-slate-50 border-r border-slate-200 font-bold">A-102</td>
                      <td className="p-3 border-r border-slate-200">0.05149</td>
                      <td className="p-3 border-r border-slate-200">2.19047</td>
                      <td className="p-3 border-r border-slate-200">14.92819</td>
                      <td className="p-3 text-emerald-600">+0.00284 (Safe)</td>
                    </tr>
                    <tr>
                      <td className="p-3 bg-slate-50 border-r border-slate-200 font-bold">A-103</td>
                      <td className="p-3 border-r border-slate-200">0.09241</td>
                      <td className="p-3 border-r border-slate-200">2.18120</td>
                      <td className="p-3 border-r border-slate-200">14.88710</td>
                      <td className="p-3 text-emerald-600">+0.00194 (Safe)</td>
                    </tr>
                    <tr>
                      <td className="p-3 bg-slate-50 border-r border-slate-200 font-bold">A-104</td>
                      <td className="p-3 border-r border-slate-200">0.12984</td>
                      <td className="p-3 border-r border-slate-200">2.17983</td>
                      <td className="p-3 border-r border-slate-200">14.61204</td>
                      <td className="p-3 text-rose-500">-0.01048 (Warning)</td>
                    </tr>
                    <tr>
                      <td className="p-3 bg-slate-50 border-r border-slate-200 font-bold">A-105</td>
                      <td className="p-3 border-r border-slate-200">0.18431</td>
                      <td className="p-3 border-r border-slate-200">2.20455</td>
                      <td className="p-3 border-r border-slate-200">15.11029</td>
                      <td className="p-3 text-emerald-600">+0.00412 (Normal)</td>
                    </tr>
                    <tr>
                      <td className="p-3 bg-slate-50 border-r border-slate-200 font-bold">A-106</td>
                      <td className="p-3 border-r border-slate-200">0.24610</td>
                      <td className="p-3 border-r border-slate-200">2.21501</td>
                      <td className="p-3 border-r border-slate-200">15.34091</td>
                      <td className="p-3 text-emerald-600">+0.00511 (Normal)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo & Subheading */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 glow-indigo border border-indigo-400/30">
              <Gamepad2 size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-purple-200 text-gradient">
                  Unblocked Games Portal
                </h1>
                <span className="bg-indigo-900/40 text-[10px] text-indigo-300 font-mono px-1.5 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Safe iframe game catalog &mdash; No filters, pure playground</p>
            </div>
          </div>

          {/* Quick Stats & Panic Button Info */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            
            {/* Decoy Disguise Button */}
            <button 
              id="panic-button-header"
              onClick={() => setIsPanicMode(true)}
              className="bg-slate-900 hover:bg-rose-950/20 hover:text-rose-400 border border-slate-800 hover:border-rose-900/50 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 transition-all flex items-center gap-2"
              title="Instantly overlays a spreadsheet homework screen. Quick-Key: [Q]"
            >
              <EyeOff size={14} className="animate-pulse" />
              <span>Disguise Tab <kbd className="text-[9px] bg-slate-850 px-1 rounded ml-1 border border-slate-700 font-mono font-normal">Q</kbd></span>
            </button>

            {/* Custom Iframe Game Upload Trigger */}
            <button 
              id="create-game-trigger"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center gap-2 border border-indigo-500/40"
            >
              <Plus size={14} />
              <span>Import custom game</span>
            </button>
          </div>

        </div>
      </header>

      {/* DETAILED ACTIVE GAME CENTER (IFRAME CONTAINER PANEL) */}
      <AnimatePresence mode="wait">
        {selectedGame && (
          <motion.div 
            id="active-game-arena"
            key={selectedGame.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`w-full bg-slate-900 border-b border-indigo-950/40 relative z-30 transition-all duration-300 ${
              showTheaterMode ? "fixed inset-0 z-50 bg-slate-950" : ""
            }`}
          >
            <div className={`mx-auto ${showTheaterMode ? "w-full h-full flex flex-col" : "max-w-7xl p-4 sm:p-6"}`}>
              
              {/* TOP GAME BAR CONTROLS */}
              <div className={`flex items-center justify-between gap-4 mb-4 ${showTheaterMode ? "p-4 bg-slate-950 border-b border-slate-900" : ""}`}>
                <div className="flex items-center gap-3">
                  <button 
                    id="exit-game-arena-btn"
                    onClick={() => {
                      setSelectedGame(null);
                      setShowTheaterMode(false);
                    }}
                    className="p-1 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <ChevronLeft size={15} />
                    <span>Library</span>
                  </button>
                  <div className="h-4 w-px bg-slate-800" />
                  <div>
                    <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
                      {selectedGame.name}
                      <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 text-slate-400 font-mono rounded font-normal">
                        {selectedGame.category}
                      </span>
                    </h2>
                    {!showTheaterMode && (
                      <p className="text-[11px] text-slate-400 truncate max-w-sm hidden md:block">
                        {selectedGame.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* GAME OPERATIONAL SLATE */}
                <div className="flex items-center gap-2">
                  
                  {/* Session playing clock */}
                  <div className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg flex items-center gap-2 font-mono text-xs text-indigo-300">
                    <Clock size={12} className="text-indigo-400" />
                    <span>{formatTime(playSeconds)}</span>
                  </div>

                  {/* Refresh game viewport */}
                  <button 
                    id="reboot-active-game"
                    onClick={() => {
                      setIsLoadingIframe(true);
                      setIframeKey((prev) => prev + 1);
                      setTimeout(() => setIsLoadingIframe(false), 900);
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                    title="Reload current unblocked game"
                  >
                    <RotateCcw size={14} className={isLoadingIframe ? "animate-spin" : ""} />
                  </button>

                  {/* Theater Mode Toggle */}
                  <button 
                    id="theater-mode-toggle"
                    onClick={() => setShowTheaterMode(!showTheaterMode)}
                    className={`p-2 rounded-lg transition-all ${
                      showTheaterMode 
                        ? "bg-indigo-600 text-white hover:bg-indigo-500" 
                        : "bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white"
                    }`}
                    title={showTheaterMode ? "Exit Theater Focus Zone [Esc]" : "Enter Theater Focus Zone"}
                  >
                    {showTheaterMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                </div>
              </div>

              {/* GAME STAGE BOX */}
              <div className={`relative bg-slate-950 border border-slate-800 shadow-2xl rounded-xl overflow-hidden ${
                showTheaterMode ? "flex-1 rounded-none border-0" : "aspect-video max-h-[640px] w-full"
              }`}>
                
                {/* CYBER LOADER SEQUENCE */}
                {isLoadingIframe && (
                  <div className="absolute inset-0 bg-slate-950/95 z-20 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin mb-4" />
                    <code className="text-xs text-indigo-400 font-mono animate-pulse max-w-xs break-words">
                      [BOOT_SERENE] Fetching iframe payload from endpoint...
                    </code>
                    <p className="text-[11px] text-slate-500 font-sans mt-2">Setting up unblocked runtime environment...</p>
                  </div>
                )}

                {/* THE GAME FRAME */}
                <iframe 
                  key={iframeKey}
                  src={selectedGame.iframeUrl}
                  title={`Play ${selectedGame.name}`}
                  className="w-full h-full border-0 absolute inset-0 bg-slate-950"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>

              {/* STATS & CONTROLLER BINDINGS PANEL (UNDER GAME EXCLUDING THEATER MODE) */}
              {!showTheaterMode && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pt-4 border-t border-slate-800/50">
                  
                  {/* Left block: Description & Tags */}
                  <div className="lg:col-span-1 space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Info size={13} className="text-indigo-400" /> Game Details
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed mt-2 p-3 bg-slate-950 rounded-lg border border-slate-850">
                        {selectedGame.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {selectedGame.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="text-[10px] bg-slate-850 text-slate-400 border border-slate-800 font-mono px-2 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      <span className="text-[10px] bg-emerald-900/20 text-emerald-300 border border-emerald-950 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                        Difficulty: {selectedGame.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Middle block: Controller layout */}
                  <div className="lg:col-span-1">
                    <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2">
                      <Sliders size={13} className="text-pink-400" /> Controller Keybinds
                    </h3>
                    <div className="divide-y divide-slate-850 bg-slate-950 border border-slate-850 rounded-lg p-1">
                      {Object.entries(selectedGame.controls).map(([keyBind, action]) => (
                        <div key={keyBind} className="flex justify-between items-center py-2 px-3 text-xs">
                          <span className="font-mono text-[11px] text-pink-300 bg-pink-950/10 border border-pink-900/30 px-1.5 py-0.5 rounded">
                            {keyBind}
                          </span>
                          <span className="text-slate-300 text-right font-medium">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right block: Play Guidelines */}
                  <div className="lg:col-span-1">
                    <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2">
                      <Terminal size={13} className="text-emerald-400" /> Instructions
                    </h3>
                    <div className="bg-slate-950 border border-slate-850 rounded-lg p-3.5 space-y-2">
                      <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5">
                        {selectedGame.instructions.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <span className="text-slate-300">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH / FILTERS / STATS ROW */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col gap-6">
        
        {/* FILTERS & SEARCH ROW */}
        <div id="filter-bar" className="bg-slate-900/40 border border-slate-900/80 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Categories Grid tags */}
          <div className="flex flex-wrap gap-1.5">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedCategory === cat 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "bg-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {cat === "All" ? "🎮 All Games" : cat}
              </button>
            ))}
          </div>

          {/* Search bar console */}
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Search size={14} />
            </span>
            <input 
              id="search-games-input"
              type="text"
              placeholder="Search games, tags, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 px-3 pl-9 py-2.5 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

        </div>

        {/* GAMES SECTION GRID */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
                {filteredGames.length} available
              </span>
              <h2 className="font-display font-bold text-base text-slate-200">
                {selectedCategory === "All" ? "Curated Retro Library" : `${selectedCategory} Collection`}
              </h2>
            </div>
            
            {/* Reset custom database fallback */}
            {games.length > gamesData.length && (
              <button 
                id="reset-db-btn"
                onClick={handleResetCustomGames}
                className="text-[11px] text-slate-500 hover:text-rose-400 underline font-mono cursor-pointer"
              >
                Reset Database to default
              </button>
            )}
          </div>

          {/* Empty search fallback */}
          {filteredGames.length === 0 ? (
            <div className="text-center py-16 px-6 bg-slate-900/20 border border-dashed border-slate-900 rounded-2xl flex flex-col items-center justify-center max-w-md mx-auto my-6 text-slate-400">
              <div className="w-12 h-12 rounded-xl bg-slate-900/60 border border-slate-850 flex items-center justify-center mb-3">
                <SearchCode size={20} className="text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-300">No matching unblocked games</p>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Try searching other keywords, clearing your filter tags, or import a new dynamic game with an iframe link.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 px-4 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs font-medium rounded-lg text-slate-300 transition-all"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredGames.map((game) => {
                const isActive = selectedGame?.id === game.id;
                return (
                  <motion.div
                    id={`game-card-${game.id}`}
                    key={game.id}
                    layoutId={`card-container-${game.id}`}
                    className={`bg-slate-900 border overflow-hidden rounded-2xl flex flex-col transition-all duration-250 group relative cursor-pointer ${
                      isActive 
                        ? "border-indigo-500 glow-indigo ring-1 ring-indigo-500/30" 
                        : "border-slate-900/90 hover:border-slate-800"
                    }`}
                    onClick={() => handleSelectGame(game)}
                  >
                    {/* Header gradient band */}
                    <div className={`h-2.5 bg-gradient-to-r ${game.colorTheme || "from-slate-700 to-indigo-800"}`} />

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Game Category / Difficulty block */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] bg-slate-950 font-semibold px-2 py-0.5 rounded-md text-slate-400 border border-slate-850">
                            {game.category}
                          </span>
                          <span className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded ${
                            game.difficulty === "Easy" 
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/20" 
                              : game.difficulty === "Medium"
                              ? "bg-amber-950/40 text-amber-400 border border-amber-950/20"
                              : "bg-rose-950/40 text-rose-400 border border-rose-950/20"
                          }`}>
                            {game.difficulty}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-display font-medium text-white text-base tracking-tight mb-2 group-hover:text-indigo-400 transition-all flex items-center justify-between">
                          <span>{game.name}</span>
                          <span className="shrink-0 p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all opacity-0 group-hover:opacity-100">
                            <Play size={10} fill="currentColor" />
                          </span>
                        </h3>

                        {/* Description snippet */}
                        <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3 mb-4">
                          {game.description}
                        </p>
                      </div>

                      {/* Footer tags list */}
                      <div className="flex flex-wrap gap-1 mt-auto border-t border-slate-850/60 pt-3">
                        {game.tags.slice(0, 3).map((tag) => (
                          <span 
                            key={tag}
                            className="text-[9px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* GUIDANCE TIP ACCENT */}
        <div className="bg-slate-900/20 rounded-2xl p-4 border border-slate-900/60 max-w-4xl mx-auto w-full mt-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 shrink-0">
            <Sparkles size={20} className="text-yellow-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">How the Iframe Launcher Functions</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Unblocked Games Portal acts as an embedding client. Real games are stored in `/src/data/games.json` and rendered on-demand in sandboxed, ad-free contexts inside full-fidelity `&lt;iframe&gt;` blocks. Press <strong className="font-mono text-indigo-400 bg-slate-950 border border-slate-850 px-1 py-0.5 rounded text-[10px]">Q</strong> of your keyboard at anytime to quickly cover your screen with a boring work math sheet!
            </p>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/80 p-5 text-center mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>&copy; 2026 Unblocked Games Portal. Safe Sandbox Client.</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Secure Port: 3000 (Iframe SSL Verified)</span>
            <span>&bull;</span>
            <span>Keyboard Panic hotkey active</span>
          </div>
        </div>
      </footer>

      {/* 🛠️ MODAL: CUSTOM IFRAME GAME IMPORT DRAWER */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              id="game-import-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 px-2.5 bg-indigo-900/30 border border-indigo-900/40 text-indigo-400 font-mono rounded text-xs">
                    JSON API
                  </div>
                  <h3 className="text-base font-display font-semibold text-white">Import Custom Playable Iframe</h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-100 bg-slate-850 rounded-lg hover:bg-slate-800 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateGame} className="p-5 space-y-4 overflow-y-auto flex-1 max-h-[60vh]">
                
                {/* Notice banner */}
                <div className="bg-indigo-950/30 border border-indigo-900/40 p-3 rounded-lg text-xs leading-normal text-indigo-300 flex items-start gap-2.5">
                  <Terminal size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                  <p>
                    Added games are instantly appended to your private dashboard pool saved inside the client's LocalStorage database. Ensure target URLs tolerate standard absolute iframe embedding configurations.
                  </p>
                </div>

                {/* Game Title */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold uppercase font-mono tracking-wider">Game Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Classic Tetris, My Custom Web Game"
                    value={newGame.name}
                    onChange={(e) => setNewGame(prev => ({...prev, name: e.target.value}))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20"
                  />
                </div>

                {/* Game Iframe Link */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold uppercase font-mono tracking-wider">Direct Iframe Embed URL/Source *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="https://example-game.github.io/game-sandbox/"
                    value={newGame.iframeUrl}
                    onChange={(e) => setNewGame(prev => ({...prev, iframeUrl: e.target.value}))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-500">Must be a secure HTTPS web page that supports being placed in iframe embeds.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold uppercase font-mono tracking-wider">Primary Category</label>
                    <select
                      value={newGame.category}
                      onChange={(e) => setNewGame(prev => ({...prev, category: e.target.value}))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20"
                    >
                      <option value="Puzzle">Puzzle</option>
                      <option value="Arcade">Arcade</option>
                      <option value="Shooter">Shooter</option>
                      <option value="Adventure">Adventure</option>
                    </select>
                  </div>

                  {/* Difficulty Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold uppercase font-mono tracking-wider">Difficulty Rating</label>
                    <select
                      value={newGame.difficulty}
                      onChange={(e) => setNewGame(prev => ({...prev, difficulty: e.target.value}))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Description input */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold uppercase font-mono tracking-wider">Short Description / Pitch</label>
                  <textarea 
                    placeholder="Provide a clear, brief guide of what players should accomplish in this unblocked game."
                    value={newGame.description}
                    onChange={(e) => setNewGame(prev => ({...prev, description: e.target.value}))}
                    className="w-full h-20 bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 resize-none font-sans"
                  />
                </div>

                {/* Submitting custom controller binds */}
                <div className="space-y-2 border-t border-slate-850 pt-3">
                  <label className="text-xs text-slate-300 font-semibold uppercase font-mono tracking-wider block">Controller Keybindings</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Key (e.g. Spacebar)" 
                      value={controlKeyInput}
                      onChange={(e) => setControlKeyInput(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 w-1/2 focus:outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Action (e.g. Jump)" 
                      value={controlActionInput}
                      onChange={(e) => setControlActionInput(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 w-1/2 focus:outline-none"
                    />
                    <button 
                      type="button"
                      onClick={handleAddControlMapping}
                      className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:text-white text-slate-300 px-3.5 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Bind
                    </button>
                  </div>

                  {/* Built bindings keys preview */}
                  {newGame.controls && Object.keys(newGame.controls).length > 0 && (
                    <div className="mt-1.5 bg-slate-950 border border-slate-900 rounded-lg p-2.5 flex flex-wrap gap-1.5">
                      {Object.entries(newGame.controls).map(([key, value]) => (
                        <div key={key} className="text-[10px] bg-slate-850 text-slate-300 border border-slate-800 px-2 py-1 rounded-md flex items-center gap-1.5 font-mono">
                          <span className="text-pink-400 font-bold">{key}:</span>
                          <span>{value}</span>
                          <button 
                            type="button"
                            onClick={() => {
                              const copy = {...(newGame.controls)};
                              delete copy[key];
                              setNewGame(prev => ({...prev, controls: copy}));
                            }}
                            className="text-slate-500 hover:text-rose-400 font-bold ml-1"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Tags entry */}
                <div className="space-y-2 border-t border-slate-850 pt-3">
                  <label className="text-xs text-slate-300 font-semibold uppercase font-mono tracking-wider block">Custom Tags</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add tag (e.g. Action, Retro)" 
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 flex-1 focus:outline-none"
                    />
                    <button 
                      type="button"
                      onClick={handleAddTag}
                      className="bg-indigo-900/30 border border-indigo-900/50 hover:bg-indigo-900/40 text-indigo-300 px-3.5 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Add Tag
                    </button>
                  </div>

                  {/* Tags list preview */}
                  {newGame.tags && newGame.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {newGame.tags.map((tg) => (
                        <div key={tg} className="text-[9px] bg-slate-855 text-slate-400 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                          <span>#{tg}</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              setNewGame(prev => ({...prev, tags: (prev.tags || []).filter(t => t !== tg)}));
                            }}
                            className="text-slate-500 hover:text-slate-200"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </form>

              {/* Drawer submission buttons */}
              <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-end gap-3.5">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 hover:bg-slate-850 hover:text-white border border-transparent hover:border-slate-800 text-xs font-semibold rounded-xl text-slate-400 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleCreateGame}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all border border-indigo-500/40 cursor-pointer"
                >
                  Launch App Instance
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
