import { Brain, CheckCircle2, ArrowRight, Calendar, ListTodo, PenTool, Mail, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { HeroPreview } from "@/components/home/HeroPreview";
import { Navigation } from "@/components/layout/Navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background selection:bg-accent/20 font-body">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Organic Background Shapes */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px] mix-blend-multiply animate-pulse" />
          <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-[120px] mix-blend-multiply" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] bg-[radial-gradient(circle_at_center,rgba(var(--accent),0.03),transparent_70%)]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 inline-flex items-center rounded-full border bg-background/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm shadow-sm">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-accent" />
              Your intelligent daily companion
            </div>
            
            <h1 className="mb-6 max-w-4xl text-5xl font-heading font-bold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
              Master Your Day with
              <span className="block mt-2 bg-gradient-to-r from-accent via-teal-500 to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Intelligent Assistance
              </span>
            </h1>
            
            <p className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
              More than just a chat. NeuraDesk helps you plan your day, organize tasks, draft content, and solve problems instantly. It's your personal productivity partner.
            </p>

            <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:justify-center w-full sm:w-auto">
              <Button 
                size="lg"
                className="h-14 rounded-2xl bg-accent px-8 text-base font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent/90 hover:scale-105 hover:shadow-xl"
                onClick={() => navigate("/auth")}
              >
                Start Organizing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="h-14 rounded-2xl border-2 px-8 text-base font-semibold hover:bg-accent/5 hover:border-accent/30 transition-all"
                onClick={() => navigate("/chat")}
              >
                Try Demo
              </Button>
            </div>

            {/* Hero Preview */}
            <div className="relative w-full max-w-5xl perspective-1000">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-accent/20 via-teal-500/20 to-accent/20 blur-xl opacity-50" />
              <HeroPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Daily Tasks Features */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-heading font-bold sm:text-4xl">
              Designed for Your Daily Flow
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Simplify your routine with tools built for getting things done.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: ListTodo,
                title: "Task Management",
                desc: "Break down complex projects into manageable steps. Just ask NeuraDesk to 'create a plan for my project'."
              },
              {
                icon: Calendar,
                title: "Daily Planning",
                desc: "Organize your schedule efficiently. Get suggestions on how to prioritize your day for maximum productivity."
              },
              {
                icon: PenTool,
                title: "Creative Assistant",
                desc: "Draft emails, write reports, or brainstorm ideas. NeuraDesk is your always-available creative partner."
              }
            ].map((feature, i) => (
              <div key={i} className="group relative rounded-3xl border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-accent/30">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-all group-hover:bg-accent group-hover:text-white group-hover:scale-110 group-hover:rotate-3">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-heading font-bold">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog / Insights Section */}
      <section className="py-24 bg-accent/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-4">Productivity Insights</h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Tips and tricks to get the most out of your day with NeuraDesk.
              </p>
            </div>
            <Button variant="ghost" className="text-accent hover:text-accent/80 hover:bg-accent/10">
              View all articles <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                image: "bg-gradient-to-br from-blue-100 to-indigo-100",
                category: "Productivity",
                title: "5 Ways AI Can Streamline Your Morning Routine",
                readTime: "4 min read"
              },
              {
                image: "bg-gradient-to-br from-teal-100 to-emerald-100",
                category: "Tutorial",
                title: "Mastering Task Delegation with NeuraDesk",
                readTime: "6 min read"
              },
              {
                image: "bg-gradient-to-br from-orange-100 to-amber-100",
                category: "Case Study",
                title: "How Freelancers Save 10+ Hours a Week",
                readTime: "5 min read"
              }
            ].map((post, i) => (
              <div key={i} className="group cursor-pointer flex flex-col gap-4">
                <div className={`aspect-video w-full rounded-2xl ${post.image} transition-transform duration-300 group-hover:scale-[1.02]`} />
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="text-accent bg-accent/10 px-2 py-1 rounded-full">{post.category}</span>
                    <span className="text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-heading font-bold group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-6">
                We're Here to Help
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Have questions about how NeuraDesk can fit into your workflow? 
                Our team is ready to assist you with setup, customization, or general inquiries.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Email Us</p>
                    <p className="text-muted-foreground">support@neuradesk.ai</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Live Chat</p>
                    <p className="text-muted-foreground">Available Mon-Fri, 9am-5pm</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-8 shadow-lg">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="John" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Doe" className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="john@example.com" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea placeholder="How can we help you?" className="rounded-xl min-h-[120px]" />
                </div>
                <Button className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold shadow-md">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-accent" />
            <span className="font-heading font-bold text-lg">NeuraDesk</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 NeuraDesk. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
