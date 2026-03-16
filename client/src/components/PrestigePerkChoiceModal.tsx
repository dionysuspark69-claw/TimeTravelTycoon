import { useState, useMemo } from "react";
import { usePrestigePerks, PERK_DEFINITIONS, PerkId } from "@/lib/stores/usePrestigePerks";

function getEffectPreview(perkId: PerkId, currentLevel: number): string {
  const def = PERK_DEFINITIONS[perkId];
  const nextLevel = currentLevel + 1;
  const val = def.effect(nextLevel);
  switch (perkId) {
    case "offline_efficiency":
      return `Offline: ${Math.round(val * 100)}% efficiency`;
    case "artifact_luck":
      return `Artifact drops: ${val.toFixed(1)}x rate`;
    case "manager_xp":
      return `Manager costs: -${Math.round((1 - val) * 100)}%`;
    case "mission_rewards":
      return `Mission rewards: ${val.toFixed(2)}x`;
    case "machine_retention":
      return `Machines kept: +${val}`;
    case "destination_fares":
      return `Fares: ${val.toFixed(1)}x`;
    default:
      return "";
  }
}

export function PrestigePerkChoiceModal() {
  const { pendingChoice, chosenPerks, choosePerk } = usePrestigePerks();
  const [selected, setSelected] = useState<PerkId | null>(null);

  const choices = useMemo(() => {
    if (!pendingChoice) return [];
    const allPerkIds = Object.keys(PERK_DEFINITIONS) as PerkId[];
    const available = allPerkIds.filter(id => {
      const level = chosenPerks[id] || 0;
      return level < PERK_DEFINITIONS[id].maxLevel;
    });

    const pool = available.length >= 3 ? available : allPerkIds;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingChoice]);

  if (!pendingChoice) return null;

  const handleConfirm = () => {
    if (!selected) return;
    choosePerk(selected);
    setSelected(null);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 border-2 border-yellow-500/60 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-3xl mb-1">🏆</div>
          <h2 className="text-yellow-400 font-bold text-xl">Prestige Bonus!</h2>
          <p className="text-gray-400 text-sm mt-1">Choose a permanent upgrade to keep forever</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {choices.map((perkId) => {
            const def = PERK_DEFINITIONS[perkId];
            const currentLevel = chosenPerks[perkId] || 0;
            const isSelected = selected === perkId;
            const preview = getEffectPreview(perkId, currentLevel);

            return (
              <button
                key={perkId}
                onClick={() => setSelected(perkId)}
                className={`flex-1 rounded-lg border-2 p-3 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-yellow-500 bg-yellow-900/20"
                    : "border-gray-600 hover:border-cyan-500/70 hover:bg-cyan-900/10"
                }`}
              >
                <div className="text-2xl mb-1">{def.icon}</div>
                <div className="text-white font-semibold text-sm">{def.name}</div>
                <div className="text-gray-400 text-xs mt-0.5">{def.description}</div>
                <div className="text-cyan-300 text-xs mt-1 font-medium">{preview}</div>
                <div className="text-gray-500 text-xs mt-1">
                  Level {currentLevel} / {def.maxLevel}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected}
          className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
            selected
              ? "bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          Claim Upgrade
        </button>
      </div>
    </div>
  );
}
