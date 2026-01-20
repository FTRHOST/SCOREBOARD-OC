"use client";

import { useVolleyballData } from "@/hooks/useVolleyballData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, RotateCcw, Palette, RefreshCw, Award, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useEffect, KeyboardEvent } from 'react';
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
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import teamsData from '@/lib/teams.json'; // Import the teams data

export default function VolleyballController() {
  const { scoreboard, loading, updateScoreboard, updatePoints, winSet, resetSet, resetMatch, swapTeams, deleteColorSuggestion } = useVolleyballData();
  const [localTeamAName, setLocalTeamAName] = useState('');
  const [localTeamBName, setLocalTeamBName] = useState('');
  const [localMatchTitle, setLocalMatchTitle] = useState('');
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    setTeams(teamsData);
  }, []);

  useEffect(() => {
    if (scoreboard && !loading && !initialDataLoaded) {
      setLocalTeamAName(scoreboard.teamAName || '');
      setLocalTeamBName(scoreboard.teamBName || '');
      setLocalMatchTitle(scoreboard.matchTitle || '');
      setInitialDataLoaded(true);
    }
  }, [scoreboard, loading, initialDataLoaded]);

  if (loading || !scoreboard) {
    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center font-headline">
                    Master Kontroler Bola Voli
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
                <div className="flex gap-4 pb-4 md:pb-0 md:grid md:grid-cols-3 md:gap-6 w-full overflow-x-auto md:overflow-visible p-4 md:p-0">
                    <Skeleton className="h-[400px] w-full" />
                    <Skeleton className="h-[400px] w-full" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </CardContent>
        </Card>
    );
  }

  const handleUpdate = (field: string, value: any) => {
    updateScoreboard({ [field]: value });
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

  const CustomColorPopover = ({ team }: { team: 'A' | 'B' }) => {
    const [customColor, setCustomColor] = useState(team === 'A' ? scoreboard.teamAColor : scoreboard.teamBColor);
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

  const TeamControls = ({ team }: { team: 'A' | 'B' }) => {
    const name = team === 'A' ? localTeamAName : localTeamBName;
    const setName = team === 'A' ? setLocalTeamAName : setLocalTeamBName;
    const sets = team === 'A' ? scoreboard.teamASets : scoreboard.teamBSets;
    const points = team === 'A' ? scoreboard.teamAPoints : scoreboard.teamBPoints;
    const color = team === 'A' ? scoreboard.teamAColor : scoreboard.teamBColor;
    const fieldName = team === 'A' ? 'teamAName' : 'teamBName';

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
          <h3 className="font-bold text-lg text-center" style={{ color: color }}>{team === 'A' ? 'Tim A' : 'Tim B'}</h3>
          <div className="space-y-2">
            <Label htmlFor={fieldName}>Nama Tim</Label>
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
                onBlur={() => handleInputCommit(fieldName, name)}
                placeholder="Nama Tim Kustom"
                className="mt-2"
              />
            )}
          </div>

           <div className="space-y-2">
              <Label>Set Dimenangkan: {sets}</Label>
              <div className="grid grid-cols-3 gap-2">
                {scoreboard.setHistory.slice(0, 5).map((set, index) => (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`set${index+1}Team${team}`} className="text-xs">Set {index+1}</Label>
                     <div
                        id={`set${index+1}Team${team}`}
                        className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background/50 px-3 py-2 text-center font-bold text-sm text-muted-foreground"
                     >
                       {team === 'A' ? set.teamAScore : set.teamBScore}
                     </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Poin Saat Ini</Label>
              <div className="flex items-center gap-2">
                <Button size="icon" onClick={() => updatePoints(team, -1)} variant="outline"><Minus /></Button>
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-center font-bold text-base">
                    {points}
                </div>
                <Button size="icon" onClick={() => updatePoints(team, 1)}><Plus /></Button>
              </div>
            </div>

           <div className="space-y-2">
            <Label className="flex items-center gap-2"><Palette/> Warna Tim</Label>
            <div
              className="w-full h-8 rounded-md border"
              style={{ backgroundColor: color }}
            />
            <div className="flex flex-wrap items-center gap-2">
                {(scoreboard.colorSuggestions || []).map((c: string) => (
                  <div key={c} className="relative group">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: c }}
                      onClick={() => handleUpdate(team === 'A' ? 'teamAColor' : 'teamBColor', c)}
                    />
                     <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteColorSuggestion && deleteColorSuggestion(c)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                  </div>
                ))}
                <CustomColorPopover team={team} />
            </div>
          </div>
        </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center font-headline">
          Master Kontroler Bola Voli
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        <div className="flex gap-4 pb-4 md:pb-0 md:grid md:grid-cols-3 md:gap-6 w-full overflow-x-auto md:overflow-visible p-4 md:p-0">
            <TeamControls team="A" />

            {/* General Controls */}
            <div className="flex-shrink-0 w-[300px] md:w-auto flex flex-col gap-4 p-4 rounded-lg border bg-card">
                <h3 className="font-bold text-lg text-center">Kontrol Pertandingan</h3>
                 <div className="space-y-2">
                    <Label htmlFor="matchTitle">Judul Pertandingan</Label>
                    <Input
                        id="matchTitle"
                        value={localMatchTitle}
                        onChange={(e) => setLocalMatchTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'matchTitle', localMatchTitle)}
                        onBlur={() => handleInputCommit('matchTitle', localMatchTitle)}
                        placeholder="e.g., FINAL"
                    />
                </div>

                <Separator />

                <div className='flex flex-col gap-2'>
                <Label>Aksi Set</Label>
                    <div className="flex flex-wrap gap-2 w-full">
                    <Button variant="outline" className="flex-1" onClick={() => winSet('A')}>
                        <Award className="mr-2 h-4 w-4" /> Tim A Menang Set
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => winSet('B')}>
                        <Award className="mr-2 h-4 w-4" /> Tim B Menang Set
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={resetSet}>
                        <Trash2 className="mr-2 h-4 w-4" /> Reset Poin Set Ini
                    </Button>
                    </div>
                </div>

                <Separator />

                <div className='flex flex-col gap-2'>
                <Label>Aksi Pertandingan</Label>
                <div className="flex flex-wrap gap-2 w-full">
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                        <RefreshCw className="mr-2 h-4 w-4" /> Tukar Tim
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Anda yakin ingin menukar tim?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Ini akan menukar nama, set, poin, dan warna antara Tim A dan Tim B.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={swapTeams}>Konfirmasi Tukar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex-1">
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset Semua
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Anda yakin ingin mereset semuanya?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Ini akan mereset semua set dan poin ke 0. Nama tim, warna, dan logo tidak akan berubah.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={resetMatch}>Konfirmasi Reset</AlertDialogAction>
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
