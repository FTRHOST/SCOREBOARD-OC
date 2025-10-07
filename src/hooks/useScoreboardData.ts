
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDatabase } from '@/firebase';
import { ref, onValue, update, get, set } from 'firebase/database';

const SCOREBOARD_PATH = 'scoreboard';
const TEAM_A_COLOR = '#b72fce';
const TEAM_B_COLOR = '#ef7438';
const INITIAL_TIME_SECONDS = 20 * 60;

export interface Scoreboard {
  teamAName: string;
  teamBName: string;
  teamAScore: number;
  teamBScore: number;
  teamAFouls: number;
  teamBFouls: number;
  time: number;
  initialTime: number;
  half: string;
  isRunning: boolean;
  teamAColor: string;
  teamBColor: string;
  logoSrc: string | null;
}

const defaultScoreboard: Scoreboard = {
  teamAName: 'Tim A',
  teamBName: 'Tim B',
  teamAScore: 0,
  teamBScore: 0,
  teamAFouls: 0,
  teamBFouls: 0,
  time: INITIAL_TIME_SECONDS,
  initialTime: INITIAL_TIME_SECONDS,
  half: 'Babak 1',
  isRunning: false,
  teamAColor: TEAM_A_COLOR,
  teamBColor: TEAM_B_COLOR,
  logoSrc: null,
};

export function useScoreboardData() {
  const database = useDatabase();
  const [scoreboard, setScoreboard] = useState<Scoreboard>(defaultScoreboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const scoreboardRef = ref(database, SCOREBOARD_PATH);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!database) return;
    setLoading(true);
    
    // Check if data exists. If not, initialize it.
    get(scoreboardRef).then(snapshot => {
      if (!snapshot.exists()) {
        set(scoreboardRef, defaultScoreboard);
      }
    });

    const unsubscribe = onValue(scoreboardRef, (snapshot) => {
      if (snapshot.exists()) {
        setScoreboard(snapshot.val());
      } else {
        setScoreboard(defaultScoreboard);
      }
      setLoading(false);
    }, (err) => {
      console.error("RTDB read failed:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [database]);

  useEffect(() => {
    if (!scoreboard?.isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    // This timer logic will run in any client that has isRunning = true
    // It's better to run it only in the controller page context, but for simplicity now it is here
    timerRef.current = setInterval(async () => {
      const snapshot = await get(scoreboardRef);
      if (snapshot.exists()) {
          const currentData = snapshot.val() as Scoreboard;
          if (currentData.time > 0 && currentData.isRunning) {
              update(ref(database, SCOREBOARD_PATH), { time: currentData.time - 1 });
          } else if (currentData.isRunning) {
              update(ref(database, SCOREBOARD_PATH), { isRunning: false });
          }
      }
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scoreboard?.isRunning, database]);

  const updateScoreboard = useCallback((data: Partial<Scoreboard>) => {
    if (!database) return;
    update(scoreboardRef, data);
  }, [database]);

  const resetScoreboard = useCallback(() => {
    if (!database) return;
    if (confirm('Are you sure you want to reset all scoreboard data?')) {
        set(scoreboardRef, defaultScoreboard);
    }
  }, [database]);

  return { scoreboard, loading, error, updateScoreboard, resetScoreboard };
}
