import { useState, useEffect } from "react";

const MESSAGES = [
  "BREAKING: Local man accidentally books round trip to the Jurassic Period. Dinosaur not impressed.",
  "MARKETS: ChronoCoin futures up 400% after temporal paradox confirmed profitable.",
  "WEATHER: Expect scattered temporal anomalies near the Cretaceous wing. Bring an umbrella.",
  "TRAVEL ADVISORY: The French Revolution is currently at capacity. Try the Renaissance instead.",
  "SCIENCE: Researchers confirm time travel does NOT cause grandfather paradoxes. Grandpa is fine.",
  "ECONOMY: ChronoTransit rated #1 time travel service for 47th consecutive year — retroactively.",
  "SPORTS: Time Travel Olympics postponed indefinitely due to competitors arriving before the event.",
  "TECH: New update allows booking trips to alternate timelines. Results may vary.",
  "TOURISM: Ancient Rome reports record visitor numbers. Colosseum wifi still spotty.",
  "ALERT: Customer left their phone in 1842. We are unable to return it.",
  "CLASSIFIED: Do NOT discuss the incident at 2087. Legal is handling it.",
  "TRENDING: #WouldYouGoBack going viral. Most users vote for free pizza era.",
  "NOTICE: Time machine #4 is running 3 minutes late. Ironically.",
  "REPORT: Satisfaction survey from 1066 AD delayed due to unavailability of internet.",
  "LOCAL: Man attempts to bet on sports using future knowledge. Loses anyway.",
];

export function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
        setVisible(true);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:flex absolute bottom-0 left-0 right-0 z-10 h-7 bg-black/70 items-center gap-2 px-3">
      <span className="text-cyan-400 text-xs font-bold shrink-0 border-r border-cyan-500/30 pr-2">
        📡 CHRONO NEWS
      </span>
      <span
        className={`text-cyan-300 text-xs transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {MESSAGES[currentIndex]}
      </span>
    </div>
  );
}
