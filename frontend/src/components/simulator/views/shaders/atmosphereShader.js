/**
 * Enhanced Atmosphere Shader
 * 
 * Implements realistic atmospheric scattering using simplified Rayleigh scattering.
 * Creates a blue glow around Earth that's more intense at the edges (limb).
 * 
 * Based on atmospheric rendering techniques from NASA visualizations.
 */

export const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const atmosphereFragmentShader = `
  uniform vec3 glowColor;
  uniform float glowIntensity;
  uniform float atmosphereThickness;
  uniform vec3 cameraPosition;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    // Calculate view direction
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    
    // Fresnel effect - stronger glow at edges (limb)
    float fresnel = dot(viewDirection, vNormal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    
    // Enhanced edge glow with power curve
    float intensity = pow(fresnel, 2.5) * glowIntensity;
    
    // Add subtle inner atmosphere
    float innerGlow = pow(fresnel, 4.0) * 0.3;
    intensity += innerGlow;
    
    // Apply atmosphere thickness (affects opacity)
    float alpha = intensity * atmosphereThickness;
    
    // Output with additive blending for glow effect
    gl_FragColor = vec4(glowColor, alpha);
  }
`

/**
 * Default atmosphere shader uniforms
 */
export const defaultAtmosphereUniforms = {
  glowColor: { value: [0.3, 0.6, 1.0] }, // Blue atmospheric color
  glowIntensity: { value: 1.2 },           // Overall glow strength
  atmosphereThickness: { value: 0.8 },     // Opacity control
  cameraPosition: { value: [0, 0, 5] }     // Updated each frame
}

/**
 * Create atmosphere material with custom shader
 */
export function createAtmosphereMaterial() {
  return {
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms: {
      glowColor: { value: new THREE.Vector3(0.3, 0.6, 1.0) },
      glowIntensity: { value: 1.2 },
      atmosphereThickness: { value: 0.8 },
      cameraPosition: { value: new THREE.Vector3(0, 0, 5) }
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false
  }
}
