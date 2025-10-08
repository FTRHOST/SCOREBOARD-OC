
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
  
  if (loading) {
    return (
      <div className="w-[1048px] h-[288px] flex items-center justify-center text-white font-display bg-black/20">
         <OsisCupLogo className="w-32 h-32 text-white/50 animate-pulse" />
      </div>
    );
  }
  
  if (!scoreboard) {
      return (
          <div className="w-[1048px] h-[288px] flex items-center justify-center text-white font-display bg-black/20">
              Scoreboard data not available.
          </div>
      );
  }

  const { teamAName, teamBName, teamAScore, teamBScore, teamAFouls, teamBFouls, time, half, teamAColor, teamBColor, logoSrc } = scoreboard;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="w-[1048px] h-[291px] relative font-display text-white">
        {/* Nama Tim Backgrounds */}
        <div className="w-80 h-[105px] left-0 top-[41px] absolute" style={{backgroundColor: teamAColor || '#B62FCE'}} />
        <div className="w-80 h-[105px] left-[728px] top-[41px] absolute" style={{backgroundColor: teamBColor || '#EF7438'}} />

        {/* Tengah Background */}
        <div className="w-[408px] h-[105px] left-[320px] top-[41px] absolute bg-[#05183B]" />
        <div className="w-[233px] h-[79px] left-[407px] top-[153px] absolute bg-[#05183B]" />
        <div className="w-[233px] h-[48px] left-[407px] top-[243px] absolute bg-[#05183B]" />

        {/* Fouls Backgrounds */}
        <div className={cn("w-[72px] h-[79px] left-[320px] top-[153px] absolute", flashA && "animate-flash")} style={{backgroundColor: teamAColor || '#B62FCE'}} />
        <div className={cn("w-[72px] h-[79px] left-[656px] top-[153px] absolute", flashB && "animate-flash")} style={{backgroundColor: teamBColor || '#EF7438'}}/>

        {/* Nama Tim Text */}
        <div className="w-80 h-[103px] left-0 top-[41px] absolute flex items-center justify-center text-7xl text-center truncate px-2">{teamAName}</div>
        <div className="w-80 h-[103px] left-[728px] top-[41px] absolute flex items-center justify-center text-7xl text-center truncate px-2">{teamBName}</div>
        
        {/* Skor Text */}
        <div className="left-[351px] top-[-21px] absolute text-white text-[96px] mt-[18px]">
             <AnimatedNumber value={teamAScore} />
        </div>
        <div className="left-[652px] top-[-21px] absolute text-white text-[96px] mt-[18px]">
            <AnimatedNumber value={teamBScore} />
        </div>

        {/* Fouls Text */}
        <div className="left-[328px] top-[132px] absolute text-white text-8xl">
            <AnimatedNumber value={teamAFouls} />
        </div>
        <div className="left-[673px] top-[129px] absolute text-white text-8xl">
            <AnimatedNumber value={teamBFouls} />
        </div>

        {/* Waktu & Babak Text */}
        <div className="w-[233px] h-[79px] left-[407px] top-[153px] absolute flex items-center justify-center text-6xl">{formatTime(time)}</div>
        <div className="w-[233px] h-[48px] left-[407px] top-[243px] absolute flex items-center justify-center text-4xl">{half}</div>
        
        {/* Logo */}
        <div className="w-[238px] h-[188px] left-[405px] top-0 absolute flex items-center justify-center">
            {logoSrc ? (
                <div className="relative w-full h-full">
                    <Image 
                        src={logoSrc} 
                        alt="Uploaded Logo" 
                        fill
                        style={{objectFit: "contain"}}
                    />
                </div>
            ) : (
                <OsisCupLogo className="w-full h-full text-white" />
            )}
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

    