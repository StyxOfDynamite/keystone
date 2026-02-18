import { useState, useCallback, useEffect } from 'react';
import Arch from './components/Arch';
import BettingTable from './components/BettingTable';
import Dice from './components/Dice';
import GuideModal from './components/GuideModal';
import {
  INITIAL_TILES,
  rollDice,
  calculateNextTileToRemove,
  checkGameOver,
  calculateInsideBreakdown,
  ARCH_PAYOUTS
} from './game/engine';
import type { Bet, BetType, BetResult } from './game/engine';
import { Coffee } from 'lucide-react';
import './game.css';
import confetti from 'canvas-confetti';

function App() {
  const [activeTiles, setActiveTiles] = useState<number[]>(INITIAL_TILES);
  const [balance, setBalance] = useState(100);
  const [bets, setBets] = useState<Bet[]>([]);
  const [lastRoll, setLastRoll] = useState<[number, number, number] | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [gameMessage, setGameMessage] = useState('Place your bets, friend!');
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [lastRollResult, setLastRollResult] = useState<{
    breakdown: BetResult[];
    totalWin: number;
  } | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  const handlePlaceBet = (type: BetType, value: string | number) => {
    if (isGameOver || isRolling) return;
    if (balance < 10) return;
    // Arch bets are locked after the first roll
    if (type === 'ARCH' && hasRolled) return;

    setBalance(prev => prev - 10);
    setBets(prev => {
      const existing = prev.find(b => b.type === type && b.value === value);
      if (existing) {
        return prev.map(b => (b.type === type && b.value === value) ? { ...b, amount: b.amount + 10 } : b);
      }
      return [...prev, { id: Math.random().toString(), type, value, amount: 10 }];
    });
  };

  const handleRemoveBet = (type: BetType, value: string | number) => {
    if (isGameOver || isRolling) return;
    if (type === 'ARCH' && hasRolled) return;

    const existing = bets.find(b => b.type === type && b.value === value);
    if (!existing) return;

    setBalance(prev => prev + 10);
    setBets(prev => {
      if (existing.amount === 10) {
        return prev.filter(b => !(b.type === type && b.value === value));
      }
      return prev.map(b =>
        b.type === type && b.value === value ? { ...b, amount: b.amount - 10 } : b
      );
    });
  };

  const processRoll = useCallback(async () => {
    if (isRolling || isGameOver) return;
    const hasArchBets = bets.some(b => b.type === 'ARCH');
    const hasInsideBets = bets.some(b => b.type !== 'ARCH');
    if (!hasRolled && !hasArchBets) {
      setGameMessage('Place at least one arch bet first!');
      return;
    }
    if (!hasInsideBets) {
      setGameMessage('Place at least one inside bet first!');
      return;
    }

    setIsRolling(true);
    setGameMessage('The bones are rolling...');

    await new Promise(resolve => setTimeout(resolve, 1500));

    const newRoll = rollDice();
    const sum = newRoll[0] + newRoll[1] + newRoll[2];
    setLastRoll(newRoll);
    setIsRolling(false);
    setHasRolled(true);

    const { total: insideWin, breakdown: insideBreakdown } = calculateInsideBreakdown(bets, newRoll);
    const tileToRemove = calculateNextTileToRemove(sum, activeTiles);
    const isJackpot = activeTiles.length === 16 && (sum === 3 || sum === 18);
    let msg = `Rolled ${sum}. `;

    let archBreakdown: BetResult[];
    let totalWin: number;

    if (isJackpot) {
      archBreakdown = bets
        .filter(b => b.type === 'ARCH')
        .map(b => ({
          bet: b,
          won: true,
          payout: b.amount * ARCH_PAYOUTS[b.value as number],
          label: `JACKPOT! Tile ${b.value} pays ${ARCH_PAYOUTS[b.value as number]}x`
        }));
      totalWin = insideWin + archBreakdown.reduce((acc, r) => acc + r.payout, 0);
      setBalance(prev => prev + totalWin);
      setGameMessage('JACKPOT! The bones favor you!');
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      setIsGameOver(true);
    } else {
      archBreakdown = bets
        .filter(b => b.type === 'ARCH')
        .map(b => {
          const won = tileToRemove !== null && b.value === tileToRemove;
          const payout = won ? (b.amount * ARCH_PAYOUTS[b.value as number]) : 0;
          return {
            bet: b,
            won,
            payout,
            label: won ? `Tile ${b.value} hit! ${ARCH_PAYOUTS[b.value as number]}x` : `Tile ${b.value} missed`
          };
        });
      const archWin = archBreakdown.reduce((acc, r) => acc + r.payout, 0);
      totalWin = insideWin + archWin;

      if (tileToRemove !== null) {
        msg += `Striking tile ${tileToRemove}.`;
        setActiveTiles(prev => prev.filter(t => t !== tileToRemove));
      } else {
        msg += `A swing and a miss.`;
      }

      if (totalWin > 0) {
        setBalance(prev => prev + totalWin);
        setGameMessage(`${msg} You've won $${totalWin}!`);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else {
        setGameMessage(msg);
      }
      setBets(prev => prev.filter(b => b.type === 'ARCH'));
    }

    const breakdown = [...insideBreakdown, ...archBreakdown];
    setLastRollResult({ breakdown, totalWin });
  }, [bets, isRolling, isGameOver, activeTiles]);

  useEffect(() => {
    const { over, reason } = checkGameOver(activeTiles);
    const hasInsideBets = bets.some(b => b.type !== 'ARCH');
    if (over) {
      setIsGameOver(true);
      setGameMessage(`Game Over: ${reason} Final balance: $${balance}`);
    } else if (balance === 0 && !hasInsideBets && !isRolling) {
      setGameMessage('You are flat broke!');
      const t = setTimeout(() => setIsGameOver(true), 1500);
      return () => clearTimeout(t);
    }
  }, [activeTiles, balance, bets, isRolling]);

  const resetGame = () => {
    setActiveTiles(INITIAL_TILES);
    setBets([]);
    setLastRoll(null);
    setIsGameOver(false);
    setHasRolled(false);
    setBalance(100);
    setGameMessage('New game, good luck!');
    setLastRollResult(null);
  };

  return (
    <div className="game-container">
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      {isGameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2 className="game-over-title">Game Over</h2>
            <p className="game-over-reason">{gameMessage}</p>
            <button onClick={resetGame} className="restart-button-large">
              Restart
            </button>
          </div>
        </div>
      )}
      <header>
        <h1>Keystone</h1>
        <div className="balance-display">Balance: ${balance}</div>
      </header>

      <div className="game-main">
        <div className="game-board">
          <Arch activeTiles={activeTiles} />
          <BettingTable
        onPlaceBet={handlePlaceBet}
        onRemoveBet={handleRemoveBet}
        bets={bets}
        activeTiles={activeTiles}
        hasRolled={hasRolled}
        lastRollResult={lastRollResult}
          />
        </div>

        <div className="game-controls">
          <div className="message-area">
            {gameMessage}
          </div>
          <div className="controls-area">
            <Dice values={lastRoll} isRolling={isRolling} />
            <button
              onClick={processRoll}
              disabled={isRolling || isGameOver || !bets.some(b => b.type !== 'ARCH') || (!hasRolled && !bets.some(b => b.type === 'ARCH'))}
              className="roll-button"
            >
              ROLL
            </button>
            {isGameOver && (
              <button onClick={resetGame} className="roll-button" style={{ border: '2px solid var(--gold)' }}>
                RESTART
              </button>
            )}
          </div>
        </div>
      </div>

      <a
        href="https://buymeacoffee.com/styxofdynamite"
        target="_blank"
        rel="noopener noreferrer"
        className="coffee-link"
        title="Buy me a coffee"
        aria-label="Buy me a coffee"
      >
        <Coffee size={24} strokeWidth={2} />
      </a>
    </div>
  );
}

export default App;
