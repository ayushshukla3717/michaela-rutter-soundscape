import { useCallback, useRef } from "react";
import * as Tone from "tone";

// Mobile-optimized audio context initialization
const initializeToneContext = async () => {
  // Configure for low latency on mobile
  if (Tone.getContext().state === "suspended") {
    Tone.setContext(
      new Tone.Context({
        latencyHint: "interactive",
        lookAhead: 0.01,
      })
    );
  }
  
  await Tone.start();
  
  // Resume audio when app regains focus (mobile browser optimization)
  const handleVisibility = async () => {
    if (document.visibilityState === "visible" && Tone.getContext().state !== "running") {
      await Tone.start();
    }
  };
  
  document.removeEventListener("visibilitychange", handleVisibility);
  document.addEventListener("visibilitychange", handleVisibility);
};

export const useAudioContext = () => {
  const isInitialized = useRef(false);

  const ensureAudioContext = useCallback(async () => {
    if (!isInitialized.current) {
      await initializeToneContext();
      isInitialized.current = true;
    } else if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
  }, []);

  return { ensureAudioContext, isInitialized };
};

// Touch event helper - prevents double-firing on mobile
export const useTouchHandler = (onPlay: () => void) => {
  const lastTouchTime = useRef(0);
  
  const handleTouch = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    
    // Prevent ghost clicks and double-firing
    if (e.type === "touchstart") {
      lastTouchTime.current = now;
      e.preventDefault();
      onPlay();
    } else if (e.type === "mousedown" || e.type === "click") {
      // Only fire mouse events if no recent touch
      if (now - lastTouchTime.current > 300) {
        onPlay();
      }
    }
  }, [onPlay]);
  
  return {
    onTouchStart: handleTouch,
    onMouseDown: handleTouch,
  };
};
