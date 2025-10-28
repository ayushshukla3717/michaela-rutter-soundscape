import { Button } from "@/components/ui/button";
import { Mic, Piano, Radio } from "lucide-react";
import heroImage from "@/assets/hero-music.jpg";

export const Hero = () => {
  const scrollToStudio = () => {
    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-hero opacity-80" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 flex justify-center gap-4 animate-float">
            <div className="p-4 rounded-full bg-primary/20 backdrop-blur-sm">
              <Mic className="w-8 h-8 text-primary" />
            </div>
            <div className="p-4 rounded-full bg-secondary/20 backdrop-blur-sm">
              <Piano className="w-8 h-8 text-secondary" />
            </div>
            <div className="p-4 rounded-full bg-accent/20 backdrop-blur-sm">
              <Radio className="w-8 h-8 text-accent" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text animate-pulse-glow">
            Welcome to Your Creative Music Space
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/90 mb-8 leading-relaxed">
            Hi, I'm <span className="font-semibold text-primary">Michaela Rutter</span>! 
            This is your online music studio where you can record vocals, 
            play virtual instruments, layer tracks, and create amazing songs. 
            Let your creativity flow!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="lg" onClick={scrollToStudio} className="text-lg px-8">
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
            <Button variant="accent" size="lg" className="text-lg px-8">
              <Piano className="w-5 h-5 mr-2" />
              Play Instruments
            </Button>
          </div>
          
          <div className="mt-12 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border">
            <p className="text-sm text-muted-foreground">
              ✨ Record unlimited tracks • 🎹 Play piano, guitar & drums • 🎵 Mix and export your music
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
