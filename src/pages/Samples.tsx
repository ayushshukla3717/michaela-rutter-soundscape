import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music } from "lucide-react";

const sampleTracks = [
  {
    id: 1,
    title: "Summer Dreams",
    description: "A bright, uplifting track with piano and vocals",
    duration: "3:24",
    genre: "Pop"
  },
  {
    id: 2,
    title: "Midnight Jazz",
    description: "Smooth jazz piano with atmospheric vibes",
    duration: "4:12",
    genre: "Jazz"
  },
  {
    id: 3,
    title: "Electric Sunrise",
    description: "Energetic electronic track with layered synths",
    duration: "2:58",
    genre: "Electronic"
  },
  {
    id: 4,
    title: "Acoustic Memories",
    description: "Gentle acoustic guitar and soft vocals",
    duration: "3:45",
    genre: "Acoustic"
  },
];

const Samples = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-primary mb-4 animate-float">
              <Music className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Sample Music Gallery
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Listen to tracks created with Michaela Rutter's Music Studio. 
              Get inspired and start creating your own masterpieces!
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {sampleTracks.map((track) => (
              <Card key={track.id} className="p-6 bg-card/50 backdrop-blur-sm border-border hover:glow-effect transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-primary shrink-0">
                    <Music className="w-6 h-6 text-primary-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold mb-1">{track.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{track.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        {track.genre}
                      </span>
                      <span>{track.duration}</span>
                    </div>

                    <Button variant="default" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Play Sample
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-12 p-8 text-center bg-gradient-primary border-none">
            <h2 className="text-2xl font-bold mb-3 text-primary-foreground">
              Ready to Create Your Own?
            </h2>
            <p className="text-primary-foreground/90 mb-6">
              Start recording, layering tracks, and making music that's uniquely yours!
            </p>
            <Button variant="secondary" size="lg" onClick={() => window.location.href = '/'}>
              Go to Studio
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Samples;
