import { Helmet } from 'react-helmet-async'
import AppHeader from '@/components/app-header'
import { Footer } from '@/components/footer'
import { Construction, Users } from 'lucide-react'

/**
 * Community Hub / Forum Page
 * Discussion boards and community interaction
 * 
 * Route: /community
 * Status: Feature in Development
 */
export default function Community() {
  return (
    <>
      <Helmet>
        <title>Community Hub - GroundCTRL</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Construction className="h-24 w-24 text-muted-foreground animate-pulse" />
                <Users className="h-8 w-8 text-primary absolute -top-2 -right-2" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Community Hub
              </h1>
              <p className="text-xl text-muted-foreground">
                Connect with Fellow Operators
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-8 border border-border">
              <p className="text-lg text-muted-foreground mb-4">
                🚀 <strong>Feature in Development</strong> 🚀
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                The community hub is coming soon! Soon you'll be able to:
              </p>
              <ul className="text-left text-sm text-muted-foreground space-y-2 max-w-md mx-auto">
                <li>💬 Participate in discussion boards</li>
                <li>🏆 Share mission accomplishments</li>
                <li>💡 Exchange tips and strategies</li>
                <li>❓ Ask and answer questions</li>
                <li>🤝 Connect with other operators</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              This feature is scheduled for a future update.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
