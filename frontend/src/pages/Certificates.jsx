import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import AppHeader from '@/components/app-header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/hooks/use-auth'
import { fetchUserProgress } from '@/lib/firebase/userProgressService'
import { CertificateModal } from '@/components/simulator/certificate-modal'
import { 
  Award, Download, Share2, Loader2, Filter, Search,
  Calendar, TrendingUp, Medal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Certificates Gallery Page
 * Full implementation showing all earned mission certificates
 */
export default function Certificates() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState('ALL')
  const [sortBy, setSortBy] = useState('date-desc')
  const [selectedCertificate, setSelectedCertificate] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/')
    }
  }, [user, authLoading, navigate])

  // Fetch user's completed missions with certificates
  useEffect(() => {
    async function loadCertificates() {
      if (!user) return
      
      try {
        setLoading(true)
        const sessions = await fetchUserProgress(user.uid)
        
        // Filter completed sessions and format as certificates
        const certs = sessions
          .filter(s => s.status === 'completed' && s.performance)
          .map(session => ({
            id: session.certificateId || `CERT-${user.uid.slice(0,8)}-${session.id}`,
            userName: user.displayName || user.email?.split('@')[0] || 'Operator',
            mission: {
              name: session.scenarioName || 'Training Mission',
              type: session.scenarioType || 'Standard',
            },
            completionDate: session.endTime || session.startTime,
            completionDateFormatted: new Date(session.endTime || session.startTime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            performance: {
              overallScore: session.performance.overallScore || 0,
              tier: session.performance.tier || { name: 'SATISFACTORY', label: 'Satisfactory', badge: '✓' },
              duration: session.performance.duration || 'N/A',
              commandsIssued: session.performance.commandsIssued || 0,
              stepsCompleted: `${session.currentStep || 0}/${session.totalSteps || 0}`,
              achievements: session.performance.achievements || [],
              metrics: session.performance.metrics || {},
            },
            shareableText: generateShareableText(session, user),
          }))
          .sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate))
        
        setCertificates(certs)
      } catch (error) {
        console.error('Error loading certificates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCertificates()
  }, [user])

  // Calculate statistics
  const totalCertificates = certificates.length
  const avgScore = certificates.length > 0
    ? Math.round(certificates.reduce((sum, c) => sum + c.performance.overallScore, 0) / certificates.length)
    : 0
  const bestScore = certificates.length > 0
    ? Math.max(...certificates.map(c => c.performance.overallScore))
    : 0
  const excellentCount = certificates.filter(c => c.performance.overallScore >= 90).length

  // Filter and sort certificates
  const filteredCertificates = certificates
    .filter(cert => {
      if (searchTerm && !cert.mission.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (filterTier !== 'ALL') {
        const tierName = cert.performance.tier.name
        if (filterTier === 'EXCELLENT' && tierName !== 'EXCELLENT') return false
        if (filterTier === 'GOOD' && tierName !== 'GOOD') return false
        if (filterTier === 'SATISFACTORY' && tierName !== 'SATISFACTORY') return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.completionDate) - new Date(a.completionDate)
      if (sortBy === 'date-asc') return new Date(a.completionDate) - new Date(b.completionDate)
      if (sortBy === 'score-desc') return b.performance.overallScore - a.performance.overallScore
      if (sortBy === 'score-asc') return a.performance.overallScore - b.performance.overallScore
      return 0
    })

  // Featured certificate (best score)
  const featuredCertificate = certificates.length > 0
    ? certificates.reduce((best, current) => 
        current.performance.overallScore > best.performance.overallScore ? current : best
      )
    : null

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Certificates - GroundCTRL</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Award className="h-8 w-8 text-primary" />
                Certificates Gallery
              </h1>
              <p className="text-muted-foreground mt-1">
                Your mission completion certificates and achievements
              </p>
            </div>

            {/* Statistics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground">Total Certificates</div>
                <div className="text-2xl font-bold text-foreground mt-1">
                  {totalCertificates}
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground">Average Score</div>
                <div className="text-2xl font-bold text-primary mt-1">
                  {avgScore}
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground">Best Performance</div>
                <div className="text-2xl font-bold text-amber-500 mt-1">
                  {bestScore}
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground">Excellent Ratings</div>
                <div className="text-2xl font-bold text-green-500 mt-1">
                  {excellentCount}
                </div>
              </div>
            </div>

            {/* Featured Certificate */}
            {featuredCertificate && (
              <div className="bg-linear-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-500 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Medal className="h-6 w-6 text-amber-500" />
                  <h2 className="text-xl font-bold text-foreground">Featured: Best Performance</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {featuredCertificate.mission.name}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {featuredCertificate.completionDateFormatted}
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Score: {featuredCertificate.performance.overallScore}/100
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button onClick={() => setSelectedCertificate(featuredCertificate)}>
                      <Award className="h-4 w-4 mr-2" />
                      View Certificate
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by mission name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Performance Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Tiers</SelectItem>
                  <SelectItem value="EXCELLENT">Excellent (90+)</SelectItem>
                  <SelectItem value="GOOD">Good (75-89)</SelectItem>
                  <SelectItem value="SATISFACTORY">Satisfactory (60-74)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="score-desc">Highest Score</SelectItem>
                  <SelectItem value="score-asc">Lowest Score</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Certificate Grid */}
            {filteredCertificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCertificates.map((certificate) => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    onClick={() => setSelectedCertificate(certificate)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {certificates.length === 0 ? 'No certificates yet' : 'No certificates found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {certificates.length === 0 
                    ? 'Complete your first mission to earn a certificate!'
                    : 'Try adjusting your filters or search term'
                  }
                </p>
                {certificates.length === 0 && (
                  <Button onClick={() => navigate('/missions')}>
                    Browse Missions
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Certificate Detail Modal */}
      {selectedCertificate && (
        <CertificateModal
          isOpen={true}
          onClose={() => setSelectedCertificate(null)}
          certificate={selectedCertificate}
        />
      )}
    </>
  )
}

/**
 * Certificate Card Component
 */
function CertificateCard({ certificate, onClick }) {
  const tierColors = {
    EXCELLENT: 'border-green-500 bg-green-500/5',
    GOOD: 'border-blue-500 bg-blue-500/5',
    SATISFACTORY: 'border-slate-500 bg-slate-500/5',
  }

  const tierColor = tierColors[certificate.performance.tier.name] || tierColors.SATISFACTORY

  return (
    <button
      onClick={onClick}
      className={`
        relative p-6 rounded-lg border-2 transition-all duration-200
        ${tierColor}
        hover:scale-105 hover:shadow-lg
        text-left w-full
      `}
    >
      {/* Score Badge */}
      <div className="absolute top-4 right-4">
        <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{certificate.performance.overallScore}</div>
          <div className="text-xs">SCORE</div>
        </div>
      </div>

      {/* Content */}
      <div className="pr-20">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-5 w-5 text-primary" />
          <Badge variant="outline">{certificate.mission.type}</Badge>
        </div>
        
        <h3 className="font-bold text-lg mb-2 text-foreground line-clamp-2">
          {certificate.mission.name}
        </h3>
        
        <div className="space-y-1 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {certificate.completionDateFormatted}
          </div>
          <div>
            {certificate.performance.tier.badge} {certificate.performance.tier.label}
          </div>
        </div>

        {/* Achievements */}
        {certificate.performance.achievements.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {certificate.performance.achievements.slice(0, 3).map((achievement, idx) => (
              <span key={idx} className="text-lg" title={achievement.name}>
                {achievement.badge}
              </span>
            ))}
            {certificate.performance.achievements.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{certificate.performance.achievements.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <div className="font-semibold text-foreground">Duration</div>
            <div>{certificate.performance.duration}</div>
          </div>
          <div>
            <div className="font-semibold text-foreground">Commands</div>
            <div>{certificate.performance.commandsIssued}</div>
          </div>
        </div>
      </div>

      {/* View Button Hint */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Click to view full certificate</span>
        <Share2 className="h-4 w-4 text-muted-foreground" />
      </div>
    </button>
  )
}

/**
 * Generate shareable text for social media
 */
function generateShareableText(session, user) {
  const name = user.displayName || 'Operator'
  const mission = session.scenarioName || 'Training Mission'
  const score = session.performance?.overallScore || 0
  const tier = session.performance?.tier?.label || 'Satisfactory'
  
  return `🚀 ${name} completed "${mission}" on GroundCTRL with a score of ${score}/100 (${tier})! #GroundCTRL #SatelliteOperations`
}
