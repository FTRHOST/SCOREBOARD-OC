"use client";
import React from 'react';
import { useVolleyballData } from '@/hooks/useVolleyballData';
import Image from 'next/image';
import { OsisCupLogo } from '@/components/icons/OsisCupLogo';

const ScoreboardVoli2 = () => {
    const { scoreboard, loading } = useVolleyballData();

    if (loading || !scoreboard) {
        return <div className="w-[1049px] h-64 flex items-center justify-center bg-gray-800 text-white">Loading...</div>;
    }

    const { teamAName, teamBName, teamASets, teamBSets, teamAColor, teamBColor, logoSrc, matchTitle, setHistory } = scoreboard;
    const isSvg = logoSrc?.startsWith('data:image/svg+xml');

    return (
        <div className="w-[1049px] h-64 relative font-display">
            {/* Center Score Box */}
            <div className="w-96 h-28 left-[321px] top-[41px] absolute">
                <div className="w-96 h-28 left-0 top-0 absolute bg-slate-900"></div>
                <div className="absolute left-[31px] top-[-21px] w-24 h-24 flex items-center justify-center text-white text-8xl">{teamASets}</div>
                <div className="absolute left-[270px] top-[-21px] w-24 h-24 flex items-center justify-center text-white text-8xl">{teamBSets}</div>
            </div>

            {/* Team B Box */}
            <div className="w-80 h-28 left-[729px] top-[41px] absolute" style={{backgroundColor: teamBColor}}>
                <div className="w-full h-full flex items-center justify-center text-center text-white text-7xl p-2 truncate">{teamBName}</div>
            </div>
            
            {/* Team A Box */}
            <div className="w-80 h-28 left-[1px] top-[41px] absolute" style={{backgroundColor: teamAColor}}>
                <div className="w-full h-full flex items-center justify-center text-center text-white text-7xl p-2 truncate">{teamAName}</div>
            </div>

            {/* Team B Set History */}
            <div className="h-28 left-[727px] top-[146px] absolute rounded-[5px] border border-purple-500 inline-flex justify-center items-center gap-10 overflow-hidden px-4">
                {setHistory.slice(0, 3).map((set, index) => (
                    <div key={index} className="w-20 h-28 relative">
                        <div className="w-20 h-20 left-0 top-[24px] absolute" style={{backgroundColor: teamBColor}}></div>
                        <div className="w-full left-0 top-0 absolute text-center text-white text-7xl">{set.teamBScore}</div>
                    </div>
                ))}
            </div>

            {/* Team A Set History */}
            <div className="h-28 left-0 top-[146px] absolute rounded-[5px] border border-purple-500 inline-flex justify-center items-center gap-10 overflow-hidden px-4">
                 {setHistory.slice(0, 3).map((set, index) => (
                    <div key={index} className="w-20 h-28 relative">
                        <div className="w-20 h-20 left-0 top-[21px] absolute" style={{backgroundColor: teamAColor}}></div>
                        <div className="w-full left-0 top-0 absolute text-center text-white text-7xl">{set.teamAScore}</div>
                    </div>
                ))}
            </div>

            {/* Match Title */}
            <div className="w-60 h-12 left-[408px] top-[189px] absolute bg-slate-900 flex justify-center items-center">
                <div className="text-center text-white text-4xl">{matchTitle}</div>
            </div>

            {/* Logo */}
            <div className="w-60 h-48 left-[406px] top-0 absolute flex items-center justify-center">
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

export default ScoreboardVoli2;
