import { useState } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { Button } from "./ui/button";

interface TutorialStep {
  title: string;
  body: string;
  arrow?: "up-left" | "up-right" | "up-center";
}

const STEPS: TutorialStep[] = [
  {
    title: "Welcome to ChronoTransit!",
    body: "You run a time travel business. Customers are waiting.",
  },
  {
    title: "Your trip is underway!",
    body: "Watch customers board and travel through time!",
  },
  {
    title: "Spend ChronoCoins on Upgrades",
    body: "Spend ChronoCoins on upgrades to earn more per trip.",
    arrow: "up-left",
  },
  {
    title: "Unlock New Destinations",
    body: "Unlock new time periods for higher fares.",
    arrow: "up-right",
  },
  {
    title: "Build Your Team",
    body: "Hire managers to automate and amplify your operation.",
    arrow: "up-center",
  },
];

function ArrowIndicator({ direction }: { direction: "up-left" | "up-right" | "up-center" }) {
  const style: React.CSSProperties = {
    position: "absolute",
    top: "-32px",
    fontSize: "24px",
    lineHeight: 1,
  };

  if (direction === "up-left") {
    style.left = "10%";
    style.transform = "rotate(-30deg)";
  } else if (direction === "up-right") {
    style.right = "10%";
    style.transform = "rotate(30deg)";
  } else {
    style.left = "50%";
    style.transform = "translateX(-50%)";
  }

  return (
    <span style={style} aria-hidden="true">
      ↑
    </span>
  );
}

export function OnboardingTutorial() {
  const { tutorialShown, setTutorialShown } = useIdleGame();
  const [step, setStep] = useState(0);

  if (tutorialShown) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setTutorialShown();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    setTutorialShown();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center pb-4 px-4">
      <div className="pointer-events-auto relative max-w-sm w-full bg-gray-900/90 border-2 border-cyan-500 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
        {/* Arrow indicator */}
        {current.arrow && (
          <div className="relative h-8">
            <ArrowIndicator direction={current.arrow} />
          </div>
        )}

        {/* Title */}
        <h3 className="text-cyan-400 font-bold text-base mb-1">{current.title}</h3>

        {/* Body */}
        <p className="text-gray-200 text-sm mb-4">{current.body}</p>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-200 text-xs"
          >
            Skip
          </Button>
          <Button
            size="sm"
            onClick={handleNext}
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-4"
          >
            {isLast ? "Let's go!" : "Next"}
          </Button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? "bg-cyan-400" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
