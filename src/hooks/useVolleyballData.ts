
"use client";

import { useEffect, useCallback, useState, useRef } from 'react';
import { useDatabase } from '@/firebase';
import { ref, onValue, update, set } from 'firebase/database';

const VOLLEYBALL_PATH = 'volleyball';
const FUTSAL_PATH = 'scoreboard'; // Path to the futsal data for logo sharing
const TEAM_A_COLOR = '#B72FCE';
const TEAM_B_COLOR = '#F97316'; // orange-400
const MAX_SETS = 5;
const INITIAL_COLOR_SUGGESTIONS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFFFFF', '#000000'];


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
  colorSuggestions: string[];
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
  colorSuggestions: INITIAL_COLOR_SUGGESTIONS,
};

export function useVolleyballData() {
  const database = useDatabase();
  const [scoreboard, setScoreboard] = useState<VolleyballScoreboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const scoreboardRef = ref(database, VOLLEYBALL_PATH);
  const futsalScoreboardRef = ref(database, FUTSAL_PATH); // Ref to futsal data

  useEffect(() => {
    if (!database) return;

    // Listener for volleyball data
    const unsubscribeVoli = onValue(scoreboardRef, (snapshot) => {
      let data: VolleyballScoreboard;
      if (snapshot.exists()) {
        const val = snapshot.val();
        const history = val.setHistory || [];
        const newHistory = Array(MAX_SETS).fill({ teamAScore: 0, teamBScore: 0 });
        for(let i=0; i < history.length && i < MAX_SETS; i++) {
          newHistory[i] = history[i] || { teamAScore: 0, teamBScore: 0 };
        }
        data = { ...defaultVolleyballScoreboard, ...val, setHistory: newHistory };
         if (!data.colorSuggestions) {
          data.colorSuggestions = INITIAL_COLOR_SUGGESTIONS;
        }
      } else {
        data = defaultVolleyballScoreboard;
        set(scoreboardRef, data);
      }
      setScoreboard(prev => ({ ...prev, ...data }));
      setLoading(false);
    }, (err) => {
      console.error("Voli RTDB read failed:", err);
      setError(err);
      setLoading(false);
    });

    // Listener for futsal logo data
    const unsubscribeFutsalLogo = onValue(ref(database, `${FUTSAL_PATH}/logoSrc`), (snapshot) => {
      const newLogoSrc = snapshot.val() || null;
      setScoreboard(prev => {
        if (!prev) {
             const initialData = { ...defaultVolleyballScoreboard, logoSrc: newLogoSrc };
             setLoading(false);
             return initialData;
        }
        return { ...prev, logoSrc: newLogoSrc };
      });
    }, (err) => {
        console.error("Futsal logo RTDB read failed:", err);
    });

    return () => {
        unsubscribeVoli();
        unsubscribeFutsalLogo();
    };
  }, [database]);
  
  const updateScoreboard = useCallback(async (data: Partial<VolleyballScoreboard>) => {
    if (!database) return;
    // If updating logo, write to futsal path instead
    if (data.logoSrc !== undefined) {
      await update(futsalScoreboardRef, { logoSrc: data.logoSrc });
    } else {
      await update(scoreboardRef, data);
    }
  }, [database, scoreboardRef, futsalScoreboardRef]);

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
  
  const updateSetHistoryScore = useCallback((setIndex: number, team: 'A' | 'B', score: number) => {
    if (!database || !scoreboard || setIndex >= scoreboard.setHistory.length) return;

    const newHistory = [...scoreboard.setHistory];
    const updatedSet = { ...newHistory[setIndex] };
    
    if (team === 'A') {
      updatedSet.teamAScore = score;
    } else {
      updatedSet.teamBScore = score;
    }
    newHistory[setIndex] = updatedSet;
    
    // Recalculate total sets won
    const teamASets = newHistory.reduce((acc, set) => acc + (set.teamAScore > set.teamBScore ? 1 : 0), 0);
    const teamBSets = newHistory.reduce((acc, set) => acc + (set.teamBScore > set.teamAScore ? 1 : 0), 0);

    update(ref(database, VOLLEYBALL_PATH), { setHistory: newHistory, teamASets, teamBSets });
  }, [database, scoreboard]);


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
      // Note: We keep team names, colors, and logo is preserved by not touching it
    });
  };
  
  const swapTeams = () => {
    if (!scoreboard) return;
    const newHistory = scoreboard.setHistory.map(set => ({
      teamAScore: set.teamBScore,
      teamBScore: set.teamAScore
    }));

    updateScoreboard({
      teamAName: scoreboard.teamBName,
      teamBName: scoreboard.teamAName,
      teamAColor: scoreboard.teamBColor,
      teamBColor: scoreboard.teamAColor,
      teamASets: scoreboard.teamBSets,
      teamBSets: scoreboard.teamASets,
      teamAPoints: scoreboard.teamBPoints,
      teamBPoints: scoreboard.teamAPoints,
      setHistory: newHistory,
    });
  };

  const deleteColorSuggestion = useCallback((colorToDelete: string) => {
    if (!database || !scoreboard) return;
    const currentSuggestions = scoreboard.colorSuggestions || [];
    const newSuggestions = currentSuggestions.filter(color => color !== colorToDelete);
    update(ref(database, VOLLEYBALL_PATH), { colorSuggestions: newSuggestions });
  }, [database, scoreboard]);


  return { scoreboard, loading, error, updateScoreboard, updatePoints, updateSets, winSet, resetSet, resetMatch, swapTeams, updateSetHistoryScore, deleteColorSuggestion };
}
