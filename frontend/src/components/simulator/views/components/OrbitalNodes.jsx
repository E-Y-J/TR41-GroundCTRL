/**
 * OrbitalNodes - Orbital Node Visualization
 * 
 * Shows ascending and descending node positions:
 * - Ascending node: where orbit crosses equator northbound (green)
 * - Descending node: where orbit crosses equator southbound (red)
 * - Markers with directional arrows
 * - Labels showing node type
 * 
 * Phase 3 Implementation
 */

import * as THREE from 'three'

/**
 * Calculate orbital nodes positions
 * 
 * @param {number} orbitRadius - Orbit radius in scene units
 * @param {number} inclination - Inclination in degrees
 * @param {number} raan - Right Ascension of Ascending Node in degrees
 * @param {number} earthRadius - Earth radius in scene units
 * @returns {Object} { ascendingNode, descendingNode }
 */
export function calculateOrbitalNodes(orbitRadius, inclination, raan, earthRadius = 1.0) {
  const inclRad = inclination * (Math.PI / 180)
  const raanRad = raan * (Math.PI / 180)
  
  // Ascending node is where orbit crosses equator going north
  // This occurs at true anomaly = 0 (or where the orbit intersects z=0 going up)
  // For an inclined orbit, the ascending node is at the RAAN angle
  
  // Ascending node position (in orbital plane at y=0, then rotated)
  const anX = orbitRadius * Math.cos(raanRad)
  const anY = 0 // On equatorial plane
  const anZ = orbitRadius * Math.sin(raanRad)
  
  const ascendingNode = new THREE.Vector3(anX, anY, anZ)
  
  // Descending node is 180 degrees opposite
  const dnX = -anX
  const dnY = 0
  const dnZ = -anZ
  
  const descendingNode = new THREE.Vector3(dnX, dnY, dnZ)
  
  return {
    ascendingNode,
    descendingNode
  }
}

/**
 * Create orbital node marker
 * 
 * @param {string} type - Node type ('ascending'|'descending')
 * @param {THREE.Vector3} position - Node position
 * @returns {THREE.Group} Node marker group
 */
export function createOrbitalNodeMarker(type, position) {
  const group = new THREE.Group()
  group.position.copy(position)
  
  // Colors based on type
  const colors = {
    ascending: {
      base: 0x4ade80,      // Green
      emissive: 0x22c55e,
      label: 'AN'
    },
    descending: {
      base: 0xef4444,      // Red
      emissive: 0xdc2626,
      label: 'DN'
    }
  }
  
  const color = colors[type] || colors.ascending
  
  // Sphere marker
  const sphereGeometry = new THREE.SphereGeometry(0.025, 16, 16)
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: color.base,
    metalness: 0.4,
    roughness: 0.3,
    emissive: color.emissive,
    emissiveIntensity: 0.4
  })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.castShadow = true
  group.add(sphere)
  
  // Glow effect
  const glowGeometry = new THREE.SphereGeometry(0.035, 16, 16)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color.base,
    transparent: true,
    opacity: 0.3,
    depthWrite: false
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  group.add(glow)
  
  // Directional arrow
  const arrowDirection = type === 'ascending' 
    ? new THREE.Vector3(0, 1, 0)  // Points up
    : new THREE.Vector3(0, -1, 0) // Points down
  
  const arrowHelper = new THREE.ArrowHelper(
    arrowDirection,
    new THREE.Vector3(0, 0, 0),
    0.08,
    color.base,
    0.02,
    0.015
  )
  group.add(arrowHelper)
  
  // Store data
  group.userData = {
    type,
    label: color.label,
    glowMesh: glow,
    pulsePhase: 0
  }
  
  return group
}

/**
 * Create both orbital node markers
 * 
 * @param {number} orbitRadius - Orbit radius in scene units
 * @param {number} inclination - Inclination in degrees
 * @param {number} raan - Right Ascension of Ascending Node in degrees
 * @param {number} earthRadius - Earth radius in scene units
 * @returns {THREE.Group} Group containing both node markers
 */
export function createOrbitalNodes(orbitRadius, inclination, raan, earthRadius = 1.0) {
  const group = new THREE.Group()
  group.name = 'OrbitalNodes'
  
  const { ascendingNode, descendingNode } = calculateOrbitalNodes(
    orbitRadius, 
    inclination, 
    raan, 
    earthRadius
  )
  
  // Create markers
  const anMarker = createOrbitalNodeMarker('ascending', ascendingNode)
  anMarker.name = 'AscendingNode'
  group.add(anMarker)
  
  const dnMarker = createOrbitalNodeMarker('descending', descendingNode)
  dnMarker.name = 'DescendingNode'
  group.add(dnMarker)
  
  return group
}

/**
 * Update orbital node positions
 * 
 * @param {THREE.Group} nodesGroup - Orbital nodes group
 * @param {number} orbitRadius - Orbit radius in scene units
 * @param {number} inclination - Inclination in degrees
 * @param {number} raan - Right Ascension of Ascending Node in degrees
 * @param {number} earthRadius - Earth radius in scene units
 */
export function updateOrbitalNodes(nodesGroup, orbitRadius, inclination, raan, earthRadius = 1.0) {
  if (!nodesGroup) return
  
  const { ascendingNode, descendingNode } = calculateOrbitalNodes(
    orbitRadius, 
    inclination, 
    raan, 
    earthRadius
  )
  
  // Update ascending node position
  const anMarker = nodesGroup.getObjectByName('AscendingNode')
  if (anMarker) {
    anMarker.position.copy(ascendingNode)
  }
  
  // Update descending node position
  const dnMarker = nodesGroup.getObjectByName('DescendingNode')
  if (dnMarker) {
    dnMarker.position.copy(descendingNode)
  }
}

/**
 * Animate orbital node markers (subtle pulse)
 * 
 * @param {THREE.Group} nodesGroup - Orbital nodes group
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function animateOrbitalNodes(nodesGroup, deltaTime) {
  if (!nodesGroup) return
  
  nodesGroup.children.forEach(marker => {
    if (!marker.userData || !marker.userData.glowMesh) return
    
    // Subtle pulse animation
    marker.userData.pulsePhase += deltaTime * 2
    const pulse = Math.sin(marker.userData.pulsePhase) * 0.1 + 0.3
    marker.userData.glowMesh.material.opacity = pulse
    
    // Slight scale pulse
    const scale = 1 + Math.sin(marker.userData.pulsePhase) * 0.05
    marker.userData.glowMesh.scale.setScalar(scale)
  })
}

/**
 * Check if satellite is near a node (for highlighting)
 * 
 * @param {THREE.Vector3} satPos - Satellite position
 * @param {THREE.Group} nodesGroup - Orbital nodes group
 * @param {number} threshold - Distance threshold in scene units
 * @returns {Object} { nearAscending, nearDescending, closestNode }
 */
export function checkSatelliteNearNodes(satPos, nodesGroup, threshold = 0.1) {
  if (!nodesGroup || !satPos) {
    return { nearAscending: false, nearDescending: false, closestNode: null }
  }
  
  const anMarker = nodesGroup.getObjectByName('AscendingNode')
  const dnMarker = nodesGroup.getObjectByName('DescendingNode')
  
  let nearAscending = false
  let nearDescending = false
  let closestNode = null
  let minDistance = Infinity
  
  if (anMarker) {
    const distToAN = satPos.distanceTo(anMarker.position)
    if (distToAN < threshold) {
      nearAscending = true
      if (distToAN < minDistance) {
        minDistance = distToAN
        closestNode = 'ascending'
      }
    }
  }
  
  if (dnMarker) {
    const distToDN = satPos.distanceTo(dnMarker.position)
    if (distToDN < threshold) {
      nearDescending = true
      if (distToDN < minDistance) {
        minDistance = distToDN
        closestNode = 'descending'
      }
    }
  }
  
  return {
    nearAscending,
    nearDescending,
    closestNode
  }
}

/**
 * Highlight node when satellite is near
 * 
 * @param {THREE.Group} nodesGroup - Orbital nodes group
 * @param {string} nodeType - Node type to highlight ('ascending'|'descending'|null)
 */
export function highlightNode(nodesGroup, nodeType) {
  if (!nodesGroup) return
  
  const anMarker = nodesGroup.getObjectByName('AscendingNode')
  const dnMarker = nodesGroup.getObjectByName('DescendingNode')
  
  // Reset all highlights
  if (anMarker && anMarker.userData.glowMesh) {
    anMarker.userData.glowMesh.material.opacity = 0.3
    anMarker.scale.setScalar(1)
  }
  
  if (dnMarker && dnMarker.userData.glowMesh) {
    dnMarker.userData.glowMesh.material.opacity = 0.3
    dnMarker.scale.setScalar(1)
  }
  
  // Highlight selected node
  if (nodeType === 'ascending' && anMarker) {
    anMarker.userData.glowMesh.material.opacity = 0.7
    anMarker.scale.setScalar(1.3)
  } else if (nodeType === 'descending' && dnMarker) {
    dnMarker.userData.glowMesh.material.opacity = 0.7
    dnMarker.scale.setScalar(1.3)
  }
}

export default createOrbitalNodes
