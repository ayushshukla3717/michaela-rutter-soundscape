import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const updateWaveform = useCallback(() => {
    if (analyserRef.current && isRecording && !isPaused) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteTimeDomainData(dataArray);
      
      // Sample 50 points for visualization
      const samples = 50;
      const step = Math.floor(dataArray.length / samples);
      const newData = [];
      for (let i = 0; i < samples; i++) {
        newData.push((dataArray[i * step] - 128) / 128);
      }
      setWaveformData(newData);
      animationRef.current = requestAnimationFrame(updateWaveform);
    }
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;

      // Set up audio analyser for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setWaveformData([]);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start waveform animation
      animationRef.current = requestAnimationFrame(updateWaveform);
      
      toast.success("Recording started!");
    } catch (error) {
      toast.error("Failed to access microphone. Please allow microphone access.");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      toast.success("Recording stopped!");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        animationRef.current = requestAnimationFrame(updateWaveform);
        toast("Recording resumed");
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        toast("Recording paused");
      }
      setIsPaused(!isPaused);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const downloadAudio = () => {
    if (audioURL) {
      const a = document.createElement("a");
      a.href = audioURL;
      a.download = `michaela-rutter-recording-${Date.now()}.webm`;
      a.click();
      toast.success("Downloading your recording!");
    }
  };

  const clearRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL("");
    setRecordingTime(0);
    setIsPlaying(false);
    setWaveformData([]);
    toast("Recording cleared");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-primary">
          <Mic className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Voice Recorder</h2>
          <p className="text-sm text-muted-foreground">Record your vocals or instruments with real-time waveform</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Recording Timer & Waveform */}
        <div className="text-center p-4 rounded-lg bg-muted">
          <div className="text-4xl font-mono font-bold gradient-text">
            {formatTime(recordingTime)}
          </div>
          
          {/* Live Waveform Display */}
          <div className="h-16 mt-4 flex items-center justify-center gap-[2px]">
            {isRecording && !isPaused ? (
              waveformData.map((value, index) => (
                <div
                  key={index}
                  className="w-1 bg-gradient-to-t from-primary to-secondary rounded-full transition-all duration-75"
                  style={{ 
                    height: `${Math.max(4, Math.abs(value) * 60 + 4)}px`,
                  }}
                />
              ))
            ) : isRecording && isPaused ? (
              <span className="text-muted-foreground text-sm">Paused...</span>
            ) : (
              <span className="text-muted-foreground text-sm">
                {audioURL ? "Recording ready" : "Press Start to begin"}
              </span>
            )}
          </div>
          
          {isRecording && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-destructive animate-pulse'}`} />
              <span className="text-sm text-muted-foreground">
                {isPaused ? "Paused" : "Recording..."}
              </span>
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex flex-wrap gap-3 justify-center">
          {!isRecording ? (
            <Button variant="hero" size="lg" onClick={startRecording}>
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="lg" onClick={pauseRecording}>
                <Pause className="w-5 h-5 mr-2" />
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button variant="destructive" size="lg" onClick={stopRecording}>
                <Square className="w-5 h-5 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Playback Controls */}
        {audioURL && (
          <>
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={() => setIsPlaying(false)}
              className="w-full"
              controls
            />
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="default" onClick={playAudio}>
                <Play className="w-5 h-5 mr-2" />
                {isPlaying ? "Playing" : "Play"}
              </Button>
              <Button variant="accent" onClick={downloadAudio}>
                <Download className="w-5 h-5 mr-2" />
                Download
              </Button>
              <Button variant="ghost" onClick={clearRecording}>
                <Trash2 className="w-5 h-5 mr-2" />
                Clear
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
