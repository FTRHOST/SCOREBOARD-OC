"use client";

import { useScoreboard } from "@/context/ScoreboardContext";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";

const Scoreboard1 = () => {
  const { teamAName, teamBName, teamAScore, teamBScore, half, teamAColor, teamBColor } = useScoreboard();

  return (
    <div className="bg-green-500 p-4 rounded-lg w-full max-w-2xl font-display text-white shadow-2xl scale-[0.7] sm:scale-100">
      <div className="relative w-full h-64 flex flex-col items-center justify-center">
        {/* Logo in background */}
        <OsisCupLogo className="absolute inset-0 m-auto w-36 h-36 text-white/10" />

        {/* Score and Team Names Row */}
        <div className="relative z-10 w-full flex items-center justify-between px-4">
          {/* Team A Name */}
          <div className="w-1/3 h-24 flex items-center justify-center rounded-md" style={{ backgroundColor: teamAColor }}>
            <span className="text-4xl lg:text-5xl truncate px-2">{teamAName}</span>
          </div>
          
          {/* Scores */}
          <div className="flex items-center justify-center w-1/3 h-24 bg-gray-900/70 rounded-md">
            <AnimatedNumber value={teamAScore} className="text-6xl lg:text-7xl w-1/2 text-center" />
            <span className="text-6xl lg:text-7xl">:</span>
            <AnimatedNumber value={teamBScore} className="text-6xl lg:text-7xl w-1/2 text-center" />
          </div>
          
          {/* Team B Name */}
          <div className="w-1/3 h-24 flex items-center justify-center rounded-md" style={{ backgroundColor: teamBColor }}>
             <span className="text-4xl lg:text-5xl truncate px-2">{teamBName}</span>
          </div>
        </div>

        {/* Half Display */}
        <div className="relative z-10 mt-4 px-8 py-2 bg-gray-900/70 rounded-md">
          <span className="text-2xl">{half}</span>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard1;
