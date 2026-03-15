import { useAdBoosts, AdBoostType } from "@/lib/stores/useAdBoosts";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tv, Zap, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// AdSense publisher ID
const AD_CLIENT = "ca-pub-7190597981311614";

// Declare adsbygoogle global
declare global {
  interface Window {
    adsbygoogle: {
      push: (config: object) => void;
    };
  }
}

// Lazily inject AdSense script the first time an ad is requested
function ensureAdSenseLoaded(): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src*="adsbygoogle"]')) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => resolve(); // fail gracefully
    document.head.appendChild(script);
  });
}

function showRewardedAd(): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      await ensureAdSenseLoaded();
      if (!window.adsbygoogle) {
        resolve(false);
        return;
      }
      window.adsbygoogle.push({
        ad_client: AD_CLIENT,
        ad_format: "rewarded",
        ad_slot: "auto",
        callback: {
          onAdDismissed: () => resolve(false),
          onAdViewed: () => resolve(true),
          onNoAd: () => resolve(false),
        },
      });
    } catch {
      resolve(false);
    }
  });
}

export function AdBoostPanel() {
  const {
    isWatchingAd,
    watchingAdType,
    adWatchStartedAt,
    startWatchingAd,
    completeAdWatch,
    cancelAdWatch,
    activeBoosts,
    cooldowns,
  } = useAdBoosts();

  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  // Auto-complete simulated ad after 5 seconds
  useEffect(() => {
    if (isWatchingAd && adWatchStartedAt) {
      const elapsed = Date.now() - adWatchStartedAt;
      if (elapsed >= 5000) completeAdWatch();
    }
  }, [isWatchingAd, adWatchStartedAt, completeAdWatch]);

  const handleWatchAd = useCallback(
    async (type: AdBoostType) => {
      startWatchingAd(type);
      const rewarded = await showRewardedAd();
      if (rewarded) {
        completeAdWatch();
      }
      // If not rewarded, simulated timer fallback continues
    },
    [startWatchingAd, completeAdWatch]
  );

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const getAdWatchProgress = () => {
    if (!isWatchingAd || !adWatchStartedAt) return 0;
    return Math.min(100, ((Date.now() - adWatchStartedAt) / 5000) * 100);
  };

  const renderAdBoostButton = (
    type: AdBoostType,
    icon: string,
    label: string,
    description: string
  ) => {
    const now = Date.now();
    const activeBoost = activeBoosts.find((b) => b.type === type);
    const cooldownData = cooldowns.find((c) => c.type === type);
    const available =
      !activeBoost && (!cooldownData || cooldownData.availableAt < now);
    const cooldownRemaining =
      cooldownData && cooldownData.availableAt > now
        ? cooldownData.availableAt - now
        : 0;
    const isCurrentlyWatching = isWatchingAd && watchingAdType === type;

    return (
      <Card
        key={type}
        className={`p-4 ${
          activeBoost
            ? "bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/70"
            : available
            ? "bg-gray-900/50 border-cyan-500/30 hover:border-cyan-500/60"
            : "bg-gray-900/30 border-gray-700/30"
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl">{icon}</div>
              <div>
                <h4 className="text-white font-semibold text-sm">{label}</h4>
                <p className="text-gray-400 text-xs">{description}</p>
              </div>
            </div>
            {activeBoost && <CheckCircle2 className="w-5 h-5 text-green-400" />}
          </div>

          {activeBoost && (
            <div className="bg-purple-900/30 rounded p-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300">Active Boost</span>
                <span className="text-white font-semibold">
                  {formatTime(activeBoost.endsAt - now)}
                </span>
              </div>
              <div className="mt-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all"
                  style={{
                    width: `${((activeBoost.endsAt - now) / activeBoost.duration) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {isCurrentlyWatching && (
            <div className="bg-cyan-900/30 rounded p-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-cyan-300">Watching Ad...</span>
                <span className="text-white font-semibold">
                  {formatTime(
                    Math.max(0, 5000 - (Date.now() - (adWatchStartedAt || 0)))
                  )}
                </span>
              </div>
              <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all animate-pulse"
                  style={{ width: `${getAdWatchProgress()}%` }}
                />
              </div>
            </div>
          )}

          {!activeBoost && !isCurrentlyWatching && (
            <Button
              onClick={() => handleWatchAd(type)}
              disabled={!available || isWatchingAd}
              className={`w-full min-h-[44px] ${
                available && !isWatchingAd
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  : "bg-gray-700"
              }`}
              size="sm"
            >
              <Tv className="w-4 h-4 mr-2" />
              {available
                ? "Watch Ad for Boost"
                : `Cooldown: ${formatTime(cooldownRemaining)}`}
            </Button>
          )}

          {isCurrentlyWatching && (
            <Button
              onClick={cancelAdWatch}
              variant="outline"
              className="w-full min-h-[44px]"
              size="sm"
            >
              Cancel
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Tv className="w-5 h-5 text-cyan-400" />
        <h3 className="text-white font-semibold text-lg">Ad Boosts</h3>
      </div>

      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <p className="text-cyan-200 text-xs">
            Watch short ads to get temporary boosts! Each boost type has a
            5-minute cooldown.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {renderAdBoostButton(
          "revenue",
          "💰",
          "2x Revenue",
          "Double your ChronoCoin earnings for 5 minutes"
        )}
        {renderAdBoostButton(
          "customers",
          "👥",
          "2x Customers",
          "Attract twice as many customers for 5 minutes"
        )}
        {renderAdBoostButton(
          "speed",
          "⚡",
          "1.5x Speed",
          "Faster trips for 5 minutes"
        )}
      </div>
    </div>
  );
}
