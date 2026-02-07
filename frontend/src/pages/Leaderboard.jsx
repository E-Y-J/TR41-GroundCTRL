import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import AppHeader from '@/components/app-header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/hooks/use-auth'
import { getGlobalLeaderboard } from '@/lib/api/leaderboardService'
import { 
  Trophy, Medal, TrendingUp, TrendingDown, Minus,
  Loader2, Info, AlertCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

/**
 * Leaderboard Page
 * Global and mission-specific rankings
 * 
 * NOTE: Backend leaderboard service is required for full functionality
 * This implementation shows the UI structure with appropriate fallbacks
 */
export default function Leaderboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [timePeriod, setTimePeriod] = useState('all-time')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/')
    }
  }, [user, authLoading, navigate])

  // Fetch leaderboard data
  useEffect(() => {
    async function loadLeaderboard() {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch from backend leaderboard API using service
        const data = await getGlobalLeaderboard({
          period: timePeriod,
          limit: 100,
          includeUser: true
        })
        
        setLeaderboardData(data)
      } catch (err) {
        console.error('Error loading leaderboard:', err)
        // Check if it's a 404 or connection error
        if (err.message.includes('404') || err.status === 404) {
          setError('SERVICE_NOT_IMPLEMENTED')
        } else {
          setError('FETCH_ERROR')
        }
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [user, timePeriod])

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
        <title>Leaderboard - GroundCTRL</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Trophy className="h-8 w-8 text-primary" />
                  Leaderboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Global rankings of top operators
                </p>
              </div>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* NASA-Inspired Empty State */}
            {error === 'SERVICE_NOT_IMPLEMENTED' && (
              <div className="space-y-8">
                {/* Mission Status Banner */}
                <div className="bg-linear-to-r from-blue-500/10 via-primary/10 to-purple-500/10 border-2 border-primary rounded-lg p-8">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="relative">
                        <Trophy className="h-20 w-20 text-primary animate-pulse" />
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          NEW
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-foreground">
                        🚀 MISSION LEADERBOARD INITIALIZING
                      </h2>
                      <p className="text-lg text-primary font-semibold">
                        T-minus: System Calibration in Progress
                      </p>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        Houston, we're preparing the leaderboard tracking system. Our mission control team is 
                        calibrating the operator performance metrics and establishing communication protocols.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mission Objectives Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg text-foreground">Global Rankings</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Track the top 100 operators across all mission scenarios. Compete for the coveted 
                      #1 position in Mission Control.
                    </p>
                    <div className="pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">COMING SOON</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <Medal className="h-6 w-6 text-blue-500" />
                      </div>
                      <h3 className="font-bold text-lg text-foreground">Mission Specific</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Compare your performance on individual satellite missions. Master each scenario 
                      to earn specialized recognition.
                    </p>
                    <div className="pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">COMING SOON</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-500" />
                      </div>
                      <h3 className="font-bold text-lg text-foreground">Performance Trends</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Monitor your rank progression over time. Track daily, weekly, and monthly 
                      improvements as you climb the ranks.
                    </p>
                    <div className="pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">COMING SOON</div>
                    </div>
                  </div>
                </div>

                {/* Sample Leaderboard Preview */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="bg-primary/10 border-b border-border px-6 py-4">
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Leaderboard Preview - Example Data
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This is what the leaderboard will look like once operators complete missions
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted border-b border-border">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">Call Sign</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold">Score</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold">Missions</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          { rank: 1, callSign: 'APOLLO-7', score: 2847, missions: 42, medal: '🥇', status: 'Legendary' },
                          { rank: 2, callSign: 'NOVA-5', score: 2634, missions: 38, medal: '🥈', status: 'Elite' },
                          { rank: 3, callSign: 'ORION-12', score: 2521, missions: 35, medal: '🥉', status: 'Master' },
                          { rank: 4, callSign: 'VEGA-3', score: 2398, missions: 31, medal: '#4', status: 'Expert' },
                          { rank: 5, callSign: 'MERCURY-9', score: 2287, missions: 29, medal: '#5', status: 'Advanced' },
                        ].map((operator) => (
                          <tr key={operator.rank} className="hover:bg-muted/50 transition-colors opacity-60">
                            <td className="px-6 py-4 text-left font-bold text-lg">
                              {operator.medal}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-foreground">
                                  {operator.callSign}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {operator.status}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-primary text-lg">
                              {operator.score}
                            </td>
                            <td className="px-6 py-4 text-right text-muted-foreground">
                              {operator.missions} completed
                            </td>
                            <td className="px-6 py-4 text-center">
                              <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-muted px-6 py-4 border-t border-border">
                    <p className="text-sm text-muted-foreground italic text-center">
                      📡 Sample data shown • Complete missions to activate real-time tracking
                    </p>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-linear-to-r from-primary/20 to-blue-500/20 border-2 border-primary rounded-lg p-8">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold text-foreground">
                      🎯 Ready for Your First Mission?
                    </h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Complete satellite control missions to earn your place among the top operators. 
                      Each successful mission brings you closer to Mission Control glory!
                    </p>
                    <button
                      onClick={() => window.location.href = '/missions'}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      <Trophy className="h-5 w-5" />
                      Start Your Journey
                    </button>
                  </div>
                </div>

                {/* Technical Note (Collapsed) */}
                <details className="bg-muted border border-border rounded-lg">
                  <summary className="px-6 py-4 cursor-pointer hover:bg-background/50 transition-colors font-semibold text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    Technical Information (For Developers)
                  </summary>
                  <div className="px-6 py-4 border-t border-border space-y-3 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Backend Service Status:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Leaderboard aggregation service: <Badge variant="outline" className="ml-2">Pending Implementation</Badge></li>
                      <li>Required API endpoints: <code className="bg-background px-2 py-0.5 rounded text-xs">GET /api/v1/leaderboard/global</code></li>
                      <li>Real-time ranking calculation: <Badge variant="outline" className="ml-2">In Development</Badge></li>
                    </ul>
                    <p className="mt-4">Once the backend service is deployed, this page will automatically connect and display live operator rankings.</p>
                  </div>
                </details>
              </div>
            )}

            {error === 'FETCH_ERROR' && (
              <div className="space-y-6">
                {/* Mission Abort Banner */}
                <div className="bg-linear-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border-2 border-red-500 rounded-lg p-8">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="relative">
                        <AlertCircle className="h-20 w-20 text-red-500 animate-pulse" />
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          ERROR
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-foreground">
                        🚨 MISSION CONTROL: CONNECTION INTERRUPTED
                      </h2>
                      <p className="text-lg text-red-500 font-semibold">
                        Houston, we have a problem
                      </p>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        Our mission control systems are experiencing technical difficulties. 
                        The leaderboard tracking network is temporarily unavailable.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Retry Action */}
                <div className="bg-muted border border-border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Ready to retry connection to Mission Control?
                  </p>
                  <Button 
                    onClick={() => window.location.reload()}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    Retry Connection
                  </Button>
                </div>

                {/* Status Note */}
                <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-semibold text-foreground mb-1">System Status</div>
                      <div className="text-muted-foreground">
                        Our engineering team has been notified of the connection issue. 
                        Normal operations will resume shortly. Thank you for your patience, operator.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Content */}
            {!error && leaderboardData ? (
              <>
                {/* Your Rank Panel */}
                {leaderboardData.userRank && (
                  <div className="bg-primary/10 border-2 border-primary rounded-lg p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Your Ranking
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Current Rank</div>
                        <div className="text-3xl font-bold text-primary">
                          #{leaderboardData.userRank.rank}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Overall Score</div>
                        <div className="text-3xl font-bold text-foreground">
                          {leaderboardData.userRank.score}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Missions</div>
                        <div className="text-3xl font-bold text-foreground">
                          {leaderboardData.userRank.missionsCompleted}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Percentile</div>
                        <div className="text-3xl font-bold text-foreground">
                          Top {leaderboardData.userRank.percentile}%
                        </div>
                      </div>
                    </div>
                    {leaderboardData.userRank.rankChange !== 0 && (
                      <div className="mt-4 flex items-center gap-2">
                        {leaderboardData.userRank.rankChange > 0 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-500">
                              Up {leaderboardData.userRank.rankChange} positions
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-500">
                              Down {Math.abs(leaderboardData.userRank.rankChange)} positions
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Top 3 Podium */}
                {leaderboardData.topThree && leaderboardData.topThree.length >= 3 && (
                  <div className="grid grid-cols-3 gap-4">
                    {/* 2nd Place */}
                    <PodiumCard
                      operator={leaderboardData.topThree[1]}
                      rank={2}
                      medal="🥈"
                      color="border-slate-400 bg-slate-400/10"
                    />
                    {/* 1st Place */}
                    <PodiumCard
                      operator={leaderboardData.topThree[0]}
                      rank={1}
                      medal="🥇"
                      color="border-amber-500 bg-amber-500/10"
                      highlight
                    />
                    {/* 3rd Place */}
                    <PodiumCard
                      operator={leaderboardData.topThree[2]}
                      rank={3}
                      medal="🥉"
                      color="border-orange-600 bg-orange-600/10"
                    />
                  </div>
                )}

                {/* Full Leaderboard Table */}
                <div className="bg-muted rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-background border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Operator</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Score</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Missions</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {leaderboardData.operators.map((operator) => (
                          <LeaderboardRow
                            key={operator.id}
                            operator={operator}
                            isCurrentUser={operator.id === user?.uid}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="text-center text-sm text-muted-foreground">
                  <Info className="h-4 w-4 inline mr-2" />
                  Rankings update every hour • Showing top {leaderboardData.operators.length} operators
                </div>
              </>
            ) : !error && (
              /* Fallback UI when service exists but no data */
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Leaderboard Data
                </h3>
                <p className="text-muted-foreground">
                  Complete missions to appear on the leaderboard!
                </p>
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
 * Podium Card for Top 3
 */
function PodiumCard({ operator, rank, medal, color, highlight }) {
  return (
    <div className={`border-2 rounded-lg p-4 ${color} ${highlight ? 'transform scale-105' : ''}`}>
      <div className="text-center">
        <div className="text-5xl mb-2">{medal}</div>
        <div className="text-sm text-muted-foreground mb-1">#{rank}</div>
        <div className="font-bold text-lg text-foreground truncate">
          {operator.callSign || 'Operator'}
        </div>
        <div className="text-2xl font-bold text-primary mt-2">
          {operator.score}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {operator.missionsCompleted} missions
        </div>
        {operator.achievements && operator.achievements.length > 0 && (
          <div className="mt-2 flex justify-center gap-1">
            {operator.achievements.slice(0, 3).map((achievement, idx) => (
              <span key={idx} className="text-lg" title={achievement.name}>
                {achievement.badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Leaderboard Row Component
 */
function LeaderboardRow({ operator, isCurrentUser }) {
  const rankDisplay = operator.rank <= 3 
    ? ['🥇', '🥈', '🥉'][operator.rank - 1]
    : `#${operator.rank}`
  
  const trendIcon = operator.rankChange > 0 
    ? <TrendingUp className="h-4 w-4 text-green-500" />
    : operator.rankChange < 0
    ? <TrendingDown className="h-4 w-4 text-red-500" />
    : <Minus className="h-4 w-4 text-muted-foreground" />

  return (
    <tr className={`hover:bg-background/50 transition-colors ${isCurrentUser ? 'bg-primary/10' : ''}`}>
      <td className="px-4 py-3 text-left font-bold">
        {rankDisplay}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">
            {operator.callSign || 'Operator'}
          </span>
          {isCurrentUser && (
            <Badge variant="default" className="text-xs">You</Badge>
          )}
          {operator.achievements && operator.achievements.length > 0 && (
            <span className="text-sm">{operator.achievements[0].badge}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right font-bold text-primary">
        {operator.score}
      </td>
      <td className="px-4 py-3 text-right text-muted-foreground">
        {operator.missionsCompleted}
      </td>
      <td className="px-4 py-3 text-center">
        {trendIcon}
      </td>
    </tr>
  )
}
