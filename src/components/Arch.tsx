import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARCH_PAYOUTS, RED_SUMS, BLACK_SUMS } from '../game/engine';

interface ArchProps {
    activeTiles: number[];
}

/**
 * Structural Arch Component
 * Desktop: curved bridge of stones (voussoirs)
 * Mobile: horizontal row of stones - all visible, no scaling
 */

const CONTAINER_W = 900;
const CONTAINER_H = 480;
const CENTER_X = CONTAINER_W / 2;
const CENTER_Y = CONTAINER_H;
const OUTER_RADIUS = 460;
const INNER_RADIUS = 360;
const TILE_W = 85;
const TILE_H = 100;

const Arch: React.FC<ArchProps> = ({ activeTiles }) => {
    const allTiles = Array.from({ length: 16 }, (_, i) => i + 3);

    const renderStone = (num: number) => {
        const isRed = RED_SUMS.includes(num);
        const isBlack = BLACK_SUMS.includes(num);
        return (
            <div
                key={num}
                className={`tile stone-tile arch-stone ${isRed ? 'red-bg' : isBlack ? 'black-bg' : ''} ${num === 10 || num === 11 ? 'keystone' : ''}`}
            >
                <div className="number">{num}</div>
                <div className="payout">{ARCH_PAYOUTS[num]}x</div>
            </div>
        );
    };

    return (
        <>
            {/* Desktop: curved arch */}
            <div className="arch-area arch-desktop">
                <div className="arch-container">
                    <AnimatePresence>
                        {allTiles.map((num, index) => {
                            const totalTiles = allTiles.length;
                            const angle = Math.PI - (index / (totalTiles - 1)) * Math.PI;
                            const midRadius = (INNER_RADIUS + OUTER_RADIUS) / 2;
                            const arcX = CENTER_X + midRadius * Math.cos(angle);
                            const arcY = CENTER_Y - midRadius * Math.sin(angle);
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
                                    animate={{ opacity: 1, scale: 1, left, top, rotate: rotateDeg }}
                                    exit={{ opacity: 0, scale: 0.5, y: 100, transition: { duration: 0.4 } }}
                                    whileHover={{ scale: 1.05, zIndex: 20, filter: "brightness(1.2)" }}
                                    style={{ width: TILE_W, height: TILE_H }}
                                >
                                    <div className="number">{num}</div>
                                    <div className="payout">{ARCH_PAYOUTS[num]}x</div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile: horizontal row - all stones visible */}
            <div className="arch-mobile">
                {allTiles
                    .filter(num => activeTiles.includes(num))
                    .map(renderStone)}
            </div>
        </>
    );
};

export default Arch;
