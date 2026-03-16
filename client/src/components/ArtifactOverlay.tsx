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
    // Bottom-left only, max 50% width so it never reaches the right side click zone
    <div className="absolute bottom-2 left-2 pointer-events-none z-10" style={{ maxWidth: "50%" }}>

      {/* Compact single row: progress bar + count + icons all inline */}
      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg px-1.5 py-1 border border-white/10">
        {/* Artifact icons - horizontal, no wrap */}
        <div className="flex gap-1 pointer-events-auto">
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
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-all ${
                    found
                      ? `${RARITY_BG[artifact.rarity]}`
                      : "bg-gray-800/50 border border-gray-700/30"
                  }`}
                  style={found ? { boxShadow: `0 0 6px ${RARITY_GLOW[artifact.rarity]}` } : {}}
                >
                  {found ? (
                    <span style={{ fontSize: "10px" }}>{RARITY_EMOJI[artifact.rarity]}</span>
                  ) : (
                    <span className="text-gray-600" style={{ fontSize: "9px" }}>?</span>
                  )}
                </div>

                {/* Tooltip - opens upward */}
                {tooltip === artifact.id && found && (
                  <div className="absolute bottom-8 left-0 z-50 pointer-events-none whitespace-nowrap">
                    <div className="bg-gray-900 border border-gray-600 rounded-lg px-2 py-1.5 text-xs shadow-xl">
                      <div className="font-bold text-white">{artifact.name}</div>
                      <div className="text-gray-400 max-w-[160px] whitespace-normal">{artifact.description}</div>
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

        {/* Progress count + optional complete star */}
        <span className={`text-xs font-bold ml-0.5 shrink-0 ${isComplete ? "text-yellow-400" : "text-purple-300"}`}>
          {isComplete ? "⭐" : `${discovered.length}/${collection.artifacts.length}`}
        </span>
      </div>
    </div>
  );
}
