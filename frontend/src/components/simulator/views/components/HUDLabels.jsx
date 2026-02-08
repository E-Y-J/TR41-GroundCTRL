/**
 * HUDLabels - 3D Text Labels
 * 
 * Adds text labels that always face the camera:
 * - Satellite altitude, velocity near satellite
 * - Ground station names above markers
 * - Cardinal directions (N, S, E, W) on Earth
 * - Orbit info at extremes
 * 
 * Phase 3 Implementation
 * 
 * Note: This uses CSS2D/CSS3D labels as an alternative to drei's Text component
 * for better performance and compatibility
 */

import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

/**
 * Create HTML label element
 * 
 * @param {string} text - Label text
 * @param {string} className - CSS class name
 * @returns {HTMLDivElement} Label element
 */
function createLabelElement(text, className = 'label-default') {
  const div = document.createElement('div')
  div.className = `hud-3d-label ${className}`
  div.textContent = text
  div.style.cssText = `
    color: rgba(255, 255, 255, 0.9);
    font-family: monospace;
    font-size: 11px;
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    pointer-events: none;
    user-select: none;
    white-space: nowrap;
    backdrop-filter: blur(4px);
  `
  return div
}

/**
 * Create satellite info label
 * 
 * @param {Object} data - Satellite data
 * @param {number} data.altitude - Altitude in km
 * @param {number} data.velocity - Velocity in km/s
 * @param {number} data.lat - Latitude in degrees
 * @param {number} data.lon - Longitude in degrees
 * @returns {CSS2DObject} Label object
 */
export function createSatelliteLabel(data) {
  const { altitude = 0, velocity = 0, lat = 0, lon = 0 } = data
  
  const div = createLabelElement('', 'satellite-label')
  div.innerHTML = `
    <div style="line-height: 1.4;">
      <div style="color: #60a5fa; font-weight: bold; margin-bottom: 2px;">SATELLITE</div>
      <div>ALT: ${altitude.toFixed(0)} km</div>
      <div>VEL: ${velocity.toFixed(2)} km/s</div>
      <div>LAT: ${lat.toFixed(2)}°</div>
      <div>LON: ${lon.toFixed(2)}°</div>
    </div>
  `
  div.style.fontSize = '10px'
  
  const label = new CSS2DObject(div)
  label.position.set(0, 0.15, 0) // Offset above satellite
  
  return label
}

/**
 * Update satellite label content
 * 
 * @param {CSS2DObject} label - Satellite label object
 * @param {Object} data - Updated satellite data
 */
export function updateSatelliteLabel(label, data) {
  if (!label || !label.element) return
  
  const { altitude = 0, velocity = 0, lat = 0, lon = 0 } = data
  
  label.element.innerHTML = `
    <div style="line-height: 1.4;">
      <div style="color: #60a5fa; font-weight: bold; margin-bottom: 2px;">SATELLITE</div>
      <div>ALT: ${altitude.toFixed(0)} km</div>
      <div>VEL: ${velocity.toFixed(2)} km/s</div>
      <div>LAT: ${lat.toFixed(2)}°</div>
      <div>LON: ${lon.toFixed(2)}°</div>
    </div>
  `
}

/**
 * Create ground station label
 * 
 * @param {Object} data - Ground station data
 * @param {string} data.name - Station name
 * @param {number} data.elevation - Current elevation angle in degrees (optional)
 * @returns {CSS2DObject} Label object
 */
export function createStationLabel(data) {
  const { name = 'Ground Station', elevation = null } = data
  
  const div = createLabelElement('', 'station-label')
  div.style.fontSize = '10px'
  div.style.background = 'rgba(34, 197, 94, 0.3)'
  div.style.borderColor = 'rgba(34, 197, 94, 0.5)'
  
  if (elevation !== null) {
    div.innerHTML = `
      <div style="color: #4ade80; font-weight: bold;">${name}</div>
      <div style="font-size: 9px;">EL: ${elevation.toFixed(1)}°</div>
    `
  } else {
    div.innerHTML = `<div style="color: #4ade80; font-weight: bold;">${name}</div>`
  }
  
  const label = new CSS2DObject(div)
  label.position.set(0, 0.06, 0) // Offset above station marker
  
  return label
}

/**
 * Update station label elevation
 * 
 * @param {CSS2DObject} label - Station label object
 * @param {string} name - Station name
 * @param {number} elevation - Elevation angle in degrees
 */
export function updateStationLabel(label, name, elevation) {
  if (!label || !label.element) return
  
  label.element.innerHTML = `
    <div style="color: #4ade80; font-weight: bold;">${name}</div>
    <div style="font-size: 9px;">EL: ${elevation.toFixed(1)}°</div>
  `
}

/**
 * Create cardinal direction labels (N, S, E, W)
 * 
 * @param {number} earthRadius - Earth radius in scene units
 * @returns {THREE.Group} Group containing all cardinal labels
 */
export function createCardinalLabels(earthRadius = 1.0) {
  const group = new THREE.Group()
  group.name = 'CardinalLabels'
  
  const directions = [
    { text: 'N', position: new THREE.Vector3(0, earthRadius * 1.05, 0), color: '#60a5fa' },
    { text: 'S', position: new THREE.Vector3(0, -earthRadius * 1.05, 0), color: '#60a5fa' },
    { text: 'E', position: new THREE.Vector3(earthRadius * 1.15, 0, 0), color: '#34d399' },
    { text: 'W', position: new THREE.Vector3(-earthRadius * 1.15, 0, 0), color: '#f59e0b' }
  ]
  
  directions.forEach(({ text, position, color }) => {
    const div = createLabelElement(text, 'cardinal-label')
    div.style.fontSize = '14px'
    div.style.fontWeight = 'bold'
    div.style.color = color
    div.style.background = 'rgba(0, 0, 0, 0.5)'
    div.style.borderColor = color
    div.style.padding = '4px 8px'
    
    const label = new CSS2DObject(div)
    label.position.copy(position)
    group.add(label)
  })
  
  return group
}

/**
 * Create orbit info labels (apogee, perigee)
 * 
 * @param {Object} orbitData - Orbit parameters
 * @param {number} orbitData.apogee - Apogee altitude in km
 * @param {number} orbitData.perigee - Perigee altitude in km
 * @param {THREE.Vector3} orbitData.apogeePos - Apogee position vector
 * @param {THREE.Vector3} orbitData.perigeePos - Perigee position vector
 * @returns {THREE.Group} Group containing orbit info labels
 */
export function createOrbitInfoLabels(orbitData) {
  const group = new THREE.Group()
  group.name = 'OrbitInfoLabels'
  
  const { apogee = 0, perigee = 0, apogeePos, perigeePos } = orbitData
  
  if (apogeePos) {
    const apDiv = createLabelElement(`APOGEE: ${apogee.toFixed(0)} km`, 'orbit-label')
    apDiv.style.color = '#f59e0b'
    apDiv.style.borderColor = 'rgba(245, 158, 11, 0.5)'
    const apLabel = new CSS2DObject(apDiv)
    apLabel.position.copy(apogeePos)
    group.add(apLabel)
  }
  
  if (perigeePos) {
    const peDiv = createLabelElement(`PERIGEE: ${perigee.toFixed(0)} km`, 'orbit-label')
    peDiv.style.color = '#06b6d4'
    peDiv.style.borderColor = 'rgba(6, 182, 212, 0.5)'
    const peLabel = new CSS2DObject(peDiv)
    peLabel.position.copy(perigeePos)
    group.add(peLabel)
  }
  
  return group
}

/**
 * Create label manager for handling multiple labels
 * 
 * @returns {Object} Label manager with helper methods
 */
export function createLabelManager() {
  const labels = new Map()
  
  return {
    /**
     * Add label to scene
     */
    addLabel(name, label, parent) {
      if (labels.has(name)) {
        this.removeLabel(name, parent)
      }
      parent.add(label)
      labels.set(name, label)
      return label
    },
    
    /**
     * Remove label from scene
     */
    removeLabel(name, parent) {
      const label = labels.get(name)
      if (label) {
        parent.remove(label)
        if (label.element && label.element.parentNode) {
          label.element.parentNode.removeChild(label.element)
        }
        labels.delete(name)
      }
    },
    
    /**
     * Get label by name
     */
    getLabel(name) {
      return labels.get(name)
    },
    
    /**
     * Update label visibility based on camera distance
     */
    updateVisibility(camera, maxDistance = 10) {
      labels.forEach(label => {
        if (!label.position) return
        const distance = camera.position.distanceTo(label.position)
        const opacity = Math.max(0, Math.min(1, 1 - (distance / maxDistance)))
        if (label.element) {
          label.element.style.opacity = opacity
        }
      })
    },
    
    /**
     * Dispose all labels
     */
    dispose(parent) {
      labels.forEach((label, name) => {
        this.removeLabel(name, parent)
      })
      labels.clear()
    },
    
    /**
     * Get all labels
     */
    getAllLabels() {
      return Array.from(labels.entries())
    }
  }
}

export default createSatelliteLabel
