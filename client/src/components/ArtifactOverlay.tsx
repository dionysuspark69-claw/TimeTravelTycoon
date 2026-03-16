import { useMemo, useState } from "react";
import { useArtifacts, ARTIFACT_COLLECTIONS, type ArtifactRarity } from "@/lib/stores/useArtifacts";
import { useIdleGame } from "@/lib/stores/useIdleGame";

const RARITY_GLOW: Record<ArtifactRarity, string> = {
  common:    "rgba(156,163,175,0.8)",
  uncommon:  "rgba(74,222,128,0.8)",
  rare:      "rgba(96,165,250,0.8)",
  epic:      "rgba(192,132,252,0.8)",
  legendary: "rgba(251,146,60,0.9)",
};

const RARITY_BG: Record<ArtifactRarity, string> = {
  common:    "bg-gray-600",
  uncommon:  "bg-green-600",
  rare:      "bg-blue-600",
  epic:      "bg-purple-600",
  legendary: "bg-orange-500",
};

const RARITY_EMOJI: Record<ArtifactRarity, string> = {
  common:    "🪨",
  uncommon:  "🌿",
  rare:      "💎",
  epic:      "🔮",
  legendary: "⭐",
};

export function ArtifactOverlay() {
  const currentDestination = useIdleGame((s) => s.currentDestination);
  const { hasArtifact, getCollectionProgress } = useArtifacts();
  const [tooltip, setTooltip] = useState<string | null>(null);

  const collection = useMemo(
    () => ARTIFACT_COLLECTIONS.find((c) => c.destinationId === currentDestination),
    [currentDestination]
  );

  if (!collection) return null;

  const discovered = collection.artifacts.filter((a) => hasArtifact(a.id));
  if (discovered.length === 0) return null;

  const progress = getCollectionProgress(currentDestination);
  const isComplete = progress >= 1;

  return (
    <div className="absolute bottom-2 left-2 right-2 pointer-events-none z-10">
      {/* Collection progress bar */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-gray-400 text-xs shrink-0">
          {collection.name.replace(" Collection", "")}
        </span>
        <div className="flex-1 h-1 bg-gray-800/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-yellow-400" : "bg-purple-400"}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className={`text-xs font-bold shrink-0 ${isComplete ? "text-yellow-400" : "text-purple-300"}`}>
          {discovered.length}/{collection.artifacts.length}
        </span>
      </div>

      {/* Artifact icons */}
      <div className="flex gap-1.5 flex-wrap pointer-events-auto">
        {collection.artifacts.map((artifact) => {
          const found = hasArtifact(artifact.id);
          return (
            <div
              key={artifact.id}
              className="relative"
              onMouseEnter={() => setTooltip(artifact.id)}
              onMouseLeave={() => setTooltip(null)}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                  found
                    ? `${RARITY_BG[artifact.rarity]} shadow-lg`
                    : "bg-gray-800/50 border border-gray-700/50"
                }`}
                style={
                  found
                    ? { boxShadow: `0 0 8px ${RARITY_GLOW[artifact.rarity]}` }
                    : {}
                }
              >
                {found ? (
                  <span>{RARITY_EMOJI[artifact.rarity]}</span>
                ) : (
                  <span className="text-gray-600 text-xs">?</span>
                )}
              </div>

              {/* Tooltip */}
              {tooltip === artifact.id && found && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none whitespace-nowrap">
                  <div className="bg-gray-900 border border-gray-600 rounded-lg px-2 py-1.5 text-xs shadow-xl">
                    <div className="font-bold text-white">{artifact.name}</div>
                    <div className="text-gray-400">{artifact.description}</div>
                    <div className="text-green-400 mt-0.5">+{(artifact.revenueBonus * 100).toFixed(1)}% revenue</div>
                    <div className={`capitalize mt-0.5 font-semibold ${
                      artifact.rarity === "legendary" ? "text-orange-400" :
                      artifact.rarity === "epic" ? "text-purple-400" :
                      artifact.rarity === "rare" ? "text-blue-400" :
                      artifact.rarity === "uncommon" ? "text-green-400" : "text-gray-400"
                    }`}>{artifact.rarity}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collection complete banner */}
      {isComplete && (
        <div className="mt-1.5 flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-lg px-2 py-1">
          <span className="text-yellow-400 text-xs font-bold">Collection Complete!</span>
          <span className="text-yellow-300 text-xs">+{(collection.setBonusMultiplier * 100).toFixed(0)}% revenue bonus active</span>
        </div>
      )}
    </div>
  );
}
