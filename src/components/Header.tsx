import { Music2, Home, Disc, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-lg bg-gradient-primary animate-pulse-glow">
              <Music2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Michaela Rutter's Music Studio</h1>
              <p className="text-xs text-muted-foreground">Create Your Sound</p>
            </div>
          </Link>
          
          <nav className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/samples">
              <Button variant="ghost" size="sm">
                <Disc className="w-4 h-4 mr-2" />
                Samples
              </Button>
            </Link>
            <Link to="/help">
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
