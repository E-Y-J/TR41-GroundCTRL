import { Routes, Route } from 'react-router-dom'
import { Providers } from '@/components/providers.jsx'

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Route Guards
import { AdminRoute } from '@/components/admin/AdminRoute.jsx'
import { ProtectedRoute } from '@/components/ProtectedRoute.jsx'

// Tutorial System
import TutorialOverlay from '@/components/tutorial/TutorialOverlay'

console.log('App.jsx loaded')

// Pages
const HomePage = lazy(() => import('@/pages/Index.jsx'))
const BetaWelcomePage = lazy(() => import('@/pages/BetaWelcome.jsx'))
const DashboardPage = lazy(() => import('@/pages/Dashboard.jsx'))
const SimulatorPage = lazy(() => import('@/pages/Simulator.jsx'))
const MissionsPage = lazy(() => import('@/pages/Missions.jsx'))
const AccountPage = lazy(() => import('@/pages/Account.jsx'))
const SettingsPage = lazy(() => import('@/pages/Settings.jsx'))
const ContactPage = lazy(() => import('@/pages/Contact.jsx'))
const HelpPage = lazy(() => import('@/pages/Help.jsx'))
const HelpArticlePage = lazy(() => import('@/pages/HelpArticle.jsx'))
const MissionBriefingPage = lazy(() => import('@/pages/MissionBriefing.jsx'))
const WebSocketTestPage = lazy(() => import('@/pages/WebSocketTest.jsx'))
const PrivacyPage = lazy(() => import('@/pages/Privacy.jsx'))
const TermsPage = lazy(() => import('@/pages/Terms.jsx'))
const NotFoundPage = lazy(() => import('@/pages/NotFound.jsx'))

// New Pages
const LeaderboardPage = lazy(() => import('@/pages/Leaderboard.jsx'))
const SatellitesPage = lazy(() => import('@/pages/Satellites.jsx'))
const GroundStationsPage = lazy(() => import('@/pages/GroundStations.jsx'))
const CommunityPage = lazy(() => import('@/pages/Community.jsx'))
const NewsPage = lazy(() => import('@/pages/News.jsx'))
const ResourcesPage = lazy(() => import('@/pages/Resources.jsx'))
const TutorialsPage = lazy(() => import('@/pages/Tutorials.jsx'))
const AchievementsPage = lazy(() => import('@/pages/Achievements.jsx'))
const CertificatesPage = lazy(() => import('@/pages/Certificates.jsx'))
const HistoryPage = lazy(() => import('@/pages/History.jsx'))
const ReplayPage = lazy(() => import('@/pages/Replay.jsx'))
const AnalyticsPage = lazy(() => import('@/pages/Analytics.jsx'))
const OperatorProfilePage = lazy(() => import('@/pages/OperatorProfile.jsx'))
const SupportTicketsPage = lazy(() => import('@/pages/SupportTickets.jsx'))

// Admin Pages
const ScenarioCreatorPage = lazy(() => import('@/pages/admin/ScenarioCreator.jsx'))
const AdminScenariosPage = lazy(() => import('@/pages/admin/AdminScenarios.jsx'))

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

function App() {
  console.log('App rendering')
  return (
    <Providers>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes - Accessible to everyone including beta users */}
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          
          {/* Beta Program Page - Accessible to logged-in beta users */}
          <Route path="/beta-welcome" element={<BetaWelcomePage />} />
          
          {/* Protected Routes - Require full user access (not beta) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/simulator" 
            element={
              <ProtectedRoute>
                <SimulatorPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/missions" 
            element={
              <ProtectedRoute>
                <MissionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/help" 
            element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/help/article/:slug" 
            element={
              <ProtectedRoute>
                <HelpArticlePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mission-briefing/:id" 
            element={
              <ProtectedRoute>
                <MissionBriefingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/websocket-test" 
            element={
              <ProtectedRoute>
                <WebSocketTestPage />
              </ProtectedRoute>
            } 
          />
          
          {/* New Protected Routes */}
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/satellites" 
            element={
              <ProtectedRoute>
                <SatellitesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ground-stations" 
            element={
              <ProtectedRoute>
                <GroundStationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/community" 
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/news" 
            element={
              <ProtectedRoute>
                <NewsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/resources" 
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tutorials" 
            element={
              <ProtectedRoute>
                <TutorialsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/achievements" 
            element={
              <ProtectedRoute>
                <AchievementsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/certificates" 
            element={
              <ProtectedRoute>
                <CertificatesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/replay/:sessionId" 
            element={
              <ProtectedRoute>
                <ReplayPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:userId" 
            element={
              <ProtectedRoute>
                <OperatorProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/support" 
            element={
              <ProtectedRoute>
                <SupportTicketsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/scenarios" 
            element={
              <AdminRoute>
                <AdminScenariosPage />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/scenario-creator" 
            element={
              <AdminRoute>
                <ScenarioCreatorPage />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/scenarios/create" 
            element={
              <AdminRoute>
                <ScenarioCreatorPage />
              </AdminRoute>
            } 
          />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      
      {/* Tutorial System UI */}
      <TutorialOverlay />
    </Providers>
  )
}

export default App
