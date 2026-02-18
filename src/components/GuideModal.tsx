import React from 'react';

interface GuideModalProps {
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="guide-overlay" onClick={onClose}>
      <div className="guide-modal" onClick={e => e.stopPropagation()}>
        <h2 className="guide-title">How to Play Keystone</h2>

        <div className="guide-section">
          <h3>Setup</h3>
          <p>Start with $100. Place at least one <strong>arch bet</strong> (on the stone bridge) and one <strong>inside bet</strong> before rolling.</p>
        </div>

        <div className="guide-section">
          <h3>Arch Bets</h3>
          <p>Bet on which stone will be struck. Place before your first roll—they&apos;re locked after. Payouts vary by tile (2x–30x). Hit 3 or 18 with all stones intact for a <strong>jackpot</strong>.</p>
        </div>

        <div className="guide-section">
          <h3>Inside Bets</h3>
          <p>Bet on the dice outcome each roll: exact sum, ranges (4–9, 10–11, 12–17), red/black, even/odd, pairs, or triples. Resolve every roll.</p>
        </div>

        <div className="guide-section">
          <h3>Rolling</h3>
          <p>Roll three dice. The sum strikes a stone—the matching tile, or the nearest if it&apos;s gone. Winning arch bets pay; losing arch bets are cleared. Inside bets pay or lose each roll.</p>
        </div>

        <div className="guide-section">
          <h3>How the Game Ends</h3>
          <ul>
            <li><strong>Base stone removed</strong> — Tile 3 or 18 is struck</li>
            <li><strong>Keystones removed</strong> — Both tiles 10 and 11 are struck</li>
            <li><strong>All tiles removed</strong> — Every stone has been struck</li>
            <li><strong>Flat broke</strong> — Balance hits $0 with no inside bets to roll</li>
          </ul>
        </div>

        <button onClick={onClose} className="guide-button">
          Got it — Let&apos;s play!
        </button>
      </div>
    </div>
  );
};

export default GuideModal;
