/**
 * CommLink - Communication Link Visualization
 * 
 * Visualizes data transmission between satellite and ground station:
 * - Line from satellite to active ground station
 * - Animated data packets along line
 * - Color-coded by link quality (green=good, yellow=marginal, red=poor)
 * - Dashed line style with pulse effect
 * - Data rate indicator
 * 
 * Phase 3 Implementation
 */

import * as THREE from 'three'

/**
 * Calculate link quality based on elevation and distance
 * 
 * @param {number} elevation - Elevation angle in degrees
 * @param {number} distance - Distance in scene units
 * @returns {Object} { quality, color, strength }
 */
export function calculateLinkQuality(elevation, distance) {
  // Quality decreases at low elevations and large distances
  let strength = 1.0
  
  // Elevation factor (0-1, best at 90°, worst at 0°)
  const elevationFactor = Math.max(0, Math.min(1, elevation / 90))
  
  // Distance factor (assuming satellites at ~1.06 units)
  const maxDistance = 2.0
  const distanceFactor = 1.0 - Math.min(1, distance / maxDistance)
  
  // Combined strength
  strength = (elevationFactor * 0.7 + distanceFactor * 0.3)
  
  // Determine quality level
  let quality = 'good'
  let color = 0x4ade80 // Green
  
  if (strength < 0.3) {
    quality = 'poor'
    color = 0xef4444 // Red
  } else if (strength < 0.6) {
    quality = 'marginal'
    color = 0xfbbf24 // Yellow
  }
  
  return { quality, color, strength }
}

/**
 * Create communication link line
 * 
 * @param {THREE.Vector3} satPos - Satellite position
 * @param {THREE.Vector3} stationPos - Ground station position
 * @param {Object} linkQuality - Link quality object from calculateLinkQuality
 * @returns {THREE.Line} Communication link line
 */
export function createCommLink(satPos, stationPos, linkQuality) {
  const { color, strength } = linkQuality
  
  // Create line geometry
  const points = [stationPos.clone(), satPos.clone()]
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  
  // Create dashed line material
  const material = new THREE.LineDashedMaterial({
    color: color,
    transparent: true,
    opacity: 0.6 + strength * 0.4,
    dashSize: 0.05,
    gapSize: 0.025,
    linewidth: 1
  })
  
  const line = new THREE.Line(geometry, material)
  line.computeLineDistances() // Required for dashed lines
  
  // Store data for animations
  line.userData = {
    satPos: satPos.clone(),
    stationPos: stationPos.clone(),
    linkQuality,
    packets: [],
    pulsePhase: 0,
    lastPacketTime: 0
  }
  
  return line
}

/**
 * Create data packet sphere
 * 
 * @param {number} color - Packet color (hex)
 * @returns {THREE.Mesh} Data packet mesh
 */
function createDataPacket(color) {
  const geometry = new THREE.SphereGeometry(0.008, 8, 8)
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.9
  })
  
  const packet = new THREE.Mesh(geometry, material)
  
  // Add glow
  const glowGeometry = new THREE.SphereGeometry(0.012, 8, 8)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  packet.add(glow)
  
  return packet
}

/**
 * Update communication link
 * 
 * @param {THREE.Line} linkLine - Communication link line
 * @param {THREE.Vector3} satPos - New satellite position
 * @param {THREE.Vector3} stationPos - New ground station position
 * @param {Object} linkQuality - New link quality
 */
export function updateCommLink(linkLine, satPos, stationPos, linkQuality) {
  if (!linkLine || !linkLine.geometry) return
  
  // Update geometry
  const positions = linkLine.geometry.attributes.position.array
  positions[0] = stationPos.x
  positions[1] = stationPos.y
  positions[2] = stationPos.z
  positions[3] = satPos.x
  positions[4] = satPos.y
  positions[5] = satPos.z
  linkLine.geometry.attributes.position.needsUpdate = true
  linkLine.computeLineDistances()
  
  // Update material
  linkLine.material.color.setHex(linkQuality.color)
  linkLine.material.opacity = 0.6 + linkQuality.strength * 0.4
  
  // Update user data
  linkLine.userData.satPos = satPos.clone()
  linkLine.userData.stationPos = stationPos.clone()
  linkLine.userData.linkQuality = linkQuality
}

/**
 * Animate communication link (pulse effect and data packets)
 * 
 * @param {THREE.Line} linkLine - Communication link line
 * @param {THREE.Group} packetsGroup - Group containing data packets (unused, for compatibility)
 * @param {number} deltaTime - Time since last frame in seconds
 * @param {boolean} visible - Whether link is visible (fade in/out)
 * @param {THREE.Scene} scene - Three.js scene (optional, needed for packet spawning)
 */
export function animateCommLink(linkLine, packetsGroup, deltaTime, visible = true, scene = null) {
  if (!linkLine || !linkLine.userData) return
  
  // Handle visibility fading
  if (!visible) {
    // Fade out effect
    if (linkLine.material.opacity > 0) {
      linkLine.material.opacity = Math.max(0, linkLine.material.opacity - deltaTime * 2)
    }
    return
  }
  
  
  const { linkQuality, satPos, stationPos } = linkLine.userData
  
  // Fade in effect
  const targetOpacity = 0.6 + linkQuality.strength * 0.4
  if (linkLine.material.opacity < targetOpacity) {
    linkLine.material.opacity = Math.min(targetOpacity, linkLine.material.opacity + deltaTime * 2)
  }
  
  // Pulse effect on line
  linkLine.userData.pulsePhase += deltaTime * 4
  const pulse = Math.sin(linkLine.userData.pulsePhase) * 0.1 + 0.9
  linkLine.material.opacity = (0.6 + linkQuality.strength * 0.4) * pulse
  
  // Spawn data packets periodically (only if scene is provided)
  if (scene) {
    const packetInterval = 1.0 / (1 + linkQuality.strength * 2) // Faster for better quality
    linkLine.userData.lastPacketTime += deltaTime
    
    if (linkLine.userData.lastPacketTime >= packetInterval) {
      linkLine.userData.lastPacketTime = 0
      
      // Create new packet
      const packet = createDataPacket(linkQuality.color)
      packet.position.copy(stationPos)
      packet.userData = {
        progress: 0,
        startPos: stationPos.clone(),
        endPos: satPos.clone(),
        lifespan: 2.0, // 2 seconds to travel
        age: 0
      }
      
      scene.add(packet)
      linkLine.userData.packets.push(packet)
    }
  }
  
  // Animate existing packets
  const packetsToRemove = []
  linkLine.userData.packets.forEach((packet, index) => {
    if (!packet.userData) {
      packetsToRemove.push(index)
      return
    }
    
    packet.userData.age += deltaTime
    packet.userData.progress = Math.min(1, packet.userData.age / packet.userData.lifespan)
    
    // Move packet along line
    packet.position.lerpVectors(
      packet.userData.startPos,
      packet.userData.endPos,
      packet.userData.progress
    )
    
    // Fade out near end
    const fadeStart = 0.8
    if (packet.userData.progress > fadeStart) {
      const fadeProgress = (packet.userData.progress - fadeStart) / (1 - fadeStart)
      packet.material.opacity = 0.9 * (1 - fadeProgress)
      if (packet.children[0]) {
        packet.children[0].material.opacity = 0.3 * (1 - fadeProgress)
      }
    }
    
    // Remove when complete
    if (packet.userData.progress >= 1) {
      if (scene) {
        scene.remove(packet)
      }
      packet.geometry.dispose()
      packet.material.dispose()
      if (packet.children[0]) {
        packet.children[0].geometry.dispose()
        packet.children[0].material.dispose()
      }
      packetsToRemove.push(index)
    }
  })
  
  // Remove completed packets from array (reverse order to maintain indices)
  for (let i = packetsToRemove.length - 1; i >= 0; i--) {
    linkLine.userData.packets.splice(packetsToRemove[i], 1)
  }
}

/**
 * Dispose communication link and its packets
 * 
 * @param {THREE.Line} linkLine - Communication link line
 * @param {THREE.Scene} scene - Three.js scene
 */
export function disposeCommLink(linkLine, scene) {
  if (!linkLine) return
  
  // Remove all packets
  if (linkLine.userData && linkLine.userData.packets) {
    linkLine.userData.packets.forEach(packet => {
      scene.remove(packet)
      packet.geometry.dispose()
      packet.material.dispose()
      if (packet.children[0]) {
        packet.children[0].geometry.dispose()
        packet.children[0].material.dispose()
      }
    })
    linkLine.userData.packets = []
  }
  
  // Remove line
  scene.remove(linkLine)
  linkLine.geometry.dispose()
  linkLine.material.dispose()
}

/**
 * Create communication link manager for multiple stations
 * 
 * @returns {Object} Link manager with helper methods
 */
export function createCommLinkManager() {
  const links = new Map() // stationName -> { line, packetsGroup }
  
  return {
    /**
     * Update or create link for a station
     */
    updateLink(stationName, satPos, stationPos, linkQuality, scene) {
      if (!scene) {
        console.error('[CommLink] Scene is required for updateLink')
        return { line: null, packetsGroup: null }
      }
      
      let linkData = links.get(stationName)
      
      if (!linkData) {
        // Create new link
        const line = createCommLink(satPos, stationPos, linkQuality)
        scene.add(line)
        
        // Create packets group (for compatibility, packets are stored in line.userData)
        const packetsGroup = new THREE.Group()
        packetsGroup.name = `packets_${stationName}`
        
        linkData = { line, packetsGroup }
        links.set(stationName, linkData)
      } else {
        // Update existing link
        updateCommLink(linkData.line, satPos, stationPos, linkQuality)
      }
      
      return linkData
    },
    
    /**
     * Remove link for a station
     */
    removeLink(stationName, scene) {
      const linkData = links.get(stationName)
      if (linkData && scene) {
        disposeCommLink(linkData.line, scene)
        links.delete(stationName)
      }
    },
    
    /**
     * Get link for station
     */
    getLink(stationName) {
      return links.get(stationName)
    },
    
    /**
     * Animate all links
     */
    animateAll(deltaTime, scene) {
      links.forEach(linkData => {
        animateCommLink(linkData.line, linkData.packetsGroup, deltaTime, true, scene)
      })
    },
    
    /**
     * Dispose all links
     */
    dispose(scene) {
      if (scene) {
        links.forEach(linkData => {
          disposeCommLink(linkData.line, scene)
        })
      }
      links.clear()
    },
    
    /**
     * Get all links
     */
    getAllLinks() {
      return Array.from(links.values())
    }
  }
}

export default createCommLink
