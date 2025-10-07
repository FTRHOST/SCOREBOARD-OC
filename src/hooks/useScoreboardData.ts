
'use client';

import { useEffect, useCallback, useState } from 'react';
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
    } else if (scoreboard) {
        setLocalTime(scoreboard.time);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [scoreboard]);

  const updateScoreboard = useCallback(async (data: Partial<Scoreboard>) => {
    if (!database || !scoreboard) return;
    
    const now = Date.now();
    let updateData: Partial<Scoreboard> = { ...data };

    if (data.isRunning === true && !scoreboard.isRunning) {
        // --- STARTING the timer ---
        updateData.startTime = now;
        updateData.pauseTime = scoreboard.time; // Start countdown from where it was
    } else if (data.isRunning === false && scoreboard.isRunning) {
        // --- PAUSING the timer ---
        const elapsed = Math.floor((now - scoreboard.startTime) / 1000);
        const newTime = Math.max(0, scoreboard.pauseTime - elapsed);
        
        updateData.time = newTime;
        updateData.pauseTime = newTime; 
        updateData.startTime = 0; 
    }
    
    await update(scoreboardRef, updateData);
  }, [database, scoreboard, scoreboardRef]);

  const resetScoreboard = useCallback(() => {
    if (!database) return;
    if (window.confirm('Are you sure you want to reset all scoreboard data (scores, time, etc.)? The logo will not be changed.')) {
        const newScoreboardState = { ...defaultScoreboard, logoSrc: scoreboard?.logoSrc || null };
        set(scoreboardRef, newScoreboardState);
    }
  }, [database, scoreboardRef, scoreboard?.logoSrc]);

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

  const displayScoreboard = scoreboard ? { ...scoreboard, time: localTime ?? scoreboard.time } : null;

  return { scoreboard: displayScoreboard, loading, error, updateScoreboard, resetScoreboard, swapTeams };
}

    