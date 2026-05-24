import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Brain, Sparkles, Target, BookOpen, Shield, Trophy } from 'lucide-react'

export default async function HomePage() {
  // If already signed in, send to dashboard
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Clarity Behavior Lab</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles size={14} />
            AI-Powered Training Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Master Clinical Skills with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              AI Simulations
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Experiential learning for Behavior Technicians. Practice with AI simulations,
            track your competencies, and earn training certification through gamified progression.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                <Brain size={18} />
                Start Learning Free
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg">Try the Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '40+', label: 'Training Scenarios' },
              { value: '6',   label: 'Competency Areas' },
              { value: '100%', label: 'Learner Centered' },
              { value: '40h', label: 'Certification Ready' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Learning Experience</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Five integrated modules designed to build clinical competence through practice,
              reflection, and adaptive learning.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain,     title: 'AI Clinical Simulator',  description: 'Practice with realistic AI clients in various behavioral scenarios. Receive real-time coaching and feedback.' },
              { icon: Target,    title: 'Guided Rehearsal',        description: 'Scaffolded practice with prompts that fade as your confidence grows. Perfect for building fluency.' },
              { icon: BookOpen,  title: 'Reflective Practice',     description: 'Journal your sessions, receive AI analysis, and rehearse improved responses for continuous growth.' },
              { icon: Sparkles,  title: 'Adaptive Journey',        description: 'AI tracks your progress and adjusts difficulty. Personalized recommendations keep you challenged.' },
              { icon: Shield,    title: 'Supervisor Dashboard',    description: 'Supervisors can monitor progress, assess competencies, and certify skills with full analytics.' },
              { icon: Trophy,    title: 'Gamified Progress',       description: 'Earn XP, maintain streaks, unlock scenarios, and achieve certifications as you master each skill.' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-muted-foreground mb-8">
            Join Clarity Behavior Lab today and accelerate your path to clinical excellence through
            AI-powered experiential learning.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              <Brain size={18} />
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Clarity Behavior Lab</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Clarity Behavior Lab. AI-powered training for behavior technicians.
          </p>
        </div>
      </footer>
    </div>
  )
}
