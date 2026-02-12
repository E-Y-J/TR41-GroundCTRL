import { Helmet } from "react-helmet-async"
import { useNavigate } from "react-router-dom"
import { Rocket, CheckCircle, Clock, Satellite } from "lucide-react"
import AppHeader from "@/components/app-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function BetaWelcome() {
  const navigate = useNavigate()

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

            {/* 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 max-w-4xl mx-auto">
              {/* Left Column - Status */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6 h-full">
                  <div className="flex flex-col items-center text-center gap-4">
                    <Clock className="h-12 w-12 text-status-warning" />
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-2">Beta Access Pending</h3>
                      <p className="text-sm text-muted-foreground">
                        Your beta access request has been received and is currently under review. 
                        We're working hard to bring more operators onboard!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - What Happens Next */}
              <div className="lg:col-span-1">
                <div className="bg-muted/50 rounded-lg p-6 h-full">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                    <Satellite className="h-6 w-6 text-primary" />
                    What Happens Next
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Email Notification</p>
                        <p className="text-sm text-muted-foreground">
                          You'll receive an email when your access is approved with instructions to create your account.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Full Access</p>
                        <p className="text-sm text-muted-foreground">
                          Once approved, you'll have full access to the GroundCTRL simulator, interactive tutorials, and all mission scenarios.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Mission Control Experience</p>
                        <p className="text-sm text-muted-foreground">
                          Learn satellite operations through hands-on simulations with real-time AI guidance from NOVA, our AI flight director.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <Button onClick={() => navigate("/")} variant="outline">
                Return to Home
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
