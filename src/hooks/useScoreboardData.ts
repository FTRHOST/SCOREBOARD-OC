
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
  const [, setTick] = useState(0); // State to force re-render every second for timer display

  const scoreboardRef = ref(database, SCOREBOARD_PATH);

  // This effect subscribes to RTDB changes
  useEffect(() => {
    if (!database) return;

    const unsubscribe = onValue(scoreboardRef, (snapshot) => {
      if (snapshot.exists()) {
        setScoreboard(snapshot.val());
      } else {
        set(scoreboardRef, defaultScoreboard); // Initialize if not present
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
  
  // This effect runs the VISUAL timer on the client side based on server data
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (scoreboard?.isRunning) {
      interval = setInterval(() => {
        // This just forces a re-render to update the displayed time
        setTick(tick => tick + 1); 
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [scoreboard?.isRunning]);
  
  const getDisplayTime = () => {
    if (!scoreboard) return INITIAL_TIME_SECONDS;
    if (scoreboard.isRunning) {
        const elapsed = Math.floor((Date.now() - scoreboard.startTime) / 1000);
        return Math.max(0, scoreboard.pauseTime - elapsed);
    }
    return scoreboard.time;
  }

  const updateScoreboard = useCallback(async (data: Partial<Scoreboard>) => {
    if (!database || !scoreboard) return;
    
    let updateData: Partial<Scoreboard> = { ...data };

    // --- STARTING the timer ---
    if (data.isRunning === true && !scoreboard.isRunning) {
        updateData.startTime = Date.now();
        // Start countdown from where it was last paused or set.
        // `scoreboard.time` holds the last valid state.
        updateData.pauseTime = scoreboard.time;
    } 
    // --- PAUSING the timer ---
    else if (data.isRunning === false && scoreboard.isRunning) {
        const elapsed = Math.floor((Date.now() - scoreboard.startTime) / 1000);
        const newTime = Math.max(0, scoreboard.pauseTime - elapsed);
        updateData.time = newTime;
        updateData.pauseTime = newTime; // Store the exact paused time
    } 
    // --- SETTING NEW TIME ---
    else if (typeof data.initialTime !== 'undefined') {
       updateData.time = data.initialTime;
       updateData.pauseTime = data.initialTime; // Also update pauseTime
       updateData.isRunning = false; // Always stop timer when setting new time
    }
    
    await update(scoreboardRef, updateData);
  }, [database, scoreboard, scoreboardRef]);

  const resetScoreboard = useCallback(() => {
    if (!database) return;
    if (window.confirm('Are you sure you want to reset all scoreboard data (scores, time, etc.)? The logo will not be changed.')) {
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

  // Create a proxy/derived scoreboard object that shows the calculated time
  const displayScoreboard = scoreboard ? {
      ...scoreboard,
      time: getDisplayTime()
  } : null;


  return { scoreboard: displayScoreboard, loading, error, updateScoreboard, resetScoreboard, swapTeams };
}
