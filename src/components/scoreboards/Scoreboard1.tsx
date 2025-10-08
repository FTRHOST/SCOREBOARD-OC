
"use client";

import { useScoreboardData } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import Image from 'next/image';

const Scoreboard1 = () => {
  const { scoreboard, loading } = useScoreboardData();

  if (loading || !scoreboard) {
    return (
      <div className="bg-[#00ff00] flex flex-col items-center justify-center p-4 font-display text-white w-full h-full">
        <OsisCupLogo className="w-36 h-36 text-white animate-pulse" />
        <div className="mt-4 text-3xl">Loading Scoreboard...</div>
      </div>
    );
  }

  const { teamAName, teamBName, teamAScore, teamBScore, half, teamAColor, teamBColor, logoSrc } = scoreboard;

  return (
    <div className="bg-[#00ff00] flex flex-col items-center justify-center p-4 font-display text-white w-full h-full">
      <div className="relative flex items-center justify-center w-full my-4 scale-[0.7] sm:scale-90 md:scale-100 max-w-6xl">
        {/* Team A Name */}
        <div 
          className="flex-1 flex items-center justify-center h-24"
          style={{ backgroundColor: teamAColor }}
        >
          <span className="text-6xl font-bold truncate px-4">{teamAName}</span>
        </div>

        {/* Scores container */}
        <div className="flex items-center justify-center bg-[#05183b] h-24">
            {/* Team A Score */}
            <div className="h-24 w-24 flex items-center justify-center">
              <AnimatedNumber value={teamAScore} className="text-7xl font-bold" />
            </div>

            {/* Separator / Placeholder for Logo */}
            <div className="h-24 w-48" />

            {/* Team B Score */}
            <div className="h-24 w-24 flex items-center justify-center">
              <AnimatedNumber value={teamBScore} className="text-7xl font-bold" />
            </div>
        </div>

        {/* Team B Name */}
        <div 
          className="flex-1 flex items-center justify-center h-24"
          style={{ backgroundColor: teamBColor }}
        >
          <span className="text-6xl font-bold truncate px-4">{teamBName}</span>
        </div>

        {/* Logo (Absolutely Positioned) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-48 flex items-center justify-center z-10">
           {logoSrc ? (
            <div className="relative w-full h-full">
              <Image src={logoSrc} alt="Uploaded Logo" layout="fill" objectFit="contain" style={{position: 'absolute', height: '188px', width: '238px', inset: '0px', objectFit: 'contain', color: 'transparent'}}/>
            </div>
          ) : (
            <OsisCupLogo className="w-36 h-36 text-white" />
          )}
        </div>
      </div>
      
      {/* Half Display */}
      <div className="px-8 py-2 bg-[#05183b]">
        <span className="text-3xl">{half}</span>
      </div>
    </div>
  );
};

export default Scoreboard1;
