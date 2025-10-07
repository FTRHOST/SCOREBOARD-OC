
'use client';

import { useEffect, useCallback, useState } from 'react';
import { useDatabase } from '@/firebase';
import { ref, onValue, update, set, get } from 'firebase/database';

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
  startTime: number; // Timestamp when the timer started
  pauseTime: number; // The time remaining when paused
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
  startTime: 0,
  pauseTime: INITIAL_TIME_SECONDS,
};

export function useScoreboardData() {
  const database = useDatabase();
  const [scoreboard, setScoreboard] = useState<Scoreboard>(defaultScoreboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const scoreboardRef = ref(database, SCOREBOARD_PATH);

  useEffect(() => {
    if (!database) return;

    get(scoreboardRef).then(snapshot => {
      if (!snapshot.exists()) {
        set(scoreboardRef, defaultScoreboard);
      }
      setLoading(false);
    }).catch(err => {
        console.error("Initial data check failed:", err);
        setError(err);
        setLoading(false);
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
    let timerInterval: NodeJS.Timeout | null = null;
    
    if (scoreboard.isRunning && scoreboard.startTime > 0) {
      timerInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - scoreboard.startTime) / 1000);
        const remainingTime = Math.max(0, scoreboard.pauseTime - elapsed);
        
        // This is a local update for the UI, the DB is the source of truth
        // We only update the local state to show the countdown, but don't write to DB here
        setScoreboard(prev => ({...prev, time: remainingTime}));

        if (remainingTime === 0) {
            update(scoreboardRef, { isRunning: false });
        }
      }, 500); // Update UI every 500ms for smoother countdown
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [scoreboard.isRunning, scoreboard.startTime, scoreboard.pauseTime, scoreboardRef]);

  const updateScoreboard = useCallback(async (data: Partial<Scoreboard>) => {
    if (!database) return;

    if (data.isRunning === true && !scoreboard.isRunning) {
        // Starting the timer
        const offsetRef = ref(database, '.info/serverTimeOffset');
        const offsetSnapshot = await get(offsetRef);
        const offset = offsetSnapshot.val() || 0;
        const now = Date.now() + offset;

        const snapshot = await get(scoreboardRef);
        const currentData = snapshot.val() as Scoreboard;

        await update(scoreboardRef, { 
            isRunning: true, 
            startTime: now,
            pauseTime: currentData.time // Start countdown from current time value
        });

    } else if (data.isRunning === false && scoreboard.isRunning) {
        // Pausing the timer
        const offsetRef = ref(database, '.info/serverTimeOffset');
        const offsetSnapshot = await get(offsetRef);
        const offset = offsetSnapshot.val() || 0;
        const now = Date.now() + offset;
        
        const snapshot = await get(scoreboardRef);
        const currentData = snapshot.val() as Scoreboard;
        
        const elapsed = Math.floor((now - currentData.startTime) / 1000);
        const newTime = Math.max(0, currentData.pauseTime - elapsed);
        
        await update(scoreboardRef, { 
            isRunning: false, 
            time: newTime,
            pauseTime: newTime // Save the remaining time
        });

    } else {
      // For other updates that don't affect the timer state
      await update(scoreboardRef, data);
    }
  }, [database, scoreboard.isRunning, scoreboardRef]);

  const resetScoreboard = useCallback(() => {
    if (!database) return;
    if (confirm('Are you sure you want to reset all scoreboard data?')) {
        set(scoreboardRef, defaultScoreboard);
    }
  }, [database, scoreboardRef]);

  return { scoreboard, loading, error, updateScoreboard, resetScoreboard };
}
