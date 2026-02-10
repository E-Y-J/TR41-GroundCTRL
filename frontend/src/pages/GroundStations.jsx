import { Helmet } from 'react-helmet-async'
import AppHeader from '@/components/app-header'
import { Footer } from '@/components/footer'
import { Construction, Satellite } from 'lucide-react'

/**
 * Ground Station Explorer Page
 * Interactive directory of ground stations worldwide
 * 
 * Route: /ground-stations
 * Status: Feature in Development
 */
export default function GroundStations() {
  return (
    <>
      <Helmet>
        <title>Ground Station Explorer - GroundCTRL</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Construction className="h-24 w-24 text-muted-foreground animate-pulse" />
                <Satellite className="h-8 w-8 text-primary absolute -top-2 -right-2" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Ground Station Explorer
              </h1>
              <p className="text-xl text-muted-foreground">
                Discover the Ground Network
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-8 border border-border">
              <p className="text-lg text-muted-foreground mb-4">
                🚀 <strong>Feature in Development</strong> 🚀
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                The ground station explorer is coming soon! Soon you'll be able to:
              </p>
              <ul className="text-left text-sm text-muted-foreground space-y-2 max-w-md mx-auto">
                <li>🗺️ View ground stations on an interactive world map</li>
                <li>📡 Explore station details and capabilities</li>
                <li>🛰️ See current satellite passes in real-time</li>
                <li>📖 Learn about each station's history</li>
                <li>⭐ Favorite stations for quick access</li>
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
