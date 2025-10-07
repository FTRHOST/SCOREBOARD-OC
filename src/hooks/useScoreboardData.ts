
'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useDatabase } from '@/firebase';
import { ref, onValue, update, set } from 'firebase/database';

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
  startTime: number; 
  pauseTime: number;
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

  const scoreboardRef = ref(database, SCOREBOARD_PATH);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // This effect subscribes to RTDB changes
  useEffect(() => {
    if (!database) return;

    const unsubscribe = onValue(scoreboardRef, (snapshot) => {
      if (snapshot.exists()) {
        setScoreboard(snapshot.val());
      } else {
        set(scoreboardRef, defaultScoreboard);
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
  
  // This effect runs the master timer ONLY if it's the controlling client
  useEffect(() => {
    // Clear any existing interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (scoreboard?.isRunning) {
      timerIntervalRef.current = setInterval(() => {
        // This runs only on the controller client, pushing updates to all.
        const now = Date.now();
        const elapsed = Math.floor((now - scoreboard.startTime) / 1000);
        const newTime = Math.max(0, scoreboard.pauseTime - elapsed);

        if (newTime !== scoreboard.time) {
          update(scoreboardRef, { time: newTime });
        }

        if (newTime === 0) {
          update(scoreboardRef, { isRunning: false, time: 0 });
        }
      }, 1000);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
    // This effect should only depend on isRunning, startTime, and pauseTime to avoid re-triggering unnecessarily
  }, [scoreboard?.isRunning, scoreboard?.startTime, scoreboard?.pauseTime, scoreboardRef, scoreboard?.time]);

  const updateScoreboard = useCallback(async (data: Partial<Scoreboard>) => {
    if (!database || !scoreboard) return;
    
    let updateData: Partial<Scoreboard> = { ...data };

    // --- STARTING the timer ---
    if (data.isRunning === true && !scoreboard.isRunning) {
        updateData.startTime = Date.now();
        updateData.pauseTime = scoreboard.time; // Start countdown from where it was
    } 
    // --- PAUSING the timer ---
    else if (data.isRunning === false && scoreboard.isRunning) {
        const elapsed = Math.floor((Date.now() - scoreboard.startTime) / 1000);
        const newTime = Math.max(0, scoreboard.pauseTime - elapsed);
        updateData.time = newTime;
    } 
    // --- SETTING NEW TIME ---
    else if (typeof data.initialTime !== 'undefined') {
       updateData.time = data.initialTime;
       updateData.isRunning = false; // Always stop timer when setting new time
    }
    
    await update(scoreboardRef, updateData);
  }, [database, scoreboard, scoreboardRef]);

  const resetScoreboard = useCallback(() => {
    if (!database) return;
    if (window.confirm('Are you sure you want to reset all scoreboard data (scores, time, etc.)? The logo will not be changed.')) {
        // Preserve logo and colors on reset
        const newScoreboardState = { 
            ...defaultScoreboard, 
            logoSrc: scoreboard?.logoSrc || null,
            teamAColor: scoreboard?.teamAColor || TEAM_A_COLOR,
            teamBColor: scoreboard?.teamBColor || TEAM_B_COLOR,
            teamAName: scoreboard?.teamAName || 'Tim A',
            teamBName: scoreboard?.teamBName || 'Tim B',
        };
        set(scoreboardRef, newScoreboardState);
    }
  }, [database, scoreboardRef, scoreboard]);

  const swapTeams = useCallback(() => {
    if (!database || !scoreboard) return;

    const swappedData = {
        teamAName: scoreboard.teamBName,
        teamBName: scoreboard.teamAName,
        teamAScore: scoreboard.teamBScore,
        teamBScore: scoreboard.teamAScore,
        teamAFouls: scoreboard.teamBFouls,
        teamBFouls: scoreboard.teamAFouls,
        teamAColor: scoreboard.teamBColor,
        teamBColor: scoreboard.teamAColor,
    };

    update(scoreboardRef, swappedData);
  }, [database, scoreboard, scoreboardRef]);

  return { scoreboard, loading, error, updateScoreboard, resetScoreboard, swapTeams };
}
