#!/usr/bin/env python3
"""
Fix orbital display duplication by removing hardcoded displays from visualization views.
"""

import re

def fix_earth_globe_3d():
    """Remove OrbitalInfoPanel and satellite label from 3D view."""
    file_path = 'k:/HUD/TR41-GroundCTRL/frontend/src/components/simulator/views/earth-globe-3d.jsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove createSatelliteLabel from imports
    content = re.sub(
        r'  createSatelliteLabel,\n',
        '',
        content
    )
    
    # Remove OrbitalInfoPanel component
    content = re.sub(
        r'/\*\* Orbital info display panel \*/\n.*?^}\n\n/\*\* Single info row \*/\n.*?^}\n\n',
        '',
        content,
        flags=re.DOTALL | re.MULTILINE
    )
    
    # Remove satellite label creation
    content = re.sub(
        r'    // Create satellite label \(Phase 3\)\n    if \(showLabels\) \{\n.*?      satLabelRef\.current = satLabel\n    \}\n\n',
        '    // Satellite label removed - use OrbitalViewPanel instead\n\n',
        content,
        flags=re.DOTALL
    )
    
    # Remove satellite label update
    content = re.sub(
        r'        // Update satellite label \(Phase 3\)\n        if \(satLabelRef\.current && showLabels\) \{\n.*?        \}\n\n',
        '        // Satellite label removed - use OrbitalViewPanel instead\n\n',
        content,
        flags=re.DOTALL
    )
    
    # Remove OrbitalInfoPanel usage
    content = re.sub(
        r'      <OrbitalInfoPanel \n.*?      />\n      \n',
        '',
        content,
        flags=re.DOTALL
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('✓ Fixed earth-globe-3d.jsx')

def fix_ground_track_2d():
    """Remove CoordinateDisplay from 2D view."""
    file_path = 'k:/HUD/TR41-GroundCTRL/frontend/src/components/simulator/views/ground-track-2d.jsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove CoordinateDisplay component
    content = re.sub(
        r'/\*\* Coordinate display bar \*/\n.*?^}\n\n',
        '',
        content,
        flags=re.DOTALL | re.MULTILINE
    )
    
    # Remove CoordinateDisplay usage
    content = re.sub(
        r'      \n      /\* Coordinate display \*/\n      <CoordinateDisplay.*?/>\n',
        '\n',
        content,
        flags=re.DOTALL
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('✓ Fixed ground-track-2d.jsx')

if __name__ == '__main__':
    print('Fixing orbital display duplications...')
    fix_earth_globe_3d()
    fix_ground_track_2d()
    print('\n✓ All fixes applied successfully!')
    print('\nNext steps:')
    print('1. Restart your dev server')
    print('2. Hard refresh your browser (Ctrl+Shift+R)')
    print('3. Click the ORBIT button in the toolbar to see the new panel')
