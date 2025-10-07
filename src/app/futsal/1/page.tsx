"use client";

import { ScoreboardProvider } from "@/context/ScoreboardContext";
import Scoreboard1 from "@/components/scoreboards/Scoreboard1";

export default function ScoreboardPage1() {
  return (
    <ScoreboardProvider>
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Scoreboard1 />
      </div>
    </ScoreboardProvider>
  );
}
