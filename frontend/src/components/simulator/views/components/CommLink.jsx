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
 * @param {THREE.Scene} scene - Three.js scene
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function animateCommLink(linkLine, scene, deltaTime) {
  if (!linkLine || !linkLine.userData) return
  
  const { linkQuality, satPos, stationPos } = linkLine.userData
  
  // Pulse effect on line
  linkLine.userData.pulsePhase += deltaTime * 4
  const pulse = Math.sin(linkLine.userData.pulsePhase) * 0.1 + 0.9
  linkLine.material.opacity = (0.6 + linkQuality.strength * 0.4) * pulse
  
  // Spawn data packets periodically
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
      scene.remove(packet)
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
 * @param {THREE.Scene} scene - Three.js scene
 * @returns {Object} Link manager with helper methods
 */
export function createCommLinkManager(scene) {
  const links = new Map() // stationName -> link line
  
  return {
    /**
     * Update or create link for a station
     */
    updateLink(stationName, satPos, stationPos, linkQuality) {
      let link = links.get(stationName)
      
      if (!link) {
        // Create new link
        link = createCommLink(satPos, stationPos, linkQuality)
        scene.add(link)
        links.set(stationName, link)
      } else {
        // Update existing link
        updateCommLink(link, satPos, stationPos, linkQuality)
      }
      
      return link
    },
    
    /**
     * Remove link for a station
     */
    removeLink(stationName) {
      const link = links.get(stationName)
      if (link) {
        disposeCommLink(link, scene)
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
    animateAll(deltaTime) {
      links.forEach(link => {
        animateCommLink(link, scene, deltaTime)
      })
    },
    
    /**
     * Dispose all links
     */
    dispose() {
      links.forEach(link => {
        disposeCommLink(link, scene)
      })
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
