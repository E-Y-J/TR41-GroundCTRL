/**
 * Orbit Gradient Shader
 * 
 * Creates a gradient effect along the orbit path to show:
 * - Past orbit: Gray/dimmed
 * - Current position: White/bright
 * - Future orbit: Blue/cyan
 * 
 * The gradient centers on the satellite's current position and creates
 * a visual indicator of orbital motion direction.
 */

export const orbitGradientVertexShader = `
  precision highp float;
  
  attribute float segmentIndex;
  attribute float totalSegments;
  
  varying float vProgress;
  
  void main() {
    // Normalize segment position (0.0 to 1.0)
    vProgress = segmentIndex / totalSegments;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const orbitGradientFragmentShader = `
  precision highp float;
  
  uniform float satelliteProgress;
  uniform vec3 pastColor;
  uniform vec3 presentColor;
  uniform vec3 futureColor;
  uniform float gradientSpread;
  
  varying float vProgress;
  
  void main() {
    // Calculate distance from satellite position (wraps around orbit)
    float distFromSat = abs(vProgress - satelliteProgress);
    
    // Handle wrap-around (0 connects to 1 in circular orbit)
    if (distFromSat > 0.5) {
      distFromSat = 1.0 - distFromSat;
    }
    
    // Determine if this segment is past or future
    float relativePosition = vProgress - satelliteProgress;
    
    // Normalize to -0.5 to 0.5 range (accounting for wrap)
    if (relativePosition > 0.5) relativePosition -= 1.0;
    if (relativePosition < -0.5) relativePosition += 1.0;
    
    vec3 color;
    float opacity;
    
    // Near satellite (present) - bright white
    if (distFromSat < gradientSpread) {
      float proximity = 1.0 - (distFromSat / gradientSpread);
      // Determine base color (past or future)
      vec3 baseColor;
      if (relativePosition < 0.0) {
        baseColor = pastColor;
      } else {
        baseColor = futureColor;
      }
      color = mix(baseColor, presentColor, proximity);
      opacity = 0.9;
    }
    // Past orbit - gray/dimmed
    else if (relativePosition < 0.0) {
      color = pastColor;
      opacity = 0.5;
    }
    // Future orbit - blue/cyan
    else {
      color = futureColor;
      opacity = 0.7;
    }
    
    gl_FragColor = vec4(color, opacity);
  }
`

/**
 * Default orbit gradient uniforms
 */
export const defaultOrbitGradientUniforms = {
  satelliteProgress: { value: 0.0 },        // 0.0 to 1.0 around orbit
  pastColor: { value: [0.5, 0.5, 0.5] },   // Gray for past
  presentColor: { value: [1.0, 1.0, 1.0] }, // White for present
  futureColor: { value: [0.2, 0.6, 1.0] },  // Blue for future
  gradientSpread: { value: 0.1 }             // Width of gradient transition
}

/**
 * Create orbit gradient material
 */
export function createOrbitGradientMaterial(satelliteProgress = 0.0) {
  return {
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
    depthWrite: false,
    blending: THREE.NormalBlending
  }
}
