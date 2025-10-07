"use client";

import { useScoreboard } from "@/context/ScoreboardContext";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";

const Scoreboard1 = () => {
  const { teamAName, teamBName, teamAScore, teamBScore, half, teamAColor, teamBColor } = useScoreboard();

  return (
    <div className="bg-green-500 flex flex-col items-center justify-center p-4 font-display text-white w-full max-w-4xl scale-[0.7] sm:scale-100">
      <div className="relative flex items-center justify-center w-full my-4">
        {/* Team A */}
        <div 
          className="flex-1 flex items-center justify-center h-24"
          style={{ backgroundColor: teamAColor }}
        >
          <span className="text-6xl font-bold truncate px-4">{teamAName}</span>
        </div>

        {/* Score A */}
        <div className="bg-gray-900/80 h-24 w-24 flex items-center justify-center">
          <AnimatedNumber value={teamAScore} className="text-7xl font-bold" />
        </div>

        {/* Logo */}
        <div className="relative bg-gray-900/80 h-32 w-48 flex items-center justify-center">
           <OsisCupLogo className="w-36 h-36 text-white" />
        </div>
        
        {/* Score B */}
        <div className="bg-gray-900/80 h-24 w-24 flex items-center justify-center">
          <AnimatedNumber value={teamBScore} className="text-7xl font-bold" />
        </div>

        {/* Team B */}
        <div 
          className="flex-1 flex items-center justify-center h-24"
          style={{ backgroundColor: teamBColor }}
        >
          <span className="text-6xl font-bold truncate px-4">{teamBName}</span>
        </div>
      </div>
      
      {/* Half Display */}
      <div className="mt-2 px-8 py-2 bg-gray-900/80 rounded-md">
        <span className="text-3xl">{half}</span>
      </div>
    </div>
  );
};

export default Scoreboard1;
