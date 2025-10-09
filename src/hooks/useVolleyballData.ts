"use client";

import { useEffect, useCallback, useState, useRef } from 'react';
import { useDatabase } from '@/firebase';
import { ref, onValue, update, set } from 'firebase/database';

const VOLLEYBALL_PATH = 'volleyball';
const TEAM_A_COLOR = '#B72FCE';
const TEAM_B_COLOR = '#F97316'; // orange-400

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
  // Placeholder for set history, timeouts, etc.
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
  logoSrc: "https://placehold.co/238x188",
  matchTitle: "FINAL",
  setHistory: [
    { teamAScore: 0, teamBScore: 0 },
    { teamAScore: 0, teamBScore: 0 },
    { teamAScore: 0, teamBScore: 0 },
    { teamAScore: 0, teamBScore: 0 },
    { teamAScore: 0, teamBScore: 0 },
  ],
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
        data = { ...defaultVolleyballScoreboard, ...val };
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

  // Placeholder for future functions like point updates, set wins, etc.

  return { scoreboard, loading, error, updateScoreboard };
}
