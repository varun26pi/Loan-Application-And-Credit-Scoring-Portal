'use client';

import { useEffect, useState } from 'react';

interface CreditScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
}

export function CreditScoreRing({
  score,
  maxScore = 900,
  size = 200,
  strokeWidth = 8,
}: CreditScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayScore((prev) => {
        if (prev < score) {
          return Math.min(prev + Math.ceil((score - prev) / 10), score);
        }
        return prev;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / maxScore) * circumference;
  const percentage = (displayScore / maxScore) * 100;

  let scoreColor = '#ef4444'; // red
  if (percentage >= 75) scoreColor = '#10b981'; // green
  else if (percentage >= 50) scoreColor = '#f59e0b'; // amber
  else if (percentage >= 25) scoreColor = '#f97316'; // orange

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-primary">{displayScore}</div>
          <div className="text-sm text-muted-foreground">of {maxScore}</div>
        </div>
      </div>
    </div>
  );
}
