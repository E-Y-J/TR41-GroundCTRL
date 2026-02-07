import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import AppHeader from '@/components/app-header'
import { Footer } from '@/components/footer'
import { Construction, Video } from 'lucide-react'

/**
 * Mission Replay Viewer Page
 * Video-style replay of past missions
 * 
 * Route: /replay/:sessionId
 * Status: Feature in Development
 */
export default function Replay() {
  const { sessionId } = useParams()

  return (
    <>
      <Helmet>
        <title>Mission Replay - GroundCTRL</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Construction className="h-24 w-24 text-muted-foreground animate-pulse" />
                <Video className="h-8 w-8 text-primary absolute -top-2 -right-2" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Mission Replay
              </h1>
              {sessionId && (
                <p className="text-xl text-muted-foreground">
                  Session: <span className="font-mono text-primary">{sessionId.slice(0, 8)}...</span>
                </p>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-8 border border-border">
              <p className="text-lg text-muted-foreground mb-4">
                🚀 <strong>Feature in Development</strong> 🚀
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Mission replay is coming soon! Soon you'll be able to:
              </p>
              <ul className="text-left text-sm text-muted-foreground space-y-2 max-w-md mx-auto">
                <li>🎬 Watch video-style replays of missions</li>
                <li>⏯️ Use playback controls (play/pause/speed)</li>
                <li>⏱️ Scrub through the timeline</li>
                <li>📝 View annotated events</li>
                <li>🔗 Share replays with friends</li>
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
