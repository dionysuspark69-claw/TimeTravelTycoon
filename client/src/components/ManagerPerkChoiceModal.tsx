import { useState } from "react";
import { useManagerPerks, MANAGER_PERK_BRANCHES } from "@/lib/stores/useManagerPerks";
import { MANAGER_TYPES } from "@/lib/stores/useManagers";
import { Button } from "./ui/button";

export function ManagerPerkChoiceModal() {
  const { pendingChoice, makeChoice } = useManagerPerks();
  const [selected, setSelected] = useState<string | null>(null);

  if (!pendingChoice) return null;

  const { managerId, milestone } = pendingChoice;
  const manager = MANAGER_TYPES.find(m => m.id === managerId);
  const branches = MANAGER_PERK_BRANCHES[managerId];
  const branch = branches?.find(b => b.milestone === milestone);

  if (!manager || !branch) return null;

  const handleChoose = () => {
    if (!selected) return;
    makeChoice(managerId, milestone, selected);
    setSelected(null);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border-2 border-cyan-500 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="text-center mb-4">
          <div
            className="text-lg font-bold mb-1"
            style={{ color: manager.color }}
          >
            {manager.name} reached Level {milestone}!
          </div>
          <div className="text-gray-400 text-sm">Choose a specialization</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Option A */}
          <button
            onClick={() => setSelected(branch.optionA.id)}
            className={`flex-1 rounded-lg border-2 p-3 text-left transition-all ${
              selected === branch.optionA.id
                ? "border-cyan-400 bg-cyan-500/20"
                : "border-gray-600 bg-gray-800 hover:border-gray-500"
            }`}
          >
            <div className="text-white font-semibold text-sm mb-1">{branch.optionA.name}</div>
            <div className="text-gray-400 text-xs">{branch.optionA.description}</div>
          </button>

          {/* Option B */}
          <button
            onClick={() => setSelected(branch.optionB.id)}
            className={`flex-1 rounded-lg border-2 p-3 text-left transition-all ${
              selected === branch.optionB.id
                ? "border-cyan-400 bg-cyan-500/20"
                : "border-gray-600 bg-gray-800 hover:border-gray-500"
            }`}
          >
            <div className="text-white font-semibold text-sm mb-1">{branch.optionB.name}</div>
            <div className="text-gray-400 text-xs">{branch.optionB.description}</div>
          </button>
        </div>

        <Button
          onClick={handleChoose}
          disabled={!selected}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 font-semibold"
        >
          Choose Specialization
        </Button>
      </div>
    </div>
  );
}
