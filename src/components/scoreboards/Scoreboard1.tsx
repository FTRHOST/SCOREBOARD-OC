"use client";

import { useScoreboard } from "@/context/ScoreboardContext";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import Image from 'next/image';

const Scoreboard1 = () => {
  const { teamAName, teamBName, teamAScore, teamBScore, half, teamAColor, teamBColor, logoSrc } = useScoreboard();

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

        {/* Team A Score */}
        <div className="bg-[#05183b] h-24 w-24 flex items-center justify-center">
          <AnimatedNumber value={teamAScore} className="text-7xl font-bold" />
        </div>

        {/* Logo */}
        <div className="relative bg-[#05183b] h-32 w-48 flex items-center justify-center z-10">
           {logoSrc ? (
            <Image src={logoSrc} alt="Uploaded Logo" layout="fill" objectFit="contain" />
          ) : (
            <OsisCupLogo className="w-36 h-36 text-white" />
          )}
        </div>
        
        {/* Team B Score */}
        <div className="bg-[#05183b] h-24 w-24 flex items-center justify-center">
          <AnimatedNumber value={teamBScore} className="text-7xl font-bold" />
        </div>

        {/* Team B Name */}
        <div 
          className="flex-1 flex items-center justify-center h-24"
          style={{ backgroundColor: teamBColor }}
        >
          <span className="text-6xl font-bold truncate px-4">{teamBName}</span>
        </div>
      </div>
      
      {/* Half Display */}
      <div className="mt-4 px-8 py-2 bg-[#05183b] rounded-md">
        <span className="text-3xl">{half}</span>
      </div>
    </div>
  );
};

export default Scoreboard1;
