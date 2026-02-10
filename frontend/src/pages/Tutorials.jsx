import { Helmet } from 'react-helmet-async'
import AppHeader from '@/components/app-header'
import { Footer } from '@/components/footer'
import { Construction, BookOpen } from 'lucide-react'

/**
 * Tutorial Library Page
 * Self-paced learning center with browsable tutorials
 * 
 * Route: /tutorials
 * Status: Feature in Development
 */
export default function Tutorials() {
  return (
    <>
      <Helmet>
        <title>Tutorial Library - GroundCTRL</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Construction className="h-24 w-24 text-muted-foreground animate-pulse" />
                <BookOpen className="h-8 w-8 text-primary absolute -top-2 -right-2" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Tutorial Library
              </h1>
              <p className="text-xl text-muted-foreground">
                Learn at Your Own Pace
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-8 border border-border">
              <p className="text-lg text-muted-foreground mb-4">
                🚀 <strong>Feature in Development</strong> 🚀
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                The tutorial library is coming soon! Soon you'll be able to:
              </p>
              <ul className="text-left text-sm text-muted-foreground space-y-2 max-w-md mx-auto">
                <li>📚 Browse tutorials by category</li>
                <li>✅ Track your completion progress</li>
                <li>⭐ View difficulty ratings and time estimates</li>
                <li>🔗 See prerequisites for advanced tutorials</li>
                <li>🎓 Earn badges for completing tutorial series</li>
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
