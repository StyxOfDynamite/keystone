import React from 'react';
import { motion } from 'framer-motion';

interface DiceProps {
    values: [number, number, number] | null;
    isRolling: boolean;
}

const Die: React.FC<{ value: number; isRolling: boolean }> = ({ value, isRolling }) => {
    const rotationVariants = {
        rolling: {
            rotateX: [0, 360, 720, 1080],
            rotateY: [0, 180, 540, 900],
            transition: { duration: 1, repeat: Infinity, ease: "linear" as const }
        },
        stopped: {
            rotateX: 0,
            rotateY: 0,
            transition: { duration: 0.3 }
        }
    };

    const renderDots = (val: number) => {
        const positions = [
            [], // 0
            ['center'], // 1
            ['top-right', 'bottom-left'], // 2
            ['top-right', 'center', 'bottom-left'], // 3
            ['top-left', 'top-right', 'bottom-left', 'bottom-right'], // 4
            ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'], // 5
            ['top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right'], // 6
        ];

        return (
            <div className={`die-face-dots dots-${val}`}>
                {positions[val].map((pos, i) => (
                    <div key={i} className={`dot ${pos}`} />
                ))}
            </div>
        );
    };

    return (
        <motion.div
            className="die"
            variants={rotationVariants}
            animate={isRolling ? "rolling" : "stopped"}
            style={{
                width: '60px',
                height: '60px',
                background: '#f8f8f8',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 6px 12px rgba(0,0,0,0.6), inset 0 0 10px rgba(0,0,0,0.1)',
                position: 'relative'
            }}
        >
            {renderDots(value)}
        </motion.div>
    );
};

const Dice: React.FC<DiceProps> = ({ values, isRolling }) => {
    return (
        <div className="dice-area">
            <Die value={values?.[0] || 1} isRolling={isRolling} />
            <Die value={values?.[1] || 1} isRolling={isRolling} />
            <Die value={values?.[2] || 1} isRolling={isRolling} />
        </div>
    );
};

export default Dice;
