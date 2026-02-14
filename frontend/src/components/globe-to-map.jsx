/**
 * Globe to Map Transform Component
 * Smooth 3D globe to 2D map transition with lat/long overlay
 * Optimized for overlay and seamless integration
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { Button } from '@/components/ui/button';

/**
 * Interpolate between two D3 projections
 */
function interpolateProjection(raw0, raw1) {
    const mutate = d3.geoProjectionMutator((t) => (x, y) => {
        const [x0, y0] = raw0(x, y);
        const [x1, y1] = raw1(x, y);
        return [x0 + t * (x1 - x0), y0 + t * (y1 - y0)];
    });
    let t = 0;
    return Object.assign(mutate(t), {
        alpha(_) {
            return arguments.length ? mutate((t = +_)) : t;
        },
    });
}

export function GlobeToMap({
    satellites = [],
    width = 720, // Default to matching our 2D NASA map viewbox
    height = 360,
    progress: controlledProgress, // 0 = globe, 100 = map
    showUI = true,
    showCountries = true,
    opacity = 1,
    onProjectionChange
}) {
    const svgRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [internalProgress, setInternalProgress] = useState(0);
    const [worldData, setWorldData] = useState([]);
    const [rotation, setRotation] = useState([0, 0]);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMouse, setLastMouse] = useState([0, 0]);

    // Use controlled or internal progress
    const progress = controlledProgress !== undefined ? controlledProgress : internalProgress;

    // Load world data
    useEffect(() => {
        const loadWorldData = async () => {
            try {
                const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
                const world = await response.json();
                const countries = feature(world, world.objects.countries).features;
                setWorldData(countries);
            } catch (error) {
                console.error('❌ Error loading world data:', error);
                setWorldData([{
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[
                            [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]
                        ]]
                    },
                    properties: {}
                }]);
            }
        };
        loadWorldData();
    }, []);

    // Mouse interaction handlers
    const handleMouseDown = useCallback((event) => {
        setIsDragging(true);
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
            setLastMouse([event.clientX - rect.left, event.clientY - rect.top]);
        }
    }, []);

    const handleMouseMove = useCallback((event) => {
        if (!isDragging) return;

        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const currentMouse = [event.clientX - rect.left, event.clientY - rect.top];
        const dx = currentMouse[0] - lastMouse[0];
        const dy = currentMouse[1] - lastMouse[1];

        const t = progress / 100;
        const sensitivity = t < 0.5 ? 0.5 : 0.25;

        setRotation((prev) => [
            prev[0] + dx * sensitivity,
            Math.max(-90, Math.min(90, prev[1] - dy * sensitivity))
        ]);

        setLastMouse(currentMouse);
    }, [isDragging, lastMouse, progress]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Render visualization
    useEffect(() => {
        if (!svgRef.current || worldData.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const t = progress / 100;
        const alpha = Math.pow(t, 0.5); // Ease-out

        // Scale: larger for globe, matching NASA map for 2D
        // In our NASA map (720x360), Plate Carree scale is 720 / (2*PI) ≈ 114.6
        const globeScale = 180;
        const mapScale = 114.59;
        const currentScale = d3.interpolate(globeScale, mapScale)(alpha);

        // Create interpolated projection
        const projection = interpolateProjection(d3.geoOrthographicRaw, d3.geoEquirectangularRaw)
            .scale(currentScale)
            .translate([width / 2, height / 2])
            .rotate([rotation[0], rotation[1]])
            .precision(0.1);

        projection.alpha(alpha);

        const path = d3.geoPath(projection);

        // Add graticule (lat/long grid)
        const graticule = d3.geoGraticule();
        const graticulePath = path(graticule());
        if (graticulePath) {
            svg
                .append('path')
                .datum(graticule())
                .attr('d', graticulePath)
                .attr('fill', 'none')
                .attr('stroke', '#4ade80')
                .attr('stroke-width', 0.5)
                .attr('opacity', 0.3 * opacity);
        }

        // Add countries
        if (showCountries) {
            svg
                .selectAll('.country')
                .data(worldData)
                .enter()
                .append('path')
                .attr('class', 'country')
                .attr('d', (d) => {
                    try {
                        const pathString = path(d);
                        if (!pathString || pathString.includes('NaN')) return '';
                        return pathString;
                    } catch {
                        return '';
                    }
                })
                .attr('fill', 'rgba(100, 116, 139, 0.2)')
                .attr('stroke', '#64748b')
                .attr('stroke-width', 0.5)
                .attr('opacity', 0.6 * opacity);
        }

        // Add satellites
        if (satellites.length > 0) {
            svg
                .selectAll('.satellite')
                .data(satellites)
                .enter()
                .append('circle')
                .attr('class', 'satellite')
                .attr('cx', (d) => {
                    const coords = projection([d.longitude, d.latitude]);
                    return coords ? coords[0] : -1000;
                })
                .attr('cy', (d) => {
                    const coords = projection([d.longitude, d.latitude]);
                    return coords ? coords[1] : -1000;
                })
                .attr('r', 4)
                .attr('fill', '#f59e0b')
                .attr('stroke', '#fbbf24')
                .attr('stroke-width', 2)
                .attr('opacity', 0.9 * opacity)
                .append('title')
                .text((d) => `${d.name}\nLat: ${d.latitude.toFixed(2)}°\nLon: ${d.longitude.toFixed(2)}°\nAlt: ${d.altitude.toFixed(0)} km`);
        }

        // Draw sphere outline (only visible when not fully flattened)
        if (alpha < 0.99) {
            const sphereOutline = path({ type: 'Sphere' });
            if (sphereOutline) {
                svg
                    .append('path')
                    .datum({ type: 'Sphere' })
                    .attr('d', sphereOutline)
                    .attr('fill', 'none')
                    .attr('stroke', '#334155')
                    .attr('stroke-width', 2)
                    .attr('opacity', (1 - alpha) * opacity);
            }
        }
    }, [worldData, progress, rotation, satellites, width, height, showCountries, opacity]);

    // Animate transition
    const animateTo = useCallback((target) => {
        if (isAnimating) return;

        setIsAnimating(true);
        const startProgress = progress;
        const endProgress = target;
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const currentP = startProgress + (endProgress - startProgress) * eased;

            setInternalProgress(currentP);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
                if (onProjectionChange) {
                    onProjectionChange(endProgress === 0);
                }
            }
        };

        animate();
    }, [isAnimating, progress, onProjectionChange]);

    const handleReset = useCallback(() => {
        setRotation([0, 0]);
    }, []);

    const isGlobeMode = progress < 50;

    return (
        <div className="relative flex items-center justify-center w-full h-full pointer-events-none">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                className={`w-full h-full transition-opacity duration-500 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} pointer-events-auto`}
                preserveAspectRatio="xMidYMid meet"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ background: 'none' }} // Ensure transparency
            />
            {showUI && (
                <>
                    <div className="absolute bottom-4 right-4 flex gap-2 z-10 pointer-events-auto">
                        <Button
                            onClick={() => animateTo(progress === 0 ? 100 : 0)}
                            disabled={isAnimating}
                            className="min-w-[140px]"
                            variant="default"
                        >
                            {isAnimating ? 'Animating...' : isGlobeMode ? '🌍 → 🗺️ Flatten' : '🗺️ → 🌍 Spherize'}
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="min-w-[80px]"
                        >
                            Reset
                        </Button>
                    </div>
                    <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700 pointer-events-auto">
                        <p className="text-xs text-slate-300">
                            Mode: <span className="font-semibold text-green-400">{isGlobeMode ? '3D Globe' : '2D Map'}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Drag to rotate • {satellites.length} satellites tracked
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

GlobeToMap.propTypes = {
    satellites: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
        altitude: PropTypes.number.isRequired
    })),
    width: PropTypes.number,
    height: PropTypes.number,
    progress: PropTypes.number,
    showUI: PropTypes.boolean,
    showCountries: PropTypes.boolean,
    opacity: PropTypes.number,
    onProjectionChange: PropTypes.func
};
