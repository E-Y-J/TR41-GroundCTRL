/**
 * EarthGlobe3D - 3D Globe Visualization Component (Phase 3 Integrated)
 * 
 * Note: This is the active 3D globe implementation.
 * Backup version (earth-globe-3d.backup.jsx) removed 2026-02-08
 *
 * Uses Three.js for photorealistic Earth rendering with satellite orbit.
 * Features proper orbital mechanics, camera controls, and follow mode.
 * 
 * Phase 3 Additions:
 * - Ground station markers with pulsing animations
 * - Visibility cones showing line-of-sight
 * - Communication links with data packet animations
 * - 3D HUD labels for satellite and stations
 * - Orbital nodes visualization (ascending/descending)
 * 
 * Inspired by stellarsnap.space orbit simulator.
 */

import { useRef, useEffect, useState, useCallback } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js"
import { 
  atmosphereVertexShader, 
  atmosphereFragmentShader 
} from "./shaders/atmosphereShader"
import {
  orbitGradientVertexShader,
  orbitGradientFragmentShader
} from "./shaders/orbitGradientShader"
import { createSatellite3D } from "./components/Satellite3D"
import { 
  createGroundStationMarkers, 
  animateStationMarkers,
  updateStationActive 
} from "./components/GroundStationMarkers"
import {
  checkVisibility,
  createVisibilityConeManager,
  animateVisibilityCone
} from "./components/VisibilityCone"
import {
  calculateLinkQuality,
  createCommLinkManager,
  animateCommLink
} from "./components/CommLink"
import {
  createStationLabel,
  updateTextLabel,
  createCardinalLabels
} from "./components/HUDLabels"
// Phase 3 components not yet integrated - components exist but full integration pending
// import { createOrbitalNodesManager } from "./components/OrbitalNodes"

// ============================================================================
// Constants
// ============================================================================

const EARTH_RADIUS = 1
const EARTH_RADIUS_KM = 6371
const DEG_TO_RAD = Math.PI / 180
const GRAVITATIONAL_PARAM = 398600.4418 // km³/s² (Earth's GM)

// Sample ground stations (Phase 3)
const GROUND_STATIONS = [
  {
    name: 'Wallops',
    latitude: 37.9402,
    longitude: -75.4662,
    type: 'primary',
    active: false
  },
  {
    name: 'KSAT',
    latitude: 78.2295,
    longitude: 15.3918,
    type: 'primary',
    active: false
  },
  {
    name: 'Santiago',
    latitude: -33.4489,
    longitude: -70.6693,
    type: 'backup',
    active: false
  }
]

// ============================================================================
// Sub-Components
// ============================================================================

/** Loading spinner overlay */
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-sm text-muted-foreground">Loading Globe...</span>
      </div>
    </div>
  )
}

/** View mode indicator badge */
function ViewModeBadge() {
  return (
    <div className="absolute top-3 right-3 bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-1.5 z-10">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-mono text-primary">3D GLOBE</span>
      </div>
    </div>
  )
}

/** Follow satellite toggle button */
function FollowToggle({ 
  active, 
  onToggle 
}) {
  return (
    <button
      onClick={onToggle}
      className={`absolute bottom-3 right-3 bg-card/90 backdrop-blur border rounded-lg px-3 py-2 z-10 transition-colors ${
        active 
          ? "border-primary bg-primary/10 text-primary" 
          : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
    >
      <div className="flex items-center gap-2">
        <FollowIcon active={active} />
        <span className="text-xs font-mono">
          {active ? "TRACKING" : "FOLLOW SAT"}
        </span>
      </div>
    </button>
  )
}

/** Follow icon SVG */
function FollowIcon({ active }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="w-4 h-4"
    >
      {active ? (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v10" />
          <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" />
          <path d="M1 12h6m6 0h10" />
          <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  )
}

/** Interaction hint text */
function InteractionHint({ followMode, isPaused }) {
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60 z-10">
      {followMode 
        ? "Camera tracking satellite • Click TRACKING to exit" 
        : isPaused
        ? "PAUSED • Space to resume • +/- zoom • Arrows rotate • R reset"
        : "Drag to rotate • Scroll to zoom • Space to pause • +/- zoom • Arrows rotate"
      }
    </div>
  )
}

// ============================================================================
// Three.js Factory Functions
// ============================================================================

/** Create Earth mesh with Blue Marble texture */
function createEarthMesh(onLoad) {
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64)
  const textureLoader = new THREE.TextureLoader()
  
  const dayTexture = textureLoader.load(
    "/images/world.200401.3x5400x2700.jpg",
    onLoad,
    undefined,
    () => console.warn("[EarthGlobe3D] Earth texture failed to load")
  )
  dayTexture.anisotropy = 16
  
  const material = new THREE.MeshPhongMaterial({
    map: dayTexture,
    bumpScale: 0.02,
    specular: new THREE.Color(0x333333),
    shininess: 5,
  })

  const earth = new THREE.Mesh(geometry, material)
  earth.rotation.y = -Math.PI / 2
  earth.receiveShadow = true
  
  return earth
}

/** Create enhanced atmosphere glow effect with Fresnel-based scattering */
function createAtmosphere() {
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.018, 64, 64)
  
  const material = new THREE.ShaderMaterial({
    name: 'AtmosphereShader',
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms: {
      glowColor: { value: new THREE.Vector3(0.3, 0.6, 1.0) },
      glowIntensity: { value: 1.3 },
      atmosphereThickness: { value: 0.85 }
      // cameraPosition is a built-in uniform in Three.js, no need to declare it
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false
  })

  return new THREE.Mesh(geometry, material)
}

/** Create star field background */
function createStarField() {
  const geometry = new THREE.BufferGeometry()
  const starCount = 2000
  const positions = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = 50 + Math.random() * 50
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    opacity: 0.8,
  })

  return new THREE.Points(geometry, material)
}

/** Create orbital path line with gradient shader */
function createOrbitLine(radius, inclination, raan, satelliteProgress = 0.0) {
  const points = []
  const segments = 128
  const inclRad = inclination * DEG_TO_RAD
  const raanRad = raan * DEG_TO_RAD
  
  const segmentIndices = []

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    
    let x = radius * Math.cos(angle)
    let y = 0
    let z = radius * Math.sin(angle)

    const y1 = y * Math.cos(inclRad) - z * Math.sin(inclRad)
    const z1 = y * Math.sin(inclRad) + z * Math.cos(inclRad)

    const x2 = x * Math.cos(raanRad) + z1 * Math.sin(raanRad)
    const z2 = -x * Math.sin(raanRad) + z1 * Math.cos(raanRad)

    points.push(new THREE.Vector3(x2, y1, z2))
    segmentIndices.push(i / segments)
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  geometry.setAttribute('segmentIndex', new THREE.Float32BufferAttribute(segmentIndices, 1))
  geometry.setAttribute('totalSegments', new THREE.Float32BufferAttribute(new Array(points.length).fill(segments), 1))
  
  const material = new THREE.ShaderMaterial({
    name: 'OrbitGradientShader',
    vertexShader: orbitGradientVertexShader,
    fragmentShader: orbitGradientFragmentShader,
    uniforms: {
      satelliteProgress: { value: satelliteProgress },
      pastColor: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
      presentColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
      futureColor: { value: new THREE.Vector3(0.2, 0.6, 1.0) },
      gradientSpread: { value: 0.1 }
    },
    transparent: true,
    depthWrite: false
  })

  return new THREE.Line(geometry, material)
}

/** Setup scene lighting */
function setupLighting(scene) {
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
  sunLight.position.set(5, 3, 5)
  sunLight.castShadow = true
  scene.add(sunLight)

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3)
  scene.add(hemiLight)
}

// ============================================================================
// Main Component
// ============================================================================

export function EarthGlobe3D({
  telemetry,
  altitude = 415,
  inclination = 51.6,
  eccentricity = 0.0001,
  raan = 0,
  showOrbit = true,
  showAtmosphere = true,
  showStars = true,
  showGroundStations = true,
  showVisibilityCones = true,
  showCommLinks = true,
  showLabels = true,
  showOrbitalNodes = true,
  animationSpeed = 120,
  groundStationsData = null, // Phase 3 - WebSocket ground stations
  className = "",
}) {
  // Refs
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const labelRendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const earthRef = useRef(null)
  const satelliteRef = useRef(null)
  const orbitLineRef = useRef(null)
  const atmosphereRef = useRef(null)
  const groundStationsRef = useRef(null)
  const orbitalNodesRef = useRef(null)
  const satLabelRef = useRef(null)
  const animationRef = useRef(0)
  const isMountedRef = useRef(false) // Track mount status for StrictMode
  
  // Phase 3 managers
  const coneManagerRef = useRef(null)
  const linkManagerRef = useRef(null)
  
  // State
  const [isLoaded, setIsLoaded] = useState(false)
  const [trueAnomaly, setTrueAnomaly] = useState(0)
  const [followSatellite, setFollowSatellite] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [activeStations, setActiveStations] = useState(new Set())

  // Derived values
  const orbitRadius = EARTH_RADIUS + (altitude / EARTH_RADIUS_KM)

  // Convert lat/lon from telemetry to 3D position
  const latLonToPosition = useCallback((lat, lon, alt = altitude) => {
    const radius = EARTH_RADIUS + (alt / EARTH_RADIUS_KM)
    const phi = (90 - lat) * DEG_TO_RAD
    const theta = (lon + 180) * DEG_TO_RAD

    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)

    return { x, y, z, lat, lon, alt }
  }, [altitude])

  // Calculate satellite position from orbital elements (fallback)
  const calculateSatellitePosition = useCallback((
    anomaly,
    radius,
    incl,
    raanDeg
  ) => {
    const inclRad = incl * DEG_TO_RAD
    const raanRad = raanDeg * DEG_TO_RAD

    let x = radius * Math.cos(anomaly)
    let y = 0
    let z = radius * Math.sin(anomaly)

    const y1 = y * Math.cos(inclRad) - z * Math.sin(inclRad)
    const z1 = y * Math.sin(inclRad) + z * Math.cos(inclRad)

    const x2 = x * Math.cos(raanRad) + z1 * Math.sin(raanRad)
    const z2 = -x * Math.sin(raanRad) + z1 * Math.cos(raanRad)

    const r = Math.sqrt(x2 * x2 + y1 * y1 + z2 * z2)
    const lat = Math.asin(y1 / r) / DEG_TO_RAD
    const lon = Math.atan2(z2, x2) / DEG_TO_RAD

    return { lat, lon, alt: altitude, x: x2, y: y1, z: z2 }
  }, [altitude])

  // Calculate satellite velocity
  const calculateOrbitalVelocity = useCallback(() => {
    const semiMajorAxis = EARTH_RADIUS_KM + altitude
    const velocity = Math.sqrt(GRAVITATIONAL_PARAM / semiMajorAxis)
    return velocity
  }, [altitude])

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    // Always use dark space background for star visibility
    scene.background = new THREE.Color(0x000510)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 1.5, 4.5)
    cameraRef.current = camera

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // CSS2D Renderer for labels (Phase 3)
    const labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(width, height)
    labelRenderer.domElement.style.position = 'absolute'
    labelRenderer.domElement.style.top = '0'
    labelRenderer.domElement.style.pointerEvents = 'none'
    container.appendChild(labelRenderer.domElement)
    labelRendererRef.current = labelRenderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 1.5
    controls.maxDistance = 10
    controls.enablePan = false
    controlsRef.current = controls

    // Setup lighting
    setupLighting(scene)

    // Create Earth
    const earth = createEarthMesh(() => setIsLoaded(true))
    scene.add(earth)
    earthRef.current = earth

    // Create atmosphere
    if (showAtmosphere) {
      const atmosphere = createAtmosphere()
      scene.add(atmosphere)
      atmosphereRef.current = atmosphere
    }

    // Create stars
    if (showStars) {
      scene.add(createStarField())
    }

    // Create satellite (Phase 3 - Enhanced 3D model)
    const satellite = createSatellite3D({ 
      status: 'active',
      showAttitudeAxes: false 
    })
    scene.add(satellite)
    satelliteRef.current = satellite

    // Satellite label removed - use OrbitalViewPanel instead

    // Create orbit path
    if (showOrbit) {
      const orbitLine = createOrbitLine(orbitRadius, inclination, raan)
      scene.add(orbitLine)
      orbitLineRef.current = orbitLine
    }

    // Ground stations will be created/updated separately via useEffect
    // to handle WebSocket data updates and proper cleanup

    // Orbital nodes - Phase 3 component exists but not yet integrated
    // if (showOrbitalNodes) {
    //   const nodesManager = createOrbitalNodesManager(scene)
    //   nodesManager.updateNodes(orbitRadius, inclination, raan)
    //   orbitalNodesRef.current = nodesManager
    // }

    // Create cardinal labels (Phase 3)
    if (showLabels) {
      const cardinalLabels = createCardinalLabels(EARTH_RADIUS)
      scene.add(cardinalLabels)
    }

    // Initialize Phase 3 managers
    coneManagerRef.current = createVisibilityConeManager()
    linkManagerRef.current = createCommLinkManager()
    
    // Mark as mounted (after all scene setup)
    isMountedRef.current = true

    // Handle resize
    const handleResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      labelRenderer.setSize(w, h)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      isMountedRef.current = false
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationRef.current)
      
      // Cleanup ground stations
      if (groundStationsRef.current && sceneRef.current) {
        sceneRef.current.remove(groundStationsRef.current)
        disposeGroundStations(groundStationsRef.current)
        groundStationsRef.current = null
      }
      
      // Cleanup Phase 3 managers
      if (coneManagerRef.current) {
        coneManagerRef.current.dispose(scene)
      }
      if (linkManagerRef.current) {
        linkManagerRef.current.dispose(scene)
      }
      
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      if (container.contains(labelRenderer.domElement)) {
        container.removeChild(labelRenderer.domElement)
      }
    }
  }, [showAtmosphere, showStars, showOrbit, orbitRadius, inclination, raan, altitude, calculateOrbitalVelocity])

  // Ground stations update effect - handles WebSocket data and proper cleanup
  useEffect(() => {
    if (!sceneRef.current || !isLoaded) return
    
    // Don't create ground stations if disabled or mount not complete
    if (!showGroundStations || !isMountedRef.current) return

    const scene = sceneRef.current
    
    // Determine which station data to use: WebSocket data or fallback to static
    const stationsToRender = groundStationsData && groundStationsData.length > 0 
      ? groundStationsData 
      : GROUND_STATIONS

    console.log('[EarthGlobe3D] Updating ground stations:', stationsToRender.length)

    // Remove and dispose old ground stations group if it exists
    if (groundStationsRef.current) {
      scene.remove(groundStationsRef.current)
      disposeGroundStations(groundStationsRef.current)
      groundStationsRef.current = null
    }

    // Create new ground stations group
    const newStationsGroup = createGroundStationMarkers(stationsToRender, EARTH_RADIUS)
    
    // Add station labels if enabled
    if (showLabels) {
      newStationsGroup.children.forEach((marker, index) => {
        const stationLabel = createStationLabel(stationsToRender[index].name)
        marker.add(stationLabel)
      })
    }

    // Add to scene and store reference
    scene.add(newStationsGroup)
    groundStationsRef.current = newStationsGroup

  }, [showGroundStations, showLabels, groundStationsData, isLoaded])

  // Update orbit when parameters change
  useEffect(() => {
    if (!sceneRef.current || !orbitLineRef.current) return
    
    sceneRef.current.remove(orbitLineRef.current)
    orbitLineRef.current.geometry.dispose()
    
    if (showOrbit) {
      const newOrbitLine = createOrbitLine(orbitRadius, inclination, raan)
      sceneRef.current.add(newOrbitLine)
      orbitLineRef.current = newOrbitLine
    }

    // Update orbital nodes - Phase 3 component not yet integrated
    // if (orbitalNodesRef.current && orbitalNodesRef.current.updateNodes) {
    //   orbitalNodesRef.current.updateNodes(orbitRadius, inclination, raan)
    // }
  }, [altitude, inclination, raan, showOrbit, orbitRadius])

  // Keyboard controls
  useEffect(() => {
    if (!isLoaded || !cameraRef.current || !controlsRef.current) return

    const camera = cameraRef.current
    const controls = controlsRef.current

    const handleKeyDown = (e) => {
      const rotationSpeed = 0.05
      
      switch(e.key) {
        case ' ':
          e.preventDefault()
          setIsPaused(prev => !prev)
          break
        case '+':
        case '=':
          e.preventDefault()
          camera.position.multiplyScalar(0.9)
          camera.position.clampLength(1.5, 10)
          break
        case '-':
        case '_':
          e.preventDefault()
          camera.position.multiplyScalar(1.1)
          camera.position.clampLength(1.5, 10)
          break
        case 'ArrowUp':
          e.preventDefault()
          camera.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), -rotationSpeed)
          break
        case 'ArrowDown':
          e.preventDefault()
          camera.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), rotationSpeed)
          break
        case 'ArrowLeft':
          e.preventDefault()
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed)
          break
        case 'ArrowRight':
          e.preventDefault()
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotationSpeed)
          break
        case 'r':
        case 'R':
          e.preventDefault()
          camera.position.set(0, 1.5, 4.5)
          controls.target.set(0, 0, 0)
          setFollowSatellite(false)
          break
        case 'f':
        case 'F':
          e.preventDefault()
          setFollowSatellite(prev => !prev)
          break
        case 'p':
        case 'P':
          e.preventDefault()
          setIsPaused(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLoaded])

  // Animation loop
  useEffect(() => {
    if (!isLoaded || !rendererRef.current || !sceneRef.current || !cameraRef.current) return

    const renderer = rendererRef.current
    const labelRenderer = labelRendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current
    const controls = controlsRef.current

    // Calculate orbital period
    const semiMajorAxis = EARTH_RADIUS_KM + altitude
    const period = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / GRAVITATIONAL_PARAM)

    let lastTime = performance.now()

    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime

      // Update true anomaly (only if not paused)
      if (!isPaused) {
        setTrueAnomaly(prev => {
          const newAnomaly = prev + (deltaTime * animationSpeed * 2 * Math.PI) / period
          return newAnomaly % (2 * Math.PI)
        })
      }

      // Rotate Earth (only if not paused)
      if (earthRef.current && !isPaused) {
        earthRef.current.rotation.y += deltaTime * 0.02
      }

      // Atmosphere shader uses built-in cameraPosition uniform, no need to update

      // Update satellite position - use telemetry if available, otherwise calculate
      if (satelliteRef.current) {
        let pos
        // Support both flat structure (lat/lon/alt) and nested structure (orbit.latitude/longitude/altitude_km)
        const lat = telemetry?.orbit?.latitude ?? telemetry?.lat
        const lon = telemetry?.orbit?.longitude ?? telemetry?.lon
        const alt = telemetry?.orbit?.altitude_km ?? telemetry?.alt
        
        if (lat != null && lon != null) {
          // Use real-time telemetry from backend
          pos = latLonToPosition(
            lat,
            lon,
            alt || altitude
          )
        } else {
          // Fallback to calculated position
          pos = calculateSatellitePosition(trueAnomaly, orbitRadius, inclination, raan)
        }
        
        const satPosVec = new THREE.Vector3(pos.x, pos.y, pos.z)
        satelliteRef.current.position.copy(satPosVec)
        satelliteRef.current.lookAt(0, 0, 0)

        // Satellite label removed - use OrbitalViewPanel instead

        // Update orbit gradient
        if (orbitLineRef.current && orbitLineRef.current.material.uniforms) {
          const progress = trueAnomaly / (2 * Math.PI)
          orbitLineRef.current.material.uniforms.satelliteProgress.value = progress
        }

        // Phase 3: Check visibility to ground stations
        if (showGroundStations && groundStationsRef.current) {
          const newActiveStations = new Set()
          const currentStations = groundStationsData && groundStationsData.length > 0 
            ? groundStationsData 
            : GROUND_STATIONS
          
          groundStationsRef.current.children.forEach((marker, index) => {
            if (index >= currentStations.length) return // Safety check
            
            const stationPos = marker.position
            const visibility = checkVisibility(satPosVec, stationPos, EARTH_RADIUS)
            
            if (visibility.visible) {
              newActiveStations.add(currentStations[index].name)
              
              // Update station active state
              updateStationActive(marker, true)
              
              // Create/update visibility cone
              if (showVisibilityCones && coneManagerRef.current) {
                const cone = coneManagerRef.current.updateCone(
                  currentStations[index].name,
                  stationPos,
                  satPosVec,
                  scene
                )
                // Animate cone to visible
                animateVisibilityCone(cone, true, deltaTime)
              }
              
              // Create/update comm link
              if (showCommLinks && linkManagerRef.current) {
                const quality = calculateLinkQuality(visibility.elevation)
                const linkData = linkManagerRef.current.updateLink(
                  currentStations[index].name,
                  satPosVec,
                  stationPos,
                  quality,
                  scene
                )
                animateCommLink(linkData.line, linkData.packetsGroup, deltaTime, true, scene)
              }
              
              // Update station label with elevation
              if (showLabels && marker.children.length > 0) {
                const labelIndex = marker.children.findIndex(child => child.isCSS2DObject)
                if (labelIndex !== -1) {
                  const newText = `${currentStations[index].name}\nEL: ${visibility.elevation.toFixed(1)}°`
                  updateTextLabel(marker.children[labelIndex], newText)
                }
              }
            } else {
              // Update station inactive state
              updateStationActive(marker, false)
              
              // Fade out visibility cone
              if (showVisibilityCones && coneManagerRef.current) {
                const cone = coneManagerRef.current.getCone(currentStations[index].name)
                if (cone) {
                  animateVisibilityCone(cone, false, deltaTime)
                }
              }
              
              // Fade out comm link
              if (showCommLinks && linkManagerRef.current) {
                const linkData = linkManagerRef.current.getLink(currentStations[index].name)
                if (linkData) {
                  animateCommLink(linkData.line, linkData.packetsGroup, deltaTime, false, scene)
                }
              }
            }
          })
          
          setActiveStations(newActiveStations)
        }

        // Animate ground station markers (Phase 3)
        if (groundStationsRef.current && !isPaused) {
          animateStationMarkers(groundStationsRef.current.children, deltaTime)
        }

        // Animate orbital nodes - Phase 3 component not yet integrated
        // if (orbitalNodesRef.current && orbitalNodesRef.current.animate) {
        //   orbitalNodesRef.current.animate(deltaTime)
        // }

        // Camera follow mode
        if (followSatellite && camera && controls) {
          const direction = satPosVec.clone().normalize()
          const cameraOffset = direction.multiplyScalar(0.8)
          const targetPos = satPosVec.clone().add(cameraOffset)
          
          camera.position.lerp(targetPos, 0.05)
          controls.target.set(0, 0, 0)
        }
      }

      controls?.update()
      renderer.render(scene, camera)
      labelRenderer?.render(scene, camera)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationRef.current)
  }, [
    isLoaded, 
    telemetry,
    altitude, 
    inclination, 
    raan, 
    orbitRadius, 
    latLonToPosition,
    calculateSatellitePosition, 
    calculateOrbitalVelocity,
    trueAnomaly, 
    followSatellite, 
    animationSpeed, 
    isPaused,
    showGroundStations,
    showVisibilityCones,
    showCommLinks,
    showLabels,
    groundStationsData
  ])

  // Current satellite position for display
  const satPos = calculateSatellitePosition(trueAnomaly, orbitRadius, inclination, raan)

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`} style={{ display: 'block', maxHeight: '100%' }}>
      {!isLoaded && <LoadingOverlay />}
      
      <FollowToggle 
        active={followSatellite}
        onToggle={() => setFollowSatellite(!followSatellite)}
      />
      
      <InteractionHint followMode={followSatellite} isPaused={isPaused} />
    </div>
  )
}

/**
 * Dispose ground stations group and all its resources
 * @param {THREE.Group} stationsGroup - Ground stations group to dispose
 */
function disposeGroundStations(stationsGroup) {
  if (!stationsGroup) return
  
  stationsGroup.children.forEach(marker => {
    // Dispose geometries and materials for each marker's children
    marker.children.forEach(child => {
      if (child.geometry) {
        child.geometry.dispose()
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
    
    // Clear marker's children
    marker.children.length = 0
  })
  
  // Clear group's children
  stationsGroup.children.length = 0

}

export default EarthGlobe3D
