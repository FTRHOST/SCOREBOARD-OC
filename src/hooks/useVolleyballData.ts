"use client";

import { useEffect, useCallback, useState, useRef } from 'react';
import { useDatabase } from '@/firebase';
import { ref, onValue, update, set } from 'firebase/database';

const VOLLEYBALL_PATH = 'volleyball';
const TEAM_A_COLOR = '#B72FCE';
const TEAM_B_COLOR = '#F97316'; // orange-400
const MAX_SETS = 5;

export interface VolleyballScoreboard {
  teamAName: string;
  teamBName: string;
  teamASets: number;
  teamBSets: number;
  teamAPoints: number;
  teamBPoints: number;
  currentSet: number;
  teamAColor: string;
  teamBColor: string;
  logoSrc: string | null;
  matchTitle: string;
  setHistory: Array<{ teamAScore: number; teamBScore: number }>;
}

const defaultVolleyballScoreboard: VolleyballScoreboard = {
  teamAName: 'Tim A',
  teamBName: 'Tim B',
  teamASets: 0,
  teamBSets: 0,
  teamAPoints: 0,
  teamBPoints: 0,
  currentSet: 1,
  teamAColor: TEAM_A_COLOR,
  teamBColor: TEAM_B_COLOR,
  logoSrc: null,
  matchTitle: "FINAL",
  setHistory: Array(MAX_SETS).fill({ teamAScore: 0, teamBScore: 0 }),
};

export function useVolleyballData() {
  const database = useDatabase();
  const [scoreboard, setScoreboard] = useState<VolleyballScoreboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const scoreboardRef = ref(database, VOLLEYBALL_PATH);

  useEffect(() => {
    if (!database) return;

    const unsubscribe = onValue(scoreboardRef, (snapshot) => {
      let data: VolleyballScoreboard;
      if (snapshot.exists()) {
        const val = snapshot.val();
        // Ensure setHistory has the correct length
        const history = val.setHistory || [];
        const newHistory = Array(MAX_SETS).fill({ teamAScore: 0, teamBScore: 0 });
        for(let i=0; i < history.length && i < MAX_SETS; i++) {
          newHistory[i] = history[i];
        }
        data = { ...defaultVolleyballScoreboard, ...val, setHistory: newHistory };

      } else {
        data = defaultVolleyballScoreboard;
        set(scoreboardRef, data); // Initialize if not present
      }
      setScoreboard(data);
      setLoading(false);
    }, (err) => {
      console.error("RTDB read failed:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [database]);
  
  const updateScoreboard = useCallback(async (data: Partial<VolleyballScoreboard>) => {
    if (!database || !scoreboard) return;
    await update(scoreboardRef, data);
  }, [database, scoreboard, scoreboardRef]);

  const updatePoints = (team: 'A' | 'B', delta: number) => {
    if (!scoreboard) return;
    const currentPoints = team === 'A' ? scoreboard.teamAPoints : scoreboard.teamBPoints;
    const newPoints = Math.max(0, currentPoints + delta);
    updateScoreboard(team === 'A' ? { teamAPoints: newPoints } : { teamBPoints: newPoints });
  };

  const updateSets = (team: 'A' | 'B', delta: number) => {
    if (!scoreboard) return;
    const currentSets = team === 'A' ? scoreboard.teamASets : scoreboard.teamBSets;
    const newSets = Math.max(0, currentSets + delta);
    updateScoreboard(team === 'A' ? { teamASets: newSets } : { teamBSets: newSets });
  };
  
  const winSet = (winner: 'A' | 'B') => {
    if (!scoreboard || scoreboard.currentSet > MAX_SETS) return;

    const { teamAPoints, teamBPoints, teamASets, teamBSets, currentSet, setHistory } = scoreboard;

    const newSetHistory = [...setHistory];
    newSetHistory[currentSet - 1] = { teamAScore: teamAPoints, teamBScore: teamBPoints };
    
    const newTeamASets = teamASets + (winner === 'A' ? 1 : 0);
    const newTeamBSets = teamBSets + (winner === 'B' ? 1 : 0);

    updateScoreboard({
      teamAPoints: 0,
      teamBPoints: 0,
      teamASets: newTeamASets,
      teamBSets: newTeamBSets,
      currentSet: Math.min(currentSet + 1, MAX_SETS),
      setHistory: newSetHistory,
    });
  };

  const resetSet = () => {
    updateScoreboard({ teamAPoints: 0, teamBPoints: 0 });
  };

  const resetMatch = () => {
    if (!scoreboard) return;
    updateScoreboard({
      teamASets: 0,
      teamBSets: 0,
      teamAPoints: 0,
      teamBPoints: 0,
      currentSet: 1,
      setHistory: Array(MAX_SETS).fill({ teamAScore: 0, teamBScore: 0 }),
      // Note: We keep team names, colors, and logo
    });
  };
  
  const swapTeams = () => {
    if (!scoreboard) return;
    updateScoreboard({
      teamAName: scoreboard.teamBName,
      teamBName: scoreboard.teamAName,
      teamAColor: scoreboard.teamBColor,
      teamBColor: scoreboard.teamAColor,
      teamASets: scoreboard.teamBSets,
      teamBSets: scoreboard.teamASets,
      teamAPoints: scoreboard.teamBPoints,
      teamBPoints: scoreboard.teamAPoints,
      // We don't swap set history as it's tied to the set number
    });
  };


  return { scoreboard, loading, error, updateScoreboard, updatePoints, updateSets, winSet, resetSet, resetMatch, swapTeams };
}
