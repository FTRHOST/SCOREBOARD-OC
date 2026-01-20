
'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useScoreboardData } from '@/hooks/useScoreboardData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Play, Pause, RotateCcw, Trash2, X, Palette, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import teamsData from '@/lib/teams.json'; // Import the teams data

export default function Controller() {
  const { scoreboard, loading, updateScoreboard, resetScoreboard, swapTeams, deleteColorSuggestion } = useScoreboardData();
  const { toast } = useToast();
  const [timeInput, setTimeInput] = useState('20');
  const [localTeamAName, setLocalTeamAName] = useState('');
  const [localTeamBName, setLocalTeamBName] = useState('');
  const [localEventTitle, setLocalEventTitle] = useState('');
  const [localHalf, setLocalHalf] = useState('');
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    setTeams(teamsData);
  }, []);

  const [isTeamANameFocused, setIsTeamANameFocused] = useState(false);
  const [isTeamBNameFocused, setIsTeamBNameFocused] = useState(false);
  const [isEventTitleFocused, setIsEventTitleFocused] = useState(false);
  const [isHalfFocused, setIsHalfFocused] = useState(false);

  useEffect(() => {
    if (scoreboard) {
      if (!isTeamANameFocused) {
        setLocalTeamAName(scoreboard.teamAName || '');
      }
      if (!isTeamBNameFocused) {
        setLocalTeamBName(scoreboard.teamBName || '');
      }
      if (!isEventTitleFocused) {
        setLocalEventTitle(scoreboard.eventTitle || '');
      }
      if (!isHalfFocused) {
        setLocalHalf(scoreboard.half || '');
      }
    }
  }, [scoreboard, isTeamANameFocused, isTeamBNameFocused, isEventTitleFocused, isHalfFocused]);

  if (loading) {
    return <div>Loading Controller...</div>;
  }

  if (!scoreboard) {
    return <div>Scoreboard data not available.</div>;
  }

  const {
    teamAScore,
    teamBScore,
    teamAFouls,
    teamBFouls,
    isRunning,
    teamAColor,
    teamBColor,
    colorSuggestions,
  } = scoreboard;

  const handleUpdate = (field: string, value: any) => {
    try {
      updateScoreboard({ [field]: value });
    } catch (error) {
      console.error('Failed to update scoreboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to update scoreboard. Please check console for details.',
        variant: 'destructive',
      });
    }
  };
  
  const handleInputCommit = (field: string, value: string) => {
    handleUpdate(field, value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, field: string, value: string) => {
    if (e.key === 'Enter') {
      handleInputCommit(field, value);
      e.currentTarget.blur();
    }
  };

  const updateScore = (team: 'A' | 'B', delta: number) => {
    const currentScore = team === 'A' ? teamAScore : teamBScore;
    const newScore = Math.max(0, (currentScore || 0) + delta);
    handleUpdate(team === 'A' ? 'teamAScore' : 'teamBScore', newScore);
  };

  const updateFouls = (team: 'A' | 'B', delta: number) => {
    const currentFouls = team === 'A' ? teamAFouls : teamBFouls;
    const newFouls = Math.max(0, (currentFouls || 0) + delta);
    handleUpdate(team === 'A' ? 'teamAFouls' : 'teamBFouls', newFouls);
  };

  const resetFouls = (team: 'A' | 'B') => {
    handleUpdate(team === 'A' ? 'teamAFouls' : 'teamBFouls', 0);
  };

  const handleTimeSet = () => {
    const minutes = parseInt(timeInput, 10);
    if (!isNaN(minutes) && minutes >= 0) {
      handleUpdate('initialTime', minutes * 60);
      handleUpdate('time', minutes * 60);
      handleUpdate('isRunning', false);
    }
  };

  const resetTimer = () => {
    if (scoreboard) {
      handleUpdate('time', scoreboard.initialTime);
      handleUpdate('isRunning', false);
    }
  };

  const handleSwapTeams = () => {
    swapTeams();
  };

  const CustomColorPopover = ({ team }: { team: 'A' | 'B' }) => {
    const [customColor, setCustomColor] = useState(team === 'A' ? teamAColor : teamBColor);
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="w-8 h-8">
            <Plus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-24"
              placeholder="#RRGGBB"
            />
            <Button onClick={() => handleUpdate(team === 'A' ? 'teamAColor' : 'teamBColor', customColor)} size="sm">Set</Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const ColorControls = ({ team }: { team: 'A' | 'B' }) => (
    <div className="space-y-2">
      <Label htmlFor={`team${team}Color`} className="flex items-center gap-2"><Palette /> Team Color</Label>
      <div
        className="w-full h-10 rounded-md border"
        style={{ backgroundColor: team === 'A' ? teamAColor : teamBColor }}
      />
      <div className="flex flex-wrap items-center gap-2">
        {(colorSuggestions || []).map((color) => (
          <div key={color} className="relative group">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: color }}
              onClick={() => handleUpdate(team === 'A' ? 'teamAColor' : 'teamBColor', color)}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteColorSuggestion(color)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <CustomColorPopover team={team} />
      </div>
    </div>
  );

  const TeamControls = ({ team }: { team: 'A' | 'B' }) => {
    const name = team === 'A' ? localTeamAName : localTeamBName;
    const setName = team === 'A' ? setLocalTeamAName : setLocalTeamBName;
    const score = team === 'A' ? teamAScore : teamBScore;
    const fouls = team === 'A' ? teamAFouls : teamBFouls;
    const color = team === 'A' ? teamAColor : teamBColor;
    const fieldName = team === 'A' ? 'teamAName' : 'teamBName';
    const setFocused = team === 'A' ? setIsTeamANameFocused : setIsTeamBNameFocused;

    const handleTeamSelect = (value: string) => {
      if (value === 'custom') {
        setName('');
      } else {
        setName(value);
        handleUpdate(fieldName, value);
      }
    };

    return (
        <div className="flex-shrink-0 w-[300px] md:w-auto flex flex-col gap-4 p-4 rounded-lg border bg-card">
            <h3 className="font-bold text-lg text-center" style={{ color: color }}>{team === 'A' ? 'Team A' : 'Team B'}</h3>
            <div className="space-y-2">
              <Label htmlFor={fieldName}>Team Name</Label>
            <Select onValueChange={handleTeamSelect} value={teams.includes(name) ? name : 'custom'}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tim" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((teamName) => (
                  <SelectItem key={teamName} value={teamName}>
                    {teamName}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Lainnya...</SelectItem>
              </SelectContent>
            </Select>
            {(!teams.includes(name) || name === '') && (
              <Input
                id={fieldName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, fieldName, name)}
                 onFocus={() => setFocused(true)}
                onBlur={() => {
                  setFocused(false);
                  handleInputCommit(fieldName, name);
                }}
                placeholder="Nama Tim Kustom"
                className="mt-2"
              />
            )}
            </div>
            <div className="space-y-2">
              <Label>Score</Label>
              <div className="flex items-center gap-2">
                <Button size="icon" onClick={() => updateScore(team, -1)} variant="outline"><Minus /></Button>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background text-center font-bold items-center justify-center">
                  {score}
                </div>
                <Button size="icon" onClick={() => updateScore(team, 1)}><Plus /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fouls</Label>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => updateFouls(team, -1)}><Minus /></Button>
                <div className="flex h-10 w-12 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background text-center font-bold items-center justify-center">
                  {fouls}
                </div>
                <Button size="icon" onClick={() => updateFouls(team, 1)}><Plus /></Button>
                <div className="flex-grow" />
                <Button size="icon" variant="destructive" onClick={() => resetFouls(team)}><Trash2 /></Button>
              </div>
            </div>
            <ColorControls team={team} />
        </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center font-headline">Master Controller</CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        <div className="flex gap-4 pb-4 md:pb-0 md:grid md:grid-cols-3 md:gap-6 w-full overflow-x-auto md:overflow-visible p-4 md:p-0">
          <TeamControls team="A" />

          {/* General Controls */}
          <div className="flex-shrink-0 w-[300px] md:w-auto flex flex-col gap-4 p-4 rounded-lg border bg-card">
            <h3 className="font-bold text-lg text-center">Match Controls</h3>
            <div className="space-y-2">
              <Label htmlFor="eventTitle">Event Title</Label>
              <Input
                id="eventTitle"
                value={localEventTitle}
                onChange={(e) => setLocalEventTitle(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'eventTitle', localEventTitle)}
                onFocus={() => setIsEventTitleFocused(true)}
                onBlur={() => {
                  setIsEventTitleFocused(false);
                  handleInputCommit('eventTitle', localEventTitle);
                }}
                placeholder="e.g., OSIS CUP"
              />
            </div>
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
                  <Button className="flex-1" variant="destructive" onClick={() => handleUpdate('isRunning', false)}><Pause className="mr-2" /> Pause</Button>
                ) : (
                  <Button className="flex-1" onClick={() => handleUpdate('isRunning', true)}><Play className="mr-2" /> Start</Button>
                )}
                <Button size="icon" variant="outline" onClick={resetTimer}><RotateCcw /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="halfSet">Set Half Text</Label>
              <div className="flex gap-2">
                <Input
                  id="halfSet"
                  value={localHalf}
                  onChange={(e) => setLocalHalf(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'half', localHalf)}
                  onFocus={() => setIsHalfFocused(true)}
                  onBlur={() => {
                    setIsHalfFocused(false);
                    handleInputCommit('half', localHalf);
                  }}
                  placeholder="e.g., Babak 1"
                />
              </div>
            </div>
            <Separator />
            <div className='flex flex-col gap-2'>
              <Label>Actions</Label>
              <div className="flex flex-wrap gap-2 w-full">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <RefreshCw className="mr-2 h-4 w-4" /> Swap Teams
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to swap teams?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will swap the names, scores, fouls, and colors between Team A and Team B.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSwapTeams}>Confirm Swap</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <RotateCcw className="mr-2 h-4 w-4" /> Reset All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to reset everything?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset scores, fouls, and the timer. Team names, colors, and the logo will not be changed. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={resetScoreboard}>Confirm Reset</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          <TeamControls team="B" />
        </div>
      </CardContent>
    </Card>
  );
}
