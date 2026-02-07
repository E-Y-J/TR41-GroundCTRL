import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import AppHeader from '@/components/app-header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/hooks/use-auth'
import { fetchUserProgress } from '@/lib/firebase/userProgressService'
import { 
  BarChart3, TrendingUp, Target, Zap, Clock, 
  AlertCircle, Loader2, Calendar
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Performance Analytics Page
 * Data visualization dashboard showing improvement over time
 */
export default function Analytics() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState([])
  const [timePeriod, setTimePeriod] = useState('all')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/')
    }
  }, [user, authLoading, navigate])

  // Fetch user's mission data
  useEffect(() => {
    async function loadAnalytics() {
      if (!user) return
      
      try {
        setLoading(true)
        const userSessions = await fetchUserProgress(user.uid)
        setSessions(userSessions)
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [user])

  // Filter sessions by time period
  const filteredSessions = sessions.filter(s => {
    if (timePeriod === 'all') return true
    const sessionDate = new Date(s.startTime)
    const now = new Date()
    const daysDiff = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24))
    
    if (timePeriod === '7d') return daysDiff <= 7
    if (timePeriod === '30d') return daysDiff <= 30
    if (timePeriod === '90d') return daysDiff <= 90
    return true
  })

  // Calculate analytics
  const completedSessions = filteredSessions.filter(s => s.status === 'completed' && s.performance)
  
  const stats = {
    totalMissions: completedSessions.length,
    avgScore: completedSessions.length > 0
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.performance.overallScore || 0), 0) / completedSessions.length)
      : 0,
    bestScore: completedSessions.length > 0
      ? Math.max(...completedSessions.map(s => s.performance.overallScore || 0))
      : 0,
    worstScore: completedSessions.length > 0
      ? Math.min(...completedSessions.map(s => s.performance.overallScore || 0))
      : 0,
  }

  // Calculate metric averages
  const metricAverages = {
    commandAccuracy: calculateAvgMetric(completedSessions, 'commandAccuracy'),
    responseTime: calculateAvgMetric(completedSessions, 'responseTime'),
    resourceManagement: calculateAvgMetric(completedSessions, 'resourceManagement'),
    completionTime: calculateAvgMetric(completedSessions, 'completionTime'),
    errorAvoidance: calculateAvgMetric(completedSessions, 'errorAvoidance'),
  }

  // Calculate trends (comparing first half to second half)
  const trends = calculateTrends(completedSessions)

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
        <title>Performance Analytics - GroundCTRL</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  Performance Analytics
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your improvement over time
                </p>
              </div>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {completedSessions.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No analytics data yet
                </h3>
                <p className="text-muted-foreground">
                  Complete missions to start tracking your performance
                </p>
              </div>
            ) : (
              <>
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatCard
                    icon={Target}
                    label="Missions Completed"
                    value={stats.totalMissions}
                    trend={trends.missionTrend}
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Average Score"
                    value={stats.avgScore}
                    suffix="/100"
                    trend={trends.scoreTrend}
                  />
                  <StatCard
                    icon={Zap}
                    label="Best Performance"
                    value={stats.bestScore}
                    suffix="/100"
                    valueColor="text-amber-500"
                  />
                  <StatCard
                    icon={AlertCircle}
                    label="Improvement Needed"
                    value={stats.worstScore}
                    suffix="/100"
                    valueColor="text-red-500"
                  />
                </div>

                {/* Metric Breakdown */}
                <div className="bg-muted rounded-lg p-6 border border-border">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Performance Metrics Breakdown
                  </h2>
                  <div className="space-y-4">
                    <MetricBar
                      label="Command Accuracy"
                      value={metricAverages.commandAccuracy}
                      weight="30%"
                      description="Success rate of executed commands"
                    />
                    <MetricBar
                      label="Resource Management"
                      value={metricAverages.resourceManagement}
                      weight="25%"
                      description="Efficiency in power and data usage"
                    />
                    <MetricBar
                      label="Response Time"
                      value={metricAverages.responseTime}
                      weight="20%"
                      description="Speed of reactions to events"
                    />
                    <MetricBar
                      label="Completion Time"
                      value={metricAverages.completionTime}
                      weight="15%"
                      description="Mission duration efficiency"
                    />
                    <MetricBar
                      label="Error Avoidance"
                      value={metricAverages.errorAvoidance}
                      weight="10%"
                      description="Minimizing mistakes and failures"
                    />
                  </div>
                </div>

                {/* Recent Missions Chart */}
                <div className="bg-muted rounded-lg p-6 border border-border">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Score Trend
                  </h2>
                  <ScoreChart sessions={completedSessions.slice(-10)} />
                </div>

                {/* Insights */}
                <div className="bg-primary/10 border-2 border-primary rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Performance Insights
                  </h2>
                  <div className="space-y-3">
                    {generateInsights(stats, metricAverages, trends).map((insight, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="text-2xl">{insight.icon}</div>
                        <div>
                          <div className="font-semibold text-foreground">{insight.title}</div>
                          <div className="text-sm text-muted-foreground">{insight.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

/**
 * Stat Card Component
 */
function StatCard({ icon: Icon, label, value, suffix = '', trend, valueColor = 'text-foreground' }) {
  return (
    <div className="bg-muted rounded-lg p-4 border border-border">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="h-4 w-4" />
        <div className="text-sm">{label}</div>
      </div>
      <div className={`text-2xl font-bold ${valueColor}`}>
        {value}{suffix}
      </div>
      {trend && (
        <div className={`text-xs mt-1 flex items-center gap-1 ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
          <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
          {trend > 0 ? '+' : ''}{trend}% from previous period
        </div>
      )}
    </div>
  )
}

/**
 * Metric Bar Component
 */
function MetricBar({ label, value, weight, description }) {
  const colorClass = value >= 90 ? 'bg-green-500' : value >= 75 ? 'bg-blue-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500'
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="font-semibold text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground ml-2">(Weight: {weight})</span>
        </div>
        <span className="text-lg font-bold text-foreground">{value}%</span>
      </div>
      <div className="h-3 bg-background rounded-full overflow-hidden mb-1">
        <div 
          className={`h-full ${colorClass} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

/**
 * Score Chart Component (Simple Bar Chart)
 */
function ScoreChart({ sessions }) {
  if (sessions.length === 0) return null

  const maxScore = 100
  
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2 h-64">
        {sessions.map((session, idx) => {
          const score = session.performance?.overallScore || 0
          const height = (score / maxScore) * 100
          const barColor = score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-blue-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
          
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <div 
                className={`w-full ${barColor} rounded-t-md transition-all group-hover:opacity-80 relative`}
                style={{ height: `${height}%`, minHeight: '10px' }}
                title={`${session.scenarioName}: ${score}/100`}
              >
                <div className="absolute -top-6 left-0 right-0 text-center text-xs font-bold opacity-0 group-hover:opacity-100">
                  {score}
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center truncate w-full">
                {new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="text-xs text-muted-foreground text-center pt-4">
        Last {sessions.length} missions • Hover for details
      </div>
    </div>
  )
}

/**
 * Calculate average metric
 */
function calculateAvgMetric(sessions, metricKey) {
  const validSessions = sessions.filter(s => s.performance?.metrics?.[metricKey] !== undefined)
  if (validSessions.length === 0) return 0
  
  const sum = validSessions.reduce((acc, s) => acc + s.performance.metrics[metricKey], 0)
  return Math.round(sum / validSessions.length)
}

/**
 * Calculate trends
 */
function calculateTrends(sessions) {
  if (sessions.length < 2) return {}
  
  const midpoint = Math.floor(sessions.length / 2)
  const firstHalf = sessions.slice(0, midpoint)
  const secondHalf = sessions.slice(midpoint)
  
  const firstAvg = firstHalf.reduce((sum, s) => sum + (s.performance?.overallScore || 0), 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, s) => sum + (s.performance?.overallScore || 0), 0) / secondHalf.length
  
  const scoreTrend = firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100) : 0
  const missionTrend = Math.round(((secondHalf.length - firstHalf.length) / Math.max(firstHalf.length, 1)) * 100)
  
  return { scoreTrend, missionTrend }
}

/**
 * Generate insights based on performance
 */
function generateInsights(stats, metrics, trends) {
  const insights = []
  
  // Score trend insight
  if (trends.scoreTrend > 10) {
    insights.push({
      icon: '🚀',
      title: 'Great Improvement!',
      description: `Your average score improved by ${trends.scoreTrend}% recently. Keep up the excellent work!`
    })
  } else if (trends.scoreTrend < -10) {
    insights.push({
      icon: '📉',
      title: 'Performance Dip',
      description: `Your scores decreased by ${Math.abs(trends.scoreTrend)}%. Review recent missions to identify areas for improvement.`
    })
  }
  
  // Command accuracy insight
  if (metrics.commandAccuracy >= 95) {
    insights.push({
      icon: '🎯',
      title: 'Command Master',
      description: 'Your command accuracy is exceptional! You rarely make mistakes.'
    })
  } else if (metrics.commandAccuracy < 70) {
    insights.push({
      icon: '⚠️',
      title: 'Focus on Accuracy',
      description: 'Double-check commands before execution to improve your accuracy score.'
    })
  }
  
  // Resource management insight
  if (metrics.resourceManagement >= 90) {
    insights.push({
      icon: '💎',
      title: 'Resource Efficiency Expert',
      description: 'You manage power and data resources exceptionally well!'
    })
  }
  
  // Generic improvement
  if (stats.avgScore >= 90) {
    insights.push({
      icon: '🏆',
      title: 'Elite Operator',
      description: 'Your overall performance is excellent. You\'re in the top tier of operators!'
    })
  } else if (stats.avgScore < 60) {
    insights.push({
      icon: '📚',
      title: 'Practice Makes Perfect',
      description: 'Complete more missions and review tutorials to improve your skills.'
    })
  }
  
  return insights
}
