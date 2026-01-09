import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AudioRecorder } from "@/components/AudioRecorder";
import { VirtualPiano } from "@/components/VirtualPiano";
import { VirtualGuitar } from "@/components/VirtualGuitar";
import { ChorusEffects } from "@/components/ChorusEffects";
import { TrackSequencer } from "@/components/TrackSequencer";
import { DrumMachine } from "@/components/DrumMachine";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <main id="studio" className="container mx-auto px-4 py-12 space-y-12">
        <AudioRecorder />
        <ChorusEffects />
        <VirtualPiano />
        <VirtualGuitar />
        <DrumMachine />
        <TrackSequencer />
      </main>

      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p className="mb-2">
            © 2025 Michaela Rutter's Music Studio. Made with 💜 for music creators everywhere.
          </p>
          <p className="text-sm mb-2">
            Record • Create • Share • Inspire
          </p>
          <p className="text-xs text-muted-foreground/60">
            Made by Ayush
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
