"use client";

import React, { useEffect, useState } from 'react';
import { useScoreboardData } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import { cn } from "@/lib/utils";
import Image from 'next/image';

const Scoreboard3 = () => {
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


  if (loading || !scoreboard) {
    return (
         <div className="bg-green-500 p-2 rounded-lg w-full max-w-md font-display text-white shadow-2xl scale-[0.7] sm:scale-100 flex items-center justify-center">
            <OsisCupLogo className="w-24 h-24 text-primary animate-pulse" />
        </div>
    );
  }

  const { teamAName, teamBName, teamAScore, teamBScore, teamAFouls, teamBFouls, time, half, teamAColor, teamBColor, logoSrc } = scoreboard;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const getShortHalf = (fullHalf: string) => {
    const words = fullHalf.toLowerCase().split(' ');
    if (words.includes('1') || words.includes('first')) return '1st';
    if (words.includes('2') || words.includes('second')) return '2nd';
    if (words.includes('extra')) return 'ET';
    return fullHalf.substring(0, 3).toUpperCase();
  }

  return (
    <div className="bg-green-500 p-2 rounded-lg w-full max-w-md font-display text-white shadow-2xl scale-[0.7] sm:scale-100">
      <div className="flex w-full h-auto">
        {/* Logo Section */}
        <div className="bg-white rounded-l-md w-1/3 flex items-center justify-center p-2 relative">
          {logoSrc ? (
            <Image src={logoSrc} alt="Uploaded Logo" layout="fill" objectFit="contain" />
          ) : (
            <OsisCupLogo className="w-full h-full text-primary" />
          )}
        </div>

        {/* Info Section */}
        <div className="w-2/3 grid grid-cols-3 grid-rows-3 gap-px text-center">
          {/* Row 1: Team A, Score A, Foul A */}
          <div className="flex items-center justify-center p-1 text-lg truncate" style={{ backgroundColor: teamAColor }}>{teamAName}</div>
          <div className="bg-gray-900/70 flex items-center justify-center text-4xl"><AnimatedNumber value={teamAScore} /></div>
          <div className={cn("flex items-center justify-center text-4xl", flashA && "animate-flash")} style={{ backgroundColor: teamAColor }}>{teamAFouls}</div>

          {/* Row 2: Team B, Score B, Foul B */}
          <div className="flex items-center justify-center p-1 text-lg truncate" style={{ backgroundColor: teamBColor }}>{teamBName}</div>
          <div className="bg-gray-900/70 flex items-center justify-center text-4xl"><AnimatedNumber value={teamBScore} /></div>
          <div className={cn("flex items-center justify-center text-4xl", flashB && "animate-flash")} style={{ backgroundColor: teamBColor }}>{teamBFouls}</div>

          {/* Row 3: Half, Timer */}
          <div className="bg-gray-900/70 flex items-center justify-center text-2xl">{getShortHalf(half)}</div>
          <div className="col-span-2 bg-gray-700/80 flex items-center justify-center text-3xl">{formatTime(time)}</div>
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


export default Scoreboard3;
