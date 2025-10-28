import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Music4, Volume2, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const ChorusEffects = () => {
  const [chorusEnabled, setChorusEnabled] = useState(false);
  const [harmonyEnabled, setHarmonyEnabled] = useState(false);
  const [chorusDepth, setChorusDepth] = useState([50]);
  const [chorusRate, setChorusRate] = useState([30]);
  const [harmonyPitch, setHarmonyPitch] = useState([0]);
  const [harmonyMix, setHarmonyMix] = useState([40]);

  const handleChorusToggle = (checked: boolean) => {
    setChorusEnabled(checked);
    toast(checked ? "Chorus effect enabled" : "Chorus effect disabled");
  };

  const handleHarmonyToggle = (checked: boolean) => {
    setHarmonyEnabled(checked);
    toast(checked ? "Vocal harmony enabled" : "Vocal harmony disabled");
  };

  const applyEffects = () => {
    toast.success("Effects applied to your recording!");
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-primary">
          <Music4 className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Chorus & Harmony Effects</h2>
          <p className="text-sm text-muted-foreground">Add depth and richness to your vocals</p>
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
                  <Label className="text-sm font-medium">Rate</Label>
                  <span className="text-xs text-muted-foreground font-mono">{chorusRate[0]}%</span>
                </div>
                <Slider
                  value={chorusRate}
                  onValueChange={setChorusRate}
                  max={100}
                  step={1}
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
                    setHarmonyPitch([3]);
                    toast("Third harmony preset applied");
                  }}
                >
                  Third Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHarmonyPitch([5]);
                    toast("Fifth harmony preset applied");
                  }}
                >
                  Fifth Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHarmonyPitch([7]);
                    toast("Octave harmony preset applied");
                  }}
                >
                  Octave
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Apply Button */}
        <div className="flex justify-center pt-4">
          <Button
            variant="hero"
            size="lg"
            onClick={applyEffects}
            disabled={!chorusEnabled && !harmonyEnabled}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Apply Effects to Recording
          </Button>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm text-foreground/80">
            <strong className="text-primary">💡 Tip:</strong> Enable chorus for a fuller sound, 
            or add vocal harmony to create beautiful multi-voice arrangements. 
            Experiment with different settings to find your perfect sound!
          </p>
        </div>
      </div>
    </Card>
  );
};
