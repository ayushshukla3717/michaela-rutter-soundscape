import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, Volume2, Trash2, Play } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const mockTracks = [
  { id: 1, name: "Vocal Track 1", color: "from-primary to-primary-glow", duration: 30 },
  { id: 2, name: "Piano Melody", color: "from-secondary to-pink-400", duration: 45 },
  { id: 3, name: "Backing Vocals", color: "from-accent to-blue-400", duration: 25 },
];

export const TrackSequencer = () => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-primary">
          <Radio className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Track Sequencer</h2>
          <p className="text-sm text-muted-foreground">Layer and arrange your recordings</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Timeline */}
        <div className="bg-muted rounded-lg p-4 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Timeline markers */}
            <div className="flex justify-between mb-2 text-xs text-muted-foreground font-mono">
              {[0, 10, 20, 30, 40, 50, 60].map((sec) => (
                <span key={sec}>{sec}s</span>
              ))}
            </div>
            
            {/* Tracks */}
            <div className="space-y-3">
              {mockTracks.map((track, index) => (
                <div key={track.id} className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <Button variant="ghost" size="sm">
                      <Play className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[120px]">{track.name}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                      <Slider
                        defaultValue={[70]}
                        max={100}
                        step={1}
                        className="flex-1 max-w-[100px]"
                      />
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  
                  {/* Waveform visualization */}
                  <div className="h-16 rounded-lg bg-background border border-border p-2 relative overflow-hidden">
                    <div 
                      className={`h-full rounded bg-gradient-to-r ${track.color} opacity-60 relative`}
                      style={{ width: `${(track.duration / 60) * 100}%` }}
                    >
                      {/* Simulated waveform */}
                      <svg className="w-full h-full" preserveAspectRatio="none">
                        {Array.from({ length: 50 }).map((_, i) => {
                          const height = Math.random() * 80 + 20;
                          return (
                            <rect
                              key={i}
                              x={`${i * 2}%`}
                              y={`${50 - height / 2}%`}
                              width="1.5%"
                              height={`${height}%`}
                              fill="currentColor"
                              opacity="0.8"
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <Button variant="hero" size="lg">
            <Play className="w-5 h-5 mr-2" />
            Play All Tracks
          </Button>
          <Button variant="secondary" size="lg">
            Add New Track
          </Button>
          <Button variant="accent" size="lg">
            Export Mix
          </Button>
        </div>
      </div>
    </Card>
  );
};
