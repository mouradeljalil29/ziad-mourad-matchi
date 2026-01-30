import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Target, Zap, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-gradient-primary">BinomeMatch</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Find Your Perfect Project Partner
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Connect with students who
              <span className="text-gradient-hero block mt-2">share your vision</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              BinomeMatch helps students find the perfect project partner based on skills, 
              availability, and interests. Stop searching randomly — start matching smartly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2 text-lg px-8">
                  Start Matching
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                  I have an account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20 border-t">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to find your ideal project partner
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group p-6 rounded-2xl bg-card border transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Add your skills, interests, and preferences. Let others know what you're looking for.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-card border transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Matches</h3>
              <p className="text-muted-foreground">
                Browse profiles, filter by skills and availability, and find students who complement your strengths.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-card border transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-success/15 flex items-center justify-center mb-4 group-hover:bg-success/25 transition-colors">
                <Zap className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Build</h3>
              <p className="text-muted-foreground">
                Send match requests, accept connections, and start collaborating on amazing projects.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="bg-gradient-hero rounded-3xl p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to find your binôme?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of students who've already found their perfect project partners.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8">
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            © {new Date().getFullYear()} BinomeMatch
          </div>
          <p>Find your perfect project partner.</p>
        </div>
      </footer>
    </div>
  );
}
