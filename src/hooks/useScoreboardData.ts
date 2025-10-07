'use client';

import { useEffect, useCallback, useState } from 'react';
import { useDatabase } from '@/firebase';
import { ref, onValue, update, set, get, serverTimestamp } from 'firebase/database';

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
  const [scoreboard, setScoreboard] = useState<Scoreboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [localTime, setLocalTime] = useState<number | null>(null);

  const scoreboardRef = ref(database, SCOREBOARD_PATH);

  useEffect(() => {
    if (!database) return;

    const unsubscribe = onValue(scoreboardRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setScoreboard(data);
        setLocalTime(data.time); 
      } else {
        // If no data exists, set default and create it.
        set(scoreboardRef, defaultScoreboard);
        setScoreboard(defaultScoreboard);
        setLocalTime(defaultScoreboard.time);
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
    
    if (scoreboard && scoreboard.isRunning && scoreboard.startTime > 0) {
      timerInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - scoreboard.startTime) / 1000);
        const remainingTime = Math.max(0, scoreboard.pauseTime - elapsed);
        
        setLocalTime(remainingTime);

        if (remainingTime === 0 && scoreboard.isRunning) {
            update(scoreboardRef, { isRunning: false, time: 0 });
        }
      }, 250); 
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [scoreboard, scoreboardRef]);

  const updateScoreboard = useCallback(async (data: Partial<Scoreboard>) => {
    if (!database || !scoreboard) return;
    
    // Get the current server time for accurate calculations
    const now = Date.now();

    if (data.isRunning === true && !scoreboard.isRunning) {
        // --- STARTING the timer ---
        await update(scoreboardRef, { 
            ...data,
            startTime: now,
            pauseTime: scoreboard.time, // Start countdown from the current time value
        });
    } else if (data.isRunning === false && scoreboard.isRunning) {
        // --- PAUSING the timer ---
        const elapsed = Math.floor((now - scoreboard.startTime) / 1000);
        const newTime = Math.max(0, scoreboard.pauseTime - elapsed);
        
        await update(scoreboardRef, { 
            ...data, 
            time: newTime,
            pauseTime: newTime, 
            startTime: 0 
        });
    } else {
      // For other updates that don't affect the timer state
      await update(scoreboardRef, data);
    }
  }, [database, scoreboard, scoreboardRef]);

  const resetScoreboard = useCallback(() => {
    if (!database) return;
    if (window.confirm('Are you sure you want to reset all scoreboard data?')) {
        set(scoreboardRef, defaultScoreboard);
    }
  }, [database, scoreboardRef]);

  // Return a consistent scoreboard object for the UI
  const displayScoreboard = scoreboard ? { ...scoreboard, time: localTime ?? scoreboard.time } : null;

  return { scoreboard: displayScoreboard, loading, error, updateScoreboard, resetScoreboard };
}
