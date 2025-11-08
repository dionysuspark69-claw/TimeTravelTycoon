import { useEvents } from "@/lib/stores/useEvents";
import { Card } from "./ui/card";
import { useEffect, useState } from "react";

export function ActiveEventsDisplay() {
  const activeEvents = useEvents(state => state.activeEvents);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newTimeRemaining: Record<string, number> = {};
      
      activeEvents.forEach(activeEvent => {
        const remaining = Math.max(0, Math.floor((activeEvent.endsAt - now) / 1000));
        newTimeRemaining[activeEvent.event.id] = remaining;
      });
      
      setTimeRemaining(newTimeRemaining);
    }, 100);
    
    return () => clearInterval(interval);
  }, [activeEvents]);
  
  if (activeEvents.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-20 left-4 space-y-2 pointer-events-auto z-10">
      {activeEvents.map((activeEvent) => {
        const remaining = timeRemaining[activeEvent.event.id] || 0;
        
        return (
          <Card 
            key={activeEvent.event.id}
            className="bg-purple-900/90 backdrop-blur-sm border-purple-500/50 p-3 min-w-[250px] animate-in slide-in-from-left"
          >
            <div className="flex items-start gap-2">
              <div className="text-2xl">{activeEvent.event.icon}</div>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm flex items-center justify-between">
                  <span>{activeEvent.event.name}</span>
                  <span className="text-yellow-300 text-xs">{remaining}s</span>
                </div>
                <div className="text-purple-200 text-xs mt-1">
                  {activeEvent.event.description}
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {activeEvent.event.multipliers.revenue && (
                    <div className="bg-green-500/20 text-green-300 text-[10px] px-2 py-0.5 rounded-full">
                      💰 x{activeEvent.event.multipliers.revenue}
                    </div>
                  )}
                  {activeEvent.event.multipliers.customers && (
                    <div className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-full">
                      👥 x{activeEvent.event.multipliers.customers}
                    </div>
                  )}
                  {activeEvent.event.multipliers.speed && (
                    <div className="bg-yellow-500/20 text-yellow-300 text-[10px] px-2 py-0.5 rounded-full">
                      ⚡ x{activeEvent.event.multipliers.speed}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
