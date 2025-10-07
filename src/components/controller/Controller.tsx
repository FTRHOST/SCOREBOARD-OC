"use client";

import { useState } from 'react';
import { useScoreboard } from "@/context/ScoreboardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Play, Pause, RotateCcw, Zap, Trash2 } from "lucide-react";

export default function Controller() {
  const {
    teamAName, teamBName, setTeamName,
    updateScore, updateFouls, resetFouls,
    setHalf, isRunning, startTimer, pauseTimer, resetTimer,
    setInitialTime
  } = useScoreboard();

  const [timeInput, setTimeInput] = useState('20');
  const [halfInput, setHalfInput] = useState('First Half');
  
  const handleTimeSet = () => {
    const minutes = parseInt(timeInput, 10);
    if (!isNaN(minutes) && minutes > 0) {
      setInitialTime(minutes);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center font-headline">
          Master Controller
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team A Controls */}
        <div className="flex flex-col gap-4 p-4 rounded-lg border bg-card">
          <h3 className="font-bold text-lg text-center" style={{ color: useScoreboard().teamAColor }}>Team A</h3>
          <div className="space-y-2">
            <Label htmlFor="teamAName">Team Name</Label>
            <Input id="teamAName" value={teamAName} onChange={(e) => setTeamName('A', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Score</Label>
            <div className="flex gap-2">
              <Button size="icon" onClick={() => updateScore('A', 1)}><Plus /></Button>
              <Button size="icon" variant="outline" onClick={() => updateScore('A', -1)}><Minus /></Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fouls</Label>
            <div className="flex gap-2">
              <Button size="icon" variant="destructive" onClick={() => updateFouls('A')}><Zap /></Button>
              <Button size="icon" variant="outline" onClick={() => resetFouls('A')}><Trash2 /></Button>
            </div>
          </div>
        </div>

        {/* General Controls */}
        <div className="flex flex-col gap-4 p-4 rounded-lg border bg-card">
          <h3 className="font-bold text-lg text-center">Match Controls</h3>
          <div className="space-y-2">
            <Label htmlFor="timerSet">Set Timer (minutes)</Label>
            <div className="flex gap-2">
              <Input id="timerSet" type="number" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} placeholder="e.g., 20" />
              <Button onClick={handleTimeSet}>Set</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Timer</Label>
            <div className="flex gap-2">
              {isRunning ? (
                <Button className="flex-1" variant="destructive" onClick={pauseTimer}><Pause className="mr-2" /> Pause</Button>
              ) : (
                <Button className="flex-1" onClick={startTimer}><Play className="mr-2" /> Start</Button>
              )}
              <Button size="icon" variant="outline" onClick={resetTimer}><RotateCcw /></Button>
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="halfSet">Set Half Text</Label>
            <div className="flex gap-2">
              <Input id="halfSet" value={halfInput} onChange={(e) => setHalfInput(e.target.value)} placeholder="e.g., Babak 1" />
              <Button onClick={() => setHalf(halfInput)}>Set</Button>
            </div>
          </div>
        </div>

        {/* Team B Controls */}
        <div className="flex flex-col gap-4 p-4 rounded-lg border bg-card">
          <h3 className="font-bold text-lg text-center" style={{ color: useScoreboard().teamBColor }}>Team B</h3>
          <div className="space-y-2">
            <Label htmlFor="teamBName">Team Name</Label>
            <Input id="teamBName" value={teamBName} onChange={(e) => setTeamName('B', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Score</Label>
            <div className="flex gap-2">
              <Button size="icon" onClick={() => updateScore('B', 1)}><Plus /></Button>
              <Button size="icon" variant="outline" onClick={() => updateScore('B', -1)}><Minus /></Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fouls</Label>
            <div className="flex gap-2">
              <Button size="icon" variant="destructive" onClick={() => updateFouls('B')}><Zap /></Button>
              <Button size="icon" variant="outline" onClick={() => resetFouls('B')}><Trash2 /></Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
