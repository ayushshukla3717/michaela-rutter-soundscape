import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Guitar, Volume2 } from "lucide-react";
import * as Tone from "tone";

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

// Chord definitions: [E, A, D, G, B, e] - null means don't play, -1 means muted
const chords: Record<string, { name: string; frets: (number | null)[]; fingers: string }> = {
  C: { name: "C Major", frets: [null, 3, 2, 0, 1, 0], fingers: "x32010" },
  D: { name: "D Major", frets: [null, null, 0, 2, 3, 2], fingers: "xx0232" },
  E: { name: "E Major", frets: [0, 2, 2, 1, 0, 0], fingers: "022100" },
  G: { name: "G Major", frets: [3, 2, 0, 0, 0, 3], fingers: "320003" },
  Am: { name: "A Minor", frets: [null, 0, 2, 2, 1, 0], fingers: "x02210" },
  Em: { name: "E Minor", frets: [0, 2, 2, 0, 0, 0], fingers: "022000" },
  F: { name: "F Major", frets: [1, 3, 3, 2, 1, 1], fingers: "133211" },
  Dm: { name: "D Minor", frets: [null, null, 0, 2, 3, 1], fingers: "xx0231" },
};

// Keyboard shortcuts
const stringKeys = ["1", "2", "3", "4", "5", "6"];
const chordKeys: Record<string, string> = {
  q: "C",
  w: "D",
  e: "E",
  r: "G",
  t: "Am",
  y: "Em",
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

  // Initialize Tone.js synth
  useEffect(() => {
    volumeRef.current = new Tone.Volume(-12).toDestination();
    synthRef.current = new Tone.PluckSynth({
      attackNoise: 1.2,
      dampening: 4000,
      resonance: 0.98,
    }).connect(volumeRef.current);

    return () => {
      synthRef.current?.dispose();
      volumeRef.current?.dispose();
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (volumeRef.current) {
      volumeRef.current.volume.value = (volume[0] / 100) * 24 - 24; // -24dB to 0dB
    }
  }, [volume]);

  // Play a single note
  const playNote = useCallback(async (note: string, stringIndex: number, fret: number) => {
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
    
    if (synthRef.current) {
      const duration = sustainEnabled ? "2n" : "8n";
      synthRef.current.triggerAttack(note);
      
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
      }, 300);
    }
  }, [sustainEnabled]);

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

  // Strum a chord
  const strumChord = useCallback(async (chordName: string) => {
    const chord = chords[chordName];
    if (!chord) return;

    setActiveChord(chordName);
    
    const delay = 150 - strumSpeed[0]; // Faster strum speed = shorter delay
    
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

    setTimeout(() => setActiveChord(null), 500);
  }, [strumSpeed, playOpenString, playFret]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      
      const key = e.key.toLowerCase();
      
      // String keys (1-6)
      const stringIndex = stringKeys.indexOf(key);
      if (stringIndex !== -1) {
        playOpenString(stringIndex);
        return;
      }
      
      // Chord keys (Q-Y)
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
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Guitar className="h-6 w-6 text-primary" />
          </div>
          Virtual Guitar
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Click frets to play notes, or use chord buttons to strum. Keys 1-6 for open strings, Q-Y for chords.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Chord Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(chords).map(([key, chord]) => (
            <Button
              key={key}
              variant={activeChord === key ? "default" : "outline"}
              className={`min-w-[60px] transition-all ${
                activeChord === key ? "scale-105 shadow-lg" : ""
              }`}
              onClick={() => strumChord(key)}
            >
              <span className="font-bold">{key}</span>
            </Button>
          ))}
        </div>

        {/* Guitar Fretboard */}
        <div className="relative bg-gradient-to-b from-amber-900 to-amber-950 rounded-lg p-4 overflow-x-auto">
          {/* Nut */}
          <div className="absolute left-12 top-0 bottom-0 w-2 bg-gradient-to-b from-gray-100 to-gray-300 rounded" />
          
          {/* Fretboard */}
          <div className="ml-16 relative">
            {/* Fret numbers */}
            <div className="flex mb-2">
              <div className="w-8 text-center text-xs text-muted-foreground">0</div>
              {Array.from({ length: numFrets }, (_, i) => (
                <div key={i} className="w-12 text-center text-xs text-muted-foreground">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Strings */}
            {strings.map((string, stringIndex) => (
              <div key={stringIndex} className="flex items-center h-8 relative">
                {/* String label */}
                <div className="absolute -left-12 w-8 text-right pr-2 text-sm font-mono text-muted-foreground">
                  {string.name}
                </div>
                
                {/* Open string button */}
                <button
                  className={`w-8 h-6 rounded flex items-center justify-center transition-all ${
                    activeStrings.has(stringIndex) && activeFrets.get(stringIndex) === 0
                      ? "bg-primary scale-110 shadow-lg"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                  onClick={() => playOpenString(stringIndex)}
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
                      className={`w-12 h-6 border-r border-gray-600 flex items-center justify-center relative transition-all ${
                        isActive ? "bg-primary/30" : "hover:bg-white/10"
                      }`}
                      onClick={() => playFret(stringIndex, fret)}
                    >
                      {/* String line */}
                      <div className={`absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r ${string.color} ${
                        isActive ? "h-1 animate-pulse" : ""
                      }`} />
                      
                      {/* Active dot */}
                      {isActive && (
                        <div className="absolute w-4 h-4 rounded-full bg-primary shadow-lg animate-scale-in" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Fret markers */}
            <div className="flex mt-2">
              <div className="w-8" /> {/* Spacer for open string */}
              {Array.from({ length: numFrets }, (_, i) => {
                const fret = i + 1;
                const hasMarker = fretMarkers.includes(fret);
                const isDouble = doubleFretMarkers.includes(fret);
                
                return (
                  <div key={i} className="w-12 flex justify-center">
                    {hasMarker && (
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        {isDouble && <div className="w-2 h-2 rounded-full bg-gray-400" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg">
          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Label>Volume</Label>
              <span className="text-xs text-muted-foreground ml-auto">{volume[0]}%</span>
            </div>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>

          {/* Strum Speed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Strum Speed</Label>
              <span className="text-xs text-muted-foreground ml-auto">
                {strumSpeed[0] < 30 ? "Slow" : strumSpeed[0] < 70 ? "Medium" : "Fast"}
              </span>
            </div>
            <Slider
              value={strumSpeed}
              onValueChange={setStrumSpeed}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>

          {/* Sustain Toggle */}
          <div className="flex items-center justify-between">
            <Label>Sustain</Label>
            <Switch
              checked={sustainEnabled}
              onCheckedChange={setSustainEnabled}
            />
          </div>
        </div>

        {/* Keyboard shortcuts info */}
        <div className="text-center text-sm text-muted-foreground bg-muted/20 rounded-lg p-3">
          <span className="font-medium">🎸 Shortcuts:</span>{" "}
          <span className="font-mono">1-6</span> Open strings (E→e) |{" "}
          <span className="font-mono">Q</span>=C, <span className="font-mono">W</span>=D,{" "}
          <span className="font-mono">E</span>=E, <span className="font-mono">R</span>=G,{" "}
          <span className="font-mono">T</span>=Am, <span className="font-mono">Y</span>=Em
        </div>
      </CardContent>
    </Card>
  );
};
