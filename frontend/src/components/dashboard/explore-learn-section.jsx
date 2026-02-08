"use client"

import { useState } from "react"
import { Compass, GraduationCap, Users, Satellite, BookOpen, TrendingUp, ChevronDown } from "lucide-react"
import { Link } from "react-router-dom"

const exploreLinks = [
  {
    label: "Satellites",
    description: "Explore satellite catalog",
    icon: Satellite,
    href: "/satellites",
  },
  {
    label: "Ground Stations",
    description: "Worldwide station directory",
    icon: "🛰️",
    href: "/ground-stations",
  },
  {
    label: "News & Updates",
    description: "Latest platform updates",
    icon: "📰",
    href: "/news",
  },
]

const learnLinks = [
  {
    label: "Tutorials",
    description: "Step-by-step guides",
    icon: "📚",
    href: "/tutorials",
  },
  {
    label: "Resources",
    description: "Learning materials",
    icon: BookOpen,
    href: "/resources",
  },
  {
    label: "Certificates",
    description: "View your achievements",
    icon: "🎓",
    href: "/certificates",
  },
]

const communityLinks = [
  {
    label: "Forum",
    description: "Join the discussion",
    icon: "💬",
    href: "/community",
  },
  {
    label: "Achievements",
    description: "Track your progress",
    icon: TrendingUp,
    href: "/achievements",
  },
  {
    label: "About",
    description: "Learn more about us",
    icon: "ℹ️",
    href: "/about",
  },
]

function LinkSection({ title, icon: Icon, links, isOpen, onToggle }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {typeof Icon === 'string' ? (
            <span className="text-lg">{Icon}</span>
          ) : (
            <Icon className="h-4 w-4 text-primary" />
          )}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="block p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
            >
              <div className="flex items-center gap-3">
                {typeof link.icon === 'string' ? (
                  <span className="text-xl shrink-0">{link.icon}</span>
                ) : (
                  <link.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{link.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{link.description}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function ExploreLearnSection() {
  const [openSections, setOpenSections] = useState({
    explore: false,
    learn: false,
    community: false,
  })

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <h2 className="text-sm font-semibold text-foreground">Explore & Learn</h2>
      </div>

      {/* Content */}
      <div>
        <LinkSection 
          title="Explore" 
          icon={Compass} 
          links={exploreLinks}
          isOpen={openSections.explore}
          onToggle={() => toggleSection('explore')}
        />
        <LinkSection 
          title="Learn" 
          icon={GraduationCap} 
          links={learnLinks}
          isOpen={openSections.learn}
          onToggle={() => toggleSection('learn')}
        />
        <LinkSection 
          title="Community" 
          icon={Users} 
          links={communityLinks}
          isOpen={openSections.community}
          onToggle={() => toggleSection('community')}
        />
      </div>
    </div>
  )
}
