import React from "react";
import { Brain, User, Briefcase, Star, Sparkles, X, ShieldCheck, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/api";
import { MemoryFact } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

export const UserProfileWidget = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [memories, setMemories] = React.useState<MemoryFact[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchMemories();
    }, [user?.id]);

    const fetchMemories = async () => {
        if (!user?.id) return;
        try {
            const data = await api.getMemories(user.id);
            setMemories(data);
        } catch (err) {
            console.error("Failed to fetch memories:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (factId: string) => {
        if (!user?.id) return;
        try {
            await api.deleteMemory(factId, user.id);
            setMemories(prev => prev.filter(m => m.id !== factId));
            toast({
                title: "Memory Forgotten",
                description: "I've removed this fact from my knowledge base.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete memory.",
                variant: "destructive",
            });
        }
    };

    const categorized = React.useMemo(() => {
        return {
            personal: memories.filter(m => m.category === 'personal'),
            preference: memories.filter(m => m.category === 'preference'),
            project: memories.filter(m => m.category === 'project'),
        };
    }, [memories]);

    // formatting helper
    const formatValue = (key: string, value: string) => {
        const isTrue = value.toLowerCase() === 'true';
        if (isTrue) return key;
        return <>{<span className="opacity-70 mr-1">{key}:</span>} {value}</>;
    };

    if (loading) {
        return (
            <Card className="h-full bg-gradient-to-br from-background to-accent/5 transition-all duration-500 border-accent/20">
                <CardHeader>
                    <CardTitle className="text-xl font-heading flex items-center gap-2">
                        <Brain className="h-5 w-5 text-accent animate-pulse" />
                        Memory Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8 text-muted-foreground animate-pulse">
                    Accessing neural pathways...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full bg-gradient-to-br from-background to-accent/5 border-accent/20 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-3 border-b border-accent/10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-heading flex items-center gap-2">
                        <Brain className="h-5 w-5 text-accent" />
                        Memory Profile
                    </CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <ShieldCheck className="h-4 w-4 text-muted-foreground hover:text-accent transition-colors cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-xs p-3">
                                <p>These are facts I've learned from our conversations to help me assist you better. You have full control to remove them.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <CardDescription className="text-xs">
                    {memories.length > 0 
                        ? "Context I use to personalize your experience" 
                        : "I'm still learning about you..."}
                </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-5 p-4 overflow-y-auto pr-2 custom-scrollbar flex-1 relative">
                {memories.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center justify-center opacity-80">
                         <div className="relative mb-4">
                            <Sparkles className="h-12 w-12 text-accent opacity-80" />
                            <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
                         </div>
                        <p className="text-sm font-medium">No memories stored yet</p>
                        <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
                            Chat with me about your projects, preferences, or yourself to build your profile!
                        </p>
                        <div className="mt-4 text-xs bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20">
                            Try: "My name is [Name]"
                        </div>
                    </div>
                ) : (
                    <>
                         {/* Personal Info */}
                        {categorized.personal.length > 0 && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h4 className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                                    <User className="h-3 w-3" /> About You
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {categorized.personal.map(m => (
                                        <Badge key={m.id} variant="outline" className="group pl-2.5 pr-1.5 py-1 bg-background/50 border-accent/20 hover:border-accent/50 transition-colors">
                                           <span className="mr-1">{formatValue(m.key, m.value)}</span>
                                           <button onClick={() => handleDelete(m.id)} className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5 transition-all">
                                                <X className="h-3 w-3" />
                                           </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {categorized.project.length > 0 && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
                                <h4 className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                                    <Briefcase className="h-3 w-3" /> Projects
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {categorized.project.map(m => (
                                        <div key={m.id} className="group relative rounded-lg bg-accent/5 hover:bg-accent/10 border border-accent/10 p-2.5 transition-all">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-xs font-semibold text-accent block mb-0.5">{m.key}</span>
                                                    <p className="text-xs text-muted-foreground leading-tight line-clamp-2">{m.value}</p>
                                                </div>
                                                <button onClick={() => handleDelete(m.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preferences */}
                        {categorized.preference.length > 0 && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
                                <h4 className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                                    <Star className="h-3 w-3" /> Preferences
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {categorized.preference.map(m => (
                                        <Badge key={m.id} variant="secondary" className="group pl-2.5 pr-1.5 py-1 bg-secondary/50 hover:bg-secondary transition-colors text-secondary-foreground font-normal">
                                            {m.value}
                                            <button onClick={() => handleDelete(m.id)} className="ml-1.5 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
            {memories.length > 0 && (
                <div className="p-2 border-t border-accent/5 bg-accent/5 text-center">
                    <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                        <Info className="h-3 w-3" />
                        AI uses this context to personalize answers
                    </p>
                </div>
            )}
        </Card>
    );
};
