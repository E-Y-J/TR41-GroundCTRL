/**
 * OrbitalNodes - Ascending and Descending Node Visualization
 * 
 * Shows orbital node positions:
 * - Ascending node (orbit crosses equator northbound)
 * - Descending node (orbit crosses equator southbound)
 * - Color-coded markers (green=ascending, red=descending)
 * - Directional arrows
 * - Node labels (AN/DN)
 * 
 * Phase 3 Implementation
 */

import * as THREE from 'three'

/**
 * Calculate orbital node positions
 * 
 * @param {number} radius - Orbit radius in scene units
 * @param {number} inclination - Inclination angle in degrees
 * @param {number} raan - Right Ascension of Ascending Node in degrees
 * @returns {Object} { ascendingNode, descendingNode }
 */
export function calculateOrbitalNodes(radius, inclination, raan) {
  const inclRad = inclination * (Math.PI / 180)
  const raanRad = raan * (Math.PI / 180)
  
  // Ascending node: where orbit crosses equator going north (angle = 0)
  let x_an = radius * Math.cos(0)
  let y_an = 0
  let z_an = radius * Math.sin(0)
  
  // Apply inclination
  const y1_an = y_an * Math.cos(inclRad) - z_an * Math.sin(inclRad)
  const z1_an = y_an * Math.sin(inclRad) + z_an * Math.cos(inclRad)
  
  // Apply RAAN
  const x2_an = x_an * Math.cos(raanRad) + z1_an * Math.sin(raanRad)
  const z2_an = -x_an * Math.sin(raanRad) + z1_an * Math.cos(raanRad)
  
  const ascendingNode = new THREE.Vector3(x2_an, y1_an, z2_an)
  
  // Descending node: opposite side of orbit (angle = PI)
  let x_dn = radius * Math.cos(Math.PI)
  let y_dn = 0
  let z_dn = radius * Math.sin(Math.PI)
  
  // Apply inclination
  const y1_dn = y_dn * Math.cos(inclRad) - z_dn * Math.sin(inclRad)
  const z1_dn = y_dn * Math.sin(inclRad) + z_dn * Math.cos(inclRad)
  
  // Apply RAAN
  const x2_dn = x_dn * Math.cos(raanRad) + z1_dn * Math.sin(raanRad)
  const z2_dn = -x_dn * Math.sin(raanRad) + z1_dn * Math.cos(raanRad)
  
  const descendingNode = new THREE.Vector3(x2_dn, y1_dn, z2_dn)
  
  return {
    ascendingNode,
    descendingNode
  }
}

/**
 * Create node marker mesh
 * 
 * @param {string} nodeType - Node type ('ascending' or 'descending')
 * @param {THREE.Vector3} position - Node position
 * @returns {THREE.Group} Node marker group
 */
export function createNodeMarker(nodeType, position) {
  const group = new THREE.Group()
  
  const isAscending = nodeType === 'ascending'
  const color = isAscending ? 0x4ade80 : 0xef4444 // Green or Red
  const arrowDirection = isAscending ? 1 : -1 // Up or Down
  
  // Marker sphere
  const sphereGeometry = new THREE.SphereGeometry(0.03, 16, 16)
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.5,
    roughness: 0.3,
    emissive: color,
    emissiveIntensity: 0.4
  })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  group.add(sphere)
  
  // Glow effect
  const glowGeometry = new THREE.SphereGeometry(0.04, 16, 16)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
    depthWrite: false
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  group.add(glow)
  
  // Directional arrow
  const arrowDir = new THREE.Vector3(0, arrowDirection, 0)
  const arrowOrigin = new THREE.Vector3(0, 0, 0)
  const arrowLength = 0.08
  const arrowHelper = new THREE.ArrowHelper(
    arrowDir,
    arrowOrigin,
    arrowLength,
    color,
    0.03, // Head length
    0.02  // Head width
  )
  group.add(arrowHelper)
  
  // Ring indicator (orbit path at node)
  const ringGeometry = new THREE.TorusGeometry(0.035, 0.003, 8, 32)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.6
  })
  const ring = new THREE.Mesh(ringGeometry, ringMaterial)
  ring.rotation.x = Math.PI / 2
  group.add(ring)
  
  // Position the group
  group.position.copy(position)
  
  // Store data
  group.userData = {
    nodeType,
    position: position.clone(),
    glowMesh: glow,
    ringMesh: ring,
    pulsePhase: 0
  }
  
  return group
}

/**
 * Update node marker position
 * 
 * @param {THREE.Group} nodeMarker - Node marker group
 * @param {THREE.Vector3} newPosition - New position
 */
export function updateNodeMarker(nodeMarker, newPosition) {
  if (!nodeMarker) return
  
  nodeMarker.position.copy(newPosition)
  
  if (nodeMarker.userData) {
    nodeMarker.userData.position = newPosition.clone()
  }
}

/**
 * Animate node markers (pulse effect)
 * 
 * @param {THREE.Group} nodeMarker - Node marker group
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function animateNodeMarker(nodeMarker, deltaTime) {
  if (!nodeMarker || !nodeMarker.userData) return
  
  const { glowMesh, ringMesh } = nodeMarker.userData
  
  // Update pulse phase
  nodeMarker.userData.pulsePhase += deltaTime * 2
  
  // Pulse glow
  if (glowMesh) {
    const pulse = Math.sin(nodeMarker.userData.pulsePhase) * 0.15 + 0.85
    glowMesh.material.opacity = 0.3 * pulse
    glowMesh.scale.setScalar(pulse)
  }
  
  // Rotate ring slowly
  if (ringMesh) {
    ringMesh.rotation.z += deltaTime * 0.5
  }
}

/**
 * Create orbital nodes visualization (both AN and DN)
 * 
 * @param {number} radius - Orbit radius in scene units
 * @param {number} inclination - Inclination angle in degrees
 * @param {number} raan - Right Ascension of Ascending Node in degrees
 * @returns {Object} { ascendingMarker, descendingMarker, positions }
 */
export function createOrbitalNodes(radius, inclination, raan) {
  const { ascendingNode, descendingNode } = calculateOrbitalNodes(radius, inclination, raan)
  
  const ascendingMarker = createNodeMarker('ascending', ascendingNode)
  const descendingMarker = createNodeMarker('descending', descendingNode)
  
  return {
    ascendingMarker,
    descendingMarker,
    positions: {
      ascendingNode,
      descendingNode
    }
  }
}

/**
 * Update orbital nodes when orbit parameters change
 * 
 * @param {THREE.Group} ascendingMarker - Ascending node marker
 * @param {THREE.Group} descendingMarker - Descending node marker
 * @param {number} radius - New orbit radius
 * @param {number} inclination - New inclination angle
 * @param {number} raan - New RAAN
 */
export function updateOrbitalNodes(ascendingMarker, descendingMarker, radius, inclination, raan) {
  const { ascendingNode, descendingNode } = calculateOrbitalNodes(radius, inclination, raan)
  
  if (ascendingMarker) {
    updateNodeMarker(ascendingMarker, ascendingNode)
  }
  
  if (descendingMarker) {
    updateNodeMarker(descendingMarker, descendingNode)
  }
}

/**
 * Create orbital nodes manager
 * 
 * @param {THREE.Scene} scene - Three.js scene
 * @returns {Object} Nodes manager with helper methods
 */
export function createOrbitalNodesManager(scene) {
  let ascendingMarker = null
  let descendingMarker = null
  
  return {
    /**
     * Create or update nodes
     */
    updateNodes(radius, inclination, raan) {
      const { ascendingNode, descendingNode } = calculateOrbitalNodes(radius, inclination, raan)
      
      if (!ascendingMarker) {
        // Create new markers
        ascendingMarker = createNodeMarker('ascending', ascendingNode)
        descendingMarker = createNodeMarker('descending', descendingNode)
        scene.add(ascendingMarker)
        scene.add(descendingMarker)
      } else {
        // Update existing markers
        updateNodeMarker(ascendingMarker, ascendingNode)
        updateNodeMarker(descendingMarker, descendingNode)
      }
    },
    
    /**
     * Animate nodes
     */
    animate(deltaTime) {
      if (ascendingMarker) {
        animateNodeMarker(ascendingMarker, deltaTime)
      }
      if (descendingMarker) {
        animateNodeMarker(descendingMarker, deltaTime)
      }
    },
    
    /**
     * Show/hide nodes
     */
    setVisible(visible) {
      if (ascendingMarker) ascendingMarker.visible = visible
      if (descendingMarker) descendingMarker.visible = visible
    },
    
    /**
     * Get node positions
     */
    getPositions() {
      if (!ascendingMarker || !descendingMarker) return null
      
      return {
        ascendingNode: ascendingMarker.userData.position,
        descendingNode: descendingMarker.userData.position
      }
    },
    
    /**
     * Dispose nodes
     */
    dispose() {
      if (ascendingMarker) {
        scene.remove(ascendingMarker)
        ascendingMarker.traverse(child => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) child.material.dispose()
        })
        ascendingMarker = null
      }
      
      if (descendingMarker) {
        scene.remove(descendingMarker)
        descendingMarker.traverse(child => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) child.material.dispose()
        })
        descendingMarker = null
      }
    }
  }
}

export default createOrbitalNodes
