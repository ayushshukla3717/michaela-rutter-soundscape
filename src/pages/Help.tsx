import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Mic, Piano, Radio, Download, HelpCircle } from "lucide-react";

const tutorials = [
  {
    icon: Mic,
    title: "How to Record Your Voice",
    steps: [
      "Click 'Start Recording' button in the Voice Recorder section",
      "Allow microphone access when prompted by your browser",
      "Sing or speak into your microphone - watch the timer count up",
      "Use 'Pause' to take breaks, 'Stop' when you're done",
      "Listen to your recording using the playback controls",
      "Download your recording or clear it to start fresh"
    ]
  },
  {
    icon: Piano,
    title: "How to Play Virtual Instruments",
    steps: [
      "Find the Virtual Piano section on the homepage",
      "Click on the piano keys with your mouse or touchscreen",
      "Use keyboard shortcuts: A-K for white keys, W-U for black keys",
      "Press multiple keys together to create chords",
      "Experiment with different melodies and harmonies",
      "Record while you play to capture your performance"
    ]
  },
  {
    icon: Radio,
    title: "How to Layer Multiple Tracks",
    steps: [
      "Record your first track (vocals or instrument)",
      "Your track will appear in the Track Sequencer",
      "Record additional tracks - they'll stack automatically",
      "Use volume sliders to balance each track",
      "Play individual tracks or all together",
      "Delete unwanted tracks with the trash icon"
    ]
  },
  {
    icon: Download,
    title: "How to Export Your Music",
    steps: [
      "Complete all your recordings and arrangements",
      "Go to the Track Sequencer section",
      "Click 'Export Mix' to combine all tracks",
      "Choose MP3 or WAV format (WAV for higher quality)",
      "Your browser will download the final mix",
      "Share your creation with friends and family!"
    ]
  }
];

const Help = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-primary mb-4 animate-float">
              <HelpCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Help & Tutorials
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome to Michaela Rutter's Music Studio! Here's everything you need 
              to know to start creating amazing music.
            </p>
          </div>

          <div className="space-y-8">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className="p-8 bg-card/50 backdrop-blur-sm border-border">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-gradient-primary shrink-0">
                    <tutorial.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold">{tutorial.title}</h2>
                </div>
                
                <ol className="space-y-3 ml-2">
                  {tutorial.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm">
                        {stepIndex + 1}
                      </span>
                      <span className="text-foreground/90 pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>

          <Card className="mt-12 p-8 bg-gradient-accent border-none">
            <h2 className="text-2xl font-bold mb-3 text-accent-foreground">
              Still Have Questions?
            </h2>
            <p className="text-accent-foreground/90 mb-6">
              Feel free to experiment and explore! The best way to learn is by creating. 
              Remember, Michaela Rutter believes in your musical creativity!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:contact@michaelarutter.music" 
                className="px-6 py-3 rounded-lg bg-card text-card-foreground font-semibold hover:opacity-90 transition-opacity text-center"
              >
                Email Support
              </a>
              <a 
                href="/" 
                className="px-6 py-3 rounded-lg bg-card/50 text-card-foreground font-semibold hover:opacity-90 transition-opacity text-center"
              >
                Back to Studio
              </a>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Help;
