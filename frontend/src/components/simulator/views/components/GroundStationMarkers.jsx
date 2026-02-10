/**
 * GroundStationMarkers - 3D Ground Station Markers
 * 
 * Displays ground stations on Earth's surface with:
 * - Cone/pyramid markers pointing up
 * - Color-coded by station type (primary/backup)
 * - Pulsing animation for active stations
 * - Hover effects and labels
 * 
 * Phase 3 Implementation
 */

import * as THREE from 'three'

/**
 * Convert lat/lon to 3D position on sphere
 * 
 * @param {number} lat - Latitude in degrees
 * @param {number} lon - Longitude in degrees
 * @param {number} radius - Sphere radius
 * @returns {THREE.Vector3} 3D position
 */
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

/**
 * Create ground station marker
 * 
 * @param {Object} station - Ground station data
 * @param {string} station.name - Station name
 * @param {number} station.latitude - Latitude in degrees
 * @param {number} station.longitude - Longitude in degrees
 * @param {string} station.type - Station type ('primary'|'backup')
 * @param {boolean} station.active - Whether station is currently active
 * @param {number} earthRadius - Earth radius in scene units
 * @returns {THREE.Group} Station marker group
 */
export function createGroundStationMarker(station, earthRadius = 1.0) {
  const {
    name = 'Ground Station',
    latitude = 0,
    longitude = 0,
    type = 'primary',
    active = false
  } = station

  const group = new THREE.Group()

  // Calculate position on Earth surface
  const position = latLonToVector3(latitude, longitude, earthRadius * 1.002)
  group.position.copy(position)

  // Orient marker to point up from surface (away from Earth center)
  const up = position.clone().normalize()
  const targetPos = position.clone().add(up)
  group.lookAt(targetPos)
  group.rotateX(Math.PI / 2) // Adjust for cone orientation

  // Color based on type
  const colors = {
    primary: {
      base: 0x4ade80,       // Green
      glow: 0x22c55e,
      emissive: 0x15803d
    },
    backup: {
      base: 0x60a5fa,       // Blue
      glow: 0x3b82f6,
      emissive: 0x1d4ed8
    }
  }

  const color = colors[type] || colors.primary

  // Cone marker (pyramid style)
  const coneGeometry = new THREE.ConeGeometry(0.015, 0.04, 6)
  const coneMaterial = new THREE.MeshStandardMaterial({
    color: color.base,
    metalness: 0.3,
    roughness: 0.4,
    emissive: color.emissive,
    emissiveIntensity: active ? 0.5 : 0.2
  })
  const cone = new THREE.Mesh(coneGeometry, coneMaterial)
  cone.castShadow = true
  group.add(cone)

  // Base platform
  const baseGeometry = new THREE.CylinderGeometry(0.012, 0.015, 0.005, 8)
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,
    metalness: 0.5,
    roughness: 0.5
  })
  const base = new THREE.Mesh(baseGeometry, baseMaterial)
  base.position.y = -0.0225
  group.add(base)

  // Glow effect (pulsing for active stations)
  const glowGeometry = new THREE.SphereGeometry(0.02, 16, 16)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color.glow,
    transparent: true,
    opacity: active ? 0.6 : 0.3,
    depthWrite: false
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  group.add(glow)

  // Store data for animations and updates
  group.userData = {
    name,
    latitude,
    longitude,
    type,
    active,
    glowMesh: glow,
    coneMesh: cone,
    baseOpacity: active ? 0.6 : 0.3,
    pulsePhase: Math.random() * Math.PI * 2 // Random start phase
  }

  return group
}

/**
 * Update ground station marker active state
 * 
 * @param {THREE.Group} markerGroup - Station marker group
 * @param {boolean} active - New active state
 */
export function updateStationActive(markerGroup, active) {
  if (!markerGroup.userData) return

  markerGroup.userData.active = active
  markerGroup.userData.baseOpacity = active ? 0.6 : 0.3

  // Update cone emissive
  if (markerGroup.userData.coneMesh) {
    markerGroup.userData.coneMesh.material.emissiveIntensity = active ? 0.5 : 0.2
  }
}

/**
 * Animate ground station markers (pulsing effect)
 * Call this in animation loop
 * 
 * @param {THREE.Group[]} markerGroups - Array of station marker groups
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function animateStationMarkers(markerGroups, deltaTime) {
  markerGroups.forEach(marker => {
    if (!marker.userData || !marker.userData.glowMesh) return

    const { active, glowMesh, baseOpacity } = marker.userData

    if (active) {
      // Pulsing animation for active stations
      marker.userData.pulsePhase += deltaTime * 3 // 3 rad/s
      const pulse = Math.sin(marker.userData.pulsePhase) * 0.2 + 0.8
      glowMesh.material.opacity = baseOpacity * pulse

      // Scale pulse
      const scale = 1 + Math.sin(marker.userData.pulsePhase) * 0.1
      glowMesh.scale.setScalar(scale)
    } else {
      // Steady dim glow for inactive stations
      glowMesh.material.opacity = baseOpacity
      glowMesh.scale.setScalar(1)
    }
  })
}

/**
 * Create multiple ground station markers
 * 
 * @param {Array} stations - Array of station data objects
 * @param {number} earthRadius - Earth radius in scene units
 * @returns {THREE.Group} Group containing all markers
 */
export function createGroundStationMarkers(stations, earthRadius = 1.0) {
  const markersGroup = new THREE.Group()
  markersGroup.name = 'GroundStationMarkers'

  stations.forEach(station => {
    const marker = createGroundStationMarker(station, earthRadius)
    markersGroup.add(marker)
  })

  return markersGroup
}

export default createGroundStationMarkers
