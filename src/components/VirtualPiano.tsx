import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Piano } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Tone from "tone";

const whiteKeys = [
  { note: "C4", key: "a", display: "C" },
  { note: "D4", key: "s", display: "D" },
  { note: "E4", key: "d", display: "E" },
  { note: "F4", key: "f", display: "F" },
  { note: "G4", key: "g", display: "G" },
  { note: "A4", key: "h", display: "A" },
  { note: "B4", key: "j", display: "B" },
  { note: "C5", key: "k", display: "C" },
  { note: "D5", key: "l", display: "D" },
];

const blackKeys = [
  { note: "C#4", key: "w", display: "C#", position: 0 },
  { note: "D#4", key: "e", display: "D#", position: 1 },
  { note: "F#4", key: "t", display: "F#", position: 3 },
  { note: "G#4", key: "y", display: "G#", position: 4 },
  { note: "A#4", key: "u", display: "A#", position: 5 },
  { note: "C#5", key: "o", display: "C#", position: 7 },
];

export const VirtualPiano = () => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const isInitialized = useRef(false);

  // Initialize synth
  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.4,
        release: 0.8,
      },
    }).toDestination();
    
    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  const playNote = useCallback(async (note: string) => {
    if (!isInitialized.current) {
      await Tone.start();
      isInitialized.current = true;
    }
    
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(note, "8n");
    }
  }, []);

  const handleKeyPress = useCallback((note: string) => {
    setActiveKeys(prev => new Set(prev).add(note));
    playNote(note);
    
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }, 200);
  }, [playNote]);

  // Keyboard event handlers
  useEffect(() => {
    const keyToNote: Record<string, string> = {};
    whiteKeys.forEach(k => { keyToNote[k.key] = k.note; });
    blackKeys.forEach(k => { keyToNote[k.key] = k.note; });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = keyToNote[e.key.toLowerCase()];
      if (note && !activeKeys.has(note)) {
        handleKeyPress(note);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyPress, activeKeys]);

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-primary">
          <Piano className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Virtual Piano</h2>
          <p className="text-sm text-muted-foreground">
            Click keys or use keyboard: <span className="font-mono">A-L</span> (white), <span className="font-mono">W E T Y U O</span> (black)
          </p>
        </div>
      </div>

      <div className="relative h-64 bg-muted rounded-xl p-4 overflow-x-auto">
        <div className="relative flex justify-center items-end h-full min-w-[700px]">
          {/* White Keys */}
          {whiteKeys.map((key, index) => (
            <button
              key={key.note}
              onClick={() => handleKeyPress(key.note)}
              className={cn(
                "relative w-14 h-48 bg-gradient-to-b from-white to-gray-100 border-2 border-gray-300 rounded-b-lg shadow-lg mx-[1px]",
                "hover:from-gray-50 hover:to-gray-150 active:from-gray-200 active:to-gray-300",
                "transition-all duration-75 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
                activeKeys.has(key.note) && "from-primary/40 to-primary/60 border-primary scale-[0.98] shadow-inner"
              )}
            >
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-700">
                {key.display}
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-mono uppercase bg-gray-200 px-1.5 py-0.5 rounded">
                {key.key}
              </div>
            </button>
          ))}

          {/* Black Keys */}
          {blackKeys.map((key) => (
            <button
              key={key.note}
              onClick={() => handleKeyPress(key.note)}
              className={cn(
                "absolute w-9 h-28 bg-gradient-to-b from-gray-800 to-black border-2 border-gray-900 rounded-b-lg shadow-xl z-10",
                "hover:from-gray-700 hover:to-gray-900 active:from-gray-600 active:to-gray-800",
                "transition-all duration-75 cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary",
                activeKeys.has(key.note) && "from-secondary/80 to-secondary border-secondary scale-[0.98]"
              )}
              style={{
                left: `calc(50% - 350px + ${key.position * 58 + 40}px)`,
                top: "16px",
              }}
            >
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white">
                {key.display}
              </div>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-gray-400 font-mono uppercase">
                {key.key}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
        <p className="text-xs text-muted-foreground">
          🎹 Use your computer keyboard to play! White keys: <span className="font-mono bg-background px-1 rounded">A S D F G H J K L</span> | 
          Black keys: <span className="font-mono bg-background px-1 rounded">W E T Y U O</span>
        </p>
      </div>
    </Card>
  );
};
