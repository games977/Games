import React, { useState, useEffect, useRef } from "react";
import { 
  Play, RotateCcw, Volume2, VolumeX, Zap, Trophy, Shield, Heart,
  Sparkles, Sword, Compass, Skull, Target, Crosshair, Hammer, HelpCircle, Activity
} from "lucide-react";

// Robust WebAudio Synth for all weapon sound alerts
class ProceduralSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }
  playTone(freq, dur, type = "sine", decayFreq = 40, vol = 0.1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const p = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      p.type = type;
      p.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (decayFreq) {
        p.frequency.exponentialRampToValueAtTime(decayFreq, this.ctx.currentTime + dur);
      }
      g.gain.setValueAtTime(vol, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + dur);
      p.connect(g);
      g.connect(this.ctx.destination);
      p.start();
      p.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }
}

const synth = new ProceduralSynth();

// Define exactly 15 customizable Weapons (Standard + Exotic Variants)
const WEAPONS_CATALOG = [
  { id: "pickaxe", name: "⛏️ Nano-Pickaxe", damage: 30, fireRate: 280, color: "#94a3b8", cost: 0, rarity: "Common" },
  { id: "scar_ar", name: "🔫 SCAR Assault Rifle", damage: 19, fireRate: 140, speed: 17, range: 600, spread: 0.03, color: "#2dd4bf", rarity: "Legendary" },
  { id: "pump_shotgun", name: "🔥 Gold Pump Shotgun", damage: 13, fireRate: 850, speed: 12, range: 240, spread: 0.16, projectiles: 6, color: "#f87171", rarity: "Legendary" },
  { id: "heavy_sniper", name: "⚡ Heavy Bolt Sniper", damage: 95, fireRate: 1400, speed: 28, range: 1000, spread: 0.0, color: "#a855f7", rarity: "Mythic" },
  { id: "rapid_smg", name: "💨 Rapid-Fire SMG", damage: 9, fireRate: 75, speed: 18, range: 350, spread: 0.09, color: "#cbd5e1", rarity: "Epic" },
  { id: "rpg_launcher", name: "🚀 RPG Rocket Blaster", damage: 85, fireRate: 1600, speed: 7, range: 800, spread: 0.0, isRocket: true, color: "#ea580c", rarity: "Mythic" },
  { id: "toxic_ray", name: "🧪 Suppressed Poison", damage: 11, fireRate: 180, speed: 15, range: 450, spread: 0.02, isPoison: true, color: "#10b981", rarity: "Epic" },
  { id: "orbit_laser", name: "🛰️ Heat Beam Laser", damage: 6, fireRate: 50, speed: 35, range: 800, spread: 0.0, isLaser: true, color: "#f43f5e", rarity: "Legendary" },
  { id: "drum_gun", name: "🥁 Midas Drum Gun", damage: 14, fireRate: 110, speed: 16, range: 480, spread: 0.06, color: "#fb923c", rarity: "Legendary" },
  { id: "grenade", name: "💥 Clinger Grenade", damage: 70, fireRate: 900, speed: 10, range: 380, spread: 0.08, isThrowable: true, color: "#ec4899", rarity: "Rare" },
  { id: "freeze_ray", name: "❄️ Cryo Freeze Ray", damage: 12, fireRate: 220, speed: 14, range: 400, spread: 0.04, isFreeze: true, color: "#38bdf8", rarity: "Epic" },
  { id: "vampire_bow", name: "🏹 Vampire Fiend Bow", damage: 45, fireRate: 600, speed: 21, range: 820, spread: 0.01, isVampire: true, color: "#f472b6", rarity: "Legendary" },
  { id: "plasma_cannon", name: "🛸 Alien Plasma Orb", damage: 50, fireRate: 1100, speed: 6, range: 620, spread: 0.0, isPlasma: true, color: "#4ade80", rarity: "Legendary" },
  { id: "hand_cannon", name: "🤠 Heavy Deagle Pistol", damage: 52, fireRate: 600, speed: 22, range: 650, spread: 0.01, color: "#eab308", rarity: "Epic" },
  { id: "minigun", name: "🚨 Sweaty Minigun", damage: 8, fireRate: 60, speed: 19, range: 500, spread: 0.12, color: "#ec4899", rarity: "Legendary" },
];

const BUILD_MENU = [
  { id: "wall", name: "🧱 Snap Wall", type: "build", cost: 10, material: "wood", color: "#f97316" },
  { id: "floor", name: "🟩 Snap Floor", type: "build", cost: 10, material: "brick", color: "#3b82f6" },
  { id: "ramp", name: "📐 Slope Ramp", type: "build", cost: 10, material: "metal", color: "#eab308" },
  { id: "roof", name: "🔺 Roof Cap", type: "build", cost: 10, material: "wood", color: "#a855f7" }
];

const BOT_NAMES = [
  "ClixBot", "BughaSweat", "DefaultDan", "AikoFort", "Mongraal_AI", 
  "SwaySim", "TfueAim", "NinjaPrada", "Symfuh", "SweatLord"
];

const ARENA_SIZE = 1800;
const GRID_CELL = 60;

export default function GunGame({ onPanicActivate }) {
  const canvasRef = useRef(null);

  // Core React Drivers
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [winner, setWinner] = useState(null);
  
  // Game Configuration Modes
  // "1v1" / "FFA" / "ZOMBIE" / "TRAINER"
  const [gameMode, setGameMode] = useState("1v1");
  const [botLevel, setBotLevel] = useState("Sweaty"); // Casual, Pro, Sweaty, Champion
  const [aimbotActive, setAimbotActive] = useState(true);

  // Inventory list with exactly 5 customizeable quick slots
  const [equippedLoadout, setEquippedLoadout] = useState([
    WEAPONS_CATALOG[0], // Pickaxe
    WEAPONS_CATALOG[1], // SCAR
    WEAPONS_CATALOG[2], // Pump
    WEAPONS_CATALOG[3], // Sniper
    WEAPONS_CATALOG[4], // SMG
  ]);
  const [activeSlotIdx, setActiveSlotIdx] = useState(1); // SCAR
  const [materials, setMaterials] = useState({ wood: 500, brick: 350, metal: 200 });
  const [playerHp, setPlayerHp] = useState(100);
  const [playerShield, setPlayerShield] = useState(100);
  const [killCount, setKillCount] = useState(0);
  const [deathsCount, setDeathsCount] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  // Trainer Scoreboard State
  const [trainerScore, setTrainerScore] = useState(0);
  const [trainerHighscore, setTrainerHighscore] = useState(0);

  // Core Physics state refs
  const stateRef = useRef({
    player: {
      x: ARENA_SIZE / 2, y: ARENA_SIZE / 2, radius: 16, speed: 4.5,
      hp: 100, maxHp: 100, shield: 100, maxShield: 100, angle: 0,
      mats: { wood: 500, brick: 350, metal: 200 }, elevation: 0,
      lastSwingTime: 0, lastShotTime: 0, lastPlaceTime: 0,
      poisonTicks: [], frozenTimer: 0, drivingCarId: null
    },
    bots: [],
    zombies: [],
    bullets: [],
    particles: [],
    builds: [],
    resources: [],
    killFeed: [],
    cars: [],
    aimTargets: [], // for Trainer Mode
    mouse: { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false },
    keys: {},
    camera: { x: 0, y: 0 },
    screenShake: 0,
    activeBuildIdx: 0, // 0 = Wall, 1 = Floor, etc.
    activeSlot: WEAPONS_CATALOG[1],
    aimbotTarget: null,
  });

  const notify = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback((prev) => (prev === msg ? "" : prev)), 2500);
  };

  const goBackToMainLobby = () => {
    setIsPlaying(false);
    setIsGameOver(false);
    setWinner(null);
    synth.playTone(400, 0.15, "sine", 200, 0.15);
    notify("🏠 RETURNED TO MAIN LOBBY MENU");
  };

  // Switch slots helper
  const selectSlotIndex = (idx) => {
    setActiveSlotIdx(idx);
    const item = equippedLoadout[idx];
    stateRef.current.activeSlot = item;
    synth.playTone(300 + idx * 55, 0.08, "sine", 120, 0.08);
  };

  // Generate cars, trees, rocks, zombies, target dummys
  const generateWorld = (mode) => {
    const list = [];
    // Spawn mineable trees & stones
    for (let i = 0; i < 24; i++) {
      let x = 120 + Math.random() * (ARENA_SIZE - 240);
      let y = 120 + Math.random() * (ARENA_SIZE - 240);
      const isTree = Math.random() > 0.45;
      list.push({
        id: `res-${i}`,
        x, y,
        type: isTree ? "tree" : "rock",
        radius: isTree ? 26 : 21,
        hp: 150, maxHp: 150,
        color: isTree ? "#16a34a" : "#475569"
      });
    }
    stateRef.current.resources = list;
    stateRef.current.builds = [];
    stateRef.current.bullets = [];
    stateRef.current.particles = [];
    stateRef.current.killFeed = [];
    stateRef.current.zombies = [];
    stateRef.current.aimTargets = [];

    // Spawn 3 sports cars with color schemes
    const carLayouts = [
      { id: "car-red", x: ARENA_SIZE / 2 - 150, y: ARENA_SIZE / 2 + 150, color: "#dc2626", name: "Red Rocket Sport" },
      { id: "car-gold", x: ARENA_SIZE - 300, y: 300, color: "#eab308", name: "Yellow Dakar Buggy" },
      { id: "car-blue", x: 300, y: ARENA_SIZE - 300, color: "#2563eb", name: "Blue Stealth Drift" }
    ];
    stateRef.current.cars = carLayouts.map(c => ({
      ...c,
      vx: 0, vy: 0, speed: 0, maxSpeed: 8, angle: Math.random() * Math.PI,
      radius: 28, hp: 400, maxHp: 400
    }));

    // If Trainer Mode, spawn persistent floating aim trainer targets
    if (mode === "TRAINER") {
      setTrainerScore(0);
      for (let i = 0; i < 10; i++) {
        spawnTrainerTarget();
      }
    }
  };

  const spawnTrainerTarget = () => {
    stateRef.current.aimTargets.push({
      id: `target-${Date.now()}-${Math.random()}`,
      x: 200 + Math.random() * (ARENA_SIZE - 400),
      y: 200 + Math.random() * (ARENA_SIZE - 400),
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: 17,
      color: "#f43f5e"
    });
  };

  const spawnZombieWave = (qty) => {
    for (let i = 0; i < qty; i++) {
      const sides = [
        { x: Math.random() * ARENA_SIZE, y: 50 },
        { x: Math.random() * ARENA_SIZE, y: ARENA_SIZE - 50 },
        { x: 50, y: Math.random() * ARENA_SIZE },
        { x: ARENA_SIZE - 50, y: Math.random() * ARENA_SIZE },
      ];
      const startPt = sides[Math.floor(Math.random() * 4)];
      const randType = Math.random();
      
      let classType = "Swarmer";
      let hp = 60;
      let speed = 2.4;
      let color = "#22c55e"; // bright neon toxic green
      let radius = 15;

      if (randType > 0.85) {
        classType = "Goliath";
        hp = 200;
        speed = 1.3;
        color = "#eab308"; // giant gold goliath
        radius = 25;
      } else if (randType > 0.65) {
        classType = "Boomer";
        hp = 80;
        speed = 1.8;
        color = "#a855f7"; // purple volatile exploder
        radius = 17;
      }

      stateRef.current.zombies.push({
        id: `zom-${Date.now()}-${Math.random()}`,
        x: startPt.x,
        y: startPt.y,
        hp, maxHp: hp,
        speed, angle: 0,
        radius, color, classType,
        lastAttackTime: 0
      });
    }
  };

  // Trigger match duel start
  const handleStartMatch = (mode) => {
    synth.playTone(523, 0.15, "square", 120, 0.15);
    setGameMode(mode);
    setIsGameOver(false);
    setKillCount(0);
    setDeathsCount(0);

    // Reset player position and inventory stats
    stateRef.current.player = {
      x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 + 100, radius: 16, speed: 4.5,
      hp: 100, maxHp: 100, shield: 100, maxShield: 100, angle: 0,
      mats: { wood: 999, brick: 999, metal: 999 }, elevation: 0,
      lastSwingTime: 0, lastShotTime: 0, lastPlaceTime: 0,
      poisonTicks: [], frozenTimer: 0, drivingCarId: null
    };

    setMaterials({ wood: 999, brick: 999, metal: 999 });
    selectSlotIndex(1); // default SCAR

    generateWorld(mode);

    // Spawn 1v1 or FFA bots
    const botCount = mode === "1v1" ? 1 : mode === "FFA" ? 5 : mode === "ZOMBIE" ? 2 : 0;
    const names = [...BOT_NAMES].sort(() => 0.5 - Math.random());
    stateRef.current.bots = Array.from({ length: botCount }, (_, idx) => {
      const offset = 400;
      return {
        id: `bot-${idx}`,
        name: names[idx],
        x: idx % 2 === 0 ? ARENA_SIZE / 2 - offset : ARENA_SIZE / 2 + offset,
        y: idx < 2 ? ARENA_SIZE / 2 - offset : ARENA_SIZE / 2 + offset,
        radius: 16, hp: 100, shield: 100, angle: Math.PI,
        speed: 4.2, lastShootTime: 0, lastBuildTime: 0, elevation: 0, stateTimer: 0,
        color: `hsl(${(idx * 135) % 360}, 95%, 60%)`, lastSwingTime: 0, respawnTimer: 0
      };
    });

    setIsPlaying(true);
    if (mode === "ZOMBIE") {
      spawnZombieWave(10);
      notify("🧟 ZOMBIE INVASION SPOTTED! ARM UP & HOOD YOUR CARS!");
    } else if (mode === "TRAINER") {
      notify("🎯 AIM TRAINING ROOM STARTED. TRAIN SIGHT OVER RETICLES!");
    } else {
      notify(`🥊 Arena Match initiated. Mode: ${mode}`);
    }
  };

  // Main Canvas & Keyboards Engine hooks
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;

    const keyListenerDown = (e) => {
      const k = e.key.toLowerCase();
      stateRef.current.keys[k] = true;

      // Escape, M, or Backspace returns to lobby menu
      if (e.key === "Escape" || k === "m" || e.key === "backspace") {
        goBackToMainLobby();
        return;
      }

      // Slot keys swaps
      if (["1", "2", "3", "4", "5"].includes(k)) {
        selectSlotIndex(parseInt(k) - 1);
      }
      // Build slot selections keys
      if (k === "z") stateRef.current.activeBuildIdx = 0; // Wall
      if (k === "x") stateRef.current.activeBuildIdx = 1; // Floor
      if (k === "c") stateRef.current.activeBuildIdx = 2; // Ramp
      if (k === "v") stateRef.current.activeBuildIdx = 3; // Roof

      // Exit/enter drive key
      if (k === "f") {
        toggleCarDrivable();
      }

      // Panic action toggle
      if (k === "q") {
        onPanicActivate();
      }
    };

    const keyListenerUp = (e) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    const mouseMoveListener = (e) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.mouse.x = e.clientX - rect.left;
      stateRef.current.mouse.y = e.clientY - rect.top;
    };

    const mouseDownListener = (e) => {
      if (e.button === 0) {
        stateRef.current.mouse.isDown = true;
      } else if (e.button === 2) {
        e.preventDefault();
        // Shift active build quickly
        stateRef.current.activeBuildIdx = (stateRef.current.activeBuildIdx + 1) % 4;
        synth.playTone(450, 0.05, "sine", 200, 0.05);
      }
    };

    const mouseUpListener = (e) => {
      if (e.button === 0) stateRef.current.mouse.isDown = false;
    };

    const rightMenuBlocker = (e) => e.preventDefault();

    window.addEventListener("keydown", keyListenerDown);
    window.addEventListener("keyup", keyListenerUp);
    canvas.addEventListener("mousemove", mouseMoveListener);
    canvas.addEventListener("mousedown", mouseDownListener);
    canvas.addEventListener("mouseup", mouseUpListener);
    canvas.addEventListener("contextmenu", rightMenuBlocker);

    // Car entry toggle
    const toggleCarDrivable = () => {
      const p = stateRef.current.player;
      if (p.drivingCarId) {
        // Exit
        const car = stateRef.current.cars.find(c => c.id === p.drivingCarId);
        if (car) {
          p.x = car.x + Math.sin(car.angle) * 45;
          p.y = car.y - Math.cos(car.angle) * 45;
          car.driverId = null;
        }
        p.drivingCarId = null;
        notify("🚪 EXITED SPORT MOTORCAR");
        synth.playTone(300, 0.15, "triangle", 100, 0.15);
      } else {
        // Find nearest car to enter
        let closest = null;
        let minDist = 75;
        stateRef.current.cars.forEach((c) => {
          if (c.hp > 0 && !c.driverId) {
            const d = Math.sqrt(Math.pow(c.x - p.x, 2) + Math.pow(c.y - p.y, 2));
            if (d < minDist) {
              minDist = d;
              closest = c;
            }
          }
        });
        if (closest) {
          p.drivingCarId = closest.id;
          closest.driverId = "player";
          notify(`🚗 BOARDED: ${closest.name.toUpperCase()} (W/S SPEED, A/D STEER)`);
          synth.playTone(180, 0.25, "sawtooth", 50, 0.2);
        }
      }
    };

    // Sub loops physics
    const mainGameEngines = () => {
      const p = stateRef.current.player;
      const keys = stateRef.current.keys;
      const mouse = stateRef.current.mouse;
      const activeItem = stateRef.current.activeSlot;

      // Decrease frozen slow effect counter
      if (p.frozenTimer > 0) p.frozenTimer--;

      // Render aimbot helper locking
      if (aimbotActive && p.hp > 0 && activeItem && activeItem.id !== "pickaxe") {
        let bestTarget = null;
        let bestDist = 450;
        
        // Pick nearest visible Bot
        stateRef.current.bots.forEach(b => {
          if (b.hp > 0) {
            const d = Math.sqrt(Math.pow(b.x - p.x, 2) + Math.pow(b.y - p.y, 2));
            if (d < bestDist) {
              bestDist = d;
              bestTarget = b;
            }
          }
        });

        // Or nearest Zombie
        stateRef.current.zombies.forEach(z => {
          if (z.hp > 0) {
            const d = Math.sqrt(Math.pow(z.x - p.x, 2) + Math.pow(z.y - p.y, 2));
            if (d < bestDist) {
              bestDist = d;
              bestTarget = z;
            }
          }
        });

        // Or Trainer Targets
        stateRef.current.aimTargets.forEach(t => {
          const d = Math.sqrt(Math.pow(t.x - p.x, 2) + Math.pow(t.y - p.y, 2));
          if (d < bestDist) {
            bestDist = d;
            bestTarget = t;
          }
        });

        stateRef.current.aimbotTarget = bestTarget;
      } else {
        stateRef.current.aimbotTarget = null;
      }

      // Handle poison damage tags
      if (p.hp > 0 && p.poisonTicks.length > 0) {
        p.poisonTicks = p.poisonTicks.map(tick => {
          if (Date.now() - tick.lastTime >= 1000) {
            mutateEntityHp(p, tick.dmg, "Toxic Acid Outbreak");
            tick.count--;
            tick.lastTime = Date.now();
            // splash toxic liquid bubbles
            for (let i = 0; i < 4; i++) {
              stateRef.current.particles.push({
                x: p.x, y: p.y,
                vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                color: "#10b981", size: Math.random() * 3 + 2, life: 18
              });
            }
          }
          return tick;
        }).filter(t => t.count > 0);
      }

      // 1. Move Player or Control Car
      if (p.hp > 0) {
        if (p.drivingCarId) {
          const car = stateRef.current.cars.find(c => c.id === p.drivingCarId);
          if (car) {
            // Apply car controls
            if (keys["w"] || keys["arrowup"]) {
              car.speed = Math.min(car.maxSpeed, car.speed + 0.15);
            } else if (keys["s"] || keys["arrowdown"]) {
              car.speed = Math.max(-car.maxSpeed / 2, car.speed - 0.12);
            } else {
              car.speed *= 0.95; // engine brake friction deceleration
            }

            if (keys["a"] || keys["arrowleft"]) {
              car.angle -= 0.045 * (car.speed < 0 ? -1 : 1);
              // Drift smoke particles
              if (Math.abs(car.speed) > 2) {
                stateRef.current.particles.push({
                  x: car.x - Math.cos(car.angle) * 20,
                  y: car.y - Math.sin(car.angle) * 20,
                  vx: (Math.random() - 0.5) * 1.5,
                  vy: (Math.random() - 0.5) * 1.5,
                  color: "rgba(100, 116, 139, 0.25)",
                  size: Math.random() * 5 + 4,
                  life: 15
                });
              }
            }
            if (keys["d"] || keys["arrowright"]) {
              car.angle += 0.045 * (car.speed < 0 ? -1 : 1);
              if (Math.abs(car.speed) > 2) {
                stateRef.current.particles.push({
                  x: car.x - Math.cos(car.angle) * 20,
                  y: car.y - Math.sin(car.angle) * 20,
                  vx: (Math.random() - 0.5) * 1.5,
                  vy: (Math.random() - 0.5) * 1.5,
                  color: "rgba(100, 116, 139, 0.25)",
                  size: Math.random() * 5 + 4,
                  life: 15
                });
              }
            }

            car.vx = Math.cos(car.angle) * car.speed;
            car.vy = Math.sin(car.angle) * car.speed;
            car.x += car.vx;
            car.y += car.vy;

            // Clip boundaries
            car.x = Math.max(car.radius, Math.min(ARENA_SIZE - car.radius, car.x));
            car.y = Math.max(car.radius, Math.min(ARENA_SIZE - car.radius, car.y));

            // Sync player position inside vehicle
            p.x = car.x;
            p.y = car.y;
            p.angle = car.angle;

            // Kinetic impact checks: Run over zombies, bots, builds
            stateRef.current.zombies.forEach(z => {
              if (z.hp > 0 && Math.abs(car.speed) > 1.5) {
                const distZ = Math.sqrt(Math.pow(car.x - z.x, 2) + Math.pow(car.y - z.y, 2));
                if (distZ < car.radius + z.radius) {
                  const dmg = Math.round(Math.abs(car.speed) * 22);
                  z.hp = Math.max(0, z.hp - dmg);
                  synth.playTone(180, 0.1, "triangle", 30, 0.15);
                  
                  // splatters
                  for (let i = 0; i < 8; i++) {
                    stateRef.current.particles.push({
                      x: z.x, y: z.y,
                      vx: Math.cos(car.angle) * car.speed + (Math.random() - 0.5) * 5,
                      vy: Math.sin(car.angle) * car.speed + (Math.random() - 0.5) * 5,
                      color: "#ef4444", size: Math.random() * 4 + 2, life: 20
                    });
                  }
                  if (z.hp <= 0) {
                    processZombieKill(z);
                  }
                }
              }
            });

            // Run over bots
            stateRef.current.bots.forEach(b => {
              if (b.hp > 0 && Math.abs(car.speed) > 2) {
                const dB = Math.sqrt(Math.pow(car.x - b.x, 2) + Math.pow(car.y - b.y, 2));
                if (dB < car.radius + b.radius) {
                  const dmg = Math.round(Math.abs(car.speed) * 18);
                  mutateEntityHp(b, dmg, "Vehicular Roadkill Crush");
                  synth.playTone(120, 0.15, "triangle", 30, 0.2);
                }
              }
            });

            // Smash structures
            stateRef.current.builds.forEach(bld => {
              if (bld.hp > 0 && Math.abs(car.speed) > 3) {
                const cenX = bld.x + GRID_CELL / 2;
                const cenY = bld.y + GRID_CELL / 2;
                const dBuild = Math.sqrt(Math.pow(car.x - cenX, 2) + Math.pow(car.y - cenY, 2));
                if (dBuild < car.radius + GRID_CELL / 2) {
                  bld.hp -= 150;
                  car.speed *= 0.5; // lose momentum
                  synth.playTone(80, 0.2, "sawtooth", 30, 0.15);
                  stateRef.current.screenShake = 12;
                  
                  for (let i = 0; i < 10; i++) {
                    stateRef.current.particles.push({
                      x: cenX, y: cenY,
                      vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.5) * 7,
                      color: bld.material === "wood" ? "#b45309" : "#475569",
                      size: Math.random() * 4 + 2, life: 25
                    });
                  }
                  if (bld.hp <= 0) destroyConstruct(bld.id);
                }
              }
            });
          }
        } else {
          // Normal walking player movement
          let dx = 0, dy = 0;
          if (keys["w"] || keys["arrowup"]) dy = -1;
          if (keys["s"] || keys["arrowdown"]) dy = 1;
          if (keys["a"] || keys["arrowleft"]) dx = -1;
          if (keys["d"] || keys["arrowright"]) dx = 1;

          let speed = p.speed;
          if (p.frozenTimer > 0) speed *= 0.45; // slowed by freeze blaster

          const mag = Math.sqrt(dx * dx + dy * dy);
          if (mag > 0) {
            p.x += (dx / mag) * speed;
            p.y += (dy / mag) * speed;
          }

          p.x = Math.max(p.radius, Math.min(ARENA_SIZE - p.radius, p.x));
          p.y = Math.max(p.radius, Math.min(ARENA_SIZE - p.radius, p.y));

          // Resolve collisions against placed builds
          p.elevation = 0;
          stateRef.current.builds.forEach((bld) => {
            if (bld.type === "wall" || bld.type === "roof") {
              const nearX = Math.max(bld.x, Math.min(p.x, bld.x + bld.w));
              const nearY = Math.max(bld.y, Math.min(p.y, bld.y + bld.h));
              const d = Math.sqrt(Math.pow(p.x - nearX, 2) + Math.pow(p.y - nearY, 2));
              if (d < p.radius) {
                const angle = Math.atan2(p.y - nearY, p.x - nearX);
                p.x += Math.cos(angle) * (p.radius - d);
                p.y += Math.sin(angle) * (p.radius - d);
              }
            } else if (bld.type === "ramp") {
              // Elevated advantage when walking on ramp
              if (p.x >= bld.x && p.x <= bld.x + bld.w && p.y >= bld.y && p.y <= bld.y + bld.h) {
                p.elevation = 1;
              }
            }
          });

          // Resolve collisions vs rocks & trees
          stateRef.current.resources.forEach((r) => {
            if (r.hp <= 0) return;
            const d = Math.sqrt(Math.pow(p.x - r.x, 2) + Math.pow(p.y - r.y, 2));
            if (d < p.radius + r.radius) {
              const angle = Math.atan2(p.y - r.y, p.x - r.x);
              p.x += Math.cos(angle) * (p.radius + r.radius - d);
              p.y += Math.sin(angle) * (p.radius + r.radius - d);
            }
          });

          // Auto steer camera tracking in aimbot or track mouse coords
          if (aimbotActive && stateRef.current.aimbotTarget) {
            const tgt = stateRef.current.aimbotTarget;
            const targetAngle = Math.atan2(tgt.y - p.y, tgt.x - p.x);
            // smooth angle easing
            p.angle += (targetAngle - p.angle) * 0.28;
          } else {
            const worldMouseX = mouse.x + stateRef.current.camera.x;
            const worldMouseY = mouse.y + stateRef.current.camera.y;
            p.angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
          }

          // 3. Auto Shoot Triggers
          if (mouse.isDown) {
            if (activeItem.id === "pickaxe") {
              const now = Date.now();
              if (now - p.lastSwingTime >= activeItem.fireRate) {
                p.lastSwingTime = now;
                shootPickaxe(p);
              }
            } else {
              const now = Date.now();
              if (now - p.lastShotTime >= activeItem.fireRate) {
                p.lastShotTime = now;
                shootWeaponsEntities(p, activeItem);
              }
            }
          }

          // Continuous Build placing if key is down and build hotkey active
          if (keys["z"] || keys["x"] || keys["c"] || keys["v"]) {
            const now = Date.now();
            if (now - p.lastPlaceTime >= 180) {
              p.lastPlaceTime = now;
              placeGridStructure(p, BUILD_MENU[stateRef.current.activeBuildIdx]);
            }
          }
        }

        // Camera scroll
        stateRef.current.camera.x = p.x - canvas.width / 2;
        stateRef.current.camera.y = p.y - canvas.height / 2;
        stateRef.current.camera.x = Math.max(0, Math.min(ARENA_SIZE - canvas.width, stateRef.current.camera.x));
        stateRef.current.camera.y = Math.max(0, Math.min(ARENA_SIZE - canvas.height, stateRef.current.camera.y));
      }

      // 4. Update Smart Sweat Bots Behaviour
      stateRef.current.bots.forEach((b) => {
        if (b.hp <= 0) {
          if (b.respawnTimer > 0) {
            b.respawnTimer--;
            if (b.respawnTimer === 0) b.hp = 100;
          }
          return;
        }

        // AI Tick Logic
        let closestOpponent = null;
        let dMin = 99999;

        // track player
        if (p.hp > 0) {
          const d = Math.sqrt(Math.pow(p.x - b.x, 2) + Math.pow(p.y - b.y, 2));
          if (d < dMin) { dMin = d; closestOpponent = p; }
        }
        // track other bots in FFA mode
        if (gameMode === "FFA") {
          stateRef.current.bots.forEach(o => {
            if (o.id !== b.id && o.hp > 0) {
              const d = Math.sqrt(Math.pow(o.x - b.x, 2) + Math.pow(o.y - b.y, 2));
              if (d < dMin) { dMin = d; closestOpponent = o; }
            }
          });
        }
        // track zombies
        stateRef.current.zombies.forEach(z => {
          if (z.hp > 0) {
            const d = Math.sqrt(Math.pow(z.x - b.x, 2) + Math.pow(z.y - b.y, 2));
            if (d < dMin) { dMin = d; closestOpponent = z; }
          }
        });

        if (closestOpponent) {
          b.angle = Math.atan2(closestOpponent.y - b.y, closestOpponent.x - b.x);

          if (dMin > 250) {
            // Chase
            b.x += Math.cos(b.angle) * b.speed * 0.85;
            b.y += Math.sin(b.angle) * b.speed * 0.85;

            // Occasionally build ramps
            const now = Date.now();
            if (botLevel !== "Casual" && now - b.lastBuildTime > 2000) {
              b.lastBuildTime = now;
              placeBotDefensiveCover(b, "ramp");
            }
          } else {
            // Strafe
            const strafe = b.angle + Math.PI / 2;
            b.x += Math.cos(strafe) * b.speed * 0.6;
            b.y += Math.sin(strafe) * b.speed * 0.6;
          }

          // Fire random weapons catalog in range
          const now = Date.now();
          const scaleRate = botLevel === "Champion" ? 180 : botLevel === "Sweaty" ? 400 : 800;
          if (now - b.lastShootTime >= scaleRate) {
            b.lastShootTime = now;
            const chosenEq = dMin < 120 ? WEAPONS_CATALOG[2] : WEAPONS_CATALOG[1]; // pump shotgun or scar
            shootWeaponsEntities(b, chosenEq);
          }
        }

        // Avoid building blocks boundaries
        stateRef.current.builds.forEach(bld => {
          if (bld.type === "wall" || bld.type === "roof") {
            const dX = Math.max(bld.x, Math.min(b.x, bld.x + bld.w));
            const dY = Math.max(bld.y, Math.min(b.y, bld.y + bld.h));
            const d = Math.sqrt(Math.pow(b.x - dX, 2) + Math.pow(b.y - dY, 2));
            if (d < b.radius) {
              // Sweat bots pickaxe construct blocks block immediately
              if (botLevel === "Champion" || botLevel === "Sweaty") {
                bld.hp -= 40;
                synth.playTone(330, 0.08, "triangle", 100, 0.1);
                if (bld.hp <= 0) destroyConstruct(bld.id);
              }
              const pushAngle = Math.atan2(b.y - dY, b.x - dX);
              b.x += Math.cos(pushAngle) * (b.radius - d);
              b.y += Math.sin(pushAngle) * (b.radius - d);
            }
          }
        });
      });

      // 5. Update Brain-Seeking Spooky Zombies
      stateRef.current.zombies.forEach((z) => {
        if (z.hp <= 0) return;

        // Hunt closest living entity (Player or AI Bots, or cars)
        let closestPrey = null;
        let dMin = 99999;

        if (p.hp > 0) {
          const d = Math.sqrt(Math.pow(p.x - z.x, 2) + Math.pow(p.y - z.y, 2));
          if (d < dMin) { dMin = d; closestPrey = p; }
        }
        stateRef.current.bots.forEach(b => {
          if (b.hp > 0) {
            const d = Math.sqrt(Math.pow(b.x - z.x, 2) + Math.pow(b.y - z.y, 2));
            if (d < dMin) { dMin = d; closestPrey = b; }
          }
        });

        if (closestPrey) {
          z.angle = Math.atan2(closestPrey.y - z.y, closestPrey.x - z.x);
          z.x += Math.cos(z.angle) * z.speed;
          z.y += Math.sin(z.angle) * z.speed;

          // Attack claw swipe
          if (dMin < z.radius + closestPrey.radius + 8) {
            const now = Date.now();
            if (now - z.lastAttackTime >= 1200) {
              z.lastAttackTime = now;
              const dmg = z.classType === "Goliath" ? 35 : z.classType === "Boomer" ? 18 : 12;
              mutateEntityHp(closestPrey, dmg, `${z.classType.toUpperCase()} Zombie Bite Strike`);
              synth.playTone(100, 0.2, "sawtooth", 20, 0.15);
              // green bloody splashes
              for (let i = 0; i < 5; i++) {
                stateRef.current.particles.push({
                  x: closestPrey.x, y: closestPrey.y,
                  vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
                  color: "#22c55e", size: Math.random() * 4 + 2, life: 18
                });
              }
            }
          }
        }

        // Avoid walls
        stateRef.current.builds.forEach(bld => {
          if (bld.type === "wall" || bld.type === "roof") {
            const dX = Math.max(bld.x, Math.min(z.x, bld.x + bld.w));
            const dY = Math.max(bld.y, Math.min(z.y, bld.y + bld.h));
            const d = Math.sqrt(Math.pow(z.x - dX, 2) + Math.pow(z.y - dY, 2));
            if (d < z.radius) {
              // zombies punch constructs down slowly
              bld.hp -= 5;
              if (bld.hp <= 0) destroyConstruct(bld.id);
              const pushAngle = Math.atan2(z.y - dY, z.x - dX);
              z.x += Math.cos(pushAngle) * (z.radius - d);
              z.y += Math.sin(pushAngle) * (z.radius - d);
            }
          }
        });
      });

      // 6. Update Aim Trainer Target patterns
      stateRef.current.aimTargets.forEach((t) => {
        t.x += t.vx;
        t.y += t.vy;
        // bounce edge boundaries
        if (t.x < 150 || t.x > ARENA_SIZE - 150) t.vx *= -1;
        if (t.y < 150 || t.y > ARENA_SIZE - 150) t.vy *= -1;
      });

      // 7. Update Bullets & Projectiles Tracing
      const remainingBullets = [];
      stateRef.current.bullets.forEach((bu) => {
        bu.x += bu.vx;
        bu.y += bu.vy;
        bu.travelled += Math.sqrt(bu.vx * bu.vx + bu.vy * bu.vy);

        let dead = bu.travelled >= bu.range;

        // Check builds collisions matching
        if (!dead) {
          for (let b of stateRef.current.builds) {
            if (bu.x >= b.x && bu.x <= b.x + b.w && bu.y >= b.y && bu.y <= b.y + b.h) {
              // Laser/Plasma passes wood if plasma, Wall blocks normal
              if (b.type === "wall" || b.type === "roof") {
                if (bu.isPlasma) {
                  b.hp -= bu.damage * 0.4;
                  bu.damage *= 0.8; // dim damage
                } else {
                  dead = true;
                  b.hp -= bu.damage;
                  if (b.hp <= 0) destroyConstruct(b.id);
                  break;
                }
              }
            }
          }
        }

        // Check resources collisions
        if (!dead) {
          for (let r of stateRef.current.resources) {
            if (r.hp > 0) {
              const d = Math.sqrt(Math.pow(bu.x - r.x, 2) + Math.pow(bu.y - r.y, 2));
              if (d < r.radius) {
                dead = true;
                r.hp -= bu.damage;
                break;
              }
            }
          }
        }

        // Check sports cars hit blocks
        if (!dead) {
          for (let c of stateRef.current.cars) {
            if (c.hp > 0) {
              const d = Math.sqrt(Math.pow(bu.x - c.x, 2) + Math.pow(bu.y - c.y, 2));
              if (d < c.radius) {
                dead = true;
                c.hp -= bu.damage;
                synth.playTone(400, 0.08, "sine", 150, 0.1);
                // car fire splash
                if (c.hp <= 0) {
                  triggerFieryExplosions(c.x, c.y);
                  notify(`${bu.ownerName.toUpperCase()} SHATTERED VEHICLE`);
                }
                break;
              }
            }
          }
        }

        // Check vs zombie entity targets
        if (!dead) {
          for (let z of stateRef.current.zombies) {
            if (z.hp > 0) {
              const d = Math.sqrt(Math.pow(bu.x - z.x, 2) + Math.pow(bu.y - z.y, 2));
              if (d < z.radius) {
                dead = true;
                applyBulletHitEffects(z, bu);
                break;
              }
            }
          }
        }

        // Check vs Trainer target rings
        if (!dead) {
          for (let t of stateRef.current.aimTargets) {
            const d = Math.sqrt(Math.pow(bu.x - t.x, 2) + Math.pow(bu.y - t.y, 2));
            if (d < t.radius) {
              dead = true;
              synth.playTone(880, 0.15, "sine", 440, 0.2); // sweet chime
              setTrainerScore(s => {
                const nextS = s + 100;
                if (nextS > trainerHighscore) setTrainerHighscore(nextS);
                return nextS;
              });
              
              // pop rings visual effects
              for (let j = 0; j < 8; j++) {
                stateRef.current.particles.push({
                  x: t.x, y: t.y,
                  vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
                  color: "#f43f5e", size: Math.random() * 4 + 2, life: 15
                });
              }

              // respawn
              t.x = 200 + Math.random() * (ARENA_SIZE - 400);
              t.y = 200 + Math.random() * (ARENA_SIZE - 400);
              t.vx = (Math.random() - 0.5) * 4;
              t.vy = (Math.random() - 0.5) * 4;
              break;
            }
          }
        }

        // Shoot player targets
        if (!dead && bu.ownerId !== "player") {
          // If player inside car, bullet hits the car
          if (p.drivingCarId) {
            const car = stateRef.current.cars.find(c => c.id === p.drivingCarId);
            if (car) {
              const d = Math.sqrt(Math.pow(bu.x - car.x, 2) + Math.pow(bu.y - car.y, 2));
              if (d < car.radius) {
                dead = true;
                car.hp -= bu.damage;
                if (car.hp <= 0) triggerFieryExplosions(car.x, car.y);
              }
            }
          } else {
            const d = Math.sqrt(Math.pow(bu.x - p.x, 2) + Math.pow(bu.y - p.y, 2));
            if (d < p.radius) {
              dead = true;
              applyBulletHitEffects(p, bu);
            }
          }
        }

        // Shoot opponent bots
        if (!dead) {
          for (let b of stateRef.current.bots) {
            if (b.hp > 0 && bu.ownerId !== b.id) {
              const d = Math.sqrt(Math.pow(bu.x - b.x, 2) + Math.pow(bu.y - b.y, 2));
              if (d < b.radius) {
                dead = true;
                applyBulletHitEffects(b, bu);
                break;
              }
            }
          }
        }

        if (!dead) {
          remainingBullets.push(bu);
        } else {
          // Explode if RPG rocket on bullet death!
          if (bu.isRocket) {
            triggerFieryExplosions(bu.x, bu.y);
          }
        }
      });
      stateRef.current.bullets = remainingBullets;

      // 8. Update transient cloud particles decay
      stateRef.current.particles = stateRef.current.particles.map(pa => {
        pa.x += pa.vx || 0;
        pa.y += pa.vy || 0;
        pa.life--;
        return pa;
      }).filter(p => p.life > 0);

      // Trigger Zombie wave spawns periodically in apocalypse
      if (gameMode === "ZOMBIE" && stateRef.current.zombies.filter(z => z.hp > 0).length < 5) {
        spawnZombieWave(8);
      }

      // Sync player state drivers for top layout UI
      setPlayerHp(p.hp);
      setPlayerShield(p.shield);
    };

    // Apply special weapons hit interactions
    const applyBulletHitEffects = (target, bu) => {
      // 1. Poison agent damage tags
      if (bu.isPoison) {
        if (!target.poisonTicks) target.poisonTicks = [];
        target.poisonTicks.push({ dmg: 4, count: 5, lastTime: Date.now() });
        notify("🧪 TOXIC POISON GAS EFFECT APPLIED");
      }

      // 2. Slow freeze ray slowing tags
      if (bu.isFreeze) {
        target.frozenTimer = 180; // slow down bot speed
        notify("❄️ CYRO SLOWDOWN EFFECT APPLIED");
        for (let i = 0; i < 6; i++) {
          stateRef.current.particles.push({
            x: target.x, y: target.y,
            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
            color: "#67e8f9", size: Math.random() * 4 + 1.5, life: 12
          });
        }
      }

      // 3. Vampire fiend bow lifestealing healing
      if (bu.isVampire && bu.ownerId === "player") {
        const p = stateRef.current.player;
        p.hp = Math.min(100, p.hp + Math.round(bu.damage * 0.35));
        synth.playTone(660, 0.1, "sine", 300, 0.1); // heal sound
        notify(`🏹 HEALED +${Math.round(bu.damage * 0.35)} HP VIA BLOODSUCK LIFESTEAL!`);
        for (let i = 0; i < 5; i++) {
          stateRef.current.particles.push({
            x: p.x, y: p.y,
            vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3,
            color: "#ec4899", size: Math.random() * 3 + 2, life: 15
          });
        }
      }

      // 4. normal damage mutating
      mutateEntityHp(target, bu.damage, bu.ownerName);
    };

    const triggerFieryExplosions = (x, y) => {
      synth.playTone(180, 0.45, "sawtooth", 20, 0.35); // rumble
      stateRef.current.screenShake = 18;

      // Expand fire circle splinters to break wall structures
      stateRef.current.builds.forEach(b => {
        const cenX = b.x + GRID_CELL / 2;
        const cenY = b.y + GRID_CELL / 2;
        const d = Math.sqrt(Math.pow(x - cenX, 2) + Math.pow(y - cenY, 2));
        if (d < 120) {
          b.hp -= 180; // massive blast damage
          if (b.hp <= 0) destroyConstruct(b.id);
        }
      });

      // Blast players, bots, and zombies
      const p = stateRef.current.player;
      if (Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 110) {
        mutateEntityHp(p, 55, "Air Rocket Strike Blast");
      }
      stateRef.current.bots.forEach(b => {
        if (b.hp > 0 && Math.sqrt(Math.pow(b.x - x, 2) + Math.pow(b.y - y, 2)) < 110) {
          mutateEntityHp(b, 55, "Air Rocket Strike Blast");
        }
      });
      stateRef.current.zombies.forEach(z => {
        if (z.hp > 0 && Math.sqrt(Math.pow(z.x - x, 2) + Math.pow(z.y - y, 2)) < 110) {
          z.hp = Math.max(0, z.hp - 100);
          if (z.hp <= 0) processZombieKill(z);
        }
      });

      // Spawn bright cloud fire particles
      for (let i = 0; i < 25; i++) {
        stateRef.current.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          color: Math.random() > 0.4 ? "#f97316" : "#ef4444",
          size: Math.random() * 8 + 3,
          life: 30
        });
      }
    };

    const processZombieKill = (z) => {
      const p = stateRef.current.player;
      p.mats.wood = Math.min(999, p.mats.wood + 40);
      p.mats.brick = Math.min(999, p.mats.brick + 25);
      p.mats.metal = Math.min(999, p.mats.metal + 15);
      setMaterials({ ...p.mats });
      
      setKillCount(k => k + 1);
      
      // Spawn zombie boomer volatile burst
      if (z.classType === "Boomer") {
        triggerFieryExplosions(z.x, z.y);
      }
      
      // drop minor blue shield shield potion pickup
      if (Math.random() > 0.6) {
        p.shield = Math.min(100, p.shield + 25);
        synth.playTone(450, 0.15, "sine", 300, 0.15);
        notify("🧪 PICKED UP SMALL SHIELD DROP (+25 SHIELD)");
      }
    };

    // Global Entity health manipulator helper
    const mutateEntityHp = (target, damage, attackerName) => {
      let finalDmg = damage;
      if (target.shield > 0) {
        const absorb = Math.min(target.shield, Math.round(damage * 0.5));
        target.shield -= absorb;
        finalDmg -= absorb;
      }
      
      target.hp = Math.max(0, target.hp - finalDmg);

      // Hit particles splatters
      for (let i = 0; i < 5; i++) {
        stateRef.current.particles.push({
          x: target.x, y: target.y,
          vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
          color: target.id === "player" ? "#ef4444" : "#f43f5e",
          size: Math.random() * 3.5 + 1.5,
          life: 16
        });
      }

      // Defending wall builds in SWEAT AIS when takes damage
      if (target.id !== "player" && target.hp > 0 && target.color) {
        const now = Date.now();
        if (botLevel !== "Casual" && now - target.lastBuildTime > 1500) {
          target.lastBuildTime = now;
          placeBotDefensiveCover(target, "wall");
        }
      }

      if (target.hp <= 0) {
        synth.playTone(200, 0.35, "sawtooth", 30, 0.25); // death groans
        const obituary = `${attackerName.toUpperCase()} ☠️ ELIMINATED 💀 ${target.name ? target.name.toUpperCase() : "ZOMBIE"}`;
        stateRef.current.killFeed.unshift({ id: Date.now(), msg: obituary });
        if (stateRef.current.killFeed.length > 5) stateRef.current.killFeed.pop();

        if (attackerName === "You") {
          setKillCount(k => k + 1);
          // Reward materials on elimination
          const pm = stateRef.current.player.mats;
          pm.wood = Math.min(999, pm.wood + 250);
          pm.brick = Math.min(999, pm.brick + 150);
          pm.metal = Math.min(999, pm.metal + 100);
          setMaterials({ ...pm });
          notify("👑 KILL ELIMINATION! +250 WOOD +150 STONE MATS ACCRUED");
        }

        evaluateMatchTriggers();
      }
    };

    const evaluateMatchTriggers = () => {
      const liveBots = stateRef.current.bots.filter(b => b.hp > 0);
      const isPlayerLive = stateRef.current.player.hp > 0;

      if (!isPlayerLive) {
        setDeathsCount(d => d + 1);
        if (gameMode === "1v1") {
          setIsGameOver(true);
          setWinner(stateRef.current.bots[0]?.name || "Challenger Bot");
        } else {
          // Auto respawn in continuous deathmatches
          setTimeout(() => {
            if (isPlaying && !isGameOver) respawnPlayerEntity();
          }, 4000);
        }
      } else if (gameMode !== "ZOMBIE" && gameMode !== "TRAINER" && liveBots.length === 0) {
        setIsGameOver(true);
        setWinner("You");
      }
    };

    const respawnPlayerEntity = () => {
      const p = stateRef.current.player;
      p.x = ARENA_SIZE / 2 + (Math.random() * 200 - 100);
      p.y = ARENA_SIZE / 2 + (Math.random() * 200 - 100);
      p.hp = 100;
      p.shield = 100;
      p.elevation = 0;
      p.poisonTicks = [];
      p.frozenTimer = 0;
      p.drivingCarId = null;
      notify("🔄 SLIDED BACK INTO ARENA COMBAT! READY TO REBUILD.");
    };

    // Melee pickaxe strike
    const shootPickaxe = (p) => {
      synth.playTone(392, 0.08, "triangle", 150, 0.1); // swing
      const reach = 52;
      const swX = p.x + Math.cos(p.angle) * reach;
      const swY = p.y + Math.sin(p.angle) * reach;

      let hit = false;

      // Mine world rocks/foliages
      stateRef.current.resources.forEach(r => {
        if (r.hp <= 0) return;
        const d = Math.sqrt(Math.pow(swX - r.x, 2) + Math.pow(swY - r.y, 2));
        if (d < r.radius + 15) {
          hit = true;
          r.hp -= 40;
          synth.playTone(260, 0.08, "sine", 120, 0.15); // crack
          const amount = 35 + Math.floor(Math.random() * 15);
          if (r.type === "tree") {
            p.mats.wood = Math.min(999, p.mats.wood + amount);
            notify(`🪵 +${amount} WOOD HARVESTED`);
          } else {
            p.mats.brick = Math.min(999, p.mats.brick + amount);
            notify(`🧱 +${amount} BRICK HARVESTED`);
          }
          setMaterials({ ...p.mats });

          for (let k = 0; k < 8; k++) {
            stateRef.current.particles.push({
              x: swX, y: swY,
              vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
              color: r.type === "tree" ? "#4ade80" : "#cbd5e1",
              size: Math.random() * 4 + 2, life: 20
            });
          }
        }
      });

      // Break constructs
      if (!hit) {
        stateRef.current.builds.forEach(b => {
          if (swX >= b.x && swX <= b.x + b.w && swY >= b.y && swY <= b.y + b.h) {
            hit = true;
            b.hp -= 90; // pickaxe deals immense structural damage
            synth.playTone(220, 0.08, "sine", 100, 0.12);
            for (let k = 0; k < 6; k++) {
              stateRef.current.particles.push({
                x: swX, y: swY,
                vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                color: b.type === "wall" ? "#b45309" : "#3b82f6",
                size: Math.random() * 3 + 1.5, life: 15
              });
            }
            if (b.hp <= 0) destroyConstruct(b.id);
          }
        });
      }

      // Hit zombies
      if (!hit) {
        stateRef.current.zombies.forEach(z => {
          if (z.hp > 0) {
            const d = Math.sqrt(Math.pow(swX - z.x, 2) + Math.pow(swY - z.y, 2));
            if (d < z.radius + 15) {
              hit = true;
              z.hp = Math.max(0, z.hp - 35);
              synth.playTone(180, 0.1, "triangle", 50, 0.15);
              if (z.hp <= 0) processZombieKill(z);
            }
          }
        });
      }

      // Hit opponent Bots
      if (!hit) {
        stateRef.current.bots.forEach(b => {
          if (b.hp > 0) {
            const d = Math.sqrt(Math.pow(swX - b.x, 2) + Math.pow(swY - b.y, 2));
            if (d < b.radius + 15) {
              hit = true;
              synth.playTone(150, 0.1, "sine", 80, 0.15);
              mutateEntityHp(b, 28, "You");
            }
          }
        });
      }
    };

    // Place building blocks
    const placeGridStructure = (p, currentSlot) => {
      const mouseW = mouse.x + stateRef.current.camera.x;
      const mouseH = mouse.y + stateRef.current.camera.y;

      const gX = Math.floor(mouseW / GRID_CELL) * GRID_CELL;
      const gY = Math.floor(mouseH / GRID_CELL) * GRID_CELL;

      // reach range
      const reach = Math.sqrt(Math.pow(gX + GRID_CELL / 2 - p.x, 2) + Math.pow(gY + GRID_CELL / 2 - p.y, 2));
      if (reach > 240) return;

      const category = currentSlot.material;
      if (p.mats[category] < currentSlot.cost) {
        notify(`⚠️ LACKING ${category.toUpperCase()} COMPONENT RESOURCE MATS!`);
        return;
      }

      // scan overlaps
      let duplicate = false;
      stateRef.current.builds.forEach(b => {
        if (b.x === gX && b.y === gY && b.type === currentSlot.id) duplicate = true;
      });

      if (!duplicate) {
        p.mats[category] -= currentSlot.cost;
        setMaterials({ ...p.mats });
        synth.playTone(440, 0.08, "sine", 220, 0.1); // wood crackle

        stateRef.current.builds.push({
          id: `bld-${Date.now()}-${Math.random()}`,
          x: gX, y: gY, w: GRID_CELL, h: GRID_CELL,
          type: currentSlot.id,
          material: currentSlot.material,
          hp: currentSlot.id === "wall" ? 250 : 150,
          maxHp: currentSlot.id === "wall" ? 250 : 150,
          owner: "player"
        });

        // sparks
        for (let j = 0; j < 10; j++) {
          stateRef.current.particles.push({
            x: gX + GRID_CELL/2, y: gY + GRID_CELL/2,
            vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
            color: currentSlot.color, size: Math.random() * 4 + 2, life: 18
          });
        }
      }
    };

    const placeBotDefensiveCover = (bot, type) => {
      const gX = Math.floor(bot.x / GRID_CELL) * GRID_CELL;
      const gY = Math.floor(bot.y / GRID_CELL) * GRID_CELL;
      const dX = Math.sign(Math.cos(bot.angle)) * GRID_CELL;
      const dY = Math.sign(Math.sin(bot.angle)) * GRID_CELL;

      const placeX = gX + dX;
      const placeY = gY + dY;

      if (placeX < 0 || placeX > ARENA_SIZE || placeY < 0 || placeY > ARENA_SIZE) return;

      // add covers
      stateRef.current.builds.push({
        id: `bld-bot-${Date.now()}-${Math.random()}`,
        x: placeX, y: placeY, w: GRID_CELL, h: GRID_CELL,
        type: type,
        material: "wood",
        hp: 140, maxHp: 140,
        owner: bot.name
      });
    };

    const destroyConstruct = (id) => {
      stateRef.current.builds = stateRef.current.builds.filter(b => b.id !== id);
    };

    // Shoot gun bullet objects
    const shootWeaponsEntities = (shooter, slot) => {
      const isPlayer = shooter.id === "player";

      // Triggers synth pitch depending on weapon class
      if (slot.id === "scar_ar") synth.playTone(380, 0.1, "sawtooth", 100, 0.12);
      else if (slot.id === "pump_shotgun") synth.playTone(180, 0.2, "triangle", 30, 0.25);
      else if (slot.id === "heavy_sniper") synth.playTone(650, 0.35, "square", 80, 0.22);
      else if (slot.id === "rapid_smg") synth.playTone(450, 0.08, "sine", 120, 0.09);
      else if (slot.id === "rpg_launcher") synth.playTone(220, 0.18, "sawtooth", 50, 0.22);
      else if (slot.id === "toxic_ray") synth.playTone(320, 0.1, "sine", 200, 0.06);
      else if (slot.id === "orbit_laser") synth.playTone(720, 0.06, "square", 440, 0.08);
      else if (slot.id === "drum_gun") synth.playTone(340, 0.12, "sawtooth", 90, 0.12);
      else if (slot.id === "grenade") synth.playTone(280, 0.14, "sine", 80, 0.15);
      else if (slot.id === "freeze_ray") synth.playTone(480, 0.15, "square", 300, 0.1);
      else if (slot.id === "vampire_bow") synth.playTone(520, 0.12, "sine", 250, 0.12);
      else if (slot.id === "plasma_cannon") synth.playTone(200, 0.22, "triangle", 100, 0.18);
      else if (slot.id === "hand_cannon") synth.playTone(550, 0.2, "sawtooth", 40, 0.2);
      else if (slot.id === "minigun") synth.playTone(420, 0.07, "sawtooth", 150, 0.14);

      const radiusOffset = shooter.radius + 15;
      const muzzleX = shooter.x + Math.cos(shooter.angle) * radiusOffset;
      const muzzleY = shooter.y + Math.sin(shooter.angle) * radiusOffset;

      if (isPlayer) {
        stateRef.current.screenShake = slot.id === "heavy_sniper" ? 14 : slot.id === "pump_shotgun" ? 10 : 2;
      }

      // Minigun shell casings visual detail
      if (slot.id === "minigun" || slot.id === "rapid_smg") {
        stateRef.current.particles.push({
          x: muzzleX, y: muzzleY,
          vx: Math.cos(shooter.angle + Math.PI/2) * (Math.random()*2+2) + (Math.random()-0.5)*1,
          vy: Math.sin(shooter.angle + Math.PI/2) * (Math.random()*2+2) + (Math.random()-0.5)*1,
          color: "#fbbf24", size: 1.5, life: 10
        });
      }

      const bulletCount = slot.projectiles || 1;
      for (let i = 0; i < bulletCount; i++) {
        const spreadAngle = shooter.angle + (Math.random() - 0.5) * (slot.spread || 0.01);
        
        stateRef.current.bullets.push({
          ownerId: shooter.id,
          ownerName: shooter.name || "You",
          elevationCheck: shooter.elevation || 0,
          x: muzzleX, y: muzzleY,
          vx: Math.cos(spreadAngle) * (slot.speed || 16),
          vy: Math.sin(spreadAngle) * (slot.speed || 16),
          damage: slot.damage,
          range: slot.range || 500,
          color: slot.color,
          travelled: 0,
          isRocket: slot.isRocket,
          isPoison: slot.isPoison,
          isLaser: slot.isLaser,
          isFreeze: slot.isFreeze,
          isVampire: slot.isVampire,
          isPlasma: slot.isPlasma,
          isThrowable: slot.isThrowable
        });
      }

      // Muzzle flashes flares
      for (let i = 0; i < 5; i++) {
        stateRef.current.particles.push({
          x: muzzleX, y: muzzleY,
          vx: Math.cos(shooter.angle) * (Math.random() * 4 + 3) + (Math.random() - 0.5) * 1.5,
          vy: Math.sin(shooter.angle) * (Math.random() * 4 + 3) + (Math.random() - 0.5) * 1.5,
          color: slot.color, size: Math.random() * 3 + 1, life: 12
        });
      }
    };

    // Full 2D HTML5 canvas draw engine
    const renderTick = () => {
      const p = stateRef.current.player;
      const camera = stateRef.current.camera;
      const activeSlot = stateRef.current.activeSlot;

      ctx.save();
      // Apply screenshake
      if (stateRef.current.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * stateRef.current.screenShake;
        const shakeY = (Math.random() - 0.5) * stateRef.current.screenShake;
        ctx.translate(shakeX, shakeY);
        stateRef.current.screenShake *= 0.88;
        if (stateRef.current.screenShake < 0.15) stateRef.current.screenShake = 0;
      }

      ctx.translate(-camera.x, -camera.y);

      // 1. Draw Grid Ground
      ctx.fillStyle = "#0c1020"; // Cyber night dark blueprint slate
      ctx.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE);

      // Grid line grids
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      for (let x = 0; x < ARENA_SIZE; x += GRID_CELL) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ARENA_SIZE); ctx.stroke();
      }
      for (let y = 0; y < ARENA_SIZE; y += GRID_CELL) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ARENA_SIZE, y); ctx.stroke();
      }

      // Outer force fields neon glow border
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 8;
      ctx.strokeRect(0, 0, ARENA_SIZE, ARENA_SIZE);

      // 2. Draw placed build structures
      stateRef.current.builds.forEach((b) => {
        const pctHp = b.hp / b.maxHp;
        // Wood / brick / metal colors
        let fill = "rgba(180, 83, 9, 0.4)";
        let stroke = "#b45309";
        if (b.material === "brick") {
          fill = "rgba(148, 163, 184, 0.45)"; stroke = "#94a3b8";
        } else if (b.material === "metal") {
          fill = "rgba(234, 179, 8, 0.35)"; stroke = "#eab308";
        }

        ctx.fillStyle = fill;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 3;
        ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);

        if (b.type === "wall") {
          ctx.beginPath(); ctx.moveTo(b.x, b.y + b.h/2); ctx.lineTo(b.x + b.w, b.y + b.h/2); ctx.stroke();
        } else if (b.type === "ramp") {
          for (let stair = 10; stair < b.h; stair += 12) {
            ctx.beginPath(); ctx.moveTo(b.x + 4, b.y + stair); ctx.lineTo(b.x + b.w - 4, b.y + stair); ctx.stroke();
          }
        } else if (b.type === "roof") {
          ctx.beginPath();
          ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.w, b.y + b.h);
          ctx.moveTo(b.x + b.w, b.y); ctx.lineTo(b.x, b.y + b.h);
          ctx.stroke();
        }

        // Structural HP gauge
        if (pctHp < 1) {
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(b.x + 4, b.y + 4, b.w - 8, 5);
          ctx.fillStyle = pctHp > 0.45 ? "#22c55e" : "#ef4444";
          ctx.fillRect(b.x + 4, b.y + 4, (b.w - 8) * pctHp, 5);
        }
      });

      // 3. Draw World scattered Trees / Rocks
      stateRef.current.resources.forEach((r) => {
        if (r.hp <= 0) return;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(r.type === "tree" ? "WOOD WOOD" : "STONE ROCK", r.x, r.y + 3);
      });

      // 4. Draw Blueprint Placement Hologram Grid Highlights
      if (p.hp > 0 && activeSlot.id === "pickaxe" && (keys["z"] || keys["x"] || keys["c"] || keys["v"])) {
        const worldM_X = mouse.x + camera.x;
        const worldM_Y = mouse.y + camera.y;
        const gX = Math.floor(worldM_X / GRID_CELL) * GRID_CELL;
        const gY = Math.floor(worldM_Y / GRID_CELL) * GRID_CELL;
        const dist = Math.sqrt(Math.pow(gX + GRID_CELL/2 - p.x, 2) + Math.pow(gY + GRID_CELL/2 - p.y, 2));

        if (dist <= 240) {
          ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
          ctx.fillRect(gX, gY, GRID_CELL, GRID_CELL);
          ctx.strokeStyle = "#38bdf8";
          ctx.strokeRect(gX, gY, GRID_CELL, GRID_CELL);
        }
      }

      // 5. Draw Sports Cars Vehicles
      stateRef.current.cars.forEach((c) => {
        if (c.hp <= 0) return;
        
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.angle);

        // Body chassis
        ctx.fillStyle = c.color;
        ctx.fillRect(-26, -14, 52, 28);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(-26, -14, 52, 28);

        // Windshield glass
        ctx.fillStyle = "rgba(14, 165, 233, 0.65)";
        ctx.fillRect(4, -10, 10, 20);

        // Sports tires
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(-18, -17, 10, 4);
        ctx.fillRect(8, -17, 10, 4);
        ctx.fillRect(-18, 13, 10, 4);
        ctx.fillRect(8, 13, 10, 4);

        // Racing spoiler lip
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(-28, -15, 4, 30);

        // Headlights beams
        ctx.fillStyle = "rgba(254, 240, 138, 0.15)";
        ctx.beginPath();
        ctx.moveTo(26, -6);
        ctx.lineTo(80, -25);
        ctx.lineTo(80, 25);
        ctx.lineTo(26, 6);
        ctx.fill();

        ctx.restore();

        // HP bar above car
        if (c.hp < c.maxHp) {
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(c.x - 20, c.y - 28, 40, 4);
          ctx.fillStyle = "#22c55e";
          ctx.fillRect(c.x - 20, c.y - 28, 40 * (c.hp / c.maxHp), 4);
        }

        // Indicator
        if (!c.driverId) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "9px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("PRESS [F] TO DRIVE DRIVE CAR", c.x, c.y - 32);
        }
      });

      // 6. Draw Bullets & Laser tracings
      stateRef.current.bullets.forEach((bu) => {
        ctx.save();
        ctx.strokeStyle = bu.color;
        ctx.lineWidth = bu.isPlasma ? 7 : bu.isLaser ? 4 : 2.5;
        
        ctx.beginPath();
        ctx.moveTo(bu.x - bu.vx * 1.5, bu.y - bu.vy * 1.5);
        ctx.lineTo(bu.x, bu.y);
        ctx.stroke();
        ctx.restore();
      });

      // 7. Draw flying particles
      stateRef.current.particles.forEach((pa) => {
        ctx.fillStyle = pa.color || "#ffffff";
        ctx.fillRect(pa.x, pa.y, pa.size || 2.5, pa.size || 2.5);
      });

      // 8. Draw Brain-Seeking Zombies walking models
      stateRef.current.zombies.forEach((z) => {
        if (z.hp <= 0) return;
        ctx.save();
        ctx.translate(z.x, z.y);
        ctx.rotate(z.angle);

        // Walking leg wobbler animations
        const legWobble = Math.sin(Date.now() * 0.015) * 6;

        ctx.fillStyle = z.color;
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#14532d";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ghoulish spooky arms pointing out
        ctx.fillStyle = "#15803d";
        ctx.fillRect(4, -8, 12, 4);
        ctx.fillRect(4 + legWobble/2, 4, 12, 4);

        // Angry red eyes dots
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(5, -4, 2, 0, Math.PI*2);
        ctx.arc(5, 4, 2, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();

        // Hp bar zombie overlay
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(z.x - 15, z.y - z.radius - 10, 30, 3.5);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(z.x - 15, z.y - z.radius - 10, 30 * (z.hp / z.maxHp), 3.5);
      });

      // 9. Draw Trainer Mode static Target Dummies
      stateRef.current.aimTargets.forEach((t) => {
        // Red Bullseye concentric rings
        ctx.save();
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath(); ctx.arc(t.x, t.y, t.radius, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(t.x, t.y, t.radius * 0.65, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath(); ctx.arc(t.x, t.y, t.radius * 0.3, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // 10. Draw living human player model
      if (p.hp > 0 && !p.drivingCarId) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        // Body skin circle
        ctx.fillStyle = "#06b6d4"; // Cyan skin player
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = p.elevation === 1 ? 3.5 : 1.5;
        ctx.stroke();

        // Firing nozzle weapon model
        ctx.fillStyle = "#334155";
        if (activeSlot.id === "pickaxe") {
          // stick handle
          ctx.fillRect(5, -2, 20, 4);
          ctx.fillStyle = "#cbd5e1"; // pickaxe head
          ctx.fillRect(20, -9, 4, 18);
        } else {
          const wLen = activeSlot.id === "heavy_sniper" ? 27 : 18;
          ctx.fillRect(5, -3, wLen, 6);
          ctx.fillStyle = activeSlot.color || "#06b6d4";
          ctx.fillRect(5 + wLen, -2, 3, 4);
        }

        ctx.restore();

        // Name Tag above player
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px font-sans";
        ctx.textAlign = "center";
        const elev = p.elevation === 1 ? " 🔺 [RAMP ELEVATED]" : "";
        ctx.fillText(`You${elev}`, p.x, p.y - p.radius - 12);
      }

      // 11. Draw Custom opponent AI Bots
      stateRef.current.bots.forEach((b) => {
        if (b.hp <= 0) return;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);

        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // gun muzzle
        ctx.fillStyle = "#334155";
        ctx.fillRect(5, -2, 16, 4);

        ctx.restore();

        // Bots over bar tag UI
        ctx.fillStyle = "#ec4899";
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${b.name.toUpperCase()}`, b.x, b.y - b.radius - 12);

        // dual Health & shield gauge bars
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(b.x - 16, b.y - b.radius - 8, 32, 3);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(b.x - 16, b.y - b.radius - 8, 32 * (b.hp / 100), 3);

        if (b.shield > 0) {
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(b.x - 16, b.y - b.radius - 4, 32, 2.5);
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(b.x - 16, b.y - b.radius - 4, 32 * (b.shield / 100), 2.5);
        }
      });

      // 12. Draw Aimbot Glowing Scanner Overlay Locking!
      if (aimbotActive && stateRef.current.aimbotTarget && p.hp > 0) {
        const tgt = stateRef.current.aimbotTarget;
        ctx.save();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 8;
        ctx.setLineDash([3, 3]);

        // Draw HUD scanner locks rings
        ctx.beginPath();
        ctx.arc(tgt.x, tgt.y, tgt.radius + 14, 0, Math.PI * 2);
        ctx.stroke();

        // Locking square crosshairs
        ctx.setLineDash([]);
        ctx.strokeRect(tgt.x - tgt.radius - 8, tgt.y - tgt.radius - 8, tgt.radius * 2 + 16, tgt.radius * 2 + 16);

        // Text lock tag label
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText("AIMBOT_LOCKED", tgt.x, tgt.y - tgt.radius - 24);

        ctx.restore();
      }

      ctx.restore();
    };

    const loop = () => {
      mainGameEngines();
      renderTick();
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", keyListenerDown);
      window.removeEventListener("keyup", keyListenerUp);
      canvas.removeEventListener("mousemove", mouseMoveListener);
      canvas.removeEventListener("mousedown", mouseDownListener);
      canvas.removeEventListener("mouseup", mouseUpListener);
      canvas.removeEventListener("contextmenu", rightMenuBlocker);
    };
  }, [isPlaying, isGameOver, gameMode, botLevel, aimbotActive, equippedLoadout, goBackToMainLobby]);

  // Remove/replace weapon in equipped index
  const selectArmoryLoadoutSwap = (catalogId, indexToReplace) => {
    const item = WEAPONS_CATALOG.find(w => w.id === catalogId);
    if (!item) return;

    const nextLoadout = [...equippedLoadout];
    nextLoadout[indexToReplace] = item;
    setEquippedLoadout(nextLoadout);
    
    // update current slot selection if active index is replaced
    if (activeSlotIdx === indexToReplace) {
      stateRef.current.activeSlot = item;
    }
    synth.playTone(600, 0.12, "sine", 300, 0.12);
    notify(`⚔️ EQUIPPED ${item.name.toUpperCase()} TO SLOT KEY ${indexToReplace+1}`);
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto items-stretch select-none">
      
      {/* LEFT SIDEBAR: MODE CONTROLLER & ARMORY PACKS */}
      <div className="w-full xl:w-85 flex flex-col justify-between gap-5 shrink-0 bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
        
        <div className="space-y-4">
          
          {/* Header title */}
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-850">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/15">
              <Compass size={18} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">FORTNITE ARENA CHASSIS</h2>
              <span className="text-[10px] text-indigo-400 font-mono font-bold block">15 WEAPONS SELECTION BOARD</span>
            </div>
          </div>

          {/* Training reflex target score metrics */}
          {gameMode === "TRAINER" && isPlaying && (
            <div className="bg-gradient-to-r from-rose-950/20 to-rose-900/10 border border-rose-500/15 p-3 rounded-xl flex items-center justify-between text-xs font-mono text-rose-300">
              <div className="flex items-center gap-1.5">
                <Target size={14} className="text-rose-400" />
                <span>POPPED ACCURACY:</span>
              </div>
              <strong className="text-lg text-rose-400 font-extrabold">{trainerScore} XP</strong>
            </div>
          )}

          {/* 15 Customized weapons locker selector cards */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-350 block border-b border-slate-850 pb-1">🛡️ 15 WEAPONS REPLACEMENTS CHEST</h3>
            <span className="text-[9.5px] text-slate-500 block leading-tight">Click weapon card to swap into active Slot Key: (Key {activeSlotIdx+1})</span>
            
            <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-1">
              {WEAPONS_CATALOG.map((weapon) => {
                const isSelected = equippedLoadout.some(w => w.id === weapon.id);
                
                let rarityColor = "border-slate-800 text-slate-400 bg-slate-950/30";
                if (weapon.rarity === "Legendary") rarityColor = "border-amber-500/30 text-amber-300 bg-amber-500/5";
                if (weapon.rarity === "Mythic") rarityColor = "border-purple-500/30 text-purple-300 bg-purple-500/5";
                if (weapon.rarity === "Epic") rarityColor = "border-indigo-500/30 text-indigo-300 bg-indigo-500/5";

                return (
                  <button
                    key={weapon.id}
                    onClick={() => selectArmoryLoadoutSwap(weapon.id, activeSlotIdx)}
                    className={`flex flex-col items-start p-1.5 text-[10px] rounded-lg border text-left cursor-pointer transition-all ${rarityColor} ${
                      isSelected ? "ring-1 ring-indigo-500/60" : "hover:bg-slate-850"
                    }`}
                  >
                    <span className="font-bold truncate w-full">{weapon.name}</span>
                    <div className="flex justify-between w-full text-[8.5px] text-slate-500 mt-0.5">
                      <span>DMG: {weapon.damage}</span>
                      <span className="uppercase text-[8px]">{weapon.rarity}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match statistics logging if active */}
          {isPlaying && (
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono text-slate-500 block">ARENA FEED KILLS METRICOLOG</span>
              
              <div className="text-[10.5px] font-mono space-y-1.5 max-h-24 overflow-y-auto">
                {stateRef.current.killFeed.length === 0 ? (
                  <span className="text-slate-600 block italic text-[9.5px]">Awaiting elimination feeds...</span>
                ) : (
                  stateRef.current.killFeed.map((feed) => (
                    <div key={feed.id} className="text-indigo-300 leading-normal border-b border-slate-900/60 pb-1">
                      {feed.msg}
                    </div>
                  ))
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-850 text-xs font-mono">
                <div className="flex justify-between"><span>Kills:</span> <strong className="text-emerald-400">{killCount}</strong></div>
                <div className="flex justify-between"><span>Deaths:</span> <strong className="text-rose-450">{deathsCount}</strong></div>
              </div>
            </div>
          )}

          {/* Quick mode setter dashboard if not playing yet */}
          {!isPlaying && (
            <div className="space-y-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 block tracking-wide">CHOOSE MISSION BATTLEGROUND</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "1v1", name: "🏆 1v1 Sweat Duel" },
                    { id: "FFA", name: "💥 FFA Battle Royale" },
                    { id: "ZOMBIE", name: "🧟 Zombie Horde" },
                    { id: "TRAINER", name: "🎯 Aim Reflex Gym" }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setGameMode(m.id); synth.playTone(392, 0.08, "sine", 120, 0.1); }}
                      className={`px-2.5 py-1.5 text-[10.5px] font-bold rounded-lg border transition-all cursor-pointer ${
                        gameMode === m.id 
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                          : "bg-slate-950/40 border-slate-850 text-slate-450 hover:bg-slate-900"
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sweat speed controller for Bots AI */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 block tracking-wide">AI BOT SWEATY DIFFICULTY</label>
                <div className="grid grid-cols-4 gap-1">
                  {["Casual", "Pro", "Sweaty", "Champion"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => { setBotLevel(lvl); synth.playTone(392, 0.08, "sine", 120, 0.1); }}
                      className={`px-1 py-1 text-[10px] font-bold rounded border transition-all text-center cursor-pointer ${
                        botLevel === lvl 
                          ? "bg-amber-600/20 border-amber-500 text-amber-300"
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aim Assistant Locks settings */}
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
                <div className="text-left space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-300 block">🔥 RETICLE LOCK AIMBOT</span>
                  <span className="text-[8.5px] text-slate-500 block">Auto-align sights inside combat range</span>
                </div>
                <button
                  onClick={() => setAimbotActive(!aimbotActive)}
                  className={`px-3 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                    aimbotActive 
                      ? "bg-rose-500/10 border-rose-500 text-rose-300" 
                      : "bg-slate-900 border-slate-800 text-slate-450"
                  }`}
                >
                  {aimbotActive ? "ACTIVE ON" : "MUTED OFF"}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Audio muters bar */}
        <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-xs text-slate-500">
          <span>Synthesizer SFX Alerts</span>
          <button
            onClick={() => { synth.muted = !synth.muted; setIsMuted(synth.muted); }}
            className="p-1 px-2.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 flex items-center gap-1 cursor-pointer font-bold text-[9px]"
          >
            {isMuted ? <VolumeX size={10} /> : <Volume2 size={10} />}
            <span>{isMuted ? "MUTED" : "ON"}</span>
          </button>
        </div>

      </div>

      {/* RIGHT WORKBENCH: THE ACTUAL DRAW PLAYING AREA */}
      <div className="flex-1 flex flex-col justify-between bg-slate-950 border border-slate-900 p-4 rounded-3xl relative overflow-hidden">
        
        {/* Dynamic game alert bubble */}
        {feedback && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-indigo-900 border border-indigo-400 px-4 py-1 rounded-full text-[10.5px] font-black text-indigo-100 uppercase tracking-wider shadow-lg animate-bounce animate-duration-1000 shadow-indigo-600/25">
            {feedback}
          </div>
        )}

        {/* 🎮 1. LOBBY SCREEN MENU WITH ALL GAMES */}
        {!isPlaying && !isGameOver && (
          <div className="flex flex-col justify-start p-2 min-h-[490px] space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                <Compass size={20} className="animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="font-sans font-black text-white text-lg uppercase tracking-wider leading-none">
                  CYBER COMBAT MENU
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">CHOOSE YOUR SIMULATED ARENA ENTRY POINT &bull; CLICK TO MATCH</span>
              </div>
            </div>

            {/* List of Game Modes in a beautiful bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  id: "1v1", 
                  title: "🏆 1v1 Sweat Duel", 
                  badge: "PRO PLAYER SIMULATOR", 
                  desc: "Engage a hyper-sweaty, fast-building, target-tracking bot. Perfect place-controls, wall replacements, and high-ground jump shots.",
                  accent: "border-teal-500/30 hover:border-teal-400/60 bg-teal-950/10",
                  badgeBg: "bg-teal-500/10 text-teal-400 border-teal-500/20",
                  btnBg: "from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800",
                  icon: <Sword size={18} className="text-teal-400" />
                },
                { 
                  id: "FFA", 
                  title: "💥 FFA Battle Royale", 
                  badge: "SANDBOX WARZONE", 
                  desc: "A chaotic free-for-all arena with 5 aggressive build-swapping AI soldiers. Gain shields, high-grade ammo items, and wood ranks for every elimination.",
                  accent: "border-indigo-500/30 hover:border-indigo-400/60 bg-indigo-950/10",
                  badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                  btnBg: "from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800",
                  icon: <Skull size={18} className="text-indigo-400" />
                },
                { 
                  id: "ZOMBIE", 
                  title: "🧟 Mutant Zombie Horde", 
                  badge: "SURVIVAL HIGH SPEED PVE", 
                  desc: "Survive waves of toxic mutant horde swarms. Re-farm resources from wood elements, spawn neon sport cars, and run enemies over at max speeds!",
                  accent: "border-emerald-500/30 hover:border-emerald-400/60 bg-emerald-950/10",
                  badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                  btnBg: "from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800",
                  icon: <Activity size={18} className="text-emerald-400" />
                },
                { 
                  id: "TRAINER", 
                  title: "🎯 Aim Reflex Gym", 
                  badge: "WARMUP REACTION LAB", 
                  desc: "Practice target tracking speed with dynamic, bouncing holographic reflex globes. Track score metrics, hit timing, and reload reflex calibrators.",
                  accent: "border-rose-500/30 hover:border-rose-400/60 bg-rose-950/10",
                  badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                  btnBg: "from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800",
                  icon: <Target size={18} className="text-rose-400" />
                }
              ].map((mode) => (
                <div 
                  key={mode.id}
                  onClick={() => {
                    setGameMode(mode.id);
                    synth.playTone(392, 0.08, "sine", 120, 0.1);
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer group relative overflow-hidden h-[180px] ${mode.accent} ${
                    gameMode === mode.id ? "ring-2 ring-indigo-500 bg-slate-900/60" : "hover:bg-slate-900/40"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[8.5px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${mode.badgeBg}`}>
                        {mode.badge}
                      </span>
                      <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                        {mode.icon}
                      </div>
                    </div>
                    <h4 className="font-sans font-black text-white text-sm tracking-wide">
                      {mode.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed">
                      {mode.desc}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartMatch(mode.id);
                    }}
                    className={`mt-2.5 w-full py-2 bg-gradient-to-r text-white font-bold text-[10px] rounded-lg tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${mode.btnBg}`}
                  >
                    <Play size={9} fill="currentColor" /> Deploy Mission
                  </button>
                </div>
              ))}
            </div>

            {/* Sub-instructions on how to return */}
            <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-xl text-center text-xs text-slate-400 space-y-1 font-mono">
              <p>
                🎮 <strong>Quick Return Hotkey:</strong> While playing, press the <kbd className="bg-slate-950 px-1 border border-slate-700 rounded text-rose-300 font-bold mx-1 text-[10.5px]">ESC</kbd> or <kbd className="bg-slate-950 px-1 border border-slate-700 rounded text-rose-300 font-bold mx-1 text-[10.5px]">M</kbd> key anytime to immediately return back to this lobby menu!
              </p>
            </div>
          </div>
        )}

        {/* 🏆 2. DUEL FINAL Match result screen */}
        {isGameOver && (
          <div className="flex flex-col items-center justify-center text-center p-6 min-h-[460px] space-y-4">
            <div className="h-14 w-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center">
              <Trophy size={28} />
            </div>

            <div>
              <h3 className="font-sans font-black text-2xl uppercase tracking-wider text-white">
                SQUAD MATCH SETTLED
              </h3>
              <p className="text-slate-450 mt-1">
                {winner === "You" ? (
                  <strong className="text-base text-emerald-400 font-extrabold block mt-2">✨ VICTORY ROYALE! SWEAT BUILDERS VANQUISHED ✨</strong>
                ) : (
                  <span className="text-xs text-rose-450 block mt-2">Combat Champion: <strong className="text-rose-350 font-bold">{winner}</strong></span>
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={() => handleStartMatch(gameMode)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-heavy text-xs rounded-xl uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-indigo-600/15"
              >
                <RotateCcw size={12} /> Play Mode Again
              </button>

              <button
                onClick={goBackToMainLobby}
                className="px-6 py-3 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 font-bold text-xs rounded-xl uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all"
              >
                🏠 Return to Menu
              </button>
            </div>
          </div>
        )}

        {/* 🚀 3. COMBAT SIMULATION FIELD */}
        {isPlaying && !isGameOver && (
          <div className="flex flex-col gap-3.5 relative">
            
            {/* Status health & armor indicators */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-900 rounded-xl">
              
              <div className="flex items-center gap-4">
                {/* Health */}
                <div className="flex items-center gap-2">
                  <Heart size={14} className="text-rose-500 fill-rose-500" />
                  <span className="text-[10px] text-slate-500 font-mono">HP:</span>
                  <div className="w-20 bg-slate-900 h-2 rounded overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${playerHp}%` }} />
                  </div>
                  <strong className="text-xs text-white font-mono">{playerHp}</strong>
                </div>

                {/* Shield */}
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-blue-500 fill-blue-500" />
                  <span className="text-[10px] text-slate-500 font-mono">SHIELD:</span>
                  <div className="w-20 bg-slate-900 h-2 rounded overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${playerShield}%` }} />
                  </div>
                  <strong className="text-xs text-white font-mono">{playerShield}</strong>
                </div>
              </div>

              {/* Drive reminder */}
              <div className="text-[9px] bg-indigo-950/40 border border-indigo-900 text-indigo-300 font-mono px-2 py-0.5 rounded uppercase hidden sm:block">
                🚘 Press [F] near car to Drive
              </div>

              <div className="flex items-center gap-2">
                {/* Mode indicator */}
                <span className="text-[10px] font-black px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
                  {gameMode.toUpperCase()}
                </span>

                {/* Back to Menu Action Button */}
                <button
                  onClick={goBackToMainLobby}
                  className="px-2.5 py-1 bg-rose-600/15 hover:bg-rose-600/30 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                  title="Return to the Mode Menu [ESC or M]"
                >
                  Return to Menu
                </button>
              </div>

            </div>

            {/* Render Playfield */}
            <div className="relative border border-slate-900 rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
              <canvas 
                ref={canvasRef}
                width={800}
                height={420}
                className="w-full max-h-[420px] cursor-crosshair select-none block"
              />
            </div>

            {/* Quick slots hotbar */}
            <div className="flex flex-wrap gap-1.5 justify-center items-center py-1">
              {equippedLoadout.map((slot, idx) => {
                const isActive = activeSlotIdx === idx;
                return (
                  <button
                    key={`${slot.id}-${idx}`}
                    onClick={() => selectSlotIndex(idx)}
                    className={`p-2 px-3.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      isActive 
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/15" 
                        : "bg-slate-900 border-slate-850 hover:bg-slate-900 hover:border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-[11px] font-bold leading-none">{slot.name}</div>
                    <span className="text-[9px] bg-slate-950/80 px-1 py-0.2 rounded font-mono font-bold border border-slate-800">
                      KEY {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Placing component options selection indicators */}
            <div className="flex justify-center items-center gap-1 pb-1">
              {BUILD_MENU.map((build, idx) => {
                const isActiveBuild = stateRef.current.activeBuildIdx === idx;
                
                return (
                  <button
                    key={build.id}
                    onClick={() => {
                      stateRef.current.activeBuildIdx = idx;
                      synth.playTone(350, 0.05, "sine", 150, 0.05);
                    }}
                    className={`p-1.5 px-3 rounded text-[10px] border cursor-pointer transition-all flex items-center gap-1.5 ${
                      isActiveBuild 
                        ? "bg-amber-600 border-amber-500 text-white" 
                        : "bg-slate-900/40 border-slate-850 text-slate-450 hover:bg-slate-900"
                    }`}
                  >
                    <span>{build.name}</span>
                    <span className="text-[8.5px] font-mono bg-slate-950/60 px-1 py-0.2 rounded font-extrabold uppercase text-slate-500">
                      {build.id === "wall" ? "[Z]" : build.id === "floor" ? "[X]" : build.id === "ramp" ? "[C]" : "[V]"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Inventory Materials status indicators */}
            <div className="flex justify-center items-center gap-6 py-1.5 border-t border-slate-900 bg-slate-950/40 rounded-xl px-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>🪵 Wood:</span>
                <strong className="text-white font-black">{materials.wood} / 999</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🧱 Brick:</span>
                <strong className="text-white font-black">{materials.brick} / 999</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🛡️ Metal:</span>
                <strong className="text-white font-black">{materials.metal} / 999</strong>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
