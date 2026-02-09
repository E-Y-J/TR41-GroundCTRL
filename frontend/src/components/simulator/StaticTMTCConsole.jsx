/**
 * StaticTMTCConsole - Fixed TM/TC Console (non-draggable)
 * 
 * YAMCS-style telemetry and telecommand console for mission control.
 * Fixed version for permanent dock position.
 */

import { useState, useEffect, useRef } from "react"
import { StaticPanel } from "./StaticPanel"
import { Search, Filter, Download, Pause, Play, Trash2 } from "lucide-react"
import { useWebSocket } from "@/contexts/WebSocketContext"

export function StaticTMTCConsole({ sessionId }) {
  const { tmtcMessages } = useWebSocket()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all") // all, TM, TC, EVENT
  const [filterSubsystem, setFilterSubsystem] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [isPaused, setIsPaused] = useState(false)
  const [localMessages, setLocalMessages] = useState([])
  const messagesEndRef = useRef(null)
  const consoleRef = useRef(null)
  
  // Update local messages when new messages arrive (unless paused)
  useEffect(() => {
    if (!isPaused && tmtcMessages) {
      setLocalMessages(tmtcMessages)
    }
  }, [tmtcMessages, isPaused])
  
  // Auto-scroll to bottom when new messages arrive (unless paused)
  useEffect(() => {
    if (!isPaused && messagesEndRef.current && consoleRef.current) {
      // Check if user is near bottom before auto-scrolling
      const { scrollTop, scrollHeight, clientHeight } = consoleRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [localMessages, isPaused])
  
  // Filter messages
  const filteredMessages = localMessages.filter(msg => {
    // Search filter
    if (searchQuery && !msg.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Type filter
    if (filterType !== "all" && msg.type !== filterType) {
      return false
    }
    
    // Subsystem filter
    if (filterSubsystem !== "all" && msg.subsystem !== filterSubsystem) {
      return false
    }
    
    // Severity filter
    if (filterSeverity !== "all" && msg.severity !== filterSeverity) {
      return false
    }
    
    return true
  })
  
  // Export to JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(filteredMessages, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tmtc-log-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }
  
  // Clear messages
  const handleClear = () => {
    setLocalMessages([])
  }
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "text-red-500"
      case "warning":
        return "text-yellow-500"
      case "nominal":
      default:
        return "text-green-500"
    }
  }
  
  // Get type badge color
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "TC":
        return "bg-blue-600 text-white"
      case "TM":
        return "bg-purple-600 text-white"
      case "EVENT":
        return "bg-orange-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  return (
    <StaticPanel
      id="tmtc-console"
      title="📊 TM/TC Console"
      minHeight={300}
      maxHeight={400}
      showMinimize={true}
    >
      {/* Controls */}
      <div className="space-y-3 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-3 gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-muted/30 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="TM">TM Only</option>
            <option value="TC">TC Only</option>
            <option value="EVENT">Events Only</option>
          </select>
          
          <select
            value={filterSubsystem}
            onChange={(e) => setFilterSubsystem(e.target.value)}
            className="px-3 py-2 bg-muted/30 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Subsystems</option>
            <option value="ADCS">ADCS</option>
            <option value="EPS">EPS</option>
            <option value="COMMS">COMMS</option>
            <option value="PROP">Propulsion</option>
            <option value="SYSTEM">System</option>
          </select>
          
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 bg-muted/30 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Severity</option>
            <option value="nominal">Nominal</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 px-3 py-2 bg-muted/30 border border-border rounded-md text-sm hover:bg-muted transition-colors"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-muted/30 border border-border rounded-md text-sm hover:bg-muted transition-colors"
            title="Export to JSON"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 bg-destructive/20 border border-destructive/30 rounded-md text-sm hover:bg-destructive/30 transition-colors"
            title="Clear messages"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
          
          <div className="ml-auto text-xs text-muted-foreground">
            {filteredMessages.length} / {localMessages.length} messages
          </div>
        </div>
      </div>
      
      {/* Messages Console */}
      <div
        ref={consoleRef}
        className="h-64 overflow-y-auto bg-background/50 border border-border rounded-md p-2 space-y-1 font-mono text-xs"
      >
        {filteredMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No messages to display
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-2 bg-muted/20 border border-border/50 rounded hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getTypeBadgeColor(msg.type)}`}>
                    {msg.type}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {msg.subsystem}
                  </span>
                  <span className={`text-[10px] font-semibold ${getSeverityColor(msg.severity)}`}>
                    {msg.severity.toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-foreground">
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </StaticPanel>
  )
}

export default StaticTMTCConsole
