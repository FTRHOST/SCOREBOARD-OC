
"use client";

import { useScoreboardData } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import Image from 'next/image';

const Scoreboard1 = () => {
  const { scoreboard, loading } = useScoreboardData();

  if (loading) {
    return (
       <div className="w-full max-w-6xl aspect-[1048/227] flex items-center justify-center text-white font-display">
        Loading Scoreboard...
      </div>
    );
  }
  
  if (!scoreboard) {
    return (
      <div className="w-full max-w-6xl aspect-[1048/227] flex items-center justify-center text-white font-display">
        Scoreboard data not available.
      </div>
    );
  }

  const { teamAName, teamBName, teamAScore, teamBScore, half, teamAColor, teamBColor, logoSrc } = scoreboard;

  return (
    <div className="w-full max-w-6xl mx-auto aspect-[1048/227] relative font-display text-white">
      {/* Layer 1: Backgrounds */}
      <div className="absolute inset-0">
        {/* Team A Name BG */}
        <div style={{ backgroundColor: teamAColor }} className="absolute top-[41px] left-0 w-[320px] h-[105px]" />
        {/* Scoreboard BG */}
        <div className="absolute top-[41px] left-1/2 -translate-x-1/2 bg-[#05183b] w-[408px] h-[105px]" />
        {/* Team B Name BG */}
        <div style={{ backgroundColor: teamBColor }} className="absolute top-[41px] right-0 w-[320px] h-[105px]" />
        {/* Half BG */}
        <div className="absolute top-[179px] left-1/2 -translate-x-1/2 bg-[#05183b] w-[233px] h-[48px]" />
      </div>

      {/* Layer 2: Text Content (Scores, Names, Half) */}
      <div className="absolute inset-0">
        {/* Team A Name */}
        <div className="absolute top-[41px] left-0 w-[320px] h-[103px] flex items-center justify-center text-[82px] truncate px-2">
          {teamAName}
        </div>
        {/* Team B Name */}
        <div className="absolute top-[41px] right-0 w-[320px] h-[103px] flex items-center justify-center text-[82px] truncate px-2">
          {teamBName}
        </div>
        {/* Scores */}
        <div className="absolute top-[41px] left-1/2 -translate-x-1/2 w-[408px] h-[105px] flex items-center justify-between text-[96px] px-[31px]">
          <div className="absolute top-[-21px] left-[31px]">
             <AnimatedNumber value={teamAScore} />
          </div>
           <div className="absolute top-[-21px] right-[31px]">
             <AnimatedNumber value={teamBScore} />
          </div>
        </div>
        {/* Half Text */}
        <div className="absolute top-[179px] left-1/2 -translate-x-1/2 w-[233px] h-[48px] flex items-center justify-center text-[34px]">
          {half}
        </div>
      </div>
      
      {/* Layer 3: Logo (On Top) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[238px] h-[188px] flex items-center justify-center">
         <div className="relative w-full h-full">
           {logoSrc ? (
              <Image 
                src={logoSrc} 
                alt="Uploaded Logo" 
                fill
                style={{objectFit: "contain"}}
              />
            ) : (
              <OsisCupLogo className="w-full h-full text-white" />
            )}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard1;
