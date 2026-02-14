/**
 * Globe/Map View Demo Page
 * Demonstrates the 3D-to-2D transformation with satellite tracking
 */

import { useState, useEffect } from 'react';
import { GlobeToMap } from '@/components/globe-to-map';

export default function GlobeMapDemo() {
    const [satellites, setSatellites] = useState([]);
    const [isGlobeMode, setIsGlobeMode] = useState(true);

    // Example: Load satellite data (replace with your actual data source)
    useEffect(() => {
        // Mock satellite data - replace with actual API call
        const mockSatellites = [
            {
                id: 'iss',
                name: 'ISS',
                latitude: 45.5,
                longitude: -122.6,
                altitude: 408
            },
            {
                id: 'hubble',
                name: 'Hubble',
                latitude: 28.5,
                longitude: -80.6,
                altitude: 547
            },
            {
                id: 'starlink-1',
                name: 'Starlink-1',
                latitude: -33.9,
                longitude: 151.2,
                altitude: 550
            }
        ];

        setSatellites(mockSatellites);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        🌍 Globe to Map Transformation
                    </h1>
                    <p className="text-slate-400">
                        Interactive 3D globe that smoothly transitions to a 2D map with lat/long overlay.
                        Drag to rotate, click the button to transform between views.
                    </p>
                </div>

                <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                    <div className="h-[600px]">
                        <GlobeToMap
                            satellites={satellites}
                            width={800}
                            height={500}
                            onProjectionChange={(isGlobe) => setIsGlobeMode(isGlobe)}
                        />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Current View</h3>
                        <p className="text-2xl font-bold text-green-400">
                            {isGlobeMode ? '3D Globe' : '2D Map'}
                        </p>
                    </div>

                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Satellites Tracked</h3>
                        <p className="text-2xl font-bold text-amber-400">
                            {satellites.length}
                        </p>
                    </div>

                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Features</h3>
                        <ul className="text-sm text-slate-400 space-y-1">
                            <li>✓ Smooth transitions</li>
                            <li>✓ Lat/Long overlay</li>
                            <li>✓ Drag to rotate</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-6 bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Tracked Satellites</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {satellites.map((sat) => (
                            <div key={sat.id} className="bg-slate-800 rounded p-3 border border-slate-600">
                                <p className="font-semibold text-white">{sat.name}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Lat: {sat.latitude.toFixed(2)}° | Lon: {sat.longitude.toFixed(2)}°
                                </p>
                                <p className="text-xs text-slate-400">
                                    Altitude: {sat.altitude} km
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
