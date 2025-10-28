import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Piano } from "lucide-react";
import { cn } from "@/lib/utils";

const whiteKeys = [
  { note: "C", key: "A", freq: 261.63 },
  { note: "D", key: "S", freq: 293.66 },
  { note: "E", key: "D", freq: 329.63 },
  { note: "F", key: "F", freq: 349.23 },
  { note: "G", key: "G", freq: 392.00 },
  { note: "A", key: "H", freq: 440.00 },
  { note: "B", key: "J", freq: 493.88 },
  { note: "C2", key: "K", freq: 523.25 },
];

const blackKeys = [
  { note: "C#", key: "W", freq: 277.18, position: 1 },
  { note: "D#", key: "E", freq: 311.13, position: 2 },
  { note: "F#", key: "T", freq: 369.99, position: 4 },
  { note: "G#", key: "Y", freq: 415.30, position: 5 },
  { note: "A#", key: "U", freq: 466.16, position: 6 },
];

export const VirtualPiano = () => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  const playNote = (frequency: number, duration: number = 0.5) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  const handleKeyPress = (note: string, frequency: number) => {
    setActiveKeys(prev => new Set(prev).add(note));
    playNote(frequency);
    
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }, 200);
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-primary">
          <Piano className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Virtual Piano</h2>
          <p className="text-sm text-muted-foreground">Click keys or use keyboard (A-K for white, W-U for black)</p>
        </div>
      </div>

      <div className="relative h-64 bg-muted rounded-xl p-4 overflow-x-auto">
        <div className="relative flex justify-center items-end h-full min-w-[600px]">
          {/* White Keys */}
          {whiteKeys.map((key) => (
            <button
              key={key.note}
              onClick={() => handleKeyPress(key.note, key.freq)}
              className={cn(
                "relative w-16 h-48 bg-gradient-to-b from-white to-gray-100 border-2 border-gray-400 rounded-b-lg shadow-lg",
                "hover:from-gray-100 hover:to-gray-200 active:from-gray-200 active:to-gray-300",
                "transition-all duration-100 cursor-pointer",
                activeKeys.has(key.note) && "from-primary/30 to-primary/50 scale-95"
              )}
            >
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-600">
                {key.note}
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-mono">
                {key.key}
              </div>
            </button>
          ))}

          {/* Black Keys */}
          {blackKeys.map((key) => (
            <button
              key={key.note}
              onClick={() => handleKeyPress(key.note, key.freq)}
              className={cn(
                "absolute w-10 h-32 bg-gradient-to-b from-gray-900 to-black border-2 border-gray-950 rounded-b-lg shadow-xl z-10",
                "hover:from-gray-800 hover:to-gray-900 active:from-gray-700 active:to-gray-800",
                "transition-all duration-100 cursor-pointer",
                activeKeys.has(key.note) && "from-primary/70 to-primary/90 scale-95"
              )}
              style={{
                left: `${key.position * 16 * 4 - 20}px`,
              }}
            >
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white">
                {key.note}
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-gray-300 font-mono">
                {key.key}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};
