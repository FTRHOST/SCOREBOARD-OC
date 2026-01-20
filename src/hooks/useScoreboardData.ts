
'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useDatabase } from '@/firebase';
import { ref, onValue, update, set } from 'firebase/database';

const SCOREBOARD_PATH = 'scoreboard';
const TEAM_A_COLOR = '#B72FCE';
const TEAM_B_COLOR = '#EF7438';
const INITIAL_TIME_SECONDS = 20 * 60;
const INITIAL_COLOR_SUGGESTIONS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFFFFF', '#000000'];

export interface LayoutStyle {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  visible: boolean;
}

export interface ScoreboardLayout {
  // Model 1
  model1_teamAName: LayoutStyle;
  model1_teamBName: LayoutStyle;
  model1_teamAScore: LayoutStyle;
  model1_teamBScore: LayoutStyle;
  model1_logo: LayoutStyle;
  model1_half: LayoutStyle;
  model1_scoreContainer: LayoutStyle;

  // Model 2
  model2_teamAName: LayoutStyle;
  model2_teamBName: LayoutStyle;
  model2_teamAScore: LayoutStyle;
  model2_teamBScore: LayoutStyle;
  model2_teamAFouls: LayoutStyle;
  model2_teamBFouls: LayoutStyle;
  model2_foulsALabel: LayoutStyle;
  model2_foulsBLabel: LayoutStyle;
  model2_logo: LayoutStyle;
  model2_time: LayoutStyle;
  model2_half: LayoutStyle;

  // Model 3
  model3_logo: LayoutStyle;
  model3_teamAName: LayoutStyle;
  model3_teamAScore: LayoutStyle;
  model3_teamAFouls: LayoutStyle;
  model3_teamBName: LayoutStyle;
  model3_teamBScore: LayoutStyle;
  model3_teamBFouls: LayoutStyle;
  model3_half: LayoutStyle;
  model3_time: LayoutStyle;
}


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
  animationTrigger?: number;
  layout: ScoreboardLayout;
  eventTitle?: string;
  zoomScale: number;
}

export const defaultLayout: ScoreboardLayout = {
  // Model 1 Defaults based on the new reference image
  model1_scoreContainer: { x: 320, y: 41, width: 408, height: 105, visible: true, fontSize: 0 },
  model1_teamAName: { x: 0, y: 41, width: 320, height: 105, fontSize: 88, visible: true },
  model1_teamBName: { x: 728, y: 41, width: 320, height: 105, fontSize: 88, visible: true },
  model1_teamAScore: { x: 320, y: 41, width: 144, height: 105, fontSize: 96, visible: true },
  model1_teamBScore: { x: 584, y: 41, width: 144, height: 105, fontSize: 96, visible: true },
  model1_logo: { x: 405, y: 0, width: 238, height: 188, visible: true, fontSize: 0 },
  model1_half: { x: 405, y: 165, width: 233, height: 48, fontSize: 42, visible: true },

  // Model 2 Defaults
  model2_teamAName: { x: 0, y: 41, width: 320, height: 105, fontSize: 82, visible: true },
  model2_teamBName: { x: 728, y: 41, width: 320, height: 105, fontSize: 82, visible: true },
  model2_teamAScore: { x: 249, y: 41, width: 160, height: 105, fontSize: 96, visible: true },
  model2_teamBScore: { x: 584, y: 41, width: 144, height: 105, fontSize: 96, visible: true },
  model2_foulsALabel: { x: 248, y: 153, width: 72, height: 79, fontSize: 18, visible: true },
  model2_foulsBLabel: { x: 728, y: 153, width: 72, height: 79, fontSize: 18, visible: true },
  model2_teamAFouls: { x: 320, y: 153, width: 72, height: 79, fontSize: 88, visible: true },
  model2_teamBFouls: { x: 656, y: 153, width: 72, height: 79, fontSize: 88, visible: true },
  model2_logo: { x: 400, y: 0, width: 238, height: 188, visible: true },
  model2_time: { x: 407, y: 153, width: 233, height: 79, fontSize: 72, visible: true },
  model2_half: { x: 407, y: 243, width: 233, height: 48, fontSize: 36, visible: true },

  // Model 3 Defaults with 5px gap
  model3_logo: { x: 0, y: 0, width: 145, height: 162, visible: true },
  model3_teamAName: { x: 150, y: 0, width: 95, height: 50, fontSize: 18, visible: true },
  model3_teamAScore: { x: 250, y: 0, width: 95, height: 50, fontSize: 36, visible: true },
  model3_teamAFouls: { x: 350, y: 0, width: 95, height: 50, fontSize: 36, visible: true },
  model3_teamBName: { x: 150, y: 55, width: 95, height: 50, fontSize: 18, visible: true },
  model3_teamBScore: { x: 250, y: 55, width: 95, height: 50, fontSize: 36, visible: true },
  model3_teamBFouls: { x: 350, y: 55, width: 95, height: 50, fontSize: 36, visible: true },
  model3_half: { x: 150, y: 110, width: 95, height: 52, fontSize: 24, visible: true },
  model3_time: { x: 250, y: 110, width: 195, height: 52, fontSize: 30, visible: true },
};


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
  layout: defaultLayout,
  eventTitle: 'SCOREBOARD',
  zoomScale: 100
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

    // Fallback timeout
    const timeoutId = setTimeout(() => {
        setScoreboard(defaultScoreboard);
        setLoading(false);
    }, 2000);

    const unsubscribe = onValue(scoreboardRef, (snapshot) => {
      clearTimeout(timeoutId); // Clear timeout on success
      let data: Scoreboard;
      if (snapshot.exists()) {
        const val = snapshot.val();
        // Deep merge layout
        const mergedLayout = { ...defaultLayout };
        for (const modelKey in defaultLayout) {
          // @ts-ignore
          mergedLayout[modelKey] = { ...defaultLayout[modelKey], ...(val.layout?.[modelKey] || {}) };
        }
        
        data = { ...defaultScoreboard, ...val, layout: mergedLayout };
        
        // Ensure colorSuggestions exist
        if (!data.colorSuggestions) {
          data.colorSuggestions = INITIAL_COLOR_SUGGESTIONS;
        }
      } else {
        data = defaultScoreboard;
        set(scoreboardRef, data); // Initialize if not present
      }
      setScoreboard(data);
      setLoading(false);
    }, (err) => {
      clearTimeout(timeoutId);
      console.error("RTDB read failed:", err);
      // Fallback on error
      setScoreboard(defaultScoreboard);
      setLoading(false);
    });

    return () => {
        clearTimeout(timeoutId);
        unsubscribe();
    }
  }, [database]);
  
  const updateScoreboard = useCallback(async (data: Partial<Scoreboard>) => {
    if (!database || !scoreboard) return;
    
    const scoreboardRef = ref(database, SCOREBOARD_PATH);
    let updateData: Partial<Scoreboard> = { ...data };

    // --- STARTING the timer ---
    if (data.isRunning === true && !scoreboard.isRunning) {
        // Set the start time based on current server time, and pauseTime to current time value
        updateData.startTime = Date.now();
        updateData.pauseTime = scoreboard.time;
    } 
    // --- PAUSING the timer ---
    else if (data.isRunning === false && scoreboard.isRunning) {
        // Calculate remaining time based on when it was started
        const elapsed = Math.floor((Date.now() - scoreboard.startTime) / 1000);
        const newTime = Math.max(0, scoreboard.pauseTime - elapsed);
        updateData.time = newTime;
        // No need to update pauseTime here, it's already the correct remaining time
    } 
    // --- SETTING NEW TIME ---
    else if (typeof data.initialTime !== 'undefined') {
       // When setting a new time, reset everything
       updateData.time = data.initialTime;
       updateData.pauseTime = data.initialTime; // Sync pauseTime
       updateData.isRunning = false;
       updateData.startTime = 0;
    }
    
    await update(scoreboardRef, updateData);
  }, [database, scoreboard]);

  // This effect runs the VISUAL timer on the client side based on server data
  useEffect(() => {
    if (timerRef.current) {
        clearInterval(timerRef.current);
    }
    
    if (scoreboard?.isRunning) {
        timerRef.current = setInterval(() => {
            setScoreboard(prevScoreboard => {
                if (!prevScoreboard || !prevScoreboard.isRunning) {
                    return prevScoreboard;
                }
                const elapsed = Math.floor((Date.now() - prevScoreboard.startTime) / 1000);
                const newTime = Math.max(0, prevScoreboard.pauseTime - elapsed);

                if (newTime === 0) {
                   if (timerRef.current) clearInterval(timerRef.current);
                   // The controller will be responsible for setting isRunning to false
                   // to avoid race conditions. We just stop the client timer.
                }

                return {
                    ...prevScoreboard,
                    time: newTime,
                };
            });
        }, 1000);
    }

    return () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
  }, [scoreboard?.isRunning, scoreboard?.startTime, scoreboard?.pauseTime]);

  const resetScoreboard = useCallback(() => {
    if (!database || !scoreboard) return;
    
    const scoreboardRef = ref(database, SCOREBOARD_PATH);
    const resetData: Partial<Scoreboard> = {
      teamAScore: 0,
      teamBScore: 0,
      teamAFouls: 0,
      teamBFouls: 0,
      time: scoreboard.initialTime,
      isRunning: false,
      half: 'Babak 1',
      logoSrc: scoreboard.logoSrc, // Keep the existing logo
    };

    update(scoreboardRef, resetData);
  }, [database, scoreboardRef, scoreboard]);

  const swapTeams = useCallback(() => {
    if (!database || !scoreboard) return;
    
    const scoreboardRef = ref(database, SCOREBOARD_PATH);
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
    const scoreboardRef = ref(database, SCOREBOARD_PATH);
    const currentSuggestions = scoreboard.colorSuggestions || [];
    if (!currentSuggestions.includes(color)) {
      const newSuggestions = [...currentSuggestions, color];
      update(scoreboardRef, { colorSuggestions: newSuggestions });
    }
  }, [database, scoreboard]);

  const deleteColorSuggestion = useCallback((colorToDelete: string) => {
    if (!database || !scoreboard) return;
    const scoreboardRef = ref(database, SCOREBOARD_PATH);
    const currentSuggestions = scoreboard.colorSuggestions || [];
    const newSuggestions = currentSuggestions.filter(color => color !== colorToDelete);
    update(scoreboardRef, { colorSuggestions: newSuggestions });
  }, [database, scoreboard]);


  return { scoreboard, loading, error, updateScoreboard, resetScoreboard, swapTeams, addColorSuggestion, deleteColorSuggestion };
}

    