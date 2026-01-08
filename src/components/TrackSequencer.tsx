import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, Volume2, Trash2, Play, Square, Plus, VolumeX, Headphones } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Track {
  id: string;
  name: string;
  color: string;
  audioBlob?: Blob;
  audioURL?: string;
  duration: number;
  volume: number;
  muted: boolean;
  solo: boolean;
}

const trackColors = [
  "from-primary to-primary-glow",
  "from-secondary to-pink-400",
  "from-accent to-blue-400",
  "from-green-500 to-emerald-400",
  "from-orange-500 to-amber-400",
  "from-purple-500 to-violet-400",
];

export const TrackSequencer = () => {
  const [tracks, setTracks] = useState<Track[]>([
    { id: "1", name: "Track 1", color: trackColors[0], duration: 0, volume: 80, muted: false, solo: false },
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTrackId, setRecordingTrackId] = useState<string | null>(null);
  
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const playIntervalRef = useRef<number | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      tracks.forEach(track => {
        if (track.audioURL) URL.revokeObjectURL(track.audioURL);
      });
    };
  }, []);

  const addTrack = () => {
    const newId = Date.now().toString();
    const colorIndex = tracks.length % trackColors.length;
    setTracks(prev => [...prev, {
      id: newId,
      name: `Track ${prev.length + 1}`,
      color: trackColors[colorIndex],
      duration: 0,
      volume: 80,
      muted: false,
      solo: false,
    }]);
    toast.success("New track added!");
  };

  const deleteTrack = (id: string) => {
    const track = tracks.find(t => t.id === id);
    if (track?.audioURL) {
      URL.revokeObjectURL(track.audioURL);
    }
    setTracks(prev => prev.filter(t => t.id !== id));
    audioRefs.current.delete(id);
    toast("Track deleted");
  };

  const startRecordingToTrack = async (trackId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      const startTime = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const duration = (Date.now() - startTime) / 1000;
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioURL = URL.createObjectURL(audioBlob);
        
        setTracks(prev => prev.map(t => 
          t.id === trackId 
            ? { ...t, audioBlob, audioURL, duration }
            : t
        ));
        
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTrackId(trackId);
      toast.success("Recording to track...");
    } catch (error) {
      toast.error("Failed to access microphone");
      console.error(error);
    }
  };

  const stopRecordingToTrack = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTrackId(null);
      toast.success("Recording saved to track!");
    }
  };

  const updateTrackVolume = (id: string, volume: number[]) => {
    setTracks(prev => prev.map(t => 
      t.id === id ? { ...t, volume: volume[0] } : t
    ));
    
    const audio = audioRefs.current.get(id);
    if (audio) {
      audio.volume = volume[0] / 100;
    }
  };

  const toggleMute = (id: string) => {
    setTracks(prev => prev.map(t => 
      t.id === id ? { ...t, muted: !t.muted } : t
    ));
    
    const audio = audioRefs.current.get(id);
    const track = tracks.find(t => t.id === id);
    if (audio && track) {
      audio.muted = !track.muted;
    }
    toast(tracks.find(t => t.id === id)?.muted ? "Track unmuted" : "Track muted");
  };

  const toggleSolo = (id: string) => {
    setTracks(prev => prev.map(t => 
      t.id === id ? { ...t, solo: !t.solo } : t
    ));
    toast("Solo toggled");
  };

  const playAllTracks = useCallback(() => {
    const soloTracks = tracks.filter(t => t.solo);
    const tracksToPlay = soloTracks.length > 0 
      ? tracks.filter(t => t.solo && t.audioURL && !t.muted)
      : tracks.filter(t => t.audioURL && !t.muted);

    if (tracksToPlay.length === 0) {
      toast.error("No tracks to play. Record something first!");
      return;
    }

    tracksToPlay.forEach(track => {
      const audio = audioRefs.current.get(track.id);
      if (audio) {
        audio.currentTime = 0;
        audio.volume = track.volume / 100;
        audio.play();
      }
    });

    setIsPlaying(true);
    setCurrentTime(0);

    const maxDuration = Math.max(...tracksToPlay.map(t => t.duration));
    playIntervalRef.current = window.setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= maxDuration) {
          stopAllTracks();
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);

    toast.success("Playing all tracks!");
  }, [tracks]);

  const stopAllTracks = useCallback(() => {
    tracks.forEach(track => {
      const audio = audioRefs.current.get(track.id);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    
    setIsPlaying(false);
    setCurrentTime(0);
  }, [tracks]);

  const playTrack = (id: string) => {
    const track = tracks.find(t => t.id === id);
    if (!track?.audioURL) {
      toast.error("No audio recorded on this track");
      return;
    }
    
    const audio = audioRefs.current.get(id);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = track.volume / 100;
      audio.play();
      toast.success(`Playing ${track.name}`);
    }
  };

  const maxDuration = Math.max(30, ...tracks.map(t => t.duration));

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-primary">
          <Radio className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Track Sequencer</h2>
          <p className="text-sm text-muted-foreground">Record, layer and mix your tracks</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Timeline */}
        <div className="bg-muted rounded-lg p-4 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Timeline markers */}
            <div className="flex justify-between mb-2 text-xs text-muted-foreground font-mono pl-40">
              {Array.from({ length: 7 }, (_, i) => i * 5).map((sec) => (
                <span key={sec}>{sec}s</span>
              ))}
            </div>
            
            {/* Playhead */}
            {isPlaying && (
              <div 
                className="absolute w-0.5 h-full bg-primary z-20 transition-all"
                style={{ left: `${160 + (currentTime / maxDuration) * 640}px` }}
              />
            )}
            
            {/* Tracks */}
            <div className="space-y-3">
              {tracks.map((track) => (
                <div key={track.id} className="relative">
                  {/* Hidden audio element */}
                  {track.audioURL && (
                    <audio
                      ref={el => { if (el) audioRefs.current.set(track.id, el); }}
                      src={track.audioURL}
                      preload="auto"
                    />
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                    {/* Play button */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => playTrack(track.id)}
                      disabled={!track.audioURL}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    
                    {/* Track name */}
                    <span className="text-sm font-medium min-w-[80px]">{track.name}</span>
                    
                    {/* Record button */}
                    {!isRecording ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => startRecordingToTrack(track.id)}
                        className="text-destructive border-destructive/50"
                      >
                        <div className="w-2 h-2 rounded-full bg-destructive mr-1" />
                        Rec
                      </Button>
                    ) : recordingTrackId === track.id ? (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={stopRecordingToTrack}
                      >
                        <Square className="w-3 h-3 mr-1" />
                        Stop
                      </Button>
                    ) : null}
                    
                    {/* Volume slider */}
                    <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                      <Slider
                        value={[track.volume]}
                        onValueChange={(val) => updateTrackVolume(track.id, val)}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                    </div>
                    
                    {/* Mute button */}
                    <Button 
                      variant={track.muted ? "destructive" : "ghost"} 
                      size="sm"
                      onClick={() => toggleMute(track.id)}
                    >
                      <VolumeX className="w-4 h-4" />
                    </Button>
                    
                    {/* Solo button */}
                    <Button 
                      variant={track.solo ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => toggleSolo(track.id)}
                      className={track.solo ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                    >
                      <Headphones className="w-4 h-4" />
                    </Button>
                    
                    {/* Delete button */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteTrack(track.id)}
                      disabled={tracks.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  
                  {/* Waveform visualization */}
                  <div className="h-16 rounded-lg bg-background border border-border p-2 relative overflow-hidden">
                    {track.audioURL ? (
                      <div 
                        className={cn(
                          "h-full rounded bg-gradient-to-r opacity-70 relative",
                          track.color,
                          recordingTrackId === track.id && "animate-pulse"
                        )}
                        style={{ width: `${Math.min(100, (track.duration / maxDuration) * 100)}%` }}
                      >
                        {/* Simulated waveform */}
                        <svg className="w-full h-full" preserveAspectRatio="none">
                          {Array.from({ length: 50 }).map((_, i) => {
                            const height = Math.sin(i * 0.3) * 30 + Math.random() * 40 + 20;
                            return (
                              <rect
                                key={i}
                                x={`${i * 2}%`}
                                y={`${50 - height / 2}%`}
                                width="1.5%"
                                height={`${height}%`}
                                fill="currentColor"
                                opacity="0.9"
                              />
                            );
                          })}
                        </svg>
                      </div>
                    ) : recordingTrackId === track.id ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex items-center gap-2 text-destructive">
                          <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                          <span className="text-sm">Recording...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        Click "Rec" to record to this track
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          {!isPlaying ? (
            <Button variant="hero" size="lg" onClick={playAllTracks}>
              <Play className="w-5 h-5 mr-2" />
              Play All Tracks
            </Button>
          ) : (
            <Button variant="destructive" size="lg" onClick={stopAllTracks}>
              <Square className="w-5 h-5 mr-2" />
              Stop
            </Button>
          )}
          <Button variant="secondary" size="lg" onClick={addTrack}>
            <Plus className="w-5 h-5 mr-2" />
            Add Track
          </Button>
        </div>

        {/* Info */}
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground">
            🎚️ Record to individual tracks, adjust volume, mute or solo tracks, then play them all together!
          </p>
        </div>
      </div>
    </Card>
  );
};
