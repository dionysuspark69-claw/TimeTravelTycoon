import { useEffect } from "react";
import { useAudio } from "@/lib/stores/useAudio";

export function SoundManager() {
  const { setBackgroundMusic, setHitSound, setSuccessSound, isMuted } = useAudio();
  
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);
    
    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.5;
    setHitSound(hit);
    
    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.5;
    setSuccessSound(success);
    
    return () => {
      bgMusic.pause();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);
  
  useEffect(() => {
    const bgMusic = useAudio.getState().backgroundMusic;
    if (bgMusic) {
      if (isMuted) {
        bgMusic.pause();
      } else {
        bgMusic.play().catch(() => {
          console.log("Background music play prevented");
        });
      }
    }
  }, [isMuted]);
  
  return null;
}
