
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

const ScoreboardVoli3 = () => {
    const { scoreboard, loading } = useVolleyballData();

    if (loading || !scoreboard || !scoreboard.layout) {
        return <div className="w-[673px] h-52 flex items-center justify-center bg-gray-800 text-white">Loading...</div>;
    }

    const { teamAName, teamBName, teamASets, teamBSets, teamAPoints, teamBPoints, teamAColor, teamBColor, logoSrc, matchTitle, setHistory, currentSet, layout } = scoreboard;
    const isSvg = logoSrc?.startsWith('data:image/svg+xml');
    
    const displayHistory = [...setHistory];
    if (currentSet >= 1 && currentSet <= setHistory.length) {
        displayHistory[currentSet - 1] = {
            teamAScore: teamAPoints,
            teamBScore: teamBPoints,
        };
    }

    return (
        <div className="w-[673px] h-52 relative font-display">
            {/* Backgrounds */}
            <BackgroundElement style={layout.model3_teamANameBox} color={teamAColor} />
            <BackgroundElement style={layout.model3_teamBNameBox} color={teamBColor} />
            <BackgroundElement style={layout.model3_teamASetBox} color={'#0F172A'} />
            <BackgroundElement style={layout.model3_teamBSetBox} color={'#0F172A'} />
            <BackgroundElement style={layout.model3_logoBox} color={'white'} className="flex items-center justify-center p-2" />
            <BackgroundElement style={layout.model3_matchTitleBox} color={'#0F172A'} />

            {/* Set History Containers */}
             <BackgroundElement style={layout.model3_teamASetHistoryBox} className="p-5 rounded-[5px] border border-purple-500 inline-flex justify-center items-center gap-[3px] overflow-hidden">
                {displayHistory.slice(0, 3).map((set, index) => (
                     <div key={index} className="flex-1 h-16 relative flex justify-center items-center" style={{backgroundColor: teamAColor}}>
                        <div className="text-center text-white text-6xl">{set.teamAScore}</div>
                    </div>
                ))}
            </BackgroundElement>
             <BackgroundElement style={layout.model3_teamBSetHistoryBox} className="p-5 rounded-[5px] border border-purple-500 inline-flex justify-center items-center gap-[3px] overflow-hidden">
                {displayHistory.slice(0, 3).map((set, index) => (
                     <div key={index} className="flex-1 h-16 relative flex justify-center items-center" style={{backgroundColor: teamBColor}}>
                        <div className="text-center text-white text-6xl">{set.teamBScore}</div>
                    </div>
                ))}
            </BackgroundElement>


            {/* Dynamic Content */}
            <DynamicElement style={layout.model3_teamANameText} text={teamAName} isVisible={layout.model3_teamANameText.visible} />
            <DynamicElement style={layout.model3_teamBNameText} text={teamBName} isVisible={layout.model3_teamBNameText.visible} />
            <DynamicElement style={layout.model3_teamASetsText} text={teamASets.toString()} isVisible={layout.model3_teamASetsText.visible} />
            <DynamicElement style={layout.model3_teamBSetsText} text={teamBSets.toString()} isVisible={layout.model3_teamBSetsText.visible} />
            <DynamicElement style={layout.model3_matchTitleText} text={matchTitle} isVisible={layout.model3_matchTitleText.visible} />

            {/* Logo */}
            <DynamicElement style={layout.model3_logoImage} isVisible={layout.model3_logoImage.visible}>
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
                    <OsisCupLogo className="w-full h-full text-black" />
                )}
            </DynamicElement>
        </div>
    );
};

export default ScoreboardVoli3;
