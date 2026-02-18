export type BetType =
  | 'ARCH'
  | 'INSIDE_NUMBER'
  | 'INSIDE_RANGE'
  | 'INSIDE_COLOR'
  | 'INSIDE_PARITY'
  | 'INSIDE_TRIPLE'
  | 'INSIDE_PAIR';

export interface Bet {
  id: string;
  type: BetType;
  value: string | number; // e.g., '4-9', 'RED', 'EVEN', 'TRIPLE', or 3..18 for ARCH
  amount: number;
}

export interface GameState {
  activeTiles: number[]; // 3 to 18
  balance: number;
  bets: Bet[];
  lastRoll?: [number, number, number];
  isGameOver: boolean;
  gameMessage: string;
}

export const INITIAL_TILES = Array.from({ length: 16 }, (_, i) => i + 3);

export const rollDice = (): [number, number, number] => {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
};

export const calculateNextTileToRemove = (sum: number, activeTiles: number[]): number | null => {
  if (activeTiles.includes(sum)) return sum;

  // If sum is not active, look for adjacent
  if (sum <= 10) {
    // Look for lower
    for (let i = sum - 1; i >= 3; i--) {
      if (activeTiles.includes(i)) return i;
    }
  } else {
    // Look for higher
    for (let i = sum + 1; i <= 18; i++) {
      if (activeTiles.includes(i)) return i;
    }
  }

  return null;
};

export const checkGameOver = (activeTiles: number[]): { over: boolean; reason: string } => {
  if (!activeTiles.includes(3) || !activeTiles.includes(18)) {
    return { over: true, reason: 'Base stone removed!' };
  }
  if (!activeTiles.includes(10) && !activeTiles.includes(11)) {
    return { over: true, reason: 'Keystones removed!' };
  }
  if (activeTiles.length === 0) {
    return { over: true, reason: 'All tiles removed!' };
  }
  return { over: false, reason: '' };
};

export const ARCH_PAYOUTS: Record<number, number> = {
  3: 30, 4: 15, 5: 10, 6: 7, 7: 5, 8: 4, 9: 3,
  10: 2, 11: 2, 12: 3, 13: 4, 14: 5, 15: 7, 16: 10, 17: 15, 18: 30
};

export const RED_SUMS = [4, 6, 8, 10, 12, 14, 16, 18];
export const BLACK_SUMS = [3, 5, 7, 9, 11, 13, 15, 17];

export interface BetResult {
  bet: Bet;
  won: boolean;
  payout: number;
  label: string;
}

export const calculateInsidePayouts = (bets: Bet[], roll: [number, number, number]): number => {
  const { breakdown } = calculateInsideBreakdown(bets, roll);
  return breakdown.reduce((acc, r) => acc + r.payout, 0);
};

export const calculateInsideBreakdown = (
  bets: Bet[],
  roll: [number, number, number]
): { total: number; breakdown: BetResult[] } => {
  const sum = roll[0] + roll[1] + roll[2];
  const isTriple = roll[0] === roll[1] && roll[1] === roll[2];
  const breakdown: BetResult[] = [];

  bets.forEach(bet => {
    let payout = 0;
    let label = '';
    switch (bet.type) {
      case 'INSIDE_NUMBER':
        if (bet.value === sum) {
          payout = bet.amount * ARCH_PAYOUTS[sum];
          label = `${bet.value} hit! ${ARCH_PAYOUTS[sum]}x`;
        } else {
          label = `${bet.value} missed`;
        }
        break;
      case 'INSIDE_RANGE':
        if (bet.value === '4-9' && sum >= 4 && sum <= 9) {
          payout = bet.amount * 2;
          label = '4-9 hit! 2x';
        } else if (bet.value === '10-11' && (sum === 10 || sum === 11)) {
          payout = bet.amount * 3;
          label = '10-11 hit! 3x';
        } else if (bet.value === '12-17' && sum >= 12 && sum <= 17) {
          payout = bet.amount * 2;
          label = '12-17 hit! 2x';
        } else {
          label = `${bet.value} missed`;
        }
        break;
      case 'INSIDE_COLOR':
        if (bet.value === 'RED' && RED_SUMS.includes(sum)) {
          payout = bet.amount * 1;
          label = 'RED hit! 1:1';
        } else if (bet.value === 'BLACK' && BLACK_SUMS.includes(sum)) {
          payout = bet.amount * 1;
          label = 'BLACK hit! 1:1';
        } else {
          label = `${bet.value} missed`;
        }
        break;
      case 'INSIDE_PARITY':
        if (bet.value === 'EVEN' && sum % 2 === 0) {
          payout = bet.amount * 1;
          label = 'EVEN hit! 1:1';
        } else if (bet.value === 'ODD' && sum % 2 !== 0) {
          payout = bet.amount * 1;
          label = 'ODD hit! 1:1';
        } else {
          label = `${bet.value} missed`;
        }
        break;
      case 'INSIDE_TRIPLE':
        if (bet.value === 'TRIPLE' && isTriple) {
          payout = bet.amount * 30;
          label = 'TRIPLE hit! 30x';
        } else {
          label = 'TRIPLE missed';
        }
        break;
      case 'INSIDE_PAIR':
        const isPair = roll[0] === roll[1] || roll[1] === roll[2] || roll[0] === roll[2];
        if (bet.value === 'PAIR' && isPair && !isTriple) {
          payout = bet.amount * 3;
          label = 'PAIR hit! 3x';
        } else {
          label = 'PAIR missed';
        }
        break;
      default:
        label = '';
    }
    breakdown.push({ bet, won: payout > 0, payout, label });
  });

  const total = breakdown.reduce((acc, r) => acc + r.payout, 0);
  return { total, breakdown };
};
