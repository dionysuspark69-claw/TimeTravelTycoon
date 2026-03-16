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

const RARITY_BORDER: Record<ArtifactRarity, string> = {
  common:    "border-gray-500/50",
  uncommon:  "border-green-500/50",
  rare:      "border-blue-500/50",
  epic:      "border-purple-500/50",
  legendary: "border-orange-400/60",
};

const RARITY_TEXT: Record<ArtifactRarity, string> = {
  common:    "text-gray-400",
  uncommon:  "text-green-400",
  rare:      "text-blue-400",
  epic:      "text-purple-400",
  legendary: "text-orange-400",
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
  const [expanded, setExpanded] = useState(false);

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
    <div className="absolute bottom-2 left-2 z-10" style={{ maxWidth: expanded ? "220px" : "auto" }}>

      {/* Collapsed pill - always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 border transition-all hover:border-purple-400/50 active:scale-95 ${
          isComplete ? "border-yellow-500/40" : "border-purple-500/30"
        }`}
      >
        {/* Mini icons */}
        <div className="flex gap-0.5">
          {collection.artifacts.map((artifact) => {
            const found = hasArtifact(artifact.id);
            return (
              <div
                key={artifact.id}
                className={`w-5 h-5 rounded flex items-center justify-center ${
                  found ? RARITY_BG[artifact.rarity] : "bg-gray-800/60"
                }`}
                style={found ? { boxShadow: `0 0 4px ${RARITY_GLOW[artifact.rarity]}` } : {}}
              >
                {found ? (
                  <span style={{ fontSize: "9px" }}>{RARITY_EMOJI[artifact.rarity]}</span>
                ) : (
                  <span className="text-gray-600" style={{ fontSize: "8px" }}>?</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Count + expand indicator */}
        <span className={`text-xs font-bold shrink-0 ${isComplete ? "text-yellow-400" : "text-purple-300"}`}>
          {isComplete ? "⭐" : `${discovered.length}/${collection.artifacts.length}`}
        </span>
        <span className="text-gray-500 text-xs">{expanded ? "▼" : "▶"}</span>
      </button>

      {/* Expanded panel - slides down */}
      {expanded && (
        <div className="mt-1 bg-black/80 backdrop-blur-sm rounded-lg border border-purple-500/30 p-2 w-full">
          {/* Collection name + progress bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-purple-300 text-xs font-semibold truncate">
                {collection.name.replace(" Collection", "")}
              </span>
              {isComplete && (
                <span className="text-yellow-400 text-xs font-bold ml-1">Complete!</span>
              )}
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-yellow-400" : "bg-purple-400"}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* Artifact list */}
          <div className="space-y-1">
            {collection.artifacts.map((artifact) => {
              const found = hasArtifact(artifact.id);
              return (
                <div
                  key={artifact.id}
                  className={`flex items-center gap-1.5 rounded px-1.5 py-1 border ${
                    found
                      ? `bg-gray-800/40 ${RARITY_BORDER[artifact.rarity]}`
                      : "bg-gray-900/30 border-gray-700/20 opacity-50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                      found ? RARITY_BG[artifact.rarity] : "bg-gray-800"
                    }`}
                    style={found ? { boxShadow: `0 0 5px ${RARITY_GLOW[artifact.rarity]}` } : {}}
                  >
                    {found ? (
                      <span style={{ fontSize: "10px" }}>{RARITY_EMOJI[artifact.rarity]}</span>
                    ) : (
                      <span className="text-gray-600" style={{ fontSize: "9px" }}>?</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold truncate ${found ? "text-white" : "text-gray-600"}`}>
                      {found ? artifact.name : "???"}
                    </div>
                    {found && (
                      <div className={`text-xs ${RARITY_TEXT[artifact.rarity]}`}>
                        +{(artifact.revenueBonus * 100).toFixed(1)}% rev · <span className="capitalize">{artifact.rarity}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Set bonus */}
          {isComplete && (
            <div className="mt-2 bg-yellow-900/20 border border-yellow-500/30 rounded px-2 py-1">
              <div className="text-yellow-300 text-xs font-semibold">Set Bonus Active</div>
              <div className="text-yellow-400 text-xs">+{(collection.setBonusMultiplier * 100).toFixed(0)}% revenue</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
