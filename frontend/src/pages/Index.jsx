import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Rocket, Radio, Gauge } from "lucide-react"
import AppHeader from "@/components/app-header"
import { Footer } from "@/components/footer"
import { BetaSignupForm } from "@/components/beta-signup-form"
import { AuthForm } from "@/components/auth-form"
import { useAuth } from "@/hooks/use-auth"

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  // Redirect logged-in users
  useEffect(() => {
    if (user) {
      // Check if user has beta role
      if (user.role === "beta") {
        navigate("/beta-welcome")
      } else {
        navigate("/dashboard")
      }
    }
  }, [user, navigate])
  
  // Check URL parameter for view
  useEffect(() => {
    const view = searchParams.get("view")
    if (view === "login") {
      setShowLogin(true)
    } else {
      setShowLogin(false)
    }
  }, [searchParams])

  return (
    <>
      <Helmet>
        <title>GroundCTRL - Virtual Satellite Simulator</title>
        <meta name="description" content="Browser-based training simulator for satellite operations. Learn fundamentals through interactive, guided missions with real-time AI guidance." />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        
        <main className="flex-1 flex">
          {/* Hero Section */}
          <section className="flex-1 bg-background flex flex-col items-center justify-center px-8 py-16 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
            </div>
            
            <div className="max-w-3xl text-center space-y-6 relative z-10">
              {/* Logo and Title */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <img src="/images/GroundCTRL.png" alt="GroundCTRL Logo" className="h-16 w-16 object-contain" style={{ pointerEvents: 'none' }} />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance tracking-tight">
                GroundCTRL
              </h1>
              <p className="text-xl md:text-2xl text-primary font-medium text-balance">
                Virtual Satellite Simulator
              </p>
              
              <p className="text-lg text-foreground/80 leading-relaxed text-pretty max-w-2xl mx-auto">
                GroundCTRL is a browser-based training simulator that introduces users to the fundamentals of satellite
                operations through interactive, guided missions. Players manage a virtual Earth-orbiting satellite using a
                simplified mission console, real-time AI guidance, and structured objectives that blend learning with
                gameplay.
              </p>
              
              <p className="text-base text-muted-foreground text-pretty max-w-2xl mx-auto">
                Designed for space enthusiasts, students, and new operators, the platform provides visual feedback,
                step-by-step tutorials, and progress tracking. The simulator runs in modern desktop browsers and aims to
                make satellite operations education engaging, accessible, and beginner-friendly.
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                  <Rocket className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Orbital Mechanics</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                  <Radio className="w-4 h-4 text-status-nominal" />
                  <span className="text-sm font-medium text-foreground">Real-time Telemetry</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                  <Gauge className="w-4 h-4 text-status-warning" />
                  <span className="text-sm font-medium text-foreground">Mission Control</span>
                </div>
              </div>
              
              {/* Tech stack */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">React</span>
                <span className="px-3 py-1 rounded-full bg-status-nominal/10 text-status-nominal font-medium">Node.js</span>
                <span className="px-3 py-1 rounded-full bg-status-warning/10 text-status-warning font-medium">Firebase</span>
              </div>
            </div>
          </section>

          {/* Auth Sidebar - Toggle between signup and login */}
          <aside className="w-[25%] min-w-[320px] max-w-112.5 border-l border-border bg-card flex flex-col items-center justify-center p-8">
            {showLogin ? (
              <>
                <AuthForm />
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowLogin(false)}
                    className="text-xs text-primary hover:underline"
                  >
                    ← Back to Beta Signup
                  </button>
                </div>
              </>
            ) : (
              <>
                <BetaSignupForm />
                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Already have an account?</p>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Sign In →
                  </button>
                </div>
              </>
            )}
          </aside>
        </main>
        
        <Footer />
      </div>
    </>
  )
}
