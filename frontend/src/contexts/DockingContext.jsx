/**
 * DockingContext - Manages panel docking system
 * 
 * Provides state management and functions for:
 * - Docking/undocking panels to zones
 * - Auto-layout calculation
 * - Dock configuration persistence
 * - Zone occupancy tracking
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

// Dock zone definitions - match the visible dock containers
export const DOCK_ZONES = {
  left: {
    id: 'left',
    label: 'Left Dock',
    position: { x: 0, y: 150 },
    size: { width: 320, maxHeight: 'calc(100vh - 300px)' },
    maxPanels: 4,
    orientation: 'vertical',
    allowedTypes: ['info', 'monitoring', 'chat']
  },
  right: {
    id: 'right',
    label: 'Right Dock',
    position: { x: 'calc(100vw - 320px)', y: 150 },
    size: { width: 320, maxHeight: 'calc(100vh - 300px)' },
    maxPanels: 4,
    orientation: 'vertical',
    allowedTypes: ['control', 'logs', 'monitoring']
  },
  top: {
    id: 'top',
    label: 'Top Dock',
    position: { x: 240, y: 80 },
    size: { width: 'calc(100vw - 660px)', maxHeight: 100 },
    maxPanels: 2,
    orientation: 'horizontal',
    allowedTypes: ['status', 'timeline']
  },
  bottom: {
    id: 'bottom',
    label: 'Bottom Dock',
    position: { x: 240, y: 'calc(100vh - 150px)' },
    size: { width: 'calc(100vw - 660px)', maxHeight: 150 },
    maxPanels: 3,
    orientation: 'horizontal',
    allowedTypes: ['resources', 'queue', 'status']
  }
}

const SNAP_THRESHOLD = 50 // pixels from zone edge to trigger snap
const STORAGE_KEY = 'groundctrl-dock-config'

const DockingContext = createContext(null)

export function DockingProvider({ children }) {
  // State: { zoneId: [{ panelId, order, size, ... }] }
  const [dockedPanels, setDockedPanels] = useState({})
  
  // State: [{ panelId, position, size }]
  const [floatingPanels, setFloatingPanels] = useState([])
  
  // State: currently highlighted zone when dragging
  const [highlightedZone, setHighlightedZone] = useState(null)

  // Load dock configuration from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const config = JSON.parse(saved)
        setDockedPanels(config.dockedPanels || {})
        setFloatingPanels(config.floatingPanels || [])
      }
    } catch (error) {
      console.warn('[DockingContext] Failed to load dock config:', error)
    }
  }, [])

  // Save dock configuration to localStorage whenever it changes
  const saveDockConfig = useCallback(() => {
    try {
      const config = {
        dockedPanels,
        floatingPanels,
        version: 1,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch (error) {
      console.warn('[DockingContext] Failed to save dock config:', error)
    }
  }, [dockedPanels, floatingPanels])

  // Auto-save when dock state changes
  useEffect(() => {
    saveDockConfig()
  }, [dockedPanels, floatingPanels, saveDockConfig])

  /**
   * Detect which dock zone a position is near
   */
  const detectDockZone = useCallback((position) => {
    const { x, y } = position
    
    for (const [zoneId, zone] of Object.entries(DOCK_ZONES)) {
      // Convert calc() values to actual pixels for comparison
      let zoneX = zone.position.x
      let zoneY = zone.position.y
      
      if (typeof zoneX === 'string') {
        // For right zone: calc(100vw - 420px)
        if (zoneX.includes('100vw')) {
          zoneX = window.innerWidth - 420
        }
      }
      
      if (typeof zoneY === 'string') {
        // For bottom zone: calc(100vh - 180px)
        if (zoneY.includes('100vh')) {
          zoneY = window.innerHeight - 180
        }
      }
      
      // Check if position is near zone (within snap threshold)
      const isNearX = Math.abs(x - zoneX) < SNAP_THRESHOLD
      const isNearY = Math.abs(y - zoneY) < SNAP_THRESHOLD
      
      if (isNearX || isNearY) {
        return zoneId
      }
    }
    
    return null
  }, [])

  /**
   * Calculate optimal position for a panel in a dock zone
   * Panels match container width and use content height, stacking vertically
   */
  const calculateDockPosition = useCallback((zoneId, panelId) => {
    const zone = DOCK_ZONES[zoneId]
    if (!zone) return null
    
    const zonePanels = dockedPanels[zoneId] || []
    const panelIndex = zonePanels.findIndex(p => p.panelId === panelId)
    const actualIndex = panelIndex >= 0 ? panelIndex : zonePanels.length
    
    if (zone.orientation === 'vertical') {
      // Stack vertically - panels use full width and auto height
      // Calculate Y offset by summing heights of previous panels
      let yOffset = 0
      for (let i = 0; i < actualIndex; i++) {
        // Get stored height from panel data, or use default
        const prevPanel = zonePanels[i]
        yOffset += prevPanel.height || 200 // default height if not set
      }
      
      return {
        x: zone.position.x,
        y: typeof zone.position.y === 'number' ? zone.position.y + yOffset : yOffset,
        width: zone.size.width, // Full container width
        height: 'auto' // Content-based height
      }
    } else {
      // Stack horizontally
      const totalWidth = zone.size.width
      const panelWidth = typeof totalWidth === 'string'
        ? (window.innerWidth - 640) / (zonePanels.length + 1)
        : totalWidth / (zonePanels.length + 1)
      
      const xOffset = actualIndex * panelWidth
      
      return {
        x: typeof zone.position.x === 'number' ? zone.position.x + xOffset : xOffset,
        y: zone.position.y,
        width: panelWidth,
        height: 'auto' // Content-based height
      }
    }
  }, [dockedPanels])

  /**
   * Dock a panel to a zone
   */
  const dockPanel = useCallback((panelId, zoneId, panelData = {}) => {
    const zone = DOCK_ZONES[zoneId]
    if (!zone) return false
    
    const zonePanels = dockedPanels[zoneId] || []
    
    // Check if zone is full
    if (zonePanels.length >= zone.maxPanels) {
      console.warn(`[DockingContext] Zone ${zoneId} is full`)
      return false
    }
    
    // Remove from floating panels
    setFloatingPanels(prev => prev.filter(p => p.panelId !== panelId))
    
    // Remove from other zones if already docked
    setDockedPanels(prev => {
      const updated = { ...prev }
      for (const zId in updated) {
        updated[zId] = updated[zId].filter(p => p.panelId !== panelId)
      }
      return updated
    })
    
    // Add to target zone
    setDockedPanels(prev => ({
      ...prev,
      [zoneId]: [
        ...(prev[zoneId] || []),
        {
          panelId,
          order: zonePanels.length,
          dockedAt: Date.now(),
          ...panelData
        }
      ]
    }))
    
    console.log(`[DockingContext] Docked ${panelId} to ${zoneId}`)
    return true
  }, [dockedPanels])

  /**
   * Undock a panel from its zone
   */
  const undockPanel = useCallback((panelId, newPosition = null) => {
    let wasDockedIn = null
    
    // Find and remove from docked panels
    setDockedPanels(prev => {
      const updated = { ...prev }
      for (const zoneId in updated) {
        const filtered = updated[zoneId].filter(p => p.panelId !== panelId)
        if (filtered.length < updated[zoneId].length) {
          wasDockedIn = zoneId
        }
        updated[zoneId] = filtered
      }
      return updated
    })
    
    // Add to floating panels if position provided
    if (newPosition && wasDockedIn) {
      setFloatingPanels(prev => [
        ...prev.filter(p => p.panelId !== panelId),
        {
          panelId,
          ...newPosition,
          undockedAt: Date.now()
        }
      ])
      
      console.log(`[DockingContext] Undocked ${panelId} from ${wasDockedIn}`)
    }
    
    return wasDockedIn
  }, [])

  /**
   * Get all panels in a specific zone
   */
  const getZonePanels = useCallback((zoneId) => {
    return dockedPanels[zoneId] || []
  }, [dockedPanels])

  /**
   * Check if a panel is docked
   */
  const isPanelDocked = useCallback((panelId) => {
    for (const zoneId in dockedPanels) {
      if (dockedPanels[zoneId].some(p => p.panelId === panelId)) {
        return zoneId
      }
    }
    return null
  }, [dockedPanels])

  /**
   * Get dock zone by ID
   */
  const getDockZone = useCallback((zoneId) => {
    return DOCK_ZONES[zoneId] || null
  }, [])

  const value = {
    // State
    dockedPanels,
    floatingPanels,
    highlightedZone,
    
    // Actions
    dockPanel,
    undockPanel,
    detectDockZone,
    calculateDockPosition,
    
    // Queries
    getZonePanels,
    isPanelDocked,
    getDockZone,
    
    // Zones
    zones: DOCK_ZONES,
    
    // UI State
    setHighlightedZone,
    
    // Config
    saveDockConfig
  }

  return (
    <DockingContext.Provider value={value}>
      {children}
    </DockingContext.Provider>
  )
}

export function useDocking() {
  const context = useContext(DockingContext)
  if (!context) {
    throw new Error('useDocking must be used within DockingProvider')
  }
  return context
}

export default DockingContext
