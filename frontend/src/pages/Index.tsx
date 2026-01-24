import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Target, Scale, Droplets, Brain, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Logging",
    description: "Just describe what you ate in natural language. Our AI calculates calories and macros instantly.",
  },
  {
    icon: Target,
    title: "Smart Goals",
    description: "Get personalized calorie and macro targets based on your body metrics and activity level.",
  },
  {
    icon: TrendingDown,
    title: "Progress Tracking",
    description: "Visualize your weight journey with beautiful charts and track your daily progress.",
  },
  {
    icon: Droplets,
    title: "Water Tracking",
    description: "Stay hydrated with our simple water tracking feature and daily reminders.",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">MacroMind</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="gradient-primary hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Nutrition Tracking
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Track your calories
            <br />
            <span className="gradient-text">with AI magic</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Simply describe what you ate and let MacroMind calculate the calories and macros for you. 
            No more tedious manual logging.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="h-14 px-8 text-lg gradient-primary hover:opacity-90 shadow-glow">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Demo preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 h-12 rounded-lg bg-muted flex items-center px-4 text-muted-foreground">
                  "2 eggs, toast with butter, and a coffee..."
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {["320 cal", "18g protein", "24g carbs", "16g fat"].map((stat, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 text-center">
                    <div className="font-semibold">{stat.split(" ")[0]}</div>
                    <div className="text-xs text-muted-foreground">{stat.split(" ")[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to reach your goals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              MacroMind combines AI intelligence with simple design to make nutrition tracking effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-3xl gradient-primary p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to transform your health?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join thousands of users who are achieving their nutrition goals with MacroMind.
            </p>
            <Link to="/register">
              <Button size="lg" className="h-14 px-8 text-lg bg-white text-primary hover:bg-white/90">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">MacroMind</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 MacroMind. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
