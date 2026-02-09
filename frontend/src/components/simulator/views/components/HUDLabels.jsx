/**
 * HUDLabels - 3D Billboard Text Labels
 * 
 * Text labels that always face the camera:
 * - Satellite altitude, velocity near satellite
 * - Ground station names above markers
 * - Cardinal directions (N, S, E, W) on Earth
 * - Billboard effect (text always faces camera)
 * - Scale text based on camera distance
 * - Semi-transparent background for readability
 * 
 * Phase 3 Implementation
 * Note: Uses drei's Text component for React Three Fiber compatibility
 * For vanilla Three.js, we use sprites with canvas textures
 */

import * as THREE from 'three'

/**
 * Create text sprite (billboard that always faces camera)
 * 
 * @param {string} text - Text to display
 * @param {Object} options - Styling options
 * @returns {THREE.Sprite} Text sprite
 */
export function createTextLabel(text, options = {}) {
  const {
    fontSize = 64,
    fontFamily = 'monospace',
    textColor = '#ffffff',
    backgroundColor = 'rgba(0, 0, 0, 0.7)',
    padding = 10
  } = options

  // Create canvas
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  
  // Set font for measuring
  context.font = `${fontSize}px ${fontFamily}`
  const metrics = context.measureText(text)
  const textWidth = metrics.width
  const textHeight = fontSize
  
  // Set canvas size
  canvas.width = textWidth + padding * 2
  canvas.height = textHeight + padding * 2
  
  // Draw background
  context.fillStyle = backgroundColor
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  // Draw text
  context.font = `${fontSize}px ${fontFamily}`
  context.fillStyle = textColor
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, canvas.width / 2, canvas.height / 2)
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  
  // Create sprite material
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false
  })
  
  const sprite = new THREE.Sprite(material)
  
  // Scale sprite (adjust based on canvas size)
  const scale = 0.1
  sprite.scale.set(
    (canvas.width / canvas.height) * scale,
    scale,
    1
  )
  
  // Store original text for updates
  sprite.userData = {
    text,
    canvas,
    context,
    options,
    originalScale: sprite.scale.clone()
  }
  
  return sprite
}

/**
 * Update text label content
 * 
 * @param {THREE.Sprite} sprite - Text sprite or CSS2DObject
 * @param {string} newText - New text content
 */
export function updateTextLabel(sprite, newText) {
  // Handle CSS2DObject labels (skip update, they don't use canvas)
  if (sprite.isCSS2DObject) {
    if (sprite.element) {
      sprite.element.textContent = newText
    }
    return
  }
  
  if (!sprite.userData || !sprite.userData.canvas) return
  
  const { canvas, context, options, text: oldText } = sprite.userData
  
  // Skip if text hasn't changed
  if (oldText === newText) return
  
  const { fontSize = 64, fontFamily = 'monospace', textColor = '#ffffff', backgroundColor = 'rgba(0, 0, 0, 0.7)', padding = 10 } = options
  
  // Measure new text
  context.font = `${fontSize}px ${fontFamily}`
  const metrics = context.measureText(newText)
  const textWidth = Math.ceil(metrics.width)
  const textHeight = fontSize
  
  const newWidth = textWidth + padding * 2
  const newHeight = textHeight + padding * 2
  
  // Only resize if dimensions changed significantly (avoid tiny changes)
  if (Math.abs(canvas.width - newWidth) > 2 || Math.abs(canvas.height - newHeight) > 2) {
    // Dispose old texture
    if (sprite.material.map) {
      sprite.material.map.dispose()
    }
    
    // Resize canvas
    canvas.width = newWidth
    canvas.height = newHeight
    
    // Create new texture
    const newTexture = new THREE.CanvasTexture(canvas)
    newTexture.needsUpdate = true
    sprite.material.map = newTexture
  }
  
  // Redraw background
  context.fillStyle = backgroundColor
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  // Redraw text
  context.font = `${fontSize}px ${fontFamily}`
  context.fillStyle = textColor
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(newText, canvas.width / 2, canvas.height / 2)
  
  // Update texture
  sprite.material.map.needsUpdate = true
  
  // Update scale
  const scale = 0.1
  sprite.scale.set(
    (canvas.width / canvas.height) * scale,
    scale,
    1
  )
  
  sprite.userData.text = newText
  sprite.userData.originalScale = sprite.scale.clone()
}

/**
 * Create satellite info label
 * 
 * @param {Object} telemetry - Satellite telemetry data
 * @returns {THREE.Sprite} Satellite label sprite
 */
export function createSatelliteLabel(telemetry) {
  const { altitude = 0, velocity = 0, lat = 0, lon = 0 } = telemetry
  
  const text = `ALT: ${altitude.toFixed(0)}km  VEL: ${velocity.toFixed(1)}km/s\nLAT: ${lat.toFixed(2)}°  LON: ${lon.toFixed(2)}°`
  
  const sprite = createTextLabel(text, {
    fontSize: 32,
    fontFamily: 'monospace',
    textColor: '#4ade80',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8
  })
  
  sprite.userData.labelType = 'satellite'
  
  return sprite
}

/**
 * Create ground station label
 * 
 * @param {string} name - Station name
 * @param {number} elevation - Elevation angle in degrees (optional)
 * @returns {THREE.Sprite} Station label sprite
 */
export function createStationLabel(name, elevation = null) {
  let text = name
  if (elevation !== null) {
    text += `\nEL: ${elevation.toFixed(1)}°`
  }
  
  const sprite = createTextLabel(text, {
    fontSize: 40,
    fontFamily: 'sans-serif',
    textColor: '#60a5fa',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10
  })
  
  sprite.userData.labelType = 'station'
  sprite.userData.stationName = name
  
  return sprite
}

/**
 * Create cardinal direction label
 * 
 * @param {string} direction - Direction ('N', 'S', 'E', 'W')
 * @returns {THREE.Sprite} Direction label sprite
 */
export function createCardinalLabel(direction) {
  const sprite = createTextLabel(direction, {
    fontSize: 96,
    fontFamily: 'sans-serif',
    textColor: '#94a3b8',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15
  })
  
  sprite.userData.labelType = 'cardinal'
  sprite.userData.direction = direction
  
  return sprite
}

/**
 * Create orbital node label
 * 
 * @param {string} type - Node type ('AN' or 'DN')
 * @returns {THREE.Sprite} Node label sprite
 */
export function createNodeLabel(type) {
  const sprite = createTextLabel(type, {
    fontSize: 48,
    fontFamily: 'monospace',
    textColor: type === 'AN' ? '#4ade80' : '#ef4444',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8
  })
  
  sprite.userData.labelType = 'node'
  sprite.userData.nodeType = type
  
  return sprite
}

/**
 * Update label scale based on camera distance
 * 
 * @param {THREE.Sprite} sprite - Label sprite
 * @param {THREE.Vector3} cameraPosition - Camera position
 * @param {number} minScale - Minimum scale factor (default 0.5)
 * @param {number} maxScale - Maximum scale factor (default 2.0)
 */
export function updateLabelScale(sprite, cameraPosition, minScale = 0.5, maxScale = 2.0) {
  if (!sprite.userData || !sprite.userData.originalScale) return
  
  const distance = sprite.position.distanceTo(cameraPosition)
  
  // Scale factor based on distance (closer = smaller, farther = larger for readability)
  const baseDist = 3.0
  let scaleFactor = distance / baseDist
  scaleFactor = Math.max(minScale, Math.min(maxScale, scaleFactor))
  
  const originalScale = sprite.userData.originalScale
  sprite.scale.set(
    originalScale.x * scaleFactor,
    originalScale.y * scaleFactor,
    originalScale.z
  )
}

/**
 * Create label manager for organizing multiple labels
 * 
 * @param {THREE.Scene} scene - Three.js scene
 * @returns {Object} Label manager with helper methods
 */
export function createLabelManager(scene) {
  const labels = new Map() // labelId -> sprite
  
  return {
    /**
     * Add or update a label
     */
    setLabel(labelId, sprite, position) {
      // Remove old label if exists
      if (labels.has(labelId)) {
        const oldSprite = labels.get(labelId)
        scene.remove(oldSprite)
        if (oldSprite.material.map) {
          oldSprite.material.map.dispose()
        }
        oldSprite.material.dispose()
      }
      
      // Add new label
      sprite.position.copy(position)
      scene.add(sprite)
      labels.set(labelId, sprite)
    },
    
    /**
     * Update label position
     */
    updatePosition(labelId, position) {
      const sprite = labels.get(labelId)
      if (sprite) {
        sprite.position.copy(position)
      }
    },
    
    /**
     * Update label text
     */
    updateText(labelId, newText) {
      const sprite = labels.get(labelId)
      if (sprite) {
        updateTextLabel(sprite, newText)
      }
    },
    
    /**
     * Remove a label
     */
    removeLabel(labelId) {
      const sprite = labels.get(labelId)
      if (sprite) {
        scene.remove(sprite)
        if (sprite.material.map) {
          sprite.material.map.dispose()
        }
        sprite.material.dispose()
        labels.delete(labelId)
      }
    },
    
    /**
     * Get label sprite
     */
    getLabel(labelId) {
      return labels.get(labelId)
    },
    
    /**
     * Update all label scales based on camera
     */
    updateAllScales(cameraPosition) {
      labels.forEach(sprite => {
        updateLabelScale(sprite, cameraPosition)
      })
    },
    
    /**
     * Dispose all labels
     */
    dispose() {
      labels.forEach(sprite => {
        scene.remove(sprite)
        if (sprite.material.map) {
          sprite.material.map.dispose()
        }
        sprite.material.dispose()
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

/**
 * Create cardinal direction labels on Earth horizon
 * 
 * @param {number} earthRadius - Earth radius in scene units
 * @param {number} distance - Distance from Earth center (default 1.5)
 * @returns {THREE.Group} Group containing cardinal direction labels
 */
export function createCardinalLabels(earthRadius = 1.0, distance = 1.5) {
  const group = new THREE.Group()
  group.name = 'cardinal-labels'
  
  const directions = [
    { id: 'cardinal-N', label: 'N', pos: [0, 0, distance] },
    { id: 'cardinal-S', label: 'S', pos: [0, 0, -distance] },
    { id: 'cardinal-E', label: 'E', pos: [distance, 0, 0] },
    { id: 'cardinal-W', label: 'W', pos: [-distance, 0, 0] }
  ]
  
  directions.forEach(({ id, label, pos }) => {
    const sprite = createCardinalLabel(label)
    sprite.name = id
    sprite.position.set(...pos)
    group.add(sprite)
  })
  
  return group
}

export default createTextLabel
