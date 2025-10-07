"use client";

import { ScoreboardProvider } from "@/context/ScoreboardContext";
import Scoreboard2 from "@/components/scoreboards/Scoreboard2";

export default function ScoreboardPage2() {
  return (
    <ScoreboardProvider>
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Scoreboard2 />
      </div>
    </ScoreboardProvider>
  );
}
