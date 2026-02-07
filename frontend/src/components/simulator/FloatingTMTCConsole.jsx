/**
 * FloatingTMTCConsole - YAMCS-style Telemetry & Command Log Console
 * 
 * Floating, draggable/resizable console for viewing telemetry stream and command history.
 * Features filtering, search, auto-scroll, and export capabilities.
 */

import { useState, useEffect, useRef, useCallback } from "react"
import { DraggablePanel } from "./DraggablePanel"
import { Search, Filter, Download, Pause, Play, Trash2 } from "lucide-react"
import { useSimulatorState } from "@/contexts/SimulatorStateContext"

// Message severity colors
const SEVERITY_COLORS = {
  nominal: {
    bg: "bg-green-500/10",
    text: "text-green-500",
    border: "border-green-500/30",
  },
  warning: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-500",
    border: "border-yellow-500/30",
  },
  critical: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/30",
  },
}

// Subsystem labels
const SUBSYSTEMS = ["ALL", "ADCS", "EPS", "COMMS", "PROP", "SYSTEM"]

export function FloatingTMTCConsole({
  sessionId,
  onCommandSubmit,
  onClose,
  defaultPosition = { x: window.innerWidth - 450, y: 100, width: 400, height: 500 },
  maxMessages = 500,
}) {
  const { telemetry, commandHistory } = useSimulatorState()
  const [messages, setMessages] = useState([])
  const [filteredMessages, setFilteredMessages] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState({
    subsystem: "ALL",
    severity: "ALL",
    type: "ALL", // TM, TC, EVENT, ALL
  })
  const [isPaused, setIsPaused] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)

  // Generate telemetry messages from telemetry updates
  useEffect(() => {
    if (!telemetry || isPaused) return

    const newMessage = {
      id: `tm-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type: "TM",
      subsystem: "SYSTEM",
      severity: "nominal",
      content: `Telemetry update received - Alt: ${telemetry.orbit?.altitude_km?.toFixed(1)}km`,
      raw: telemetry,
    }

    setMessages((prev) => {
      const updated = [...prev, newMessage]
      // Keep only last maxMessages
      return updated.slice(-maxMessages)
    })
  }, [telemetry, isPaused, maxMessages])

  // Add command history to messages
  useEffect(() => {
    if (!commandHistory || commandHistory.length === 0) return

    const latestCommand = commandHistory[commandHistory.length - 1]
    const commandMessage = {
      id: `tc-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type: "TC",
      subsystem: latestCommand.subsystem || "SYSTEM",
      severity: latestCommand.status === "failed" ? "critical" : "nominal",
      content: `Command ${latestCommand.command || latestCommand.type} - ${latestCommand.status || "sent"}`,
      raw: latestCommand,
    }

    setMessages((prev) => {
      const updated = [...prev, commandMessage]
      return updated.slice(-maxMessages)
    })
  }, [commandHistory, maxMessages])

  // Filter messages based on active filters and search
  useEffect(() => {
    let filtered = [...messages]

    // Filter by subsystem
    if (activeFilters.subsystem !== "ALL") {
      filtered = filtered.filter((msg) => msg.subsystem === activeFilters.subsystem)
    }

    // Filter by severity
    if (activeFilters.severity !== "ALL") {
      filtered = filtered.filter((msg) => msg.severity === activeFilters.severity)
    }

    // Filter by type
    if (activeFilters.type !== "ALL") {
      filtered = filtered.filter((msg) => msg.type === activeFilters.type)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (msg) =>
          msg.content.toLowerCase().includes(query) ||
          msg.subsystem.toLowerCase().includes(query)
      )
    }

    setFilteredMessages(filtered)
  }, [messages, activeFilters, searchQuery])

  // Auto-scroll to bottom when new messages arrive (if not paused)
  useEffect(() => {
    if (!isPaused && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [filteredMessages, isPaused])

  // Handle filter toggle
  const toggleFilter = useCallback((filterType, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType] === value ? "ALL" : value,
    }))
  }, [])

  // Export logs
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(messages, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `tmtc-log-${sessionId}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [messages, sessionId])

  // Clear messages
  const handleClear = useCallback(() => {
    if (confirm("Clear all messages?")) {
      setMessages([])
      setUnreadCount(0)
    }
  }, [])

  return (
    <DraggablePanel
      id="tmtc-console"
      title={`TM/TC Console ${unreadCount > 0 ? `(${unreadCount} new)` : ""}`}
      defaultPosition={defaultPosition}
      minWidth={350}
      minHeight={300}
      contentClassName="p-0"
      onClose={onClose}
      showClose={true}
    >
      <div className="flex flex-col h-full">
        {/* Controls Bar */}
        <div className="px-3 py-2 border-b border-border space-y-2">
          {/* Search and Actions */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs bg-muted/30 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 hover:bg-muted rounded transition-colors"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? (
                <Play className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Pause className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            
            <button
              onClick={handleExport}
              className="p-1.5 hover:bg-muted rounded transition-colors"
              title="Export logs"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-destructive/20 hover:text-destructive rounded transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1">
            <Filter className="w-3 h-3 text-muted-foreground" />
            
            {/* Subsystem Filter */}
            <select
              value={activeFilters.subsystem}
              onChange={(e) => setActiveFilters((prev) => ({ ...prev, subsystem: e.target.value }))}
              className="px-2 py-0.5 text-[10px] bg-muted border border-border rounded hover:bg-muted/80 transition-colors"
            >
              {SUBSYSTEMS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={activeFilters.type}
              onChange={(e) => setActiveFilters((prev) => ({ ...prev, type: e.target.value }))}
              className="px-2 py-0.5 text-[10px] bg-muted border border-border rounded hover:bg-muted/80 transition-colors"
            >
              <option value="ALL">ALL</option>
              <option value="TM">TM</option>
              <option value="TC">TC</option>
              <option value="EVENT">EVENT</option>
            </select>

            {/* Severity Filter */}
            <select
              value={activeFilters.severity}
              onChange={(e) => setActiveFilters((prev) => ({ ...prev, severity: e.target.value }))}
              className="px-2 py-0.5 text-[10px] bg-muted border border-border rounded hover:bg-muted/80 transition-colors"
            >
              <option value="ALL">ALL</option>
              <option value="nominal">NOMINAL</option>
              <option value="warning">WARNING</option>
              <option value="critical">CRITICAL</option>
            </select>
          </div>
        </div>

        {/* Messages List */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto font-mono text-[10px] leading-tight p-2 space-y-0.5"
        >
          {filteredMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {messages.length === 0 ? "No messages yet" : "No messages match filters"}
            </div>
          ) : (
            filteredMessages.map((message) => (
              <MessageRow key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Status Bar */}
        <div className="px-3 py-1.5 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              {filteredMessages.length} / {messages.length} messages
            </span>
            <span>{isPaused ? "PAUSED" : "LIVE"}</span>
          </div>
        </div>
      </div>
    </DraggablePanel>
  )
}

/**
 * MessageRow - Individual message display
 */
function MessageRow({ message }) {
  const [expanded, setExpanded] = useState(false)
  const severityConfig = SEVERITY_COLORS[message.severity] || SEVERITY_COLORS.nominal

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <div
      className={`p-1.5 rounded border ${severityConfig.border} ${severityConfig.bg} hover:bg-muted/50 transition-colors cursor-pointer`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2">
        <span className="text-muted-foreground shrink-0 w-16">
          {formatTime(message.timestamp)}
        </span>
        <span className={`shrink-0 w-10 font-bold ${severityConfig.text}`}>
          [{message.type}]
        </span>
        <span className="text-foreground/70 shrink-0 w-14 uppercase">
          {message.subsystem}
        </span>
        <span className="text-foreground flex-1 break-all">
          {message.content}
        </span>
      </div>

      {/* Expanded raw data */}
      {expanded && message.raw && (
        <div className="mt-2 pt-2 border-t border-border/30">
          <pre className="text-[9px] text-muted-foreground overflow-x-auto">
            {JSON.stringify(message.raw, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default FloatingTMTCConsole
