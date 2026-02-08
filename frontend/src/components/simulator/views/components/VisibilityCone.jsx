/**
 * VisibilityCone - Ground Station Line-of-Sight Visualization
 * 
 * Shows visibility cone from ground station to satellite:
 * - Semi-transparent cone geometry
 * - Only visible when satellite is above horizon
 * - Gradient opacity (bright at station, fades toward satellite)
 * - Animated appearance/disappearance
 * 
 * Phase 3 Implementation
 */

import * as THREE from 'three'

/**
 * Check if satellite is visible from ground station
 * 
 * @param {THREE.Vector3} satPos - Satellite position
 * @param {THREE.Vector3} stationPos - Ground station position
 * @param {number} earthRadius - Earth radius in scene units
 * @returns {Object} { visible, elevation, distance }
 */
export function checkVisibility(satPos, stationPos, earthRadius = 1.0) {
  // Vector from station to satellite
  const toSat = satPos.clone().sub(stationPos)
  const distance = toSat.length()
  
  // Station's zenith direction (pointing up from surface)
  const zenith = stationPos.clone().normalize()
  
  // Elevation angle (angle between zenith and toSat)
  const toSatNorm = toSat.clone().normalize()
  const dotProduct = toSatNorm.dot(zenith)
  const elevation = Math.asin(Math.max(-1, Math.min(1, dotProduct)))
  
  // Visible if elevation > 0 (above horizon)
  const visible = elevation > 0
  
  return {
    visible,
    elevation: elevation * (180 / Math.PI), // Convert to degrees
    distance
  }
}

/**
 * Create visibility cone geometry
 * 
 * @param {THREE.Vector3} stationPos - Ground station position
 * @param {THREE.Vector3} satPos - Satellite position
 * @param {number} segments - Number of cone segments
 * @returns {THREE.BufferGeometry} Cone geometry
 */
function createConeGeometry(stationPos, satPos, segments = 32) {
  const vertices = []
  const colors = []
  const indices = []

  // Calculate cone parameters
  const direction = satPos.clone().sub(stationPos)
  const height = direction.length()
  
  // Horizon circle radius (approximate based on altitude)
  const horizonAngle = Math.asin(1.0 / satPos.length()) // Approximate
  const baseRadius = height * Math.tan(horizonAngle)
  
  // Apex (at ground station)
  const apex = new THREE.Vector3(0, 0, 0)
  
  // Create base circle vertices
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    const x = baseRadius * Math.cos(theta)
    const y = height
    const z = baseRadius * Math.sin(theta)
    
    // Apex vertex (bright)
    vertices.push(apex.x, apex.y, apex.z)
    colors.push(0.2, 0.6, 1.0, 0.4) // Cyan with higher opacity at base
    
    // Base vertex (faded)
    vertices.push(x, y, z)
    colors.push(0.2, 0.6, 1.0, 0.05) // Cyan with lower opacity at satellite
  }
  
  // Create indices for triangles
  for (let i = 0; i < segments; i++) {
    const current = i * 2
    const next = (i + 1) * 2
    
    // Two triangles per segment
    indices.push(current, current + 1, next + 1)
    indices.push(current, next + 1, next)
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  
  return geometry
}

/**
 * Create visibility cone mesh
 * 
 * @param {THREE.Vector3} stationPos - Ground station position
 * @param {THREE.Vector3} satPos - Satellite position
 * @returns {THREE.Mesh} Visibility cone mesh
 */
export function createVisibilityCone(stationPos, satPos) {
  const geometry = createConeGeometry(stationPos, satPos, 32)
  
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(stationPos)
  
  // Orient cone to point at satellite
  const direction = satPos.clone().sub(stationPos).normalize()
  const up = new THREE.Vector3(0, 1, 0)
  const quaternion = new THREE.Quaternion()
  quaternion.setFromUnitVectors(up, direction)
  mesh.quaternion.copy(quaternion)
  
  mesh.userData = {
    stationPos: stationPos.clone(),
    satPos: satPos.clone(),
    fadePhase: 0
  }
  
  return mesh
}

/**
 * Update visibility cone position and orientation
 * 
 * @param {THREE.Mesh} coneMesh - Visibility cone mesh
 * @param {THREE.Vector3} stationPos - Ground station position
 * @param {THREE.Vector3} satPos - Satellite position
 */
export function updateVisibilityCone(coneMesh, stationPos, satPos) {
  if (!coneMesh) return
  
  // Update geometry
  const newGeometry = createConeGeometry(stationPos, satPos, 32)
  coneMesh.geometry.dispose()
  coneMesh.geometry = newGeometry
  
  // Update position
  coneMesh.position.copy(stationPos)
  
  // Update orientation
  const direction = satPos.clone().sub(stationPos).normalize()
  const up = new THREE.Vector3(0, 1, 0)
  const quaternion = new THREE.Quaternion()
  quaternion.setFromUnitVectors(up, direction)
  coneMesh.quaternion.copy(quaternion)
  
  // Store positions
  coneMesh.userData.stationPos = stationPos.clone()
  coneMesh.userData.satPos = satPos.clone()
}

/**
 * Animate visibility cone fade in/out
 * 
 * @param {THREE.Mesh} coneMesh - Visibility cone mesh
 * @param {boolean} shouldBeVisible - Whether cone should be visible
 * @param {number} deltaTime - Time since last frame in seconds
 * @returns {boolean} Whether animation is complete
 */
export function animateVisibilityCone(coneMesh, shouldBeVisible, deltaTime) {
  if (!coneMesh || !coneMesh.userData) return true
  
  const fadeSpeed = 2.0 // Fade in/out speed
  const targetPhase = shouldBeVisible ? 1.0 : 0.0
  
  // Update fade phase
  if (coneMesh.userData.fadePhase < targetPhase) {
    coneMesh.userData.fadePhase = Math.min(
      coneMesh.userData.fadePhase + deltaTime * fadeSpeed,
      targetPhase
    )
  } else if (coneMesh.userData.fadePhase > targetPhase) {
    coneMesh.userData.fadePhase = Math.max(
      coneMesh.userData.fadePhase - deltaTime * fadeSpeed,
      targetPhase
    )
  }
  
  // Update material opacity
  coneMesh.material.opacity = 0.6 * coneMesh.userData.fadePhase
  coneMesh.visible = coneMesh.userData.fadePhase > 0.01
  
  return coneMesh.userData.fadePhase === targetPhase
}

/**
 * Create visibility cone manager for multiple stations
 * 
 * @returns {Object} Cone manager with helper methods
 */
export function createVisibilityConeManager() {
  const cones = new Map() // stationName -> cone mesh
  
  return {
    /**
     * Update or create cone for a station
     */
    updateCone(stationName, stationPos, satPos, scene) {
      let cone = cones.get(stationName)
      
      if (!cone) {
        // Create new cone
        cone = createVisibilityCone(stationPos, satPos)
        cone.userData.fadePhase = 0
        cone.visible = false
        scene.add(cone)
        cones.set(stationName, cone)
      } else {
        // Update existing cone
        updateVisibilityCone(cone, stationPos, satPos)
      }
      
      return cone
    },
    
    /**
     * Remove cone for a station
     */
    removeCone(stationName, scene) {
      const cone = cones.get(stationName)
      if (cone) {
        scene.remove(cone)
        cone.geometry.dispose()
        cone.material.dispose()
        cones.delete(stationName)
      }
    },
    
    /**
     * Get cone for station
     */
    getCone(stationName) {
      return cones.get(stationName)
    },
    
    /**
     * Dispose all cones
     */
    dispose(scene) {
      cones.forEach(cone => {
        scene.remove(cone)
        cone.geometry.dispose()
        cone.material.dispose()
      })
      cones.clear()
    },
    
    /**
     * Get all cones
     */
    getAllCones() {
      return Array.from(cones.values())
    }
  }
}

export default createVisibilityCone
