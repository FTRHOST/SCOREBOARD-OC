
"use client";

import { useScoreboardData } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import Image from 'next/image';

const Scoreboard1 = () => {
  const { scoreboard, loading } = useScoreboardData();

  if (loading) {
    return (
       <div className="w-[1048px] h-[227px] flex items-center justify-center text-white font-display">
        Loading Scoreboard...
      </div>
    );
  }
  
  if (!scoreboard) {
    return (
      <div className="w-[1048px] h-[227px] flex items-center justify-center text-white font-display">
        Scoreboard data not available.
      </div>
    );
  }

  const { teamAName, teamBName, teamAScore, teamBScore, half, teamAColor, teamBColor, logoSrc } = scoreboard;

  return (
    <div className="w-[1048px] h-[227px] relative font-display text-white">
      {/* Backgrounds */}
      <div 
        className="w-80 h-[105px] left-0 top-[41px] absolute"
        style={{ backgroundColor: teamAColor || '#B62FCE' }}
      />
      <div 
        className="w-80 h-[105px] left-[728px] top-[41px] absolute"
        style={{ backgroundColor: teamBColor || '#EF7438' }}
      />
      <div className="w-[408px] h-[105px] left-[320px] top-[41px] absolute bg-[#05183B]" />
      <div className="w-[233px] h-12 left-[405px] top-[179px] absolute bg-[#05183B]" />

      {/* Team Names */}
      <div className="w-80 h-[103px] left-0 top-[41px] absolute flex items-center justify-center text-white text-7xl text-center truncate px-2">
        {teamAName}
      </div>
      <div className="w-80 h-[103px] left-[728px] top-[41px] absolute flex items-center justify-center text-white text-7xl text-center truncate px-2">
        {teamBName}
      </div>

      {/* Scores */}
      <div className="left-[351px] top-[20px] absolute text-white text-8xl">
        <AnimatedNumber value={teamAScore} />
      </div>
      <div className="left-[652px] top-[20px] absolute text-white text-8xl">
        <AnimatedNumber value={teamBScore} />
      </div>
      
      {/* Half */}
      <div className="w-[233px] h-12 left-[405px] top-[179px] absolute flex items-center justify-center text-white text-4xl">
        {half}
      </div>

      {/* Logo */}
      <div className="w-[238px] h-[188px] left-[405px] top-0 absolute">
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

export default Scoreboard1;
