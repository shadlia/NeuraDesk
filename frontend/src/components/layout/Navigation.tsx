import { Brain, LogOut, Settings, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { getUserProfile } from "@/api/profileApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const isAuthenticated = !!session;
  const userEmail = session?.user?.email;
  const { user_metadata } = session?.user || {};
  
  // Initial name from session metadata
  const initialName = user_metadata?.first_name || user_metadata?.full_name || "User";
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(initialName);

  // Load user profile data
  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData();
    }
  }, [isAuthenticated]);

  const loadProfileData = async () => {
    try {
      const profile = await getUserProfile();
      if (profile) {
        if (profile.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
        if (profile.first_name) {
          setDisplayName(profile.first_name);
        }
      }
    } catch (error) {
      // Silently fail - profile is optional
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo Section */}
          <button 
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
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
                  onClick={() => navigate("/dashboard")}
                  className="gap-2 hover:bg-accent/10 transition-colors hidden md:flex"
                >
                  <span>Dashboard</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-auto gap-2 px-2 hover:bg-accent/5 rounded-xl">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-white text-sm font-medium">
                          {displayName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start text-sm hidden md:flex">
                        <span className="font-medium">{displayName}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userEmail}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer md:hidden" onClick={() => navigate("/dashboard")}>
                      <Brain className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer" 
                      onSelect={(e) => {
                        e.preventDefault();
                        handleProfileClick();
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

      {/* Profile Modal */}
      <ProfileModal 
        open={isProfileModalOpen} 
        onOpenChange={(open) => {
          setIsProfileModalOpen(open);
          if (!open) {
            // Reload profile data when modal closes
            loadProfileData();
          }
        }} 
      />
    </>
  );
};
