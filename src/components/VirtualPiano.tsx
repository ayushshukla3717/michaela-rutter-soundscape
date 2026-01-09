import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Piano, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Tone from "tone";
import { useAudioContext } from "@/hooks/useAudioContext";

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
  const [volume, setVolume] = useState([75]);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  const { ensureAudioContext } = useAudioContext();
  const lastTouchTime = useRef(0);

  // Initialize synth with better piano-like sound
  useEffect(() => {
    volumeRef.current = new Tone.Volume(-6).toDestination();
    
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { 
        type: "fatsawtooth",
        count: 3,
        spread: 20
      },
      envelope: {
        attack: 0.005,  // Very fast attack for responsiveness
        decay: 0.3,
        sustain: 0.2,
        release: 1.2,
      },
      volume: -8,
    }).connect(volumeRef.current);
    
    // Add slight reverb for richness
    const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.15 }).toDestination();
    synthRef.current.connect(reverb);
    
    return () => {
      synthRef.current?.dispose();
      volumeRef.current?.dispose();
      reverb.dispose();
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (volumeRef.current) {
      volumeRef.current.volume.value = (volume[0] / 100) * 24 - 18;
    }
  }, [volume]);

  const playNote = useCallback(async (note: string) => {
    await ensureAudioContext();
    
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(note, "4n", Tone.now());
    }
  }, [ensureAudioContext]);

  const handleKeyPress = useCallback((note: string) => {
    setActiveKeys(prev => new Set(prev).add(note));
    playNote(note);
    
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }, 150);
  }, [playNote]);

  // Touch handler for mobile - prevents double-firing
  const handleTouch = useCallback((note: string, e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    
    if (e.type === "touchstart") {
      e.preventDefault();
      lastTouchTime.current = now;
      handleKeyPress(note);
    } else if (e.type === "mousedown") {
      if (now - lastTouchTime.current > 300) {
        handleKeyPress(note);
      }
    }
  }, [handleKeyPress]);

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
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-lg bg-gradient-primary">
          <Piano className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Virtual Piano</h2>
          <p className="text-sm text-muted-foreground">
            Tap keys or use keyboard: <span className="font-mono">A-L</span> (white), <span className="font-mono">W E T Y U O</span> (black)
          </p>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={volume}
          onValueChange={setVolume}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground w-10">{volume[0]}%</span>
      </div>

      <div className="relative h-48 md:h-64 bg-muted rounded-xl p-2 md:p-4 overflow-x-auto touch-pan-x">
        <div className="relative flex justify-center items-end h-full min-w-[500px] md:min-w-[700px]">
          {/* White Keys */}
          {whiteKeys.map((key) => (
            <button
              key={key.note}
              onTouchStart={(e) => handleTouch(key.note, e)}
              onMouseDown={(e) => handleTouch(key.note, e)}
              className={cn(
                "relative w-10 md:w-14 h-36 md:h-48 bg-gradient-to-b from-white to-gray-100 border-2 border-gray-300 rounded-b-lg shadow-lg mx-[1px]",
                "hover:from-gray-50 hover:to-gray-150 active:from-gray-200 active:to-gray-300",
                "transition-all duration-50 cursor-pointer focus:outline-none select-none",
                activeKeys.has(key.note) && "from-primary/40 to-primary/60 border-primary scale-[0.98] shadow-inner"
              )}
            >
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs md:text-sm font-bold text-gray-700">
                {key.display}
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] text-gray-400 font-mono uppercase bg-gray-200 px-1 py-0.5 rounded">
                {key.key}
              </div>
            </button>
          ))}

          {/* Black Keys */}
          {blackKeys.map((key) => (
            <button
              key={key.note}
              onTouchStart={(e) => handleTouch(key.note, e)}
              onMouseDown={(e) => handleTouch(key.note, e)}
              className={cn(
                "absolute w-7 md:w-9 h-20 md:h-28 bg-gradient-to-b from-gray-800 to-black border-2 border-gray-900 rounded-b-lg shadow-xl z-10",
                "hover:from-gray-700 hover:to-gray-900 active:from-gray-600 active:to-gray-800",
                "transition-all duration-50 cursor-pointer focus:outline-none select-none",
                activeKeys.has(key.note) && "from-secondary/80 to-secondary border-secondary scale-[0.98]"
              )}
              style={{
                left: `calc(50% - 250px + ${key.position * 42 + 30}px)`,
                top: "8px",
              }}
            >
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] md:text-[9px] font-bold text-white">
                {key.display}
              </div>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] md:text-[8px] text-gray-400 font-mono uppercase">
                {key.key}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
        <p className="text-xs text-muted-foreground">
          🎹 Keyboard: <span className="font-mono bg-background px-1 rounded">A S D F G H J K L</span> | 
          Black keys: <span className="font-mono bg-background px-1 rounded">W E T Y U O</span>
        </p>
      </div>
    </Card>
  );
};
