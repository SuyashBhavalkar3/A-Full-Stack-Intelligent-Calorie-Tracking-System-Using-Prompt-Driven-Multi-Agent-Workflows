import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl text-primary-foreground">MacroMind</span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight">
            Track your nutrition
            <br />
            with AI power
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-md">
            Simply describe what you ate and let our AI calculate the calories
            and macros for you. No more manual logging.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-primary-foreground/20 border-2 border-primary"
              />
            ))}
          </div>
          <p className="text-primary-foreground/80">
            Trusted by <span className="font-semibold text-primary-foreground">10,000+</span> users
          </p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex flex-col justify-center p-6 lg:p-12">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">MacroMind</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
