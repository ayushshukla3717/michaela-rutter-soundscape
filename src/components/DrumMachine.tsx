import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Drum, Play, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Tone from "tone";
import { useAudioContext } from "@/hooks/useAudioContext";

interface DrumPad {
  id: string;
  name: string;
  key: string;
  color: string;
}

const drumPads: DrumPad[] = [
  { id: "kick", name: "Kick", key: "1", color: "from-red-500 to-red-700" },
  { id: "snare", name: "Snare", key: "2", color: "from-orange-500 to-orange-700" },
  { id: "hihat", name: "Hi-Hat", key: "3", color: "from-yellow-500 to-yellow-700" },
  { id: "openhat", name: "Open Hat", key: "4", color: "from-lime-500 to-lime-700" },
  { id: "clap", name: "Clap", key: "q", color: "from-green-500 to-green-700" },
  { id: "tom1", name: "Tom 1", key: "w", color: "from-teal-500 to-teal-700" },
  { id: "tom2", name: "Tom 2", key: "e", color: "from-cyan-500 to-cyan-700" },
  { id: "tom3", name: "Tom 3", key: "r", color: "from-sky-500 to-sky-700" },
  { id: "crash", name: "Crash", key: "a", color: "from-blue-500 to-blue-700" },
  { id: "ride", name: "Ride", key: "s", color: "from-indigo-500 to-indigo-700" },
  { id: "perc1", name: "Perc 1", key: "d", color: "from-violet-500 to-violet-700" },
  { id: "perc2", name: "Perc 2", key: "f", color: "from-purple-500 to-purple-700" },
  { id: "fx1", name: "FX 1", key: "z", color: "from-fuchsia-500 to-fuchsia-700" },
  { id: "fx2", name: "FX 2", key: "x", color: "from-pink-500 to-pink-700" },
  { id: "fx3", name: "FX 3", key: "c", color: "from-rose-500 to-rose-700" },
  { id: "fx4", name: "FX 4", key: "v", color: "from-amber-500 to-amber-700" },
];

// Optimized drum synths for better sound and lower latency
const createDrumSynths = (volume: Tone.Volume) => {
  return {
    kick: new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 6,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.8, attackCurve: "exponential" },
    }).connect(volume),
    
    snare: new Tone.NoiseSynth({
      noise: { type: "white", playbackRate: 3 },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
    }).connect(volume),
    
    hihat: new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).connect(volume),
    
    openhat: new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.25, release: 0.08 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).connect(volume),
    
    clap: new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.08 },
    }).connect(volume),
    
    tom1: new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
    }).connect(volume),
    
    tom2: new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
    }).connect(volume),
    
    tom3: new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
    }).connect(volume),
    
    crash: new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.8, release: 0.2 },
      harmonicity: 5.1,
      modulationIndex: 40,
      resonance: 5000,
      octaves: 1.5,
    }).connect(volume),
    
    ride: new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.35, release: 0.15 },
      harmonicity: 5.1,
      modulationIndex: 20,
      resonance: 5000,
      octaves: 1,
    }).connect(volume),
    
    perc1: new Tone.PluckSynth({
      attackNoise: 1.5,
      dampening: 4000,
      resonance: 0.8,
    }).connect(volume),
    
    perc2: new Tone.PluckSynth({
      attackNoise: 1.5,
      dampening: 2500,
      resonance: 0.85,
    }).connect(volume),
    
    fx1: new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.005, decay: 0.08, sustain: 0.05, release: 0.08 },
    }).connect(volume),
    
    fx2: new Tone.Synth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0.05, release: 0.15 },
    }).connect(volume),
    
    fx3: new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.1, release: 0.2 },
    }).connect(volume),
    
    fx4: new Tone.FMSynth({
      harmonicity: 8,
      modulationIndex: 2,
      envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.15 },
    }).connect(volume),
  };
};

export const DrumMachine = () => {
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const [bpm, setBpm] = useState([120]);
  const [volume, setVolume] = useState([75]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [pattern, setPattern] = useState<boolean[][]>(
    Array(16).fill(null).map(() => Array(16).fill(false))
  );
  
  const synthsRef = useRef<ReturnType<typeof createDrumSynths> | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  const sequenceRef = useRef<Tone.Sequence | null>(null);
  const { ensureAudioContext } = useAudioContext();
  const lastTouchTime = useRef(0);

  useEffect(() => {
    volumeRef.current = new Tone.Volume(-6).toDestination();
    synthsRef.current = createDrumSynths(volumeRef.current);
    
    return () => {
      if (synthsRef.current) {
        Object.values(synthsRef.current).forEach(synth => synth.dispose());
      }
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
      }
      volumeRef.current?.dispose();
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (volumeRef.current) {
      volumeRef.current.volume.value = (volume[0] / 100) * 24 - 18;
    }
  }, [volume]);

  const playDrum = useCallback(async (drumId: string) => {
    await ensureAudioContext();
    
    const synths = synthsRef.current;
    if (!synths) return;

    const now = Tone.now();

    switch (drumId) {
      case "kick":
        synths.kick.triggerAttackRelease("C1", "8n", now);
        break;
      case "snare":
        synths.snare.triggerAttackRelease("8n", now);
        break;
      case "hihat":
        synths.hihat.triggerAttackRelease("C6", "32n", now);
        break;
      case "openhat":
        synths.openhat.triggerAttackRelease("C6", "16n", now);
        break;
      case "clap":
        synths.clap.triggerAttackRelease("16n", now);
        break;
      case "tom1":
        synths.tom1.triggerAttackRelease("G2", "8n", now);
        break;
      case "tom2":
        synths.tom2.triggerAttackRelease("D2", "8n", now);
        break;
      case "tom3":
        synths.tom3.triggerAttackRelease("A1", "8n", now);
        break;
      case "crash":
        synths.crash.triggerAttackRelease("C6", "4n", now);
        break;
      case "ride":
        synths.ride.triggerAttackRelease("C6", "8n", now);
        break;
      case "perc1":
        synths.perc1.triggerAttack("C4", now);
        break;
      case "perc2":
        synths.perc2.triggerAttack("G3", now);
        break;
      case "fx1":
        synths.fx1.triggerAttackRelease("C5", "32n", now);
        break;
      case "fx2":
        synths.fx2.triggerAttackRelease("E4", "32n", now);
        break;
      case "fx3":
        synths.fx3.triggerAttackRelease("G4", "16n", now);
        break;
      case "fx4":
        synths.fx4.triggerAttackRelease("C4", "32n", now);
        break;
    }
  }, [ensureAudioContext]);

  // Touch handler for mobile
  const handleTouch = useCallback((drumId: string, e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    
    if (e.type === "touchstart") {
      e.preventDefault();
      lastTouchTime.current = now;
      
      setActivePads(prev => new Set(prev).add(drumId));
      playDrum(drumId);
      
      setTimeout(() => {
        setActivePads(prev => {
          const newSet = new Set(prev);
          newSet.delete(drumId);
          return newSet;
        });
      }, 100);
    } else if (e.type === "mousedown") {
      if (now - lastTouchTime.current > 300) {
        setActivePads(prev => new Set(prev).add(drumId));
        playDrum(drumId);
        
        setTimeout(() => {
          setActivePads(prev => {
            const newSet = new Set(prev);
            newSet.delete(drumId);
            return newSet;
          });
        }, 100);
      }
    }
  }, [playDrum]);

  // Keyboard shortcuts
  useEffect(() => {
    const keyToId: Record<string, string> = {};
    drumPads.forEach(pad => { keyToId[pad.key] = pad.id; });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const drumId = keyToId[e.key.toLowerCase()];
      if (drumId) {
        setActivePads(prev => new Set(prev).add(drumId));
        playDrum(drumId);
        
        setTimeout(() => {
          setActivePads(prev => {
            const newSet = new Set(prev);
            newSet.delete(drumId);
            return newSet;
          });
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playDrum]);

  // Pattern sequencer
  const toggleStep = (padIndex: number, stepIndex: number) => {
    setPattern(prev => {
      const newPattern = prev.map(row => [...row]);
      newPattern[padIndex][stepIndex] = !newPattern[padIndex][stepIndex];
      return newPattern;
    });
  };

  const startSequencer = async () => {
    await ensureAudioContext();
    
    Tone.getTransport().bpm.value = bpm[0];
    
    if (sequenceRef.current) {
      sequenceRef.current.dispose();
    }

    sequenceRef.current = new Tone.Sequence(
      (time, step) => {
        setCurrentStep(step);
        pattern.forEach((row, padIndex) => {
          if (row[step]) {
            playDrum(drumPads[padIndex].id);
          }
        });
      },
      [...Array(16).keys()],
      "16n"
    );
    
    sequenceRef.current.start(0);
    Tone.getTransport().start();
    setIsPlaying(true);
  };

  const stopSequencer = () => {
    Tone.getTransport().stop();
    if (sequenceRef.current) {
      sequenceRef.current.stop();
    }
    setIsPlaying(false);
    setCurrentStep(0);
  };

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm[0];
  }, [bpm]);

  return (
    <Card className="p-4 md:p-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-lg bg-gradient-primary">
          <Drum className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Drum Machine</h2>
          <p className="text-sm text-muted-foreground">16-pad drum machine with sequencer</p>
        </div>
      </div>

      {/* Drum Pads - Mobile Optimized */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4">
        {drumPads.map((pad) => (
          <button
            key={pad.id}
            onTouchStart={(e) => handleTouch(pad.id, e)}
            onMouseDown={(e) => handleTouch(pad.id, e)}
            className={cn(
              "aspect-square rounded-lg md:rounded-xl font-bold text-white shadow-lg transition-all duration-75",
              "flex flex-col items-center justify-center gap-0.5 md:gap-1",
              "bg-gradient-to-br active:scale-95 touch-manipulation select-none",
              pad.color,
              activePads.has(pad.id) && "scale-95 brightness-125 ring-2 md:ring-4 ring-white/50"
            )}
          >
            <span className="text-[10px] md:text-sm font-medium">{pad.name}</span>
            <span className="text-[8px] md:text-xs opacity-70 font-mono uppercase bg-black/20 px-1 md:px-2 py-0.5 rounded">
              {pad.key}
            </span>
          </button>
        ))}
      </div>

      {/* Volume & BPM Controls */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg bg-muted">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">Volume</span>
            </div>
            <span className="font-mono text-sm">{volume[0]}%</span>
          </div>
          <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">BPM</span>
            <span className="font-mono text-sm">{bpm[0]}</span>
          </div>
          <Slider value={bpm} onValueChange={setBpm} min={60} max={200} step={1} />
        </div>
      </div>

      {/* Sequencer Grid */}
      <div className="mb-4 overflow-x-auto touch-pan-x">
        <div className="min-w-[500px]">
          <div className="flex gap-0.5 mb-1.5">
            <div className="w-14" />
            {Array(16).fill(0).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-6 md:w-8 h-5 flex items-center justify-center text-[10px] font-mono rounded",
                  currentStep === i && isPlaying ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
          
          {drumPads.slice(0, 8).map((pad, padIndex) => (
            <div key={pad.id} className="flex gap-0.5 mb-0.5">
              <div className="w-14 text-[10px] font-medium truncate flex items-center">
                {pad.name}
              </div>
              {Array(16).fill(0).map((_, stepIndex) => (
                <button
                  key={stepIndex}
                  onClick={() => toggleStep(padIndex, stepIndex)}
                  className={cn(
                    "w-6 md:w-8 h-6 md:h-8 rounded transition-all touch-manipulation",
                    pattern[padIndex][stepIndex] 
                      ? `bg-gradient-to-br ${pad.color}` 
                      : "bg-muted hover:bg-muted-foreground/20",
                    currentStep === stepIndex && isPlaying && "ring-1 ring-primary"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex gap-3 justify-center">
        {!isPlaying ? (
          <Button variant="hero" size="lg" onClick={startSequencer}>
            <Play className="w-5 h-5 mr-2" />
            Play
          </Button>
        ) : (
          <Button variant="destructive" size="lg" onClick={stopSequencer}>
            <Square className="w-5 h-5 mr-2" />
            Stop
          </Button>
        )}
      </div>

      {/* Keyboard Hints */}
      <div className="mt-4 p-2 rounded-lg bg-muted/50 text-center">
        <p className="text-[10px] md:text-xs text-muted-foreground">
          🥁 Keys: <span className="font-mono">1-4</span> | <span className="font-mono">Q-R</span> | <span className="font-mono">A-F</span> | <span className="font-mono">Z-V</span>
        </p>
      </div>
    </Card>
  );
};
