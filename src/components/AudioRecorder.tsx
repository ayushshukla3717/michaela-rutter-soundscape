import { useState, useRef, useEffect } from "react";
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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success("Recording started!");
    } catch (error) {
      toast.error("Failed to access microphone");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.success("Recording stopped!");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        toast("Recording resumed");
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
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
    setAudioURL("");
    setRecordingTime(0);
    setIsPlaying(false);
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
          <p className="text-sm text-muted-foreground">Record your vocals or instruments</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Recording Timer */}
        <div className="text-center p-4 rounded-lg bg-muted">
          <div className="text-4xl font-mono font-bold gradient-text">
            {formatTime(recordingTime)}
          </div>
          {isRecording && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
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
