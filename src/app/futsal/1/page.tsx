"use client";

import Scoreboard1 from "@/components/scoreboards/Scoreboard1";
import { useScoreboardData } from "@/hooks/useScoreboardData";

export default function ScoreboardPage1() {
  const { scoreboard } = useScoreboardData();
  const zoomScale = scoreboard?.zoomScale ? scoreboard.zoomScale / 100 : 1;

  return (
    <div className="min-h-screen bg-[#00ff00] flex items-center justify-center overflow-hidden">
      <div style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center' }}>
        <Scoreboard1 />
      </div>
    </div>
  );
}
