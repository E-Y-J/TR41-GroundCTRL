/**
 * Satellite3D - Enhanced 3D Satellite Model
 * 
 * Detailed satellite model with:
 * - CubeSat-style bus with PBR materials
 * - Deployable solar panels (2 wings)
 * - Antenna boom
 * - Status indicator glow
 * 
 * Phase 3 Implementation
 * Factory function for vanilla Three.js
 */

import * as THREE from 'three'

/**
 * Create enhanced 3D satellite model
 * 
 * @param {Object} options
 * @param {boolean} options.showAttitudeAxes - Show debug attitude indicators
 * @param {string} options.status - Satellite status ('active'|'idle'|'comm')
 * @returns {THREE.Group} Satellite mesh group
 */
export function createSatellite3D(options = {}) {
  const {
    showAttitudeAxes = false,
    status = 'active'
  } = options

  const group = new THREE.Group()

  // Status-based colors
  const statusColors = {
    active: {
      glow: 0x3b82f6,      // Blue
      intensity: 0.6
    },
    idle: {
      glow: 0x6b7280,      // Gray
      intensity: 0.2
    },
    comm: {
      glow: 0x4ade80,      // Green
      intensity: 0.9
    }
  }

  const currentStatus = statusColors[status] || statusColors.active

  // Materials
  const busMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.7,
    roughness: 0.3
  })

  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a237e,
    metalness: 0.5,
    roughness: 0.4,
    emissive: 0x0d47a1,
    emissiveIntensity: 0.2,
    side: THREE.DoubleSide
  })

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.9,
    roughness: 0.1
  })

  const antennaMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    metalness: 0.9,
    roughness: 0.1
  })

  const detailMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333
  })

  // Main Bus (CubeSat style - 1U)
  const busGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
  const busMesh = new THREE.Mesh(busGeometry, busMaterial)
  busMesh.castShadow = true
  busMesh.receiveShadow = true
  group.add(busMesh)

  // Bus details - small panels on sides
  const detailGeometry = new THREE.BoxGeometry(0.002, 0.08, 0.08)
  
  const detailLeft = new THREE.Mesh(detailGeometry, detailMaterial)
  detailLeft.position.set(-0.051, 0, 0)
  detailLeft.castShadow = true
  group.add(detailLeft)

  const detailRight = new THREE.Mesh(detailGeometry, detailMaterial)
  detailRight.position.set(0.051, 0, 0)
  detailRight.castShadow = true
  group.add(detailRight)

  // Solar Panel - Left Wing
  const leftPanelGroup = new THREE.Group()
  leftPanelGroup.position.set(-0.15, 0, 0)

  const panelGeometry = new THREE.BoxGeometry(0.2, 0.005, 0.1)
  const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial)
  leftPanel.castShadow = true
  leftPanel.receiveShadow = true
  leftPanelGroup.add(leftPanel)

  // Panel frames
  const frameGeometries = [
    { pos: [-0.1, 0, 0], size: [0.005, 0.008, 0.105] },
    { pos: [0.1, 0, 0], size: [0.005, 0.008, 0.105] },
    { pos: [0, 0, -0.0525], size: [0.205, 0.008, 0.005] },
    { pos: [0, 0, 0.0525], size: [0.205, 0.008, 0.005] }
  ]

  frameGeometries.forEach(({ pos, size }) => {
    const frameGeo = new THREE.BoxGeometry(...size)
    const frame = new THREE.Mesh(frameGeo, frameMaterial)
    frame.position.set(...pos)
    leftPanelGroup.add(frame)
  })

  group.add(leftPanelGroup)

  // Solar Panel - Right Wing (mirror of left)
  const rightPanelGroup = new THREE.Group()
  rightPanelGroup.position.set(0.15, 0, 0)

  const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial)
  rightPanel.castShadow = true
  rightPanel.receiveShadow = true
  rightPanelGroup.add(rightPanel)

  frameGeometries.forEach(({ pos, size }) => {
    const frameGeo = new THREE.BoxGeometry(...size)
    const frame = new THREE.Mesh(frameGeo, frameMaterial)
    frame.position.set(...pos)
    rightPanelGroup.add(frame)
  })

  group.add(rightPanelGroup)

  // Antenna Boom
  const boomGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.15, 8)
  const boom = new THREE.Mesh(boomGeometry, antennaMaterial)
  boom.position.set(0, 0.125, 0)
  boom.castShadow = true
  group.add(boom)

  // Antenna Dish
  const dishGeometry = new THREE.ConeGeometry(0.015, 0.01, 16)
  const dish = new THREE.Mesh(dishGeometry, antennaMaterial)
  dish.position.set(0, 0.2, 0)
  dish.rotation.x = Math.PI / 4
  group.add(dish)

  // Status Indicator Glow
  const glowGeometry = new THREE.SphereGeometry(0.02, 16, 16)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: currentStatus.glow,
    transparent: true,
    opacity: currentStatus.intensity
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  glow.position.set(0, 0.06, 0)
  group.add(glow)

  // Status Indicator Core
  const coreGeometry = new THREE.SphereGeometry(0.01, 8, 8)
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: currentStatus.glow
  })
  const core = new THREE.Mesh(coreGeometry, coreMaterial)
  core.position.set(0, 0.06, 0)
  group.add(core)

  // Attitude Debug Axes (optional)
  if (showAttitudeAxes) {
    const axisLength = 0.15
    
    // X-axis (Red) - Roll
    const xAxis = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      axisLength,
      0xff0000
    )
    group.add(xAxis)

    // Y-axis (Green) - Pitch
    const yAxis = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      axisLength,
      0x00ff00
    )
    group.add(yAxis)

    // Z-axis (Blue) - Yaw
    const zAxis = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 0),
      axisLength,
      0x0000ff
    )
    group.add(zAxis)
  }

  // Store status for updates
  group.userData.status = status
  group.userData.glowMesh = glow
  group.userData.coreMesh = core

  return group
}

/**
 * Update satellite status color
 * 
 * @param {THREE.Group} satelliteGroup - Satellite group from createSatellite3D
 * @param {string} newStatus - New status ('active'|'idle'|'comm')
 */
export function updateSatelliteStatus(satelliteGroup, newStatus) {
  const statusColors = {
    active: { glow: 0x3b82f6, intensity: 0.6 },
    idle: { glow: 0x6b7280, intensity: 0.2 },
    comm: { glow: 0x4ade80, intensity: 0.9 }
  }

  const status = statusColors[newStatus] || statusColors.active

  if (satelliteGroup.userData.glowMesh) {
    satelliteGroup.userData.glowMesh.material.color.setHex(status.glow)
    satelliteGroup.userData.glowMesh.material.opacity = status.intensity
  }

  if (satelliteGroup.userData.coreMesh) {
    satelliteGroup.userData.coreMesh.material.color.setHex(status.glow)
  }

  satelliteGroup.userData.status = newStatus
}

export default createSatellite3D
