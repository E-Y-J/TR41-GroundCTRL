import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import AppHeader from '@/components/app-header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/hooks/use-auth'
import { fetchUserProgress } from '@/lib/firebase/userProgressService'
import { 
  Trophy, Award, Star, Zap, Target, TrendingUp, 
  Lock, Loader2, Search, Filter
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * Achievement Definitions
 * Based on backend performanceTracker.js
 */
const ACHIEVEMENT_DEFINITIONS = {
  PERFECT_COMMANDER: {
    id: 'PERFECT_COMMANDER',
    name: 'Perfect Commander',
    badge: '🎯',
    icon: Target,
    description: 'Achieve 100% command accuracy in a mission',
    rarity: 'EPIC',
    category: 'PERFORMANCE',
    color: 'from-yellow-500 to-amber-600',
    requirements: ['Execute all commands without errors', 'Complete mission with perfect accuracy'],
  },
  SPEED_RUNNER: {
    id: 'SPEED_RUNNER',
    name: 'Speed Runner',
    badge: '⚡',
    icon: Zap,
    description: 'Complete a mission in record time',
    rarity: 'RARE',
    category: 'PERFORMANCE',
    color: 'from-blue-500 to-cyan-600',
    requirements: ['Complete mission 50% faster than average', 'Maintain good accuracy'],
  },
  RESOURCE_MASTER: {
    id: 'RESOURCE_MASTER',
    name: 'Resource Master',
    badge: '💎',
    icon: Award,
    description: 'Optimize resource usage throughout mission',
    rarity: 'RARE',
    category: 'OPERATIONAL',
    color: 'from-purple-500 to-pink-600',
    requirements: ['Achieve 90%+ resource efficiency', 'Minimize power and data waste'],
  },
  QUICK_RESPONDER: {
    id: 'QUICK_RESPONDER',
    name: 'Quick Responder',
    badge: '🚀',
    icon: TrendingUp,
    description: 'Respond to events with exceptional speed',
    rarity: 'COMMON',
    category: 'PERFORMANCE',
    color: 'from-green-500 to-emerald-600',
    requirements: ['Maintain fast response times', 'React quickly to mission events'],
  },
  COMMAND_EFFICIENCY: {
    id: 'COMMAND_EFFICIENCY',
    name: 'Command Efficiency',
    badge: '📊',
    icon: Star,
    description: 'Complete mission with minimal command usage',
    rarity: 'RARE',
    category: 'OPERATIONAL',
    color: 'from-indigo-500 to-purple-600',
    requirements: ['Use optimal command sequences', 'Avoid redundant commands'],
  },
  MISSION_10: {
    id: 'MISSION_10',
    name: 'Mission Veteran',
    badge: '🏆',
    icon: Trophy,
    description: 'Complete 10 missions',
    rarity: 'COMMON',
    category: 'MILESTONE',
    color: 'from-orange-500 to-red-600',
    requirements: ['Complete 10 missions'],
  },
  MISSION_25: {
    id: 'MISSION_25',
    name: 'Seasoned Operator',
    badge: '🎖️',
    icon: Trophy,
    description: 'Complete 25 missions',
    rarity: 'RARE',
    category: 'MILESTONE',
    color: 'from-orange-500 to-red-600',
    requirements: ['Complete 25 missions'],
  },
  MISSION_50: {
    id: 'MISSION_50',
    name: 'Expert Controller',
    badge: '🥇',
    icon: Trophy,
    description: 'Complete 50 missions',
    rarity: 'EPIC',
    category: 'MILESTONE',
    color: 'from-yellow-500 to-orange-600',
    requirements: ['Complete 50 missions'],
  },
  MISSION_100: {
    id: 'MISSION_100',
    name: 'Mission Control Legend',
    badge: '👑',
    icon: Trophy,
    description: 'Complete 100 missions',
    rarity: 'LEGENDARY',
    category: 'MILESTONE',
    color: 'from-purple-500 to-pink-600',
    requirements: ['Complete 100 missions'],
  },
}

const RARITY_COLORS = {
  COMMON: 'bg-slate-500',
  RARE: 'bg-blue-500',
  EPIC: 'bg-purple-500',
  LEGENDARY: 'bg-amber-500',
}

/**
 * Achievements & Badges Page
 * Full implementation showing earned and locked achievements
 */
export default function Achievements() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [userSessions, setUserSessions] = useState([])
  const [earnedAchievements, setEarnedAchievements] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [filterRarity, setFilterRarity] = useState('ALL')
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [sortBy, setSortBy] = useState('category')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/')
    }
  }, [user, authLoading, navigate])

  // Fetch user's completed missions and achievements
  useEffect(() => {
    async function loadUserData() {
      if (!user) return
      
      try {
        setLoading(true)
        const sessions = await fetchUserProgress(user.uid)
        setUserSessions(sessions)
        
        // Extract achievements from completed sessions
        const achievements = []
        sessions.forEach(session => {
          if (session.performance?.achievements) {
            session.performance.achievements.forEach(achievement => {
              if (!achievements.some(a => a.id === achievement.id)) {
                achievements.push({
                  ...achievement,
                  earnedDate: session.endTime || session.startTime,
                  sessionId: session.id,
                  missionName: session.scenarioName || 'Unknown Mission',
                })
              }
            })
          }
        })
        setEarnedAchievements(achievements)
      } catch (error) {
        console.error('Error loading achievements:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user])

  // Calculate statistics
  const completedMissions = userSessions.filter(s => s.status === 'completed').length
  const totalAchievements = Object.keys(ACHIEVEMENT_DEFINITIONS).length
  const completionPercentage = Math.round((earnedAchievements.length / totalAchievements) * 100)

  // Separate earned and locked achievements
  const achievements = Object.values(ACHIEVEMENT_DEFINITIONS).map(def => {
    const earned = earnedAchievements.find(a => a.id === def.id || a.name === def.name)
    return {
      ...def,
      earned: !!earned,
      earnedDate: earned?.earnedDate,
      sessionId: earned?.sessionId,
      missionName: earned?.missionName,
      progress: calculateProgress(def, completedMissions),
    }
  })

  // Filter and sort
  const filteredAchievements = achievements
    .filter(a => {
      if (searchTerm && !a.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (filterCategory !== 'ALL' && a.category !== filterCategory) {
        return false
      }
      if (filterRarity !== 'ALL' && a.rarity !== filterRarity) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      if (sortBy === 'rarity') return a.rarity.localeCompare(b.rarity)
      if (sortBy === 'earned') return (b.earned ? 1 : 0) - (a.earned ? 1 : 0)
      return a.name.localeCompare(b.name)
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
        <title>Achievements - GroundCTRL</title>
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
                  Achievements & Badges
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your accomplishments and milestones
                </p>
              </div>
            </div>

            {/* Statistics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground">Achievements Earned</div>
                <div className="text-2xl font-bold text-foreground mt-1">
                  {earnedAchievements.length} / {totalAchievements}
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground">Completion</div>
                <div className="text-2xl font-bold text-primary mt-1">
                  {completionPercentage}%
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground">Missions Completed</div>
                <div className="text-2xl font-bold text-foreground mt-1">
                  {completedMissions}
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground">Rarest Achievement</div>
                <div className="text-2xl font-bold text-amber-500 mt-1">
                  {earnedAchievements.some(a => ACHIEVEMENT_DEFINITIONS[a.id]?.rarity === 'LEGENDARY') ? '👑 Legendary' :
                   earnedAchievements.some(a => ACHIEVEMENT_DEFINITIONS[a.id]?.rarity === 'EPIC') ? '🎯 Epic' :
                   earnedAchievements.some(a => ACHIEVEMENT_DEFINITIONS[a.id]?.rarity === 'RARE') ? '⚡ Rare' : '🏆 Common'}
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search achievements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="PERFORMANCE">Performance</SelectItem>
                  <SelectItem value="OPERATIONAL">Operational</SelectItem>
                  <SelectItem value="MILESTONE">Milestones</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRarity} onValueChange={setFilterRarity}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Rarities</SelectItem>
                  <SelectItem value="COMMON">Common</SelectItem>
                  <SelectItem value="RARE">Rare</SelectItem>
                  <SelectItem value="EPIC">Epic</SelectItem>
                  <SelectItem value="LEGENDARY">Legendary</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="rarity">Rarity</SelectItem>
                  <SelectItem value="earned">Earned First</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => setSelectedAchievement(achievement)}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredAchievements.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No achievements found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search term
                </p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </>
  )
}

/**
 * Achievement Card Component
 */
function AchievementCard({ achievement, onClick }) {
  const Icon = achievement.icon

  return (
    <button
      onClick={onClick}
      className={`
        relative p-6 rounded-lg border-2 transition-all duration-200
        ${achievement.earned 
          ? 'border-primary bg-linear-to-br ' + achievement.color + ' opacity-100 hover:scale-105' 
          : 'border-border bg-muted opacity-50 hover:opacity-70 grayscale'
        }
        text-left w-full
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`text-4xl ${achievement.earned ? '' : 'opacity-30'}`}>
          {achievement.badge}
        </div>
        {!achievement.earned && (
          <Lock className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      
      <h3 className={`font-bold text-lg mb-2 ${achievement.earned ? 'text-white' : 'text-foreground'}`}>
        {achievement.name}
      </h3>
      
      <p className={`text-sm mb-3 ${achievement.earned ? 'text-white/90' : 'text-muted-foreground'}`}>
        {achievement.description}
      </p>
      
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={RARITY_COLORS[achievement.rarity]}>
          {achievement.rarity}
        </Badge>
        <Badge variant="outline">
          {achievement.category}
        </Badge>
      </div>

      {achievement.earned && achievement.earnedDate && (
        <div className="mt-3 text-xs text-white/70">
          Earned: {new Date(achievement.earnedDate).toLocaleDateString()}
        </div>
      )}

      {!achievement.earned && achievement.progress > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{achievement.progress}%</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${achievement.progress}%` }}
            />
          </div>
        </div>
      )}
    </button>
  )
}

/**
 * Achievement Detail Modal
 */
function AchievementDetailModal({ achievement, onClose }) {
  const Icon = achievement.icon

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="text-6xl">{achievement.badge}</div>
            <div>
              <DialogTitle className="text-2xl mb-1">{achievement.name}</DialogTitle>
              <div className="flex gap-2">
                <Badge className={RARITY_COLORS[achievement.rarity]}>
                  {achievement.rarity}
                </Badge>
                <Badge variant="outline">{achievement.category}</Badge>
              </div>
            </div>
          </div>
          <DialogDescription className="text-base">
            {achievement.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Requirements */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Requirements
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {achievement.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Status */}
          {achievement.earned ? (
            <div className="bg-primary/10 border border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                <Award className="h-5 w-5" />
                Achievement Unlocked!
              </div>
              {achievement.earnedDate && (
                <p className="text-sm text-muted-foreground">
                  Earned on {new Date(achievement.earnedDate).toLocaleDateString()} in {achievement.missionName}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-muted border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground font-semibold mb-2">
                <Lock className="h-5 w-5" />
                Locked
              </div>
              <p className="text-sm text-muted-foreground">
                Complete the requirements above to unlock this achievement.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Calculate progress for milestone achievements
 */
function calculateProgress(achievement, completedMissions) {
  if (achievement.category !== 'MILESTONE') return 0
  
  const milestones = {
    MISSION_10: 10,
    MISSION_25: 25,
    MISSION_50: 50,
    MISSION_100: 100,
  }
  
  const target = milestones[achievement.id]
  if (!target) return 0
  
  return Math.min(Math.round((completedMissions / target) * 100), 100)
}
