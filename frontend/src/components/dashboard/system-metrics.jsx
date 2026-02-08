"use client"

import { Satellite, Target, Clock, TrendingUp } from "lucide-react"
import { getTotalMissionTime } from "@/lib/firebase/userProgressService"

/**
 * Calculate skill level based on completed missions
 */
function calculateSkillLevel(completedCount) {
  if (completedCount === 0) return { level: "Rookie", tier: "Level 1" }
  if (completedCount < 3) return { level: "Beginner", tier: "Level 2" }
  if (completedCount < 8) return { level: "Intermediate", tier: "Level 3" }
  if (completedCount < 12) return { level: "Advanced", tier: "Level 4" }
  return { level: "Expert", tier: "Level 5" }
}

export function SystemMetrics({ sessions = [] }) {
  // Calculate real metrics from session data
  const completedCount = sessions.filter(s => s.status === 'COMPLETED').length
  const totalTime = getTotalMissionTime(sessions)
  const trainingHours = (totalTime.totalSeconds / 3600).toFixed(1)
  const skillData = calculateSkillLevel(completedCount)

  const metrics = [
    {
      label: "Active Satellites",
      value: "1",
      sublabel: "SAT-01 Online",
      icon: Satellite,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Missions Completed",
      value: completedCount.toString(),
      sublabel: "scenarios completed",
      icon: Target,
      color: "text-status-nominal",
      bgColor: "bg-status-nominal/10",
    },
    {
      label: "Training Hours",
      value: trainingHours,
      sublabel: "hrs logged",
      icon: Clock,
      color: "text-status-warning",
      bgColor: "bg-status-warning/10",
    },
    {
      label: "Skill Level",
      value: skillData.level,
      sublabel: skillData.tier,
      icon: TrendingUp,
      color: "text-teal",
      bgColor: "bg-teal/10",
    },
  ]

  return (
    <>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-card border border-border rounded-lg p-4 flex items-start gap-4"
        >
          <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
            <metric.icon className={`h-5 w-5 ${metric.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{metric.label}</p>
            <p className="text-2xl font-bold text-foreground">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.sublabel}</p>
          </div>
        </div>
      ))}
    </>
  )
}
