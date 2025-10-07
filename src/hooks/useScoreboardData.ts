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

    // Check if data exists, if not, create it.
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
        setScoreboard(defaultScoreboard); // If data is deleted, revert to default
      }
      setLoading(false);
    }, (err) => {
      console.error("RTDB read failed:", err);
      setError(err);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [database, scoreboardRef]);
  
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    
    // Only run the interval if the timer is running and start time is set
    if (scoreboard.isRunning && scoreboard.startTime > 0) {
      timerInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - scoreboard.startTime) / 1000);
        // Calculate remaining time based on when it was paused last
        const remainingTime = Math.max(0, scoreboard.pauseTime - elapsed);
        
        // This is a local update for the UI, the DB is the source of truth
        setScoreboard(prev => ({...prev, time: remainingTime}));

        if (remainingTime === 0) {
            // Stop the timer in the database when it hits zero
            update(scoreboardRef, { isRunning: false, time: 0 });
        }
      }, 500); // Update UI every 500ms
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
    // Dependencies: timer should re-evaluate if running state, start time, or pause time changes from DB
  }, [scoreboard.isRunning, scoreboard.startTime, scoreboard.pauseTime, scoreboardRef]);

  const updateScoreboard = useCallback(async (data: Partial<Scoreboard>) => {
    if (!database) return;

    const currentSnapshot = await get(scoreboardRef);
    const currentData = (currentSnapshot.val() as Scoreboard) || defaultScoreboard;

    if (data.isRunning === true && !currentData.isRunning) {
        // --- STARTING the timer ---
        const now = Date.now();
        await update(scoreboardRef, { 
            ...data, // Includes isRunning: true
            startTime: now,
            // Start countdown from the current time value
            pauseTime: currentData.time,
        });

    } else if (data.isRunning === false && currentData.isRunning) {
        // --- PAUSING the timer ---
        const now = Date.now();
        const elapsed = Math.floor((now - currentData.startTime) / 1000);
        const newTime = Math.max(0, currentData.pauseTime - elapsed);
        
        await update(scoreboardRef, { 
            ...data, // Includes isRunning: false
            time: newTime,
            pauseTime: newTime, // Save the remaining time for the next start
            startTime: 0 // Reset startTime
        });

    } else {
      // For other updates that don't affect the timer state (e.g., score, name change)
      await update(scoreboardRef, data);
    }
  }, [database, scoreboardRef]);

  const resetScoreboard = useCallback(() => {
    if (!database) return;
    if (window.confirm('Are you sure you want to reset all scoreboard data?')) {
        set(scoreboardRef, defaultScoreboard);
    }
  }, [database, scoreboardRef]);

  return { scoreboard, loading, error, updateScoreboard, resetScoreboard };
}
