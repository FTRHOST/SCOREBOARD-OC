
"use client";
import React from 'react';
import { useVolleyballData } from '@/hooks/useVolleyballData';
import Image from 'next/image';
import { OsisCupLogo } from '@/components/icons/OsisCupLogo';

const ScoreboardVoli1 = () => {
    const { scoreboard, loading } = useVolleyballData();

    if (loading || !scoreboard) {
        return <div className="w-[1048px] h-56 flex items-center justify-center bg-gray-800 text-white">Loading...</div>;
    }

    const { teamAName, teamBName, teamASets, teamBSets, teamAColor, teamBColor, logoSrc, matchTitle } = scoreboard;
    const isSvg = logoSrc?.startsWith('data:image/svg+xml');

    return (
        <div className="w-[1048px] h-56 relative font-display">
            {/* Center Score Box */}
            <div className="w-96 h-28 left-[320px] top-[41px] absolute">
                <div className="w-96 h-28 left-0 top-0 absolute bg-slate-900"></div>
                <div className="absolute left-[31px] top-[-21px] w-24 h-24 flex items-center justify-center text-white text-8xl">{teamASets}</div>
                <div className="absolute left-[270px] top-[-21px] w-24 h-24 flex items-center justify-center text-white text-8xl">{teamBSets}</div>
            </div>
            
            {/* Match Title */}
            <div className="w-60 h-12 left-[407px] top-[178px] absolute bg-slate-900 flex items-center justify-center">
                <div className="text-center text-white text-4xl">{matchTitle}</div>
            </div>

            {/* Team B Box */}
            <div className="w-80 h-28 left-[728px] top-[41px] absolute" style={{backgroundColor: teamBColor}}>
                <div className="w-full h-full flex items-center justify-center text-center text-white text-7xl p-2 truncate">{teamBName}</div>
            </div>

            {/* Team A Box */}
            <div className="w-80 h-28 left-0 top-[41px] absolute" style={{backgroundColor: teamAColor}}>
                <div className="w-full h-full flex items-center justify-center text-center text-white text-7xl p-2 truncate">{teamAName}</div>
            </div>
            
            {/* Logo */}
            <div className="w-60 h-48 left-[405px] top-0 absolute flex items-center justify-center">
                 {logoSrc ? (
                    <div className="relative w-full h-full">
                    {isSvg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoSrc} alt="Uploaded Logo" className="w-full h-full object-contain" />
                    ) : (
                        <Image 
                        src={logoSrc} 
                        alt="Uploaded Logo" 
                        fill
                        style={{objectFit: "contain"}}
                        />
                    )}
                    </div>
                ) : (
                    <OsisCupLogo className="w-full h-full text-white" />
                )}
            </div>
        </div>
    );
};

export default ScoreboardVoli1;
