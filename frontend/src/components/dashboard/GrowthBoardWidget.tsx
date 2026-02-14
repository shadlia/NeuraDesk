import React from "react";
import { Brain, Rocket, Code, Target, Zap, X, ShieldCheck, RefreshCcw, ArrowUpRight, CheckCircle2, Circle, Trophy, LayoutDashboard, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/api";
import { MemoryFact } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProjectGroup {
    name: string;
    description: string;
    memories: MemoryFact[];
    milestones: string[];
    progress: number;
}

export const GrowthBoardWidget = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [memories, setMemories] = React.useState<MemoryFact[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedProject, setSelectedProject] = React.useState<ProjectGroup | null>(null);

    const fetchMemories = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await api.getMemories(user.id);
            setMemories(data);
        } catch (err) {
            console.error("Failed to fetch memories:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchMemories();
    }, [user?.id]);

    const handleDelete = async (factId: string) => {
        if (!user?.id) return;
        try {
            await api.deleteMemory(factId, user.id);
            setMemories(prev => prev.filter(m => m.id !== factId));
            toast({
                title: "Memory Forgotten",
                description: "Removed from your knowledge base.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete memory.",
            });
        }
    };

    const handleTrackProgress = (projectName: string) => {
        navigate("/chat", { state: { initialMessage: `I want to update my progress and milestones for "${projectName}". What's the current status and what should we tackle next?` } });
    };

    // Advanced Filtering & Grouping Logic
    const sections = React.useMemo(() => {
        // 1. Group Projects and Project Milestones
        const projectMemories = memories.filter(m => 
            m.category === 'project' || m.category === 'project_milestone'
        );
        const projectGroups: Record<string, ProjectGroup> = {};

        projectMemories.forEach(m => {
            // Extract base project ID from key
            // e.g., "project_x_milestone_123" -> "x"
            // e.g., "project_x" -> "x"
            let baseKey = m.key
                .replace(/^project_/, '')      // Remove "project_" prefix
                .split('_milestone_')[0]        // Remove "_milestone_xxx" suffix
                .replace(/_/g, ' ');            // Convert underscores to spaces
            
            // Fallback: use first part of value if key is generic
            if (!baseKey || baseKey.toLowerCase() === 'project' || baseKey.toLowerCase() === 'name') {
                baseKey = m.value.split(/[.!,:]/)[0].slice(0, 30);
            }

            // Normalize to Title Case
            const projectName = baseKey.charAt(0).toUpperCase() + baseKey.slice(1).toLowerCase();
            const isMilestone = m.category === 'project_milestone' || m.key.includes('_milestone_');

            if (!projectGroups[projectName]) {
                projectGroups[projectName] = {
                    name: projectName,
                    description: isMilestone ? '' : m.value, // Only set description from base project
                    memories: [m],
                    milestones: isMilestone ? [m.value] : [],
                    progress: isMilestone ? 50 : 35 // Milestones indicate more progress
                };
            } else {
                projectGroups[projectName].memories.push(m);
                if (isMilestone) {
                    projectGroups[projectName].milestones.push(m.value);
                } else if (!projectGroups[projectName].description) {
                    projectGroups[projectName].description = m.value;
                }
            }
        });

        // Calculate progress based on milestones
        Object.values(projectGroups).forEach(pg => {
            if (pg.milestones.length > 0) {
                pg.progress = Math.min(35 + (pg.milestones.length * 15), 100);
            }
        });

        // 2. Identify Skills
        const skills = memories.filter(m => 
            (m.category === 'personal' || m.category === 'preference') && 
            (m.key.toLowerCase().includes('stack') || 
             m.key.toLowerCase().includes('tech') || 
             m.key.toLowerCase().includes('language') ||
             m.key.toLowerCase().includes('skill') ||
             /(python|react|typescript|javascript|node|sql|rust|golang|java|c\+\+)/i.test(m.value)
            )
        );

        // 3. Current Focus (Exclude Personal info like Name)
        const focus = memories.filter(m => 
            m.category !== 'personal' && (
                m.key.toLowerCase().includes('goal') || 
                m.key.toLowerCase().includes('focus') || 
                m.key.toLowerCase().includes('deadline') ||
                (m.importance > 0.8 && m.category === 'project')
            )
        );

        // 4. Everything Else (Bio/Context - Where 'Name' belongs)
        const bio = memories.filter(m => 
            !projectMemories.includes(m) && 
            !skills.includes(m) && 
            !focus.includes(m)
        );

        return { 
            projects: Object.values(projectGroups), 
            skills, 
            focus, 
            bio 
        };
    }, [memories]);

    if (loading) return <LoadingState />;

    if (memories.length === 0) return <EmptyState />;

    return (
        <>
            <Card className="h-full bg-gradient-to-br from-card/80 to-accent/5 border-border overflow-hidden flex flex-col shadow-xl ring-1 ring-border/50 backdrop-blur-md">
                <CardHeader className="pb-4 border-b border-border/50 bg-background/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <div className="p-3 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 ring-1 ring-accent/30 shadow-inner">
                                <LayoutDashboard className="h-6 w-6 text-accent" />
                             </div>
                             <div>
                                 <CardTitle className="text-xl font-heading tracking-tight flex items-center gap-2">
                                    Growth & Progress
                                    <Badge variant="outline" className="text-[10px] font-bold border-accent/30 text-accent uppercase px-2">Live Context</Badge>
                                 </CardTitle>
                                 <CardDescription className="text-xs font-medium opacity-70">Synthesized milestones from your digital brain</CardDescription>
                             </div>
                        </div>
                         <Button variant="ghost" size="icon" className="h-9 w-9 opacity-60 hover:opacity-100 hover:bg-accent/10 rounded-full transition-all" onClick={fetchMemories}>
                            <RefreshCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                
                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-10">
                        
                        {/* 1. FOCUS HIGHLIGHT */}
                        {sections.focus.length > 0 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                                 <SectionTitle icon={Target} title="Primary Focus" color="text-red-500" />
                                 <div className="grid grid-cols-1 gap-3">
                                    {sections.focus.map(m => (
                                        <FocusCard key={m.id} item={m} onDelete={handleDelete} />
                                    ))}
                                 </div>
                            </div>
                        )}

                        {/* 2. PROJECT TIMELINES */}
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            <div className="flex items-center justify-between px-1">
                                <SectionTitle icon={Rocket} title="Active Project Timelines" color="text-blue-500" />
                                <span className="text-[10px] font-bold bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full uppercase tracking-tighter">
                                    {sections.projects.length} Tracked
                                </span>
                            </div>
                            
                            {sections.projects.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6">
                                    {sections.projects.map((proj, idx) => (
                                        <EnhancedProjectCard 
                                            key={proj.name} 
                                            project={proj} 
                                            onDelete={handleDelete} 
                                            onTrack={handleTrackProgress} 
                                            onViewDetail={() => setSelectedProject(proj)}
                                            index={idx}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptySectionPlaceholder text="No connected project data found. Talk to me about your work!" />
                            )}
                        </div>

                        {/* 3. CORE SKILLS */}
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            <SectionTitle icon={Code} title="Skill Graph" color="text-teal-500" />
                             {sections.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2.5">
                                    {sections.skills.map(m => (
                                        <SkillBadge key={m.id} item={m} onDelete={handleDelete} />
                                    ))}
                                </div>
                             ) : (
                                <EmptySectionPlaceholder text="I'm observing your technical patterns..." />
                             )}
                        </div>

                         {/* 4. CONTEXT BITS */}
                        {sections.bio.length > 0 && (
                            <div className="space-y-4 pt-6 border-t border-border/50 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                                <SectionTitle icon={Zap} title="Contextual Preferences" color="text-purple-500" />
                                <div className="flex flex-wrap gap-2.5">
                                    {sections.bio.map(m => (
                                        <ContextItem key={m.id} item={m} onDelete={handleDelete} />
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </ScrollArea>
            </Card>

            {/* Project Milestones Modal */}
            <ProjectMilestonesModal 
                project={selectedProject} 
                isOpen={!!selectedProject} 
                onClose={() => setSelectedProject(null)} 
            />
        </>
    );
};

// --- Helper Components ---

const ProjectMilestonesModal = ({ project, isOpen, onClose }: { project: ProjectGroup | null, isOpen: boolean, onClose: () => void }) => {
    if (!project) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl bg-card border-border/60 shadow-2xl rounded-3xl overflow-hidden p-0 gap-0">
                <div className="bg-gradient-to-br from-blue-600/10 via-background to-background p-6 border-b border-border/40">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                             <Rocket className="h-4 w-4 text-blue-600/80" />
                             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600/40">Analysis</span>
                        </div>
                        <DialogTitle className="text-2xl font-heading font-black tracking-tighter text-foreground">{project.name}</DialogTitle>
                    </DialogHeader>
                </div>
                
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6 bg-muted/30 rounded-2xl p-4 border border-border/50">
                        <div className="space-y-0.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Completion</span>
                            <div className="text-xl font-black text-blue-600">{project.progress}%</div>
                        </div>
                        <Progress value={project.progress} className="w-1/2 h-2 bg-blue-500/10" />
                    </div>

                    <ScrollArea className="h-[320px] pr-4">
                        <div className="space-y-6 relative ml-1">
                            {/* Vertical Line */}
                            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/40" />

                            {project.memories.map((m, idx) => (
                                <div key={m.id} className="relative pl-8 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 40}ms` }}>
                                    {/* Timeline Dot */}
                                    <div className="absolute left-0 top-1.5 h-4.5 w-4.5 rounded-full border border-background bg-blue-500 flex items-center justify-center shadow-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                    </div>
                                    
                                    <div className="space-y-0.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[8px] font-black uppercase text-blue-600/60 tracking-wider">
                                                {formatKey(m.key)}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold leading-relaxed text-foreground/80">
                                            {m.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <div className="p-5 bg-muted/40 border-t border-border/50 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest">Dismiss</Button>
                    <Button className="h-9 px-5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 text-[9px] font-black uppercase tracking-widest" onClick={() => {
                        window.location.href = `/chat?initialMessage=Detail me more milestones for ${project.name}`;
                        onClose();
                    }}>
                        Expand in Chat
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const SectionTitle = ({ icon: Icon, title, color }: any) => (
    <div className="flex items-center gap-2.5 text-sm font-black text-foreground/90 uppercase tracking-widest">
        <div className={`p-1.5 rounded-lg bg-current opacity-10 ${color}`.replace('text-', 'bg-')} />
        <Icon className={`h-4 w-4 ${color}`} />
        <h3>{title}</h3>
    </div>
);

const formatKey = (key: string) => {
    // Special handling for milestones to show clean dates
    if (key.includes('_milestone_')) {
        const parts = key.split('_');
        // Find date part (simple check for YYYY-MM-DD format)
        const datePart = parts.find(p => /^\d{4}-\d{2}-\d{2}$/.test(p));
        if (datePart) {
            return new Date(datePart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return "Milestone Update";
    }

    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const FocusCard = ({ item, onDelete }: any) => (
    <div className="group relative rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 to-transparent p-5 pr-12 transition-all hover:bg-red-500/15 hover:shadow-lg hover:-translate-y-0.5">
        <h4 className="text-[10px] font-black text-red-600 uppercase mb-2 tracking-widest flex items-center gap-2">
            <Trophy className="h-3 w-3" />
            {formatKey(item.key)}
        </h4>
        <p className="text-sm font-bold leading-relaxed text-foreground/90">{item.value}</p>
        <DeleteButton onClick={() => onDelete(item.id)} />
    </div>
);

const EnhancedProjectCard = ({ project, onDelete, onTrack, onViewDetail, index }: { project: ProjectGroup, onDelete: any, onTrack: any, onViewDetail: any, index: number }) => {
    return (
        <div className="group relative flex flex-col rounded-2xl border border-border/60 bg-background/60 p-5 shadow-lg transition-all hover:shadow-2xl hover:border-blue-500/40 hover:bg-background/80">
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <h4 
                        className="text-lg font-black tracking-tighter text-foreground group-hover:text-blue-600 transition-colors cursor-pointer"
                        onClick={onViewDetail}
                    >
                        {project.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-[90%]">
                        {project.description}
                    </p>
                </div>
                <div className="flex gap-1">
                    <DeleteButton onClick={() => onDelete(project.memories[0].id)} className="static opacity-0 group-hover:opacity-100" />
                </div>
            </div>

            <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        <span>Development Phase</span>
                        <span className="text-blue-600">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2 bg-blue-500/10" />
                </div>

                {/* Milestones / Fragments */}
                {project.milestones.length > 0 && (
                    <div className="space-y-2 py-2">
                        <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Recent Milestones</p>
                        <ul className="space-y-1.5">
                            {project.milestones.slice(0, 3).map((m, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    {m}
                                </li>
                            ))}
                            {project.milestones.length > 3 && (
                                <li className="text-[10px] text-muted-foreground italic pl-5">
                                    + {project.milestones.length - 3} more details remembered
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            
            <div className="flex items-center justify-between pt-5 border-t border-border/30 mt-4">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
                    onClick={onViewDetail}
                >
                    <LayoutDashboard className="h-3 w-3" />
                    Milestones
                </Button>
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-lg group/btn"
                    onClick={() => onTrack(project.name)}
                >
                    Update Progress
                    <ArrowUpRight className="h-4 w-4 transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </Button>
            </div>
        </div>
    );
};

const SkillBadge = ({ item, onDelete }: any) => {
    const isBoolean = item.value.toLowerCase() === 'true';
    const label = isBoolean ? formatKey(item.key) : item.value;
    
    return (
        <Badge variant="secondary" className="group relative pr-8 pl-3.5 py-2 bg-background hover:bg-teal-500/10 transition-all font-bold text-xs ring-1 ring-border/50 hover:ring-teal-500/30 text-foreground/80">
            <span className="h-2 w-2 rounded-full bg-teal-500 mr-2" />
            {label}
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-red-500/20 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
            >
                <X className="h-3 w-3" />
            </button>
        </Badge>
    );
};

const ContextItem = ({ item, onDelete }: any) => {
    const isBoolean = item.value.toLowerCase() === 'true';
    let content = isBoolean ? 
        <span className="font-bold">{formatKey(item.key)}</span> : 
        <><span className="opacity-50 font-medium mr-1">{formatKey(item.key)}:</span><span className="font-bold text-foreground/90">{item.value}</span></>;

    return (
        <div className="group flex items-center gap-2 rounded-xl border border-border/50 bg-background/40 px-4 py-2 text-xs text-muted-foreground transition-all hover:border-purple-500/40 hover:text-purple-600 hover:shadow-md hover:bg-background/80">
            {content}
            <button 
                onClick={() => onDelete(item.id)}
                className="ml-1 rounded-lg p-1 hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
};

const DeleteButton = ({ onClick, className }: any) => (
    <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`absolute right-3 top-3 p-2 rounded-xl text-muted-foreground/30 opacity-0 hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 transition-all ${className}`}
    >
        <X className="h-4 w-4" />
    </button>
);

const EmptySectionPlaceholder = ({ text }: { text: string }) => (
    <div className="rounded-2xl border-2 border-dashed border-border/40 p-10 text-center bg-background/20 backdrop-blur-sm">
        <Sparkles className="h-8 w-8 text-accent/30 mx-auto mb-4" />
        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">{text}</p>
    </div>
);

const LoadingState = () => (
    <Card className="h-full bg-card/50 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
            <Brain className="h-12 w-12 text-accent animate-pulse" />
            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-accent animate-pulse">Initializing Synaptic Map...</p>
    </Card>
);

const EmptyState = () => (
    <Card className="h-full bg-card/50 border-dashed flex flex-col items-center justify-center p-12 text-center space-y-6">
         <div className="relative p-6 rounded-3xl bg-accent/5 ring-1 ring-accent/20">
            <Trophy className="h-12 w-12 text-accent opacity-40" />
            <div className="absolute top-0 right-0 h-3 w-3 bg-accent rounded-full animate-ping" />
         </div>
        <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight">Your Digital Brain Awaits</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[250px]">
                I haven't synthesized your project patterns yet. Mention your current projects and goals in chat to build your timeline.
            </p>
        </div>
        <Button onClick={() => window.location.href='/chat'} className="bg-accent text-white rounded-full px-8 shadow-lg shadow-accent/20">
            Wake Up My Brain
        </Button>
    </Card>
);



