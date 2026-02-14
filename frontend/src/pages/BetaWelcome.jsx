import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Rocket, CheckCircle, Clock, Satellite } from "lucide-react"
import AppHeader from "@/components/app-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export default function BetaWelcome() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (!user) {
      navigate("/")
    }
  }, [user, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Helmet>
        <title>Beta Access Requested - GroundCTRL</title>
        <meta name="description" content="Thank you for joining the GroundCTRL beta program!" />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        
        <main className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="max-w-7xl w-full space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                <div className="relative bg-primary/10 rounded-full p-6">
                  <Rocket className="h-16 w-16 text-primary" />
                </div>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Welcome to the Beta Program! 🚀
              </h1>
              <p className="text-lg text-muted-foreground">
                Thank you for your interest in GroundCTRL
              </p>
            </div>

            {/* Beta Program Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 max-w-5xl mx-auto">
              {/* Left Column - Status */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <Clock className="h-12 w-12 text-status-warning" />
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-2">Beta Access Pending</h3>
                      <p className="text-sm text-muted-foreground">
                        Your beta access request has been received and is currently under review. 
                        We're onboarding operators in batches to ensure a smooth mission experience.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Beta Mission Timeline */}
                <div className="bg-muted/50 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                    <span className="text-xl">📅</span>
                    Beta Mission Timeline
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Phase 1: Q1-Q2 2026 */}
                    <div>
                      <p className="text-xs font-semibold text-primary mb-2">Phase 1: Q1-Q2 2026</p>
                      <div className="space-y-3 pl-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-status-nominal mt-2 shrink-0" />
                          <div>
                            <p className="font-medium text-sm text-foreground">Early Access Onboarding</p>
                            <p className="text-xs text-muted-foreground">
                              We're inviting the first wave of operators into GroundCTRL, validating core mission flows and stability.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Phase 2: Q3-Q4 2026 */}
                    <div>
                      <p className="text-xs font-semibold text-status-warning mb-2">Phase 2: Q3-Q4 2026</p>
                      <div className="space-y-3 pl-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-status-warning mt-2 shrink-0" />
                          <div>
                            <p className="font-medium text-sm text-foreground">Expanded Access & Iteration</p>
                            <p className="text-xs text-muted-foreground">
                              We'll bring more operators online, ship new mission scenarios, and rapidly iterate based on your feedback.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Phase 3: Q1-Q2 2027 */}
                    <div>
                      <p className="text-xs font-semibold text-primary mb-2">Phase 3: Q1-Q2 2027</p>
                      <div className="space-y-3 pl-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                          <div>
                            <p className="font-medium text-sm text-foreground">Feature Complete & Public Launch</p>
                            <p className="text-xs text-muted-foreground">
                              Focus shifts to polishing key systems, performance, and reliability. GroundCTRL exits beta and opens mission control to everyone.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - What to Expect */}
              <div className="lg:col-span-1">
                <div className="bg-muted/50 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                    <Satellite className="h-6 w-6 text-primary" />
                    What to Expect
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Email Notification</p>
                        <p className="text-sm text-muted-foreground">
                          You'll receive an email at <strong>{user.email}</strong> when your beta access is approved.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Full Simulator Access</p>
                        <p className="text-sm text-muted-foreground">
                          Manage virtual satellites, command ground stations, and run mission scenarios with real-time telemetry.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">AI Flight Director (NOVA)</p>
                        <p className="text-sm text-muted-foreground">
                          Get real-time guidance from NOVA, our AI assistant trained on satellite operations procedures.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Progress Tracking</p>
                        <p className="text-sm text-muted-foreground">
                          Earn achievements, track mission history, and climb the leaderboard.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Interactive Tutorials</p>
                        <p className="text-sm text-muted-foreground">
                          Learn orbital mechanics, telemetry monitoring, and command sequences through step-by-step missions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
              <p className="text-xs text-muted-foreground">
                Questions? Contact us at{" "}
                <a href="mailto:info@missionctrl.org" className="text-primary hover:underline">
                  info@missionctrl.org
                </a>
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  )
}
