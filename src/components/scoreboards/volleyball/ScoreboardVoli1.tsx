
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

const BackgroundElement = ({ style, color }: { style: VolleyballLayoutStyle, color?: string }) => {
  if (style.visible === false) return null;
  
  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${style.x}px`,
    top: `${style.y}px`,
    width: `${style.width}px`,
    height: `${style.height}px`,
    backgroundColor: color,
  };

  return <div style={elementStyle} />;
};


const ScoreboardVoli1 = () => {
    const { scoreboard, loading } = useVolleyballData();

    if (loading || !scoreboard || !scoreboard.layout) {
        return <div className="w-[1048px] h-56 flex items-center justify-center bg-black/20 text-white">Loading...</div>;
    }

    const { teamAName, teamBName, teamASets, teamBSets, teamAColor, teamBColor, logoSrc, matchTitle, layout } = scoreboard;
    const isSvg = logoSrc?.startsWith('data:image/svg+xml');

    return (
        <div className="w-[1048px] h-224px] relative font-display">
            {/* Backgrounds */}
            <BackgroundElement style={layout.model1_teamABox} color={teamAColor} />
            <BackgroundElement style={layout.model1_teamBBox} color={teamBColor} />
            <BackgroundElement style={layout.model1_centerScoreBox} color={'#0F172A'} />
            <BackgroundElement style={layout.model1_matchTitleBox} color={'#0F172A'} />

            {/* Team Names */}
            <DynamicElement style={layout.model1_teamAName} text={teamAName} isVisible={layout.model1_teamAName.visible} />
            <DynamicElement style={layout.model1_teamBName} text={teamBName} isVisible={layout.model1_teamBName.visible} />

            {/* Sets */}
            <DynamicElement style={layout.model1_teamASets} text={teamASets.toString()} isVisible={layout.model1_teamASets.visible} />
            <DynamicElement style={layout.model1_teamBSets} text={teamBSets.toString()} isVisible={layout.model1_teamBSets.visible} />

            {/* Match Title */}
            <DynamicElement style={layout.model1_matchTitleText} text={matchTitle} isVisible={layout.model1_matchTitleText.visible} />
            
            {/* Logo */}
            <DynamicElement style={layout.model1_logo} isVisible={layout.model1_logo.visible}>
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

export default ScoreboardVoli1;
