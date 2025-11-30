import { Brain, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const Navigation = ({ isAuthenticated = false, onLogout }: NavigationProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic here
    // Example:
    // await supabase.auth.signOut();
    
    // Call the provided logout handler
    if (onLogout) {
      onLogout();
    }
    
    // Navigate to home
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo Section */}
        <button 
          onClick={() => navigate(isAuthenticated ? "/chat" : "/")}
          className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-200 shadow-sm">
            <Brain className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground tracking-tight">
              NeuraDesk
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Your AI Knowledge Assistant
            </p>
          </div>
        </button>
        
        {/* Actions Section */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-2 hover:bg-accent/10 transition-colors hidden md:flex"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
              
              <div className="flex items-center gap-3 pl-3 border-l">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-white text-sm font-medium">
                      G
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium">Guest User</p>
                    <p className="text-xs text-muted-foreground">guest@neuradesk.ai</p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout}
                  className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/auth")}
                className="hover:bg-accent/10"
              >
                Sign In
              </Button>
              <Button 
                size="sm"
                className="bg-accent hover:bg-accent/90 shadow-sm"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
