import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import AppHeader from '@/components/app-header';
import { Footer } from '@/components/footer';
import { GlobeToMap } from '@/components/globe-to-map';
import { useSimulatorState } from '@/contexts/SimulatorStateContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Satellite, Globe, Map } from 'lucide-react';

/**
 * Satellite Tracking Page
 * Real-time 3D/2D satellite visualization
 * 
 * Route: /satellites
 */
export default function Satellites() {
  const { telemetry, connected } = useSimulatorState();
  const { groundStations } = useWebSocket();
  const [viewMode, setViewMode] = useState('3D');
  const [satellites, setSatellites] = useState([]);

  // Update satellite data from telemetry
  useEffect(() => {
    if (telemetry?.orbit) {
      const satelliteData = [{
        id: 'current-satellite',
        name: 'SAT-01',
        latitude: telemetry.orbit.latitude || 0,
        longitude: telemetry.orbit.longitude || 0,
        altitude: telemetry.orbit.altitude || 408
      }];
      setSatellites(satelliteData);
    }
  }, [telemetry]);

  return (
    <>
      <Helmet>
        <title>Satellite Tracking - GroundCTRL</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Satellite className="h-8 w-8 text-primary" />
                  Satellite Tracking
                </h1>
                <p className="text-muted-foreground mt-1">
                  Real-time 3D globe to 2D map transformation with lat/long overlay
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${connected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium">{connected ? 'Live' : 'Offline'}</span>
                </div>
              </div>
            </div>

            {/* Main Visualization */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="h-[600px]">
                <GlobeToMap
                  satellites={satellites}
                  width={800}
                  height={500}
                  onProjectionChange={(isGlobe) => setViewMode(isGlobe ? '3D' : '2D')}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  {viewMode === '3D' ? (
                    <Globe className="h-4 w-4 text-primary" />
                  ) : (
                    <Map className="h-4 w-4 text-primary" />
                  )}
                  <h3 className="text-sm font-semibold text-muted-foreground">View Mode</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">{viewMode}</p>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Satellites</h3>
                <p className="text-2xl font-bold text-amber-400">{satellites.length}</p>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Ground Stations</h3>
                <p className="text-2xl font-bold text-blue-400">{groundStations.length}</p>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Altitude</h3>
                <p className="text-2xl font-bold text-green-400">
                  {telemetry?.orbit?.altitude?.toFixed(0) || '--'} km
                </p>
              </div>
            </div>

            {/* Satellite Details */}
            {satellites.length > 0 && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Tracked Satellites</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {satellites.map((sat) => (
                    <div key={sat.id} className="bg-muted/50 rounded-lg p-4 border border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <Satellite className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground">{sat.name}</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Latitude:</span>
                          <span className="font-mono text-foreground">{sat.latitude.toFixed(4)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Longitude:</span>
                          <span className="font-mono text-foreground">{sat.longitude.toFixed(4)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Altitude:</span>
                          <span className="font-mono text-foreground">{sat.altitude.toFixed(0)} km</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-muted/30 rounded-lg p-6 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">Controls</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Drag</strong> to rotate the globe or map</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Click "Flatten"</strong> to transform from 3D globe to 2D map</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Click "Spherize"</strong> to transform back to 3D globe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Green lines</strong> show latitude and longitude grid</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Orange markers</strong> indicate satellite positions</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
