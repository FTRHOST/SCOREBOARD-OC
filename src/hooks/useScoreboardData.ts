
'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useDatabase } from '@/firebase';
import { ref, onValue, update, set } from 'firebase/database';

const SCOREBOARD_PATH = 'scoreboard';
const TEAM_A_COLOR = '#B72FCE';
const TEAM_B_COLOR = '#EF7438';
const INITIAL_TIME_SECONDS = 20 * 60;
const INITIAL_COLOR_SUGGESTIONS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFFFFF', '#000000'];


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
  colorSuggestions: string[];
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
  colorSuggestions: INITIAL_COLOR_SUGGESTIONS,
};

export function useScoreboardData() {
  const database = useDatabase();
  const [scoreboard, setScoreboard] = useState<Scoreboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const scoreboardRef = ref(database, SCOREBOARD_PATH);

  // This effect subscribes to RTDB changes
  useEffect(() => {
    if (!database) return;

    const unsubscribe = onValue(scoreboardRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Ensure colorSuggestions is always an array
        if (!data.colorSuggestions) {
          data.colorSuggestions = INITIAL_COLOR_SUGGESTIONS;
        }
        setScoreboard(data);
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

  // This effect runs the VISUAL timer on the client side based on server data
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
        clearInterval(timerRef.current);
    }
    
    // If the timer should be running, set up an interval to update the server time
    if (scoreboard?.isRunning) {
        timerRef.current = setInterval(() => {
            if (scoreboard) { // Check again inside interval
                const elapsed = Math.floor((Date.now() - scoreboard.startTime) / 1000);
                const newTime = Math.max(0, scoreboard.pauseTime - elapsed);
                // Directly update the time in the database. 
                // This will trigger the onValue listener on all clients.
                set(ref(database, `${SCOREBOARD_PATH}/time`), newTime);
                
                if (newTime === 0) {
                  // Automatically stop the timer when it hits zero
                  update(ref(database, SCOREBOARD_PATH), { isRunning: false });
                }
            }
        }, 1000);
    }

    // Cleanup function to clear the interval
    return () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
    // Re-run this effect ONLY when isRunning, startTime or pauseTime changes
  }, [scoreboard?.isRunning, scoreboard?.startTime, scoreboard?.pauseTime, database]);

  const resetScoreboard = useCallback(() => {
    if (!database) return;
    const newScoreboardState = { 
        ...defaultScoreboard, 
        logoSrc: scoreboard?.logoSrc || null,
        teamAColor: scoreboard?.teamAColor || TEAM_A_COLOR,
        teamBColor: scoreboard?.teamBColor || TEAM_B_COLOR,
        teamAName: scoreboard?.teamAName || 'Tim A',
        teamBName: scoreboard?.teamBName || 'Tim B',
        colorSuggestions: scoreboard?.colorSuggestions || INITIAL_COLOR_SUGGESTIONS,
    };
    set(scoreboardRef, newScoreboardState);
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

  const addColorSuggestion = useCallback((color: string) => {
    if (!database || !scoreboard) return;
    const currentSuggestions = scoreboard.colorSuggestions || [];
    if (!currentSuggestions.includes(color)) {
      const newSuggestions = [...currentSuggestions, color];
      update(ref(database, SCOREBOARD_PATH), { colorSuggestions: newSuggestions });
    }
  }, [database, scoreboard]);

  const deleteColorSuggestion = useCallback((colorToDelete: string) => {
    if (!database || !scoreboard) return;
    const currentSuggestions = scoreboard.colorSuggestions || [];
    const newSuggestions = currentSuggestions.filter(color => color !== colorToDelete);
    update(ref(database, SCOREBOARD_PATH), { colorSuggestions: newSuggestions });
  }, [database, scoreboard]);


  return { scoreboard, loading, error, updateScoreboard, resetScoreboard, swapTeams, addColorSuggestion, deleteColorSuggestion };
}

    