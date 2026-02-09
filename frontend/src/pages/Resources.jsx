import { Helmet } from 'react-helmet-async'
import AppHeader from '@/components/app-header'
import { Footer } from '@/components/footer'
import { Construction, Library } from 'lucide-react'

/**
 * Resources & Learning Page
 * External learning materials and references
 * 
 * Route: /resources
 * Status: Feature in Development
 */
export default function Resources() {
  return (
    <>
      <Helmet>
        <title>Resources & Learning - GroundCTRL</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Construction className="h-24 w-24 text-muted-foreground animate-pulse" />
                <Library className="h-8 w-8 text-primary absolute -top-2 -right-2" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Resources & Learning
              </h1>
              <p className="text-xl text-muted-foreground">
                Expand Your Knowledge
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-8 border border-border">
              <p className="text-lg text-muted-foreground mb-4">
                🚀 <strong>Feature in Development</strong> 🚀
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                The resources page is coming soon! Soon you'll be able to:
              </p>
              <ul className="text-left text-sm text-muted-foreground space-y-2 max-w-md mx-auto">
                <li>🔗 Access curated learning links</li>
                <li>📚 Find recommended readings</li>
                <li>🎥 Watch video tutorials</li>
                <li>🌍 Explore NASA/ESA resources</li>
                <li>📖 Download educational materials</li>
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
