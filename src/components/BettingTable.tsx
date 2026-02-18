import React from 'react';
import { ARCH_PAYOUTS, RED_SUMS, BLACK_SUMS } from '../game/engine';
import type { Bet, BetType, BetResult } from '../game/engine';

interface BettingTableProps {
    onPlaceBet: (type: BetType, value: string | number) => void;
    onRemoveBet: (type: BetType, value: string | number) => void;
    bets: Bet[];
    activeTiles: number[];
    hasRolled: boolean;
    lastRollResult: { breakdown: BetResult[]; totalWin: number } | null;
}

const slotKey = (type: BetType, value: string | number) => `${type}:${value}`;

const BettingTable: React.FC<BettingTableProps> = ({ onPlaceBet, onRemoveBet, bets, activeTiles, hasRolled, lastRollResult }) => {
    const allTiles = Array.from({ length: 16 }, (_, i) => i + 3);

    const highlightMap = React.useMemo(() => {
        const map = new Map<string, 'won' | 'lost'>();
        if (!lastRollResult) return map;
        lastRollResult.breakdown.forEach(r => {
            map.set(slotKey(r.bet.type, r.bet.value), r.won ? 'won' : 'lost');
        });
        return map;
    }, [lastRollResult]);

    const getChip = (type: BetType, value: string | number) => {
        const total = bets
            .filter(b => b.type === type && b.value === value)
            .reduce((acc, b) => acc + b.amount, 0);
        return total > 0 ? <div className="chip">{total}</div> : null;
    };

    const handleSlotClick = (type: BetType, value: string | number, canPlace: boolean, placeFn: () => void) => (e: React.MouseEvent) => {
        if (e.altKey) {
            e.preventDefault();
            onRemoveBet(type, value);
        } else if (canPlace) {
            placeFn();
        }
    };

    const renderArchSlot = (num: number) => {
        const isActive = activeTiles.includes(num);
        const locked = hasRolled;
        const isRed = RED_SUMS.includes(num);
        const isBlack = BLACK_SUMS.includes(num);
        const highlight = highlightMap.get(slotKey('ARCH', num));
        const hasBet = bets.some(b => b.type === 'ARCH' && b.value === num);
        return (
            <div
                key={num}
                className={`bet-slot ${!isActive || locked ? 'disabled' : ''} ${isRed ? 'red-tint' : isBlack ? 'black-tint' : ''} ${highlight === 'won' ? 'bet-won' : highlight === 'lost' ? 'bet-lost' : ''}`}
                title={locked ? 'Arch bets are locked after the first roll' : hasBet ? 'Alt+click to remove bet' : 'Click to place bet'}
                onClick={handleSlotClick('ARCH', num, !locked && isActive, () => onPlaceBet('ARCH', num))}
            >
                {getChip('ARCH', num)}
                <div className="slot-label">{num}</div>
                <div className="slot-payout">{ARCH_PAYOUTS[num]}x</div>
            </div>
        );
    };

    const renderInsideNumberSlot = (num: number) => {
        const isActive = activeTiles.includes(num);
        const isRed = RED_SUMS.includes(num);
        const isBlack = BLACK_SUMS.includes(num);
        const highlight = highlightMap.get(slotKey('INSIDE_NUMBER', num));
        const hasBet = bets.some(b => b.type === 'INSIDE_NUMBER' && b.value === num);
        return (
            <div
                key={num}
                className={`bet-slot ${!isActive ? 'disabled' : ''} ${isRed ? 'red-tint' : isBlack ? 'black-tint' : ''} ${highlight === 'won' ? 'bet-won' : highlight === 'lost' ? 'bet-lost' : ''}`}
                title={hasBet ? 'Alt+click to remove bet' : undefined}
                onClick={handleSlotClick('INSIDE_NUMBER', num, isActive, () => onPlaceBet('INSIDE_NUMBER', num))}
            >
                {getChip('INSIDE_NUMBER', num)}
                <div className="slot-label">{num}</div>
                <div className="slot-payout">{ARCH_PAYOUTS[num]}x</div>
            </div>
        );
    };

    return (
        <div className="betting-board">
            {/* ARCH BETS — locked after first roll */}
            <div className="bet-section-label">
                {hasRolled
                    ? '🔒 Arch Bets (locked)'
                    : '⚓ Arch Bets — place before first roll'}
            </div>
            <div className="betting-row arch-row">
                {allTiles.map(renderArchSlot)}
            </div>

            <div className="bet-section-divider" />

            {/* INSIDE NUMBER BETS — single turn */}
            <div className="bet-section-label">🎯 Inside Number Bets (this turn only)</div>
            <div className="betting-row arch-row">
                {allTiles.map(renderInsideNumberSlot)}
            </div>

            {/* INSIDE GROUP BETS */}
            <div className="inside-grid">
                <div
                    className={`inside-slot red-slot ${highlightMap.get(slotKey('INSIDE_COLOR', 'RED')) === 'won' ? 'bet-won' : highlightMap.get(slotKey('INSIDE_COLOR', 'RED')) === 'lost' ? 'bet-lost' : ''}`}
                    title={bets.some(b => b.type === 'INSIDE_COLOR' && b.value === 'RED') ? 'Alt+click to remove bet' : undefined}
                    onClick={handleSlotClick('INSIDE_COLOR', 'RED', true, () => onPlaceBet('INSIDE_COLOR', 'RED'))}
                >
                    {getChip('INSIDE_COLOR', 'RED')}
                    <span className="slot-label">RED</span>
                    <span className="slot-payout">1:1</span>
                </div>
                <div
                    className={`inside-slot black-slot ${highlightMap.get(slotKey('INSIDE_COLOR', 'BLACK')) === 'won' ? 'bet-won' : highlightMap.get(slotKey('INSIDE_COLOR', 'BLACK')) === 'lost' ? 'bet-lost' : ''}`}
                    title={bets.some(b => b.type === 'INSIDE_COLOR' && b.value === 'BLACK') ? 'Alt+click to remove bet' : undefined}
                    onClick={handleSlotClick('INSIDE_COLOR', 'BLACK', true, () => onPlaceBet('INSIDE_COLOR', 'BLACK'))}
                >
                    {getChip('INSIDE_COLOR', 'BLACK')}
                    <span className="slot-label">BLACK</span>
                    <span className="slot-payout">1:1</span>
                </div>
                <div
                    className={`inside-slot ${highlightMap.get(slotKey('INSIDE_PARITY', 'EVEN')) === 'won' ? 'bet-won' : highlightMap.get(slotKey('INSIDE_PARITY', 'EVEN')) === 'lost' ? 'bet-lost' : ''}`}
                    title={bets.some(b => b.type === 'INSIDE_PARITY' && b.value === 'EVEN') ? 'Alt+click to remove bet' : undefined}
                    onClick={handleSlotClick('INSIDE_PARITY', 'EVEN', true, () => onPlaceBet('INSIDE_PARITY', 'EVEN'))}
                >
                    {getChip('INSIDE_PARITY', 'EVEN')}
                    <span className="slot-label">EVEN</span>
                    <span className="slot-payout">1:1</span>
                </div>
                <div
                    className={`inside-slot ${highlightMap.get(slotKey('INSIDE_PARITY', 'ODD')) === 'won' ? 'bet-won' : highlightMap.get(slotKey('INSIDE_PARITY', 'ODD')) === 'lost' ? 'bet-lost' : ''}`}
                    title={bets.some(b => b.type === 'INSIDE_PARITY' && b.value === 'ODD') ? 'Alt+click to remove bet' : undefined}
                    onClick={handleSlotClick('INSIDE_PARITY', 'ODD', true, () => onPlaceBet('INSIDE_PARITY', 'ODD'))}
                >
                    {getChip('INSIDE_PARITY', 'ODD')}
                    <span className="slot-label">ODD</span>
                    <span className="slot-payout">1:1</span>
                </div>
            </div>

            <div className="betting-row">
                <div className={`bet-slot ${highlightMap.get(slotKey('INSIDE_RANGE', '4-9')) === 'won' ? 'bet-won' : highlightMap.get(slotKey('INSIDE_RANGE', '4-9')) === 'lost' ? 'bet-lost' : ''}`} style={{ width: '120px' }} title={bets.some(b => b.type === 'INSIDE_RANGE' && b.value === '4-9') ? 'Alt+click to remove bet' : undefined} onClick={handleSlotClick('INSIDE_RANGE', '4-9', true, () => onPlaceBet('INSIDE_RANGE', '4-9'))}>
                    {getChip('INSIDE_RANGE', '4-9')}
                    <span className="slot-label">4 - 9</span>
                    <span className="slot-payout">2:1</span>
                </div>
                <div className={`bet-slot ${highlightMap.get(slotKey('INSIDE_RANGE', '10-11')) === 'won' ? 'bet-won' : highlightMap.get(slotKey('INSIDE_RANGE', '10-11')) === 'lost' ? 'bet-lost' : ''}`} style={{ width: '120px' }} title={bets.some(b => b.type === 'INSIDE_RANGE' && b.value === '10-11') ? 'Alt+click to remove bet' : undefined} onClick={handleSlotClick('INSIDE_RANGE', '10-11', true, () => onPlaceBet('INSIDE_RANGE', '10-11'))}>
                    {getChip('INSIDE_RANGE', '10-11')}
                    <span className="slot-label">10 - 11</span>
                    <span className="slot-payout">3:1</span>
                </div>
                <div className={`bet-slot ${highlightMap.get(slotKey('INSIDE_RANGE', '12-17')) === 'won' ? 'bet-won' : highlightMap.get(slotKey('INSIDE_RANGE', '12-17')) === 'lost' ? 'bet-lost' : ''}`} style={{ width: '100px' }} title={bets.some(b => b.type === 'INSIDE_RANGE' && b.value === '12-17') ? 'Alt+click to remove bet' : undefined} onClick={handleSlotClick('INSIDE_RANGE', '12-17', true, () => onPlaceBet('INSIDE_RANGE', '12-17'))}>
                    {getChip('INSIDE_RANGE', '12-17')}
                    <span className="slot-label">12 - 17</span>
                    <span className="slot-payout">2:1</span>
                </div>
                <div className={`bet-slot ${highlightMap.get(slotKey('INSIDE_PAIR', 'PAIR')) === 'won' ? 'bet-won' : highlightMap.get(slotKey('INSIDE_PAIR', 'PAIR')) === 'lost' ? 'bet-lost' : ''}`} style={{ width: '100px' }} title={bets.some(b => b.type === 'INSIDE_PAIR' && b.value === 'PAIR') ? 'Alt+click to remove bet' : undefined} onClick={handleSlotClick('INSIDE_PAIR', 'PAIR', true, () => onPlaceBet('INSIDE_PAIR', 'PAIR'))}>
                    {getChip('INSIDE_PAIR', 'PAIR')}
                    <span className="slot-label">PAIRS</span>
                    <span className="slot-payout">3:1</span>
                </div>
                <div className={`bet-slot ${highlightMap.get(slotKey('INSIDE_TRIPLE', 'TRIPLE')) === 'won' ? 'bet-won' : highlightMap.get(slotKey('INSIDE_TRIPLE', 'TRIPLE')) === 'lost' ? 'bet-lost' : ''}`} style={{ width: '100px' }} title={bets.some(b => b.type === 'INSIDE_TRIPLE' && b.value === 'TRIPLE') ? 'Alt+click to remove bet' : undefined} onClick={handleSlotClick('INSIDE_TRIPLE', 'TRIPLE', true, () => onPlaceBet('INSIDE_TRIPLE', 'TRIPLE'))}>
                    {getChip('INSIDE_TRIPLE', 'TRIPLE')}
                    <span className="slot-label">TRIPLES</span>
                    <span className="slot-payout">30:1</span>
                </div>
            </div>
        </div>
    );
};

export default BettingTable;
