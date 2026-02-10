import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import AppHeader from '@/components/app-header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/hooks/use-auth'
import { fetchUserProgress } from '@/lib/firebase/userProgressService'
import { 
  ScrollText, CheckCircle, Clock, XCircle, Loader2,
  ChevronDown, ChevronUp, Calendar, Trophy, Terminal,
  BarChart3, Search, Filter
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

/**
 * Mission History / Flight Log Page
 * Full implementation showing all mission sessions
 */
export default function History() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [sortBy, setSortBy] = useState('date-desc')
  const [expandedSession, setExpandedSession] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/')
    }
  }, [user, authLoading, navigate])

  // Fetch user's mission history
  useEffect(() => {
    async function loadHistory() {
      if (!user) return
      
      try {
        setLoading(true)
        const userSessions = await fetchUserProgress(user.uid)
        setSessions(userSessions)
      } catch (error) {
        console.error('Error loading mission history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user])

  // Calculate statistics
  const completedCount = sessions.filter(s => s.status === 'completed').length
  const inProgressCount = sessions.filter(s => s.status === 'in_progress').length
  const failedCount = sessions.filter(s => s.status === 'failed').length
  const avgScore = sessions.filter(s => s.status === 'completed' && s.performance).length > 0
    ? Math.round(
        sessions
          .filter(s => s.status === 'completed' && s.performance)
          .reduce((sum, s) => sum + (s.performance.overallScore || 0), 0) /
        sessions.filter(s => s.status === 'completed' && s.performance).length
      )
    : 0

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(session => {
      if (searchTerm && !session.scenarioName?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (filterStatus !== 'ALL' && session.status !== filterStatus) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.startTime) - new Date(a.startTime)
      }
      if (sortBy === 'date-asc') {
        return new Date(a.startTime) - new Date(b.startTime)
      }
      if (sortBy === 'score-desc') {
        return (b.performance?.overallScore || 0) - (a.performance?.overallScore || 0)
      }
      if (sortBy === 'duration-desc') {
        const aDuration = a.endTime ? new Date(a.endTime) - new Date(a.startTime) : 0
        const bDuration = b.endTime ? new Date(b.endTime) - new Date(b.startTime) : 0
        return bDuration - aDuration
      }
      return 0
    })

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
        <title>Mission History - GroundCTRL</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <ScrollText className="h-8 w-8 text-primary" />
                Mission History
              </h1>
              <p className="text-muted-foreground mt-1">
                Complete flight log of all your missions
              </p>
            </div>

            {/* Statistics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold text-green-500 mt-1 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  {completedCount}
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground">In Progress</div>
                <div className="text-2xl font-bold text-blue-500 mt-1 flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  {inProgressCount}
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground">Failed</div>
                <div className="text-2xl font-bold text-red-500 mt-1 flex items-center gap-2">
                  <XCircle className="h-6 w-6" />
                  {failedCount}
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground">Average Score</div>
                <div className="text-2xl font-bold text-primary mt-1 flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  {avgScore}
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search missions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
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
                  <SelectItem value="duration-desc">Longest Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mission List */}
            {filteredSessions.length > 0 ? (
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <MissionCard
                    key={session.id}
                    session={session}
                    expanded={expandedSession === session.id}
                    onToggle={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ScrollText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {sessions.length === 0 ? 'No mission history yet' : 'No missions found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {sessions.length === 0 
                    ? 'Start your first mission to build your flight log!'
                    : 'Try adjusting your filters or search term'
                  }
                </p>
                {sessions.length === 0 && (
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
    </>
  )
}

/**
 * Mission Card Component with Expandable Details
 */
function MissionCard({ session, expanded, onToggle }) {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500',
      label: 'Completed',
    },
    in_progress: {
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500',
      label: 'In Progress',
    },
    failed: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500',
      label: 'Failed',
    },
  }

  const config = statusConfig[session.status] || statusConfig.in_progress
  const StatusIcon = config.icon

  // Calculate duration
  const startTime = new Date(session.startTime)
  const endTime = session.endTime ? new Date(session.endTime) : new Date()
  const durationMs = endTime - startTime
  const durationMinutes = Math.floor(durationMs / 60000)
  const durationHours = Math.floor(durationMinutes / 60)
  const durationDisplay = durationHours > 0 
    ? `${durationHours}h ${durationMinutes % 60}m`
    : `${durationMinutes}m`

  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <div className={`border-2 ${config.borderColor} ${config.bgColor} rounded-lg overflow-hidden`}>
        <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 text-left">
              <StatusIcon className={`h-8 w-8 ${config.color} shrink-0`} />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground truncate">
                  {session.scenarioName || 'Training Mission'}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {startTime.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {durationDisplay}
                  </div>
                  {session.status === 'completed' && session.performance && (
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Score: {session.performance.overallScore}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={config.color}>{config.label}</Badge>
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 border-t border-border space-y-4 bg-background">
            {/* Progress */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Progress
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Steps Completed</span>
                  <span className="font-mono">{session.currentStep || 0} / {session.totalSteps || 0}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ 
                      width: `${session.totalSteps > 0 ? ((session.currentStep || 0) / session.totalSteps) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Performance Metrics (if completed) */}
            {session.status === 'completed' && session.performance && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Performance
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <MetricCard
                    label="Overall Score"
                    value={session.performance.overallScore}
                    suffix="/100"
                  />
                  {session.performance.metrics?.commandAccuracy !== undefined && (
                    <MetricCard
                      label="Command Accuracy"
                      value={Math.round(session.performance.metrics.commandAccuracy)}
                      suffix="%"
                    />
                  )}
                  {session.performance.metrics?.responseTime !== undefined && (
                    <MetricCard
                      label="Response Time"
                      value={Math.round(session.performance.metrics.responseTime)}
                    />
                  )}
                  {session.performance.metrics?.resourceManagement !== undefined && (
                    <MetricCard
                      label="Resource Mgmt"
                      value={Math.round(session.performance.metrics.resourceManagement)}
                      suffix="%"
                    />
                  )}
                  {session.performance.metrics?.completionTime !== undefined && (
                    <MetricCard
                      label="Completion Time"
                      value={Math.round(session.performance.metrics.completionTime)}
                    />
                  )}
                  {session.performance.metrics?.errorAvoidance !== undefined && (
                    <MetricCard
                      label="Error Avoidance"
                      value={Math.round(session.performance.metrics.errorAvoidance)}
                      suffix="%"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Achievements (if any) */}
            {session.performance?.achievements && session.performance.achievements.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Achievements Earned</h4>
                <div className="flex flex-wrap gap-2">
                  {session.performance.achievements.map((achievement, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {achievement.badge} {achievement.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {session.status === 'completed' && (
                <Button variant="outline" size="sm" onClick={() => alert('Replay feature coming soon!')}>
                  <Terminal className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
              {session.status === 'in_progress' && (
                <Button size="sm" onClick={() => alert('Resume feature coming soon!')}>
                  Continue Mission
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

/**
 * Metric Card Component
 */
function MetricCard({ label, value, suffix = '' }) {
  return (
    <div className="bg-muted rounded-lg p-3 border border-border">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-bold text-foreground">
        {value}{suffix}
      </div>
    </div>
  )
}
