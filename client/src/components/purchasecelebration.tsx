import { useState, useEffect } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";

export function PurchaseCelebration() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const unsub = useIdleGame.subscribe(
      (state) => state.timeMachineLevel,
      (level) => {
        if (level >= 2 && !localStorage.getItem("chronotransit_first_purchase_shown")) {
          localStorage.setItem("chronotransit_first_purchase_shown", "1");
          setShow(true);
          setTimeout(() => setShow(false), 2500);
        }
      }
    );
    return () => unsub();
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center transition-all duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-black/80 backdrop-blur-md border border-cyan-400/50 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20 text-center transition-all duration-300 ${
          show ? "scale-100" : "scale-95"
        }`}
      >
        <div className="text-6xl mb-3">⚡</div>
        <h2 className="text-2xl font-bold text-white mb-2">First Upgrade!</h2>
        <p className="text-gray-300 text-sm">
          Your time machine just got faster. This is only the beginning.
        </p>
      </div>
    </div>
  );
}
