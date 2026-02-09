import { Helmet } from 'react-helmet-async'
import AppHeader from '@/components/app-header'
import { Footer } from '@/components/footer'
import { Construction, Info } from 'lucide-react'

/**
 * About / Team Page
 * Project information and team profiles
 * 
 * Route: /about
 * Status: Feature in Development
 */
export default function About() {
  return (
    <>
      <Helmet>
        <title>About GroundCTRL</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Construction className="h-24 w-24 text-muted-foreground animate-pulse" />
                <Info className="h-8 w-8 text-primary absolute -top-2 -right-2" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                About GroundCTRL
              </h1>
              <p className="text-xl text-muted-foreground">
                Meet the Team
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-8 border border-border">
              <p className="text-lg text-muted-foreground mb-4">
                🚀 <strong>Feature in Development</strong> 🚀
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                The about page is coming soon! Soon you'll be able to:
              </p>
              <ul className="text-left text-sm text-muted-foreground space-y-2 max-w-md mx-auto">
                <li>📖 Learn about the project story and goals</li>
                <li>👥 Meet the team member profiles</li>
                <li>⚙️ Discover the technology stack</li>
                <li>🤝 Find contribution guidelines</li>
                <li>🌟 See project milestones</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              For now, check out our <a href="https://github.com/growthwithcoding/TR41-GroundCTRL" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub repository</a>.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
