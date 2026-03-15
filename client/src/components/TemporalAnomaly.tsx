import { useEffect, useState, useRef } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { formatChronoValue } from "@/lib/utils";
import { useAudio } from "@/lib/stores/useAudio";

const ANOMALY_MIN_INTERVAL = 25000; // 25s minimum between anomalies
const ANOMALY_MAX_INTERVAL = 60000; // 60s maximum
const ANOMALY_LIFETIME = 10000;     // 10s to click it

interface AnomalyState {
  id: number;
  x: number; // percent
  y: number; // percent
  reward: number;
  expiresAt: number;
}

export function TemporalAnomaly() {
  const [anomaly, setAnomaly] = useState<AnomalyState | null>(null);
  const [claimed, setClaimed] = useState<{ reward: number; x: number; y: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextSpawnRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const { getCurrentFare, timeMachineCount, addChronocoins } = useIdleGame();
  const { isMuted } = useAudio();

  const spawnAnomaly = () => {
    const fare = useIdleGame.getState().getCurrentFare();
    const count = useIdleGame.getState().timeMachineCount;
    const reward = Math.floor(fare * count * 30 + Math.random() * fare * count * 20);

    const x = 15 + Math.random() * 65; // keep away from edges
    const y = 15 + Math.random() * 55;
    idRef.current++;

    setAnomaly({
      id: idRef.current,
      x,
      y,
      reward,
      expiresAt: Date.now() + ANOMALY_LIFETIME,
    });

    // Auto-expire
    timerRef.current = setTimeout(() => {
      setAnomaly(null);
      scheduleNext();
    }, ANOMALY_LIFETIME);
  };

  const scheduleNext = () => {
    const delay = ANOMALY_MIN_INTERVAL + Math.random() * (ANOMALY_MAX_INTERVAL - ANOMALY_MIN_INTERVAL);
    nextSpawnRef.current = setTimeout(spawnAnomaly, delay);
  };

  useEffect(() => {
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (nextSpawnRef.current) clearTimeout(nextSpawnRef.current);
    };
  }, []);

  // Countdown ticker
  useEffect(() => {
    if (!anomaly) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, anomaly.expiresAt - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));
    }, 200);
    return () => clearInterval(interval);
  }, [anomaly]);

  const handleClick = () => {
    if (!anomaly) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    addChronocoins(anomaly.reward);
    setClaimed({ reward: anomaly.reward, x: anomaly.x, y: anomaly.y });
    setAnomaly(null);

    setTimeout(() => {
      setClaimed(null);
      scheduleNext();
    }, 1200);
  };

  const progress = anomaly ? ((anomaly.expiresAt - Date.now()) / ANOMALY_LIFETIME) * 100 : 0;

  return (
    <>
      {anomaly && (
        <button
          onClick={handleClick}
          className="absolute z-20 pointer-events-auto group"
          style={{ left: `${anomaly.x}%`, top: `${anomaly.y}%`, transform: "translate(-50%, -50%)" }}
        >
          {/* Pulsing ring */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full border-2 border-fuchsia-400/60 animate-ping" />
            <div className="absolute w-12 h-12 rounded-full border-2 border-fuchsia-300/40 animate-ping" style={{ animationDelay: "0.3s" }} />

            {/* Main button */}
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 border-2 border-fuchsia-300 shadow-lg shadow-fuchsia-500/50 flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-lg">⚡</span>
              <span className="text-white text-xs font-bold leading-none">{timeLeft}s</span>
            </div>

            {/* Reward label */}
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-fuchsia-300 text-xs font-bold px-2 py-0.5 rounded-full border border-fuchsia-500/40">
              +{formatChronoValue(anomaly.reward)} CC
            </div>

            {/* Progress arc (simple bar below) */}
            <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 w-14 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-fuchsia-400 rounded-full transition-all"
                style={{ width: `${Math.max(0, progress)}%` }}
              />
            </div>
          </div>

          {/* Label */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-fuchsia-200 animate-bounce">
            ANOMALY!
          </div>
        </button>
      )}

      {/* Claimed burst */}
      {claimed && (
        <div
          className="absolute z-20 pointer-events-none flex flex-col items-center animate-in fade-in zoom-in-50 duration-200"
          style={{ left: `${claimed.x}%`, top: `${claimed.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <div className="text-2xl">✨</div>
          <div className="text-fuchsia-300 font-bold text-sm bg-black/60 px-2 py-1 rounded-full border border-fuchsia-400/50">
            +{formatChronoValue(claimed.reward)} CC
          </div>
        </div>
      )}
    </>
  );
}
