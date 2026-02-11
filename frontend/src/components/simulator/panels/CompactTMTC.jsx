/**
 * CompactTMTC - Professional TM/TC log console
 * Subdued colors, professional mission control styling
 */

import { useState, useEffect, useRef } from "react"
import { useWebSocket } from "@/contexts/WebSocketContext"

export function CompactTMTC() {
  const { tmtcMessages } = useWebSocket()
  const [localMessages, setLocalMessages] = useState([])
  const messagesEndRef = useRef(null)
  const consoleRef = useRef(null)
  
  // Keep only last 50 messages for performance
  useEffect(() => {
    if (tmtcMessages) {
      setLocalMessages(tmtcMessages.slice(-50))
    }
  }, [tmtcMessages])
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [localMessages])
  
  // Get severity styling (subdued professional colors)
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "critical":
        return "text-red-400/90"
      case "warning":
        return "text-amber-400/90"
      case "nominal":
      default:
        return "text-slate-400"
    }
  }
  
  // Get type badge styling (minimal, professional)
  const getTypeBadge = (type) => {
    switch (type) {
      case "TC":
        return "bg-cyan-900/40 text-cyan-300"
      case "TM":
        return "bg-indigo-900/40 text-indigo-300"
      case "EVENT":
        return "bg-slate-700/40 text-slate-300"
      default:
        return "bg-slate-800/40 text-slate-400"
    }
  }

  return (
    <div className="flex flex-col h-full text-xs">
      {/* Header - minimal */}
      <div className="font-mono text-[10px] text-slate-400 border-b border-slate-700/50 pb-1 mb-1 flex items-center justify-between">
        <span>TM/TC LOG</span>
        <span className="text-slate-500">{localMessages.length}/50</span>
      </div>
      
      {/* Messages Console - scrollable */}
      <div
        ref={consoleRef}
        className="flex-1 overflow-y-auto space-y-0.5 font-mono text-[10px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {localMessages.length === 0 ? (
          <div className="text-center text-slate-600 py-4">
            Awaiting telemetry...
          </div>
        ) : (
          localMessages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className="px-1.5 py-1 bg-slate-900/30 border-l-2 border-slate-700/30 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${getTypeBadge(msg.type)}`}>
                  {msg.type}
                </span>
                <span className="text-slate-500">
                  {msg.subsystem || 'SYS'}
                </span>
                <span className={`text-[9px] font-medium ${getSeverityStyle(msg.severity)}`}>
                  {msg.severity?.toUpperCase() || 'NOM'}
                </span>
                <span className="ml-auto text-slate-600 text-[9px]">
                  {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </span>
              </div>
              <div className="text-slate-300 leading-tight">
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
