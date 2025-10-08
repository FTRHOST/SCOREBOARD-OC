
"use client";

import { useScoreboardData } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import Image from 'next/image';

const Scoreboard1 = () => {
  const { scoreboard, loading } = useScoreboardData();

  if (loading || !scoreboard) {
    return (
      <div className="w-full h-[227px] flex flex-col items-center justify-center p-4 font-display text-white bg-black/50">
        <OsisCupLogo className="w-36 h-36 text-white animate-pulse" />
        <div className="mt-4 text-3xl">Loading Scoreboard...</div>
      </div>
    );
  }

  const { teamAName, teamBName, teamAScore, teamBScore, half, teamAColor, teamBColor, logoSrc } = scoreboard;

  return (
    <div className="w-full relative h-[227px] text-center text-[96px] text-white font-display bg-[#00ff00]">

      {/* Nama Tim Container */}
      <div className="absolute top-[41px] left-0 w-[1048px] h-[105px] text-[82px]">
        {/* Nama Tim B */}
        <div className="absolute top-0 left-[728px] w-[320px] h-[105px] flex items-center justify-center" style={{ backgroundColor: teamBColor }}>
          <span className="truncate px-2">{teamBName}</span>
        </div>
        {/* Nama Tim A */}
        <div className="absolute top-0 left-0 w-[320px] h-[105px] flex items-center justify-center" style={{ backgroundColor: teamAColor }}>
          <span className="truncate px-2">{teamAName}</span>
        </div>
      </div>

      {/* Skor Container */}
      <div className="absolute top-[41px] left-1/2 -translate-x-1/2 w-[408px] h-[105px]">
        <div className="absolute inset-0 bg-[#05183b]"></div>
        {/* Skor A */}
        <div className="absolute top-[-21px] left-[31px]">
          <AnimatedNumber value={teamAScore} />
        </div>
        {/* Skor B */}
        <div className="absolute top-[-21px] left-[332px]">
          <AnimatedNumber value={teamBScore} />
        </div>
      </div>
      
      {/* Half Container */}
      <div className="absolute top-[179px] left-1/2 -translate-x-1/2 w-[233px] h-[48px] text-[34px]">
          <div className="absolute left-0 top-0 bg-[#05183b] w-[233px] h-[48px]"></div>
          <div className="absolute top-0 left-0 w-[233px] h-[48px] flex items-center justify-center">
              {half}
          </div>
      </div>
      
      {/* Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[238px] h-[188px]">
         {logoSrc ? (
            <Image 
              src={logoSrc} 
              alt="Uploaded Logo" 
              fill
              style={{objectFit: 'contain'}}
            />
          ) : (
            <OsisCupLogo className="w-full h-full text-white" />
          )}
      </div>

    </div>
  );
};

export default Scoreboard1;
