import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Guitar, Volume2 } from "lucide-react";
import * as Tone from "tone";
import { useAudioContext } from "@/hooks/useAudioContext";

// Guitar string definitions (low to high)
const strings = [
  { openNote: "E2", name: "E", color: "from-amber-600 to-amber-800" },
  { openNote: "A2", name: "A", color: "from-amber-500 to-amber-700" },
  { openNote: "D3", name: "D", color: "from-amber-400 to-amber-600" },
  { openNote: "G3", name: "G", color: "from-amber-300 to-amber-500" },
  { openNote: "B3", name: "B", color: "from-amber-200 to-amber-400" },
  { openNote: "E4", name: "e", color: "from-amber-100 to-amber-300" },
];

// Fret markers (standard guitar dots)
const fretMarkers = [3, 5, 7, 9, 12];
const doubleFretMarkers = [12];

// Chord definitions: [E, A, D, G, B, e] - null means don't play
const chords: Record<string, { name: string; frets: (number | null)[] }> = {
  C: { name: "C Major", frets: [null, 3, 2, 0, 1, 0] },
  D: { name: "D Major", frets: [null, null, 0, 2, 3, 2] },
  E: { name: "E Major", frets: [0, 2, 2, 1, 0, 0] },
  G: { name: "G Major", frets: [3, 2, 0, 0, 0, 3] },
  Am: { name: "A Minor", frets: [null, 0, 2, 2, 1, 0] },
  Em: { name: "E Minor", frets: [0, 2, 2, 0, 0, 0] },
  F: { name: "F Major", frets: [1, 3, 3, 2, 1, 1] },
  Dm: { name: "D Minor", frets: [null, null, 0, 2, 3, 1] },
};

// Keyboard shortcuts
const stringKeys = ["1", "2", "3", "4", "5", "6"];
const chordKeys: Record<string, string> = {
  q: "C", w: "D", e: "E", r: "G", t: "Am", y: "Em",
};

// Calculate note from string and fret
const getNoteFromFret = (stringIndex: number, fret: number): string => {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const openNote = strings[stringIndex].openNote;
  const noteName = openNote.slice(0, -1);
  const octave = parseInt(openNote.slice(-1));
  
  const noteIndex = notes.indexOf(noteName);
  const newNoteIndex = (noteIndex + fret) % 12;
  const newOctave = octave + Math.floor((noteIndex + fret) / 12);
  
  return `${notes[newNoteIndex]}${newOctave}`;
};

export const VirtualGuitar = () => {
  const [activeStrings, setActiveStrings] = useState<Set<number>>(new Set());
  const [activeFrets, setActiveFrets] = useState<Map<number, number>>(new Map());
  const [volume, setVolume] = useState([75]);
  const [strumSpeed, setStrumSpeed] = useState([50]);
  const [sustainEnabled, setSustainEnabled] = useState(true);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  
  const synthRef = useRef<Tone.PluckSynth | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const { ensureAudioContext } = useAudioContext();
  const lastTouchTime = useRef(0);

  // Initialize Tone.js synth with better guitar sound
  useEffect(() => {
    volumeRef.current = new Tone.Volume(-8).toDestination();
    reverbRef.current = new Tone.Reverb({ decay: 2, wet: 0.2 }).connect(volumeRef.current);
    
    synthRef.current = new Tone.PluckSynth({
      attackNoise: 2,
      dampening: 3000,
      resonance: 0.95,
      release: 1,
    }).connect(reverbRef.current);

    return () => {
      synthRef.current?.dispose();
      volumeRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (volumeRef.current) {
      volumeRef.current.volume.value = (volume[0] / 100) * 24 - 18;
    }
  }, [volume]);

  // Play a single note
  const playNote = useCallback(async (note: string, stringIndex: number, fret: number) => {
    await ensureAudioContext();
    
    if (synthRef.current) {
      synthRef.current.triggerAttack(note, Tone.now());
      
      // Visual feedback
      setActiveStrings(prev => new Set(prev).add(stringIndex));
      setActiveFrets(prev => new Map(prev).set(stringIndex, fret));
      
      setTimeout(() => {
        setActiveStrings(prev => {
          const next = new Set(prev);
          next.delete(stringIndex);
          return next;
        });
        setActiveFrets(prev => {
          const next = new Map(prev);
          next.delete(stringIndex);
          return next;
        });
      }, sustainEnabled ? 400 : 200);
    }
  }, [ensureAudioContext, sustainEnabled]);

  // Play open string
  const playOpenString = useCallback((stringIndex: number) => {
    const note = strings[stringIndex].openNote;
    playNote(note, stringIndex, 0);
  }, [playNote]);

  // Play a fret
  const playFret = useCallback((stringIndex: number, fret: number) => {
    const note = getNoteFromFret(stringIndex, fret);
    playNote(note, stringIndex, fret);
  }, [playNote]);

  // Touch handler for mobile
  const handleTouch = useCallback((action: () => void, e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    
    if (e.type === "touchstart") {
      e.preventDefault();
      lastTouchTime.current = now;
      action();
    } else if (e.type === "mousedown") {
      if (now - lastTouchTime.current > 300) {
        action();
      }
    }
  }, []);

  // Strum a chord
  const strumChord = useCallback(async (chordName: string) => {
    const chord = chords[chordName];
    if (!chord) return;

    await ensureAudioContext();
    setActiveChord(chordName);
    
    const delay = Math.max(20, 120 - strumSpeed[0]); // Faster strum = shorter delay
    
    for (let i = 0; i < chord.frets.length; i++) {
      const fret = chord.frets[i];
      if (fret !== null && fret >= 0) {
        setTimeout(() => {
          if (fret === 0) {
            playOpenString(i);
          } else {
            playFret(i, fret);
          }
        }, i * delay);
      }
    }

    setTimeout(() => setActiveChord(null), 400);
  }, [strumSpeed, playOpenString, playFret, ensureAudioContext]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      
      const key = e.key.toLowerCase();
      
      const stringIndex = stringKeys.indexOf(key);
      if (stringIndex !== -1) {
        playOpenString(stringIndex);
        return;
      }
      
      const chordName = chordKeys[key];
      if (chordName) {
        strumChord(chordName);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playOpenString, strumChord]);

  const numFrets = 12;

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Guitar className="h-6 w-6 text-primary" />
          </div>
          Virtual Guitar
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Tap frets to play, or use chord buttons. Keys 1-6 for open strings, Q-Y for chords.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chord Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(chords).map(([key, chord]) => (
            <Button
              key={key}
              variant={activeChord === key ? "default" : "outline"}
              size="sm"
              className={`transition-all ${activeChord === key ? "scale-105 shadow-lg" : ""}`}
              onTouchStart={(e) => handleTouch(() => strumChord(key), e)}
              onMouseDown={(e) => handleTouch(() => strumChord(key), e)}
            >
              <span className="font-bold">{key}</span>
            </Button>
          ))}
        </div>

        {/* Guitar Fretboard - Mobile Optimized */}
        <div className="relative bg-gradient-to-b from-amber-900 to-amber-950 rounded-lg p-3 overflow-x-auto touch-pan-x">
          {/* Nut */}
          <div className="absolute left-10 top-0 bottom-0 w-1.5 bg-gradient-to-b from-gray-100 to-gray-300 rounded" />
          
          {/* Fretboard */}
          <div className="ml-12 relative">
            {/* Fret numbers */}
            <div className="flex mb-1.5">
              <div className="w-7 text-center text-[10px] text-muted-foreground">0</div>
              {Array.from({ length: numFrets }, (_, i) => (
                <div key={i} className="w-10 text-center text-[10px] text-muted-foreground">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Strings */}
            {strings.map((string, stringIndex) => (
              <div key={stringIndex} className="flex items-center h-7 relative">
                {/* String label */}
                <div className="absolute -left-10 w-7 text-right pr-1 text-xs font-mono text-muted-foreground">
                  {string.name}
                </div>
                
                {/* Open string button */}
                <button
                  className={`w-7 h-5 rounded flex items-center justify-center transition-all touch-manipulation ${
                    activeStrings.has(stringIndex) && activeFrets.get(stringIndex) === 0
                      ? "bg-primary scale-110 shadow-lg"
                      : "bg-muted/30 hover:bg-muted/50 active:bg-primary/50"
                  }`}
                  onTouchStart={(e) => handleTouch(() => playOpenString(stringIndex), e)}
                  onMouseDown={(e) => handleTouch(() => playOpenString(stringIndex), e)}
                >
                  <div className={`w-full h-0.5 bg-gradient-to-r ${string.color} ${
                    activeStrings.has(stringIndex) ? "animate-pulse h-1" : ""
                  }`} />
                </button>

                {/* Frets */}
                {Array.from({ length: numFrets }, (_, fretIndex) => {
                  const fret = fretIndex + 1;
                  const isActive = activeStrings.has(stringIndex) && activeFrets.get(stringIndex) === fret;
                  
                  return (
                    <button
                      key={fret}
                      className={`w-10 h-5 border-r border-gray-600 flex items-center justify-center relative transition-all touch-manipulation ${
                        isActive ? "bg-primary/30" : "hover:bg-white/10 active:bg-primary/20"
                      }`}
                      onTouchStart={(e) => handleTouch(() => playFret(stringIndex, fret), e)}
                      onMouseDown={(e) => handleTouch(() => playFret(stringIndex, fret), e)}
                    >
                      <div className={`absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r ${string.color} ${
                        isActive ? "h-1 animate-pulse" : ""
                      }`} />
                      
                      {isActive && (
                        <div className="absolute w-3 h-3 rounded-full bg-primary shadow-lg animate-scale-in" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Fret markers */}
            <div className="flex mt-1.5">
              <div className="w-7" />
              {Array.from({ length: numFrets }, (_, i) => {
                const fret = i + 1;
                const hasMarker = fretMarkers.includes(fret);
                const isDouble = doubleFretMarkers.includes(fret);
                
                return (
                  <div key={i} className="w-10 flex justify-center">
                    {hasMarker && (
                      <div className="flex gap-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        {isDouble && <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Volume</Label>
              <span className="text-xs text-muted-foreground ml-auto">{volume[0]}%</span>
            </div>
            <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
          </div>

          {/* Strum Speed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Strum Speed</Label>
              <span className="text-xs text-muted-foreground ml-auto">
                {strumSpeed[0] < 30 ? "Slow" : strumSpeed[0] < 70 ? "Medium" : "Fast"}
              </span>
            </div>
            <Slider value={strumSpeed} onValueChange={setStrumSpeed} max={100} step={1} />
          </div>

          {/* Sustain Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Sustain</Label>
            <Switch checked={sustainEnabled} onCheckedChange={setSustainEnabled} />
          </div>
        </div>

        {/* Keyboard shortcuts info */}
        <div className="text-center text-xs text-muted-foreground bg-muted/20 rounded-lg p-2">
          <span className="font-medium">🎸 Shortcuts:</span>{" "}
          <span className="font-mono">1-6</span> Strings |{" "}
          <span className="font-mono">Q-Y</span> Chords
        </div>
      </CardContent>
    </Card>
  );
};
