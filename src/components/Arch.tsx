import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARCH_PAYOUTS, RED_SUMS, BLACK_SUMS } from '../game/engine';

interface ArchProps {
    activeTiles: number[];
}

/**
 * Structural Arch Component
 * 
 * Creates a "bridge" of stones (voussoirs). 
 * Each stone is trapezoidal (clip-path) and oriented radially.
 */

const CONTAINER_W = 900;
const CONTAINER_H = 480;
const CENTER_X = CONTAINER_W / 2;   // 450
const CENTER_Y = CONTAINER_H;       // 480 (bottom edge)

// Radius to the OUTER edge of the arch stones
const OUTER_RADIUS = 460;
// Radius to the INNER edge (where they sit on the wood border)
const INNER_RADIUS = 360;

const TILE_W = 85;  // Wider to allow for fanning and touching
const TILE_H = 100; // INNER_RADIUS to OUTER_RADIUS distance

const Arch: React.FC<ArchProps> = ({ activeTiles }) => {
    const allTiles = Array.from({ length: 16 }, (_, i) => i + 3);

    return (
        <div className="arch-area">
            <div className="arch-container">
                <AnimatePresence>
                    {allTiles.map((num, index) => {
                        // Spread tiles across 180 degrees
                        // We want the tiles to touch, so we calculate the angular width
                        // Total span is PI radians. 16 tiles.
                        // Angle is the center-line of each tile.
                        const totalTiles = allTiles.length;
                        const angle = Math.PI - (index / (totalTiles - 1)) * Math.PI;

                        // Positioning: The tile's anchor point will be its bottom center (on the inner radius)
                        // But we use top/left for the div, so we calculate the center point of the tile
                        const midRadius = (INNER_RADIUS + OUTER_RADIUS) / 2;
                        const arcX = CENTER_X + midRadius * Math.cos(angle);
                        const arcY = CENTER_Y - midRadius * Math.sin(angle);

                        // Rotation: Points "up" from the center
                        // angle = PI (left) -> rotate = -90deg
                        // angle = PI/2 (top) -> rotate = 0deg
                        // angle = 0 (right) -> rotate = 90deg
                        const rotateDeg = (angle * 180) / Math.PI - 90;

                        const left = arcX - TILE_W / 2;
                        const top = arcY - TILE_H / 2;

                        const isActive = activeTiles.includes(num);
                        if (!isActive) return null;

                        const isRed = RED_SUMS.includes(num);
                        const isBlack = BLACK_SUMS.includes(num);

                        return (
                            <motion.div
                                key={num}
                                className={`tile stone-tile ${isRed ? 'red-bg' : isBlack ? 'black-bg' : ''} ${num === 10 || num === 11 ? 'keystone' : ''}`}
                                initial={{ opacity: 0, scale: 0.8, rotate: rotateDeg }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    left,
                                    top,
                                    rotate: rotateDeg,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.5,
                                    y: 100,
                                    transition: { duration: 0.4 }
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    zIndex: 20,
                                    filter: "brightness(1.2)"
                                }}
                                style={{
                                    width: TILE_W,
                                    height: TILE_H,
                                }}
                            >
                                <div className="number">{num}</div>
                                <div className="payout">{ARCH_PAYOUTS[num]}x</div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Arch;
