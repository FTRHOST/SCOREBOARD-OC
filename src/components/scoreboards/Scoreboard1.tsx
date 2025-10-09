
"use client";

import { useScoreboardData, LayoutStyle } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import Image from 'next/image';

const DynamicElement = ({ style, children, text, isVisible }: { style: LayoutStyle, children?: React.ReactNode, text?: string, isVisible?: boolean }) => {
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

const BackgroundElement = ({ style, color }: { style: LayoutStyle, color?: string }) => {
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
  
  const isSvg = logoSrc?.startsWith('data:image/svg+xml');

  return (
    <div className="w-[1048px] h-[227px] relative font-display text-white">
      {/* Backgrounds */}
      <BackgroundElement style={layout.model1_teamAName} color={teamAColor || '#B62FCE'} />
      <BackgroundElement style={layout.model1_teamBName} color={teamBColor || '#EF7438'} />
      <BackgroundElement style={layout.model1_teamAScore} color={'#05183B'} />
      <BackgroundElement style={layout.model1_teamBScore} color={'#05183B'} />
      <BackgroundElement style={layout.model1_half} color={'#05183B'} />

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
              {isSvg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} alt="Uploaded Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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

export default Scoreboard1;
