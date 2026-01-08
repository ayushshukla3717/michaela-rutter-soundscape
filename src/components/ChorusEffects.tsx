import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Music4, Volume2, Sparkles, Play, Square } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import * as Tone from "tone";

export const ChorusEffects = () => {
  const [chorusEnabled, setChorusEnabled] = useState(false);
  const [harmonyEnabled, setHarmonyEnabled] = useState(false);
  const [chorusDepth, setChorusDepth] = useState([50]);
  const [chorusRate, setChorusRate] = useState([4]);
  const [harmonyPitch, setHarmonyPitch] = useState([4]);
  const [harmonyMix, setHarmonyMix] = useState([40]);
  const [isPlaying, setIsPlaying] = useState(false);

  const playerRef = useRef<Tone.Player | null>(null);
  const chorusRef = useRef<Tone.Chorus | null>(null);
  const pitchShiftRef = useRef<Tone.PitchShift | null>(null);
  const gainRef = useRef<Tone.Gain | null>(null);
  const oscillatorRef = useRef<Tone.Oscillator | null>(null);

  // Initialize effects
  useEffect(() => {
    chorusRef.current = new Tone.Chorus({
      frequency: chorusRate[0],
      delayTime: 3.5,
      depth: chorusDepth[0] / 100,
      wet: 0.5,
    });

    pitchShiftRef.current = new Tone.PitchShift({
      pitch: harmonyPitch[0],
      wet: harmonyMix[0] / 100,
    });

    gainRef.current = new Tone.Gain(0.5).toDestination();

    return () => {
      chorusRef.current?.dispose();
      pitchShiftRef.current?.dispose();
      gainRef.current?.dispose();
      oscillatorRef.current?.dispose();
    };
  }, []);

  // Update chorus parameters
  useEffect(() => {
    if (chorusRef.current) {
      chorusRef.current.depth = chorusDepth[0] / 100;
      chorusRef.current.frequency.value = chorusRate[0];
    }
  }, [chorusDepth, chorusRate]);

  // Update harmony parameters
  useEffect(() => {
    if (pitchShiftRef.current) {
      pitchShiftRef.current.pitch = harmonyPitch[0];
      pitchShiftRef.current.wet.value = harmonyMix[0] / 100;
    }
  }, [harmonyPitch, harmonyMix]);

  const handleChorusToggle = (checked: boolean) => {
    setChorusEnabled(checked);
    toast(checked ? "Chorus effect enabled" : "Chorus effect disabled");
  };

  const handleHarmonyToggle = (checked: boolean) => {
    setHarmonyEnabled(checked);
    toast(checked ? "Vocal harmony enabled" : "Vocal harmony disabled");
  };

  // Preview the effect with a test tone
  const previewEffect = async () => {
    await Tone.start();
    
    if (isPlaying) {
      oscillatorRef.current?.stop();
      oscillatorRef.current?.dispose();
      oscillatorRef.current = null;
      setIsPlaying(false);
      return;
    }

    oscillatorRef.current = new Tone.Oscillator({
      frequency: 440,
      type: "sine",
    });

    // Build effect chain
    let chain: Tone.ToneAudioNode = oscillatorRef.current;

    if (chorusEnabled && chorusRef.current) {
      chain.connect(chorusRef.current);
      chain = chorusRef.current;
    }

    if (harmonyEnabled && pitchShiftRef.current) {
      chain.connect(pitchShiftRef.current);
      chain = pitchShiftRef.current;
    }

    if (gainRef.current) {
      chain.connect(gainRef.current);
    }

    oscillatorRef.current.start();
    setIsPlaying(true);

    // Auto-stop after 3 seconds
    setTimeout(() => {
      oscillatorRef.current?.stop();
      oscillatorRef.current?.dispose();
      oscillatorRef.current = null;
      setIsPlaying(false);
    }, 3000);

    toast.success("Preview playing for 3 seconds...");
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-primary">
          <Music4 className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Chorus & Harmony Effects</h2>
          <p className="text-sm text-muted-foreground">Add depth and richness to your vocals (powered by Tone.js)</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Chorus Effect Section */}
        <div className="p-6 rounded-xl bg-muted/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <Label htmlFor="chorus-toggle" className="text-lg font-semibold">
                Chorus Effect
              </Label>
            </div>
            <Switch
              id="chorus-toggle"
              checked={chorusEnabled}
              onCheckedChange={handleChorusToggle}
            />
          </div>

          {chorusEnabled && (
            <div className="space-y-4 pl-8 animate-in fade-in slide-in-from-top-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Depth</Label>
                  <span className="text-xs text-muted-foreground font-mono">{chorusDepth[0]}%</span>
                </div>
                <Slider
                  value={chorusDepth}
                  onValueChange={setChorusDepth}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Controls how thick and layered the chorus sounds
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Rate (Hz)</Label>
                  <span className="text-xs text-muted-foreground font-mono">{chorusRate[0]} Hz</span>
                </div>
                <Slider
                  value={chorusRate}
                  onValueChange={setChorusRate}
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Speed of the chorus modulation effect
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Vocal Harmony Section */}
        <div className="p-6 rounded-xl bg-muted/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-secondary" />
              <Label htmlFor="harmony-toggle" className="text-lg font-semibold">
                Vocal Harmony
              </Label>
            </div>
            <Switch
              id="harmony-toggle"
              checked={harmonyEnabled}
              onCheckedChange={handleHarmonyToggle}
            />
          </div>

          {harmonyEnabled && (
            <div className="space-y-4 pl-8 animate-in fade-in slide-in-from-top-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Harmony Pitch</Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {harmonyPitch[0] > 0 ? '+' : ''}{harmonyPitch[0]} semitones
                  </span>
                </div>
                <Slider
                  value={harmonyPitch}
                  onValueChange={setHarmonyPitch}
                  min={-12}
                  max={12}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Adjust harmony pitch: negative for lower, positive for higher
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Harmony Mix</Label>
                  <span className="text-xs text-muted-foreground font-mono">{harmonyMix[0]}%</span>
                </div>
                <Slider
                  value={harmonyMix}
                  onValueChange={setHarmonyMix}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Balance between original vocal and harmony
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHarmonyPitch([4]);
                    toast("Third harmony preset applied (+4 semitones)");
                  }}
                  className={harmonyPitch[0] === 4 ? "ring-2 ring-primary" : ""}
                >
                  Third Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHarmonyPitch([7]);
                    toast("Fifth harmony preset applied (+7 semitones)");
                  }}
                  className={harmonyPitch[0] === 7 ? "ring-2 ring-primary" : ""}
                >
                  Fifth Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHarmonyPitch([12]);
                    toast("Octave harmony preset applied (+12 semitones)");
                  }}
                  className={harmonyPitch[0] === 12 ? "ring-2 ring-primary" : ""}
                >
                  Octave
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Preview Button */}
        <div className="flex justify-center pt-4 gap-4">
          <Button
            variant="hero"
            size="lg"
            onClick={previewEffect}
            disabled={!chorusEnabled && !harmonyEnabled}
          >
            {isPlaying ? (
              <>
                <Square className="w-5 h-5 mr-2" />
                Stop Preview
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Preview Effects
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm text-foreground/80">
            <strong className="text-primary">💡 Tip:</strong> Enable chorus for a fuller sound, 
            or add vocal harmony to create beautiful multi-voice arrangements. 
            Click "Preview Effects" to hear a test tone with your settings!
          </p>
        </div>
      </div>
    </Card>
  );
};
