"use client";

import { ScoreboardProvider } from "@/context/ScoreboardContext";
import Scoreboard3 from "@/components/scoreboards/Scoreboard3";

export default function ScoreboardPage3() {
  return (
    <ScoreboardProvider>
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Scoreboard3 />
      </div>
    </ScoreboardProvider>
  );
}
