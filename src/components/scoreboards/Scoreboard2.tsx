"use client";

import React, { useEffect, useState } from 'react';
import { useScoreboardData } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import { cn } from "@/lib/utils";
import Image from 'next/image';

const Scoreboard2 = () => {
  const { scoreboard, loading } = useScoreboardData();
  
  const [flashA, setFlashA] = useState(false);
  const [flashB, setFlashB] = useState(false);
  
  const prevFoulsA = usePrevious(scoreboard?.teamAFouls);
  const prevFoulsB = usePrevious(scoreboard?.teamBFouls);

  useEffect(() => {
    if (scoreboard && prevFoulsA !== undefined && scoreboard.teamAFouls > prevFoulsA) {
      setFlashA(true);
      setTimeout(() => setFlashA(false), 400);
    }
  }, [scoreboard?.teamAFouls, prevFoulsA, scoreboard]);

  useEffect(() => {
    if (scoreboard && prevFoulsB !== undefined && scoreboard.teamBFouls > prevFoulsB) {
      setFlashB(true);
      setTimeout(() => setFlashB(false), 400);
    }
  }, [scoreboard?.teamBFouls, prevFoulsB, scoreboard]);
  
  const { teamAName, teamBName, teamAScore, teamBScore, teamAFouls, teamBFouls, time, half, teamAColor, teamBColor, logoSrc } = scoreboard;

  if (loading) {
    return (
      <div className="bg-green-500 p-4 rounded-lg w-full max-w-2xl font-display text-white shadow-2xl scale-[0.7] sm:scale-100 flex items-center justify-center">
         <OsisCupLogo className="w-32 h-32 text-white/50 animate-pulse" />
      </div>
    );
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="bg-green-500 p-4 rounded-lg w-full max-w-2xl font-display text-white shadow-2xl scale-[0.7] sm:scale-100">
      <div className="relative w-full h-auto flex flex-col items-center justify-center space-y-3">
        {/* Background Logo */}
        <div className="absolute inset-0 m-auto w-32 h-32 text-white/10">
          {logoSrc ? (
            <Image src={logoSrc} alt="Uploaded Logo" layout="fill" objectFit="contain" className="opacity-10" />
          ) : (
            <OsisCupLogo className="w-full h-full" />
          )}
        </div>

        {/* Top Row: Team Names and Scores */}
        <div className="relative z-10 w-full flex items-center justify-between">
          <div className="w-[30%] h-24 flex items-center justify-center rounded-md" style={{ backgroundColor: teamAColor }}>
            <span className="text-4xl lg:text-5xl truncate px-2">{teamAName}</span>
          </div>
          <div className="w-[38%] h-24 flex items-center justify-center bg-gray-900/70 rounded-md">
            <AnimatedNumber value={teamAScore} className="text-6xl lg:text-7xl w-1/2 text-center" />
            <span className="text-6xl lg:text-7xl">:</span>
            <AnimatedNumber value={teamBScore} className="text-6xl lg:text-7xl w-1/2 text-center" />
          </div>
          <div className="w-[30%] h-24 flex items-center justify-center rounded-md" style={{ backgroundColor: teamBColor }}>
            <span className="text-4xl lg:text-5xl truncate px-2">{teamBName}</span>
          </div>
        </div>

        {/* Middle Row: Fouls and Timer */}
        <div className="relative z-10 w-full flex items-center justify-between">
          <div className={cn("w-16 h-20 flex items-center justify-center rounded-md", flashA && "animate-flash")} style={{ backgroundColor: teamAColor }}>
            <span className="text-5xl">{teamAFouls}</span>
          </div>
          <div className="w-56 h-20 flex items-center justify-center bg-gray-900/70 rounded-md text-5xl">
            {formatTime(time)}
          </div>
          <div className={cn("w-16 h-20 flex items-center justify-center rounded-md", flashB && "animate-flash")} style={{ backgroundColor: teamBColor }}>
            <span className="text-5xl">{teamBFouls}</span>
          </div>
        </div>

        {/* Bottom Row: Half */}
        <div className="relative z-10 px-8 py-2 bg-gray-900/70 rounded-md">
          <span className="text-2xl">{half}</span>
        </div>
      </div>
    </div>
  );
};

// Helper hook to get previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default Scoreboard2;
