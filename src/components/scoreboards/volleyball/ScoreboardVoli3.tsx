"use client";
import React from 'react';
import { useVolleyballData } from '@/hooks/useVolleyballData';
import Image from 'next/image';
import { OsisCupLogo } from '@/components/icons/OsisCupLogo';

const ScoreboardVoli3 = () => {
    const { scoreboard, loading } = useVolleyballData();

    if (loading || !scoreboard) {
        return <div className="w-[673px] h-52 flex items-center justify-center bg-gray-800 text-white">Loading...</div>;
    }

    const { teamAName, teamBName, teamASets, teamBSets, teamAPoints, teamBPoints, teamAColor, teamBColor, logoSrc, matchTitle, setHistory } = scoreboard;
    const isSvg = logoSrc?.startsWith('data:image/svg+xml');

    return (
        <div className="w-[673px] h-52 relative font-display">
            {/* Team A Point Box */}
            <div className="w-40 h-16 left-[163px] top-[20px] absolute flex items-center justify-center" style={{backgroundColor: teamAColor}}>
                <div className="text-center text-white text-6xl">{teamAPoints}</div>
            </div>

            {/* Team B Point Box */}
            <div className="w-40 h-16 left-[163px] top-[90px] absolute flex items-center justify-center" style={{backgroundColor: teamBColor}}>
                <div className="text-center text-white text-6xl">{teamBPoints}</div>
            </div>
            
            {/* Team A Set Box */}
            <div className="w-20 h-16 left-[321px] top-[20px] absolute bg-slate-900 flex items-center justify-center">
                <div className="text-center text-white text-6xl">{teamASets}</div>
            </div>

            {/* Team B Set Box */}
            <div className="w-20 h-16 left-[321px] top-[92px] absolute bg-slate-900 flex items-center justify-center">
                <div className="text-center text-white text-6xl">{teamBSets}</div>
            </div>

            {/* Logo Box */}
            <div className="w-40 h-36 left-0 top-[20px] absolute bg-white flex items-center justify-center p-2">
                 {logoSrc ? (
                    <div className="relative w-[130px] h-[113px]">
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
                    <OsisCupLogo className="w-full h-full text-black" />
                )}
            </div>

            {/* Team A Set History */}
            <div className="w-72 p-5 left-[385px] top-0 absolute rounded-[5px] border border-purple-500 inline-flex justify-center items-center gap-[3px] overflow-hidden">
                {setHistory.slice(0, 3).map((set, index) => (
                     <div key={index} className="flex-1 h-16 relative bg-fuchsia-600 flex justify-center items-center">
                        <div className="text-center text-white text-6xl">{set.teamAScore}</div>
                    </div>
                ))}
            </div>

            {/* Team B Set History */}
            <div className="w-72 p-5 left-[385px] top-[73px] absolute rounded-[5px] border border-purple-500 inline-flex justify-center items-center gap-[3px] overflow-hidden">
                {setHistory.slice(0, 3).map((set, index) => (
                     <div key={index} className="flex-1 h-16 relative bg-orange-400 flex justify-center items-center">
                        <div className="text-center text-white text-6xl">{set.teamBScore}</div>
                    </div>
                ))}
            </div>

            {/* Match Title */}
            <div className="w-[673px] h-12 left-0 top-[164px] absolute bg-slate-900 flex justify-center items-center">
                <div className="text-center text-white text-4xl">{matchTitle}</div>
            </div>
        </div>
    );
};

export default ScoreboardVoli3;
