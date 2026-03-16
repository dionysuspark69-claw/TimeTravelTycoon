import { useEffect, useRef, useMemo } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { EraDisplay } from "./EraDisplay";
import { TemporalAnomaly } from "./TemporalAnomaly";
import { ComboClick } from "./ComboClick";

// Era-specific theme configs
const ERA_THEMES: Record<string, {
  bg: string;
  accent: string;
  secondary: string;
  label: string;
  particles: string;
}> = {
  dinosaur:    { bg: "from-green-950 via-emerald-950 to-slate-950",    accent: "#2ecc71", secondary: "#145a32", label: "Jurassic Era",       particles: "#4ade80" },
  egypt:       { bg: "from-amber-950 via-yellow-950 to-stone-950",     accent: "#f39c12", secondary: "#7d4e00", label: "Ancient Egypt",      particles: "#fbbf24" },
  rome:        { bg: "from-red-950 via-rose-950 to-slate-950",         accent: "#c0392b", secondary: "#7b241c", label: "Roman Empire",       particles: "#f87171" },
  medieval:    { bg: "from-purple-950 via-violet-950 to-slate-950",    accent: "#9b59b6", secondary: "#4a235a", label: "Medieval Ages",      particles: "#c084fc" },
  viking:      { bg: "from-slate-950 via-blue-950 to-gray-950",        accent: "#607d8b", secondary: "#1c2a33", label: "Viking Age",         particles: "#94a3b8" },
  renaissance: { bg: "from-orange-950 via-amber-950 to-stone-950",     accent: "#e67e22", secondary: "#7e4a14", label: "Renaissance",        particles: "#fb923c" },
  industrial:  { bg: "from-gray-950 via-zinc-950 to-slate-950",        accent: "#7f8c8d", secondary: "#2c3e50", label: "Industrial Era",     particles: "#9ca3af" },
  wildwest:    { bg: "from-orange-950 via-red-950 to-stone-950",       accent: "#d35400", secondary: "#6e2c00", label: "Wild West",          particles: "#f97316" },
  roaring20s:  { bg: "from-yellow-950 via-amber-950 to-neutral-950",   accent: "#f1c40f", secondary: "#7d6608", label: "Roaring 20s",       particles: "#fde047" },
  spaceage:    { bg: "from-blue-950 via-indigo-950 to-slate-950",      accent: "#3498db", secondary: "#1a4a7a", label: "Space Age",          particles: "#60a5fa" },
  future:      { bg: "from-teal-950 via-cyan-950 to-slate-950",        accent: "#1abc9c", secondary: "#0e6655", label: "Future",             particles: "#2dd4bf" },
  cyberpunk:   { bg: "from-pink-950 via-fuchsia-950 to-purple-950",    accent: "#e91e63", secondary: "#880e4f", label: "Cyberpunk",          particles: "#f472b6" },
  atlantis:    { bg: "from-blue-950 via-sky-950 to-cyan-950",          accent: "#0288d1", secondary: "#01579b", label: "Atlantis",           particles: "#38bdf8" },
  prehistoric: { bg: "from-stone-950 via-brown-950 to-gray-950",       accent: "#795548", secondary: "#3e2723", label: "Prehistoric",        particles: "#a8816a" },
  mooncolony:  { bg: "from-slate-950 via-gray-950 to-zinc-950",        accent: "#90a4ae", secondary: "#37474f", label: "Moon Colony",        particles: "#cbd5e1" },
  aiutopia:    { bg: "from-cyan-950 via-blue-950 to-indigo-950",       accent: "#00bcd4", secondary: "#006064", label: "AI Utopia",          particles: "#22d3ee" },
  mars:        { bg: "from-red-950 via-orange-950 to-stone-950",       accent: "#e64a19", secondary: "#bf360c", label: "Mars Colony",        particles: "#fb7342" },
  timeorigin:  { bg: "from-violet-950 via-purple-950 to-indigo-950",   accent: "#7c4dff", secondary: "#311b92", label: "Time Origin",        particles: "#a78bfa" },
  quantum:     { bg: "from-purple-950 via-violet-950 to-fuchsia-950",  accent: "#aa00ff", secondary: "#6a1b9a", label: "Quantum Realm",      particles: "#d946ef" },
  paradise:    { bg: "from-green-950 via-emerald-950 to-teal-950",     accent: "#66bb6a", secondary: "#1b5e20", label: "Paradise",           particles: "#86efac" },
  timeloop:    { bg: "from-cyan-950 via-teal-950 to-green-950",        accent: "#26c6da", secondary: "#00838f", label: "Time Loop",          particles: "#67e8f9" },
  multiversal: { bg: "from-fuchsia-950 via-purple-950 to-violet-950",  accent: "#ab47bc", secondary: "#6a1b9a", label: "Multiverse",         particles: "#e879f9" },
  temporal:    { bg: "from-red-950 via-pink-950 to-purple-950",        accent: "#ef5350", secondary: "#b71c1c", label: "Temporal Rift",      particles: "#f87171" },
};

const DEFAULT_THEME = ERA_THEMES.spaceage;

function getTheme(era: string) {
  return ERA_THEMES[era] ?? DEFAULT_THEME;
}

// Floating particle that drifts upward and fades
function Particle({ x, delay, color, size }: { x: number; delay: number; color: string; size: number }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        bottom: "-8px",
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        boxShadow: `0 0 ${size * 2}px ${color}`,
        animation: `float2d ${4 + Math.random() * 4}s ease-in infinite`,
        animationDelay: `${delay}s`,
        opacity: 0,
      }}
    />
  );
}

// Animated grid floor
function GridFloor({ accent }: { accent: string }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(${accent}22 1px, transparent 1px),
          linear-gradient(90deg, ${accent}22 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        maskImage: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
      }}
    />
  );
}

// Glowing orb portal in the center
function Portal({ accent, secondary }: { accent: string; secondary: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Outer ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: "260px",
          height: "260px",
          border: `2px solid ${accent}44`,
          boxShadow: `0 0 40px ${accent}22, inset 0 0 40px ${accent}11`,
          animation: "spin2d 20s linear infinite",
        }}
      />
      {/* Middle ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: "200px",
          height: "200px",
          border: `1px solid ${accent}66`,
          boxShadow: `0 0 20px ${accent}33`,
          animation: "spin2d 12s linear infinite reverse",
        }}
      />
      {/* Core glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "120px",
          height: "120px",
          background: `radial-gradient(circle, ${secondary}99 0%, ${secondary}44 40%, transparent 70%)`,
          boxShadow: `0 0 60px ${accent}66, 0 0 120px ${accent}22`,
          animation: "pulse2d 3s ease-in-out infinite",
        }}
      />
      {/* Inner core */}
      <div
        className="absolute rounded-full"
        style={{
          width: "50px",
          height: "50px",
          background: `radial-gradient(circle, white 0%, ${accent} 50%, transparent 80%)`,
          boxShadow: `0 0 30px ${accent}, 0 0 60px ${accent}88`,
          animation: "pulse2d 2s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// Stars layer
function Stars() {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 70,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 4,
      dur: 2 + Math.random() * 3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: 0.4 + Math.random() * 0.5,
            animation: `twinkle2d ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Horizontal scan line (cyberpunk/sci-fi effect)
function ScanLine({ accent }: { accent: string }) {
  return (
    <div
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{
        background: `linear-gradient(90deg, transparent, ${accent}88, transparent)`,
        animation: "scan2d 6s linear infinite",
        top: 0,
      }}
    />
  );
}

// Time machine silhouettes on either side
function MachineSilhouettes({ accent, count }: { accent: string; count: number }) {
  const displayCount = Math.min(count, 5);
  return (
    <>
      {Array.from({ length: displayCount }, (_, i) => (
        <div
          key={i}
          className="absolute bottom-16 pointer-events-none"
          style={{
            left: i % 2 === 0 ? `${8 + i * 6}%` : undefined,
            right: i % 2 !== 0 ? `${8 + (i - 1) * 6}%` : undefined,
            opacity: 0.5 - i * 0.06,
            animation: `bob2d ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        >
          {/* Simple box silhouette for time machine */}
          <div style={{ position: "relative", width: "32px" }}>
            <div style={{ width: "32px", height: "20px", background: `${accent}44`, border: `1px solid ${accent}66`, borderRadius: "3px" }} />
            <div style={{ width: "16px", height: "8px", background: `${accent}33`, border: `1px solid ${accent}55`, borderRadius: "2px", margin: "0 auto" }} />
            <div style={{ width: "4px", height: "12px", background: `${accent}55`, margin: "0 auto", borderRadius: "2px" }} />
          </div>
        </div>
      ))}
    </>
  );
}

export function Scene2D() {
  const currentDestination = useIdleGame((s) => s.currentDestination);
  const timeMachineCount = useIdleGame((s) => s.timeMachineCount);
  const theme = getTheme(currentDestination);

  // Generate stable particles
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 5 + (i / 20) * 90,
      delay: i * 0.3,
      size: 3 + Math.random() * 4,
    })),
  []);

  return (
    <>
      {/* Inject keyframes once */}
      <style>{`
        @keyframes float2d {
          0%   { transform: translateY(0) scale(1);   opacity: 0; }
          10%  { opacity: 0.8; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(-280px) scale(0.3); opacity: 0; }
        }
        @keyframes spin2d {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse2d {
          0%, 100% { transform: scale(1);    opacity: 1; }
          50%       { transform: scale(1.12); opacity: 0.85; }
        }
        @keyframes twinkle2d {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }
        @keyframes scan2d {
          0%   { top: 0%;   opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes bob2d {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>

      <div
        className={`w-full h-[50vh] md:h-[60vh] relative overflow-hidden bg-gradient-to-b ${theme.bg}`}
      >
        <Stars />
        <ScanLine accent={theme.accent} />
        <Portal accent={theme.accent} secondary={theme.secondary} />
        <MachineSilhouettes accent={theme.accent} count={timeMachineCount} />
        <GridFloor accent={theme.accent} />

        {/* Floating particles */}
        {particles.map((p) => (
          <Particle
            key={p.id}
            x={p.x}
            delay={p.delay}
            color={theme.particles}
            size={p.size}
          />
        ))}

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        <EraDisplay />
        <TemporalAnomaly />
        <ComboClick />
      </div>
    </>
  );
}
