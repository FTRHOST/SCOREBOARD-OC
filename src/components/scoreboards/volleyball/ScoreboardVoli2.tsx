
"use client";
import React from 'react';
import { useVolleyballData, VolleyballLayoutStyle } from '@/hooks/useVolleyballData';
import Image from 'next/image';
import { OsisCupLogo } from '@/components/icons/OsisCupLogo';

const DynamicElement = ({ style, children, text, isVisible }: { style: VolleyballLayoutStyle, children?: React.ReactNode, text?: string, isVisible?: boolean }) => {
  if (isVisible === false) return null;
  
  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${style.x}px`,
    top: `${style.y}px`,
    width: `${style.width}px`,
    height: `${style.height}px`,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 1.1,
  };

  return (
    <div style={elementStyle}>
      <div className="truncate px-2">
        {text}
        {children}
      </div>
    </div>
  );
};

const BackgroundElement = ({ style, color, children, className }: { style: VolleyballLayoutStyle, color?: string, children?: React.ReactNode, className?: string }) => {
  if (style.visible === false) return null;
  
  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${style.x}px`,
    top: `${style.y}px`,
    width: `${style.width}px`,
    height: `${style.height}px`,
    backgroundColor: color,
  };

  return <div style={elementStyle} className={className}>{children}</div>;
};

const ScoreboardVoli2 = () => {
    const { scoreboard, loading } = useVolleyballData();

    if (loading || !scoreboard || !scoreboard.layout) {
        return <div className="w-[1049px] h-64 flex items-center justify-center bg-gray-800 text-white">Loading...</div>;
    }

    const { teamAName, teamBName, teamASets, teamBSets, teamAColor, teamBColor, logoSrc, matchTitle, setHistory, teamAPoints, teamBPoints, currentSet, layout } = scoreboard;
    const isSvg = logoSrc?.startsWith('data:image/svg+xml');

    const displayHistory = [...setHistory];
    if (currentSet >= 1 && currentSet <= setHistory.length) {
        displayHistory[currentSet - 1] = {
            teamAScore: teamAPoints,
            teamBScore: teamBPoints,
        };
    }

    return (
        <div className="w-[1049px] h-64 relative font-display">
            {/* Backgrounds */}
            <BackgroundElement style={layout.model2_teamABox} color={teamAColor} />
            <BackgroundElement style={layout.model2_teamBBox} color={teamBColor} />
            <BackgroundElement style={layout.model2_centerScoreBox} color={'#0F172A'} />
            <BackgroundElement style={layout.model2_matchTitleBox} color={'#0F172A'} />
            
            {/* Set History Backgrounds (as containers) */}
            <BackgroundElement style={layout.model2_teamASetHistoryBox} className="inline-flex justify-center items-center gap-10 overflow-hidden px-4">
                {displayHistory.slice(0, 3).map((set, index) => (
                    <div key={index} className="w-20 h-28 relative">
                        <div className="w-20 h-20 left-0 top-[21px] absolute" style={{backgroundColor: teamAColor}}></div>
                        <div className="w-full left-0 top-0 absolute text-center text-white text-7xl">{set.teamAScore}</div>
                    </div>
                ))}
            </BackgroundElement>
            <BackgroundElement style={layout.model2_teamBSetHistoryBox} className="inline-flex justify-center items-center gap-10 overflow-hidden px-4">
                {displayHistory.slice(0, 3).map((set, index) => (
                    <div key={index} className="w-20 h-28 relative">
                        <div className="w-20 h-20 left-0 top-[24px] absolute" style={{backgroundColor: teamBColor}}></div>
                        <div className="w-full left-0 top-0 absolute text-center text-white text-7xl">{set.teamBScore}</div>
                    </div>
                ))}
            </BackgroundElement>

            {/* Team Names */}
            <DynamicElement style={layout.model2_teamAName} text={teamAName} isVisible={layout.model2_teamAName.visible} />
            <DynamicElement style={layout.model2_teamBName} text={teamBName} isVisible={layout.model2_teamBName.visible} />
            
            {/* Main Sets */}
            <DynamicElement style={layout.model2_teamASets} text={teamASets.toString()} isVisible={layout.model2_teamASets.visible} />
            <DynamicElement style={layout.model2_teamBSets} text={teamBSets.toString()} isVisible={layout.model2_teamBSets.visible} />
            
            {/* Match Title */}
            <DynamicElement style={layout.model2_matchTitleText} text={matchTitle} isVisible={layout.model2_matchTitleText.visible} />

            {/* Logo */}
            <DynamicElement style={layout.model2_logo} isVisible={layout.model2_logo.visible}>
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
            </DynamicElement>
        </div>
    );
};

export default ScoreboardVoli2;
