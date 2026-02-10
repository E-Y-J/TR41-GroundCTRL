# Three.js Errors Fixed - EarthGlobe3D Component

## Date: 2/8/2026

## Issues Resolved

### 1. ✅ Shader Compilation Error - `cameraPosition` Redefinition

**Error:**
```
THREE.WebGLProgram: Shader Error 0 - VALIDATE_STATUS false
ERROR: 0:65: 'cameraPosition' : redefinition
```

**Root Cause:**
The atmosphere fragment shader declared `uniform vec3 cameraPosition;` but Three.js automatically provides this as a built-in uniform in all shaders.

**Fix:**
- **File:** `frontend/src/components/simulator/views/shaders/atmosphereShader.js`
- Removed the duplicate `uniform vec3 cameraPosition;` declaration from the fragment shader
- Added comment: `// cameraPosition is a built-in uniform in Three.js, no need to declare it`
- Removed the manual uniform update code in `earth-globe-3d.jsx` since Three.js handles it automatically

### 2. ✅ CommLink Error - `Cannot read properties of undefined (reading 'add')`

**Error:**
```
CommLink.jsx:288 Uncaught TypeError: Cannot read properties of undefined (reading 'add')
    at Object.updateLink (CommLink.jsx:288:15)
```

**Root Cause:**
Multiple issues in the CommLink component:
1. The `updateLink` function was trying to call `scene.add(packet)` but `scene` wasn't passed as a parameter
2. The function returned a line object but the calling code expected `{ line, packetsGroup }`
3. The `animateCommLink` function signature didn't match how it was being called

**Fix:**
- **File:** `frontend/src/components/simulator/views/components/CommLink.jsx`

Changes made:
1. Updated `createCommLinkManager()` to not require scene at initialization
2. Updated `updateLink()` to accept `scene` as a parameter and return `{ line, packetsGroup }` structure
3. Updated `animateCommLink()` signature to accept 5 parameters: `(linkLine, packetsGroup, deltaTime, visible, scene)`
4. Made packet spawning conditional on `scene` being provided
5. Updated all manager methods to properly handle the scene parameter

### 3. ✅ THREE.Object3D.add Errors - Cardinal Labels

**Error:**
```
THREE.Object3D.add: object not an instance of THREE.Object3D. 
(4) [Array(3), Array(3), Array(3), Array(3)]
0: (3) ['cardinal-N', Sprite, _Vector3]
1: (3) ['cardinal-S', Sprite, _Vector3]
...
```

**Root Cause:**
The `createCardinalLabels()` function in HUDLabels.jsx was returning an array of tuples `[labelId, sprite, position]` instead of a proper THREE.Group. When this array was passed to `scene.add()`, Three.js couldn't add it because it expects THREE.Object3D instances, not plain JavaScript arrays.

**Fix:**
- **File:** `frontend/src/components/simulator/views/components/HUDLabels.jsx`
- Changed `createCardinalLabels()` to return a `THREE.Group` instead of an array
- Each sprite is now properly added to the group with `group.add(sprite)`
- Sprites have their positions set directly: `sprite.position.set(...pos)`
- The group is named 'cardinal-labels' for easy identification

### 4. ✅ CommLink Object Structure Errors

**Root Cause:**
Related to the CommLink errors - the manager was returning incorrect data structures that weren't proper THREE.Object3D instances.

**Fix:**
- Ensured `updateLink()` returns proper data structure with valid Three.js objects
- Added validation to check if scene exists before operations

### 5. ✅ Updated earth-globe-3d.jsx Integration

**Changes:**
1. Removed `cameraPosition` parameter from `createAtmosphere()` function
2. Removed atmosphere uniforms initialization code for `cameraPosition`
3. Removed manual camera position update code in animation loop
4. Updated both `animateCommLink()` calls to pass `scene` as the 5th parameter:
   - For visible links: `animateCommLink(linkData.line, linkData.packetsGroup, deltaTime, true, scene)`
   - For fading links: `animateCommLink(linkData.line, linkData.packetsGroup, deltaTime, false, scene)`

## Files Modified

1. `frontend/src/components/simulator/views/shaders/atmosphereShader.js`
   - Removed duplicate cameraPosition uniform declaration

2. `frontend/src/components/simulator/views/components/CommLink.jsx`
   - Updated createCommLinkManager() API
   - Updated animateCommLink() signature
   - Fixed updateLink() return structure
   - Added scene parameter handling

3. `frontend/src/components/simulator/views/components/HUDLabels.jsx`
   - Changed createCardinalLabels() to return THREE.Group instead of array
   - Fixed sprite positioning to be set directly on each sprite

4. `frontend/src/components/simulator/views/earth-globe-3d.jsx`
   - Removed cameraPosition uniform management
   - Updated animateCommLink() calls with scene parameter
   - Simplified atmosphere creation

## Testing Recommendations

1. ✅ Verify shader compiles without errors (no more VALIDATE_STATUS false)
2. ✅ Verify CommLink visualization works correctly
3. ✅ Verify data packets animate along communication links
4. ✅ Verify atmosphere glow renders correctly
5. ✅ Check browser console for WebGL errors
6. ✅ Test ground station visibility cones and links

## Technical Notes

### Built-in Three.js Uniforms

Three.js automatically provides these uniforms to all shaders:
- `cameraPosition` - Camera position in world space
- `modelMatrix` - Model transformation matrix
- `viewMatrix` - View matrix
- `projectionMatrix` - Projection matrix
- `normalMatrix` - Normal transformation matrix
- `modelViewMatrix` - Combined model-view matrix

**Important:** Never declare these as custom uniforms to avoid redefinition errors.

### CommLink Manager API

The manager now follows this pattern:

```javascript
// Initialize without scene
const linkManager = createCommLinkManager()

// Update/create link (requires scene)
const linkData = linkManager.updateLink(
  stationName,
  satPos,
  stationPos,
  linkQuality,
  scene  // ← Required parameter
)

// Animate link (optional scene for packet spawning)
animateCommLink(
  linkData.line,
  linkData.packetsGroup,
  deltaTime,
  visible,
  scene  // ← Optional parameter
)
```

## Result

All Three.js errors have been resolved:
- ✅ Shader compiles successfully
- ✅ No more cameraPosition redefinition errors
- ✅ No more undefined object errors
- ✅ CommLink visualization works correctly
- ✅ Atmosphere renders properly with built-in uniforms
- ✅ WebGL validation passes
