
"use client";

import { useScoreboardData } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import Image from 'next/image';

const Scoreboard1 = () => {
  const { scoreboard, loading } = useScoreboardData();

  if (loading || !scoreboard) {
    return (
      <div className="w-full max-w-6xl aspect-[1048/227] flex items-center justify-center bg-gray-800 text-white font-display">
        Loading Scoreboard...
      </div>
    );
  }

  const { teamAName, teamBName, teamAScore, teamBScore, half, teamAColor, teamBColor, logoSrc } = scoreboard;

  return (
    <div className="w-full max-w-6xl aspect-[1048/227] relative font-display text-white bg-transparent">
      {/* Team Names Background */}
      <div className="absolute top-[41px] w-full h-[105px] flex justify-between">
        <div style={{ backgroundColor: teamAColor }} className="w-[30.5%] h-full"></div>
        <div style={{ backgroundColor: teamBColor }} className="w-[30.5%] h-full"></div>
      </div>
      
      {/* Central Scoreboard Background */}
      <div className="absolute top-[41px] left-1/2 -translate-x-1/2 w-[39%] h-[105px] bg-[#05183b]"></div>

      {/* Half Background */}
      <div className="absolute top-[179px] left-1/2 -translate-x-1/2 w-[22.2%] h-[48px] bg-[#05183b]"></div>
      
      {/* Content Layer */}
      <div className="absolute inset-0">
        {/* Team Names Text */}
        <div className="absolute top-[41px] w-full h-[105px] flex justify-between items-center text-[82px] px-[1.5%]">
            <div className="w-[30.5%] text-center truncate">{teamAName}</div>
            <div className="w-[30.5%] text-center truncate">{teamBName}</div>
        </div>

        {/* Scores */}
        <div className="absolute top-[20px] left-1/2 -translate-x-1/2 w-[39%] h-[105px] flex justify-between items-center text-[96px] px-[2.5%]">
          <AnimatedNumber value={teamAScore} />
          <AnimatedNumber value={teamBScore} />
        </div>

        {/* Half Text */}
        <div className="absolute top-[179px] left-1/2 -translate-x-1/2 w-[22.2%] h-[48px] flex items-center justify-center text-[34px]">
          {half}
        </div>
        
        {/* Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22.7%] h-[82.8%]">
          <div className="relative w-full h-full">
            {logoSrc ? (
              <Image 
                src={logoSrc} 
                alt="Uploaded Logo" 
                layout="fill"
                objectFit="contain"
              />
            ) : (
              <OsisCupLogo className="w-full h-full text-white" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard1;
