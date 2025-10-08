
"use client";

import { useScoreboardData, LayoutStyle } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import Image from 'next/image';

const DynamicElement = ({ style, color, children, text, isVisible }: { style: LayoutStyle, color?: string, children?: React.ReactNode, text?: string, isVisible?: boolean }) => {
  if (isVisible === false) return null;
  
  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${style.x}px`,
    top: `${style.y}px`,
    width: `${style.width}px`,
    height: `${style.height}px`,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    backgroundColor: color,
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


const Scoreboard1 = () => {
  const { scoreboard, loading } = useScoreboardData();

  if (loading || !scoreboard || !scoreboard.layout) {
    return (
       <div className="w-[1048px] h-[227px] flex items-center justify-center text-white font-display bg-black/20">
        Loading Scoreboard...
      </div>
    );
  }

  const { layout, teamAName, teamBName, teamAScore, teamBScore, half, teamAColor, teamBColor, logoSrc } = scoreboard;

  return (
    <div className="w-[1048px] h-[227px] relative font-display text-white">
      {/* Backgrounds */}
      <div style={{ position: 'absolute', left: `${layout.model1_teamAName.x}px`, top: `${layout.model1_teamAName.y}px`, width: `${layout.model1_teamAName.width}px`, height: `${layout.model1_teamAName.height}px`, backgroundColor: teamAColor || '#B62FCE' }} />
      <div style={{ position: 'absolute', left: `${layout.model1_teamBName.x}px`, top: `${layout.model1_teamBName.y}px`, width: `${layout.model1_teamBName.width}px`, height: `${layout.model1_teamBName.height}px`, backgroundColor: teamBColor || '#EF7438' }} />
      <div style={{ position: 'absolute', left: `${layout.model1_teamAScore.x - (layout.model1_teamAScore.width / 2)}px`, top: `${layout.model1_teamAScore.y}px`, width: `${(layout.model1_teamAScore.width * 2) + layout.model1_logo.width}px`, height: `${layout.model1_teamAScore.height}px`, backgroundColor: '#05183B' }} />
      <div style={{ position: 'absolute', left: `${layout.model1_half.x}px`, top: `${layout.model1_half.y}px`, width: `${layout.model1_half.width}px`, height: `${layout.model1_half.height}px`, backgroundColor: '#05183B' }} />

      {/* Team Names */}
      <DynamicElement style={layout.model1_teamAName} text={teamAName} isVisible={layout.model1_teamAName.visible} />
      <DynamicElement style={layout.model1_teamBName} text={teamBName} isVisible={layout.model1_teamBName.visible} />
      
      {/* Scores */}
      <DynamicElement style={layout.model1_teamAScore} isVisible={layout.model1_teamAScore.visible}>
        <AnimatedNumber value={teamAScore} />
      </DynamicElement>
      <DynamicElement style={layout.model1_teamBScore} isVisible={layout.model1_teamBScore.visible}>
        <AnimatedNumber value={teamBScore} />
      </DynamicElement>

      {/* Half */}
      <DynamicElement style={layout.model1_half} text={half} isVisible={layout.model1_half.visible} />

      {/* Logo */}
      <DynamicElement style={layout.model1_logo} isVisible={layout.model1_logo.visible}>
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
      </DynamicElement>
    </div>
  );
};

export default Scoreboard1;
