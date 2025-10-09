
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
}

const defaultLayout: ScoreboardLayout = {
  // Model 1 Defaults based on user image
  model1_teamAName: { x: 0, y: 41, width: 320, height: 105, fontSize: 48, visible: true }, // Box for Team A
  model1_teamBName: { x: 728, y: 41, width: 320, height: 105, fontSize: 48, visible: true }, // Box for Team B
  model1_teamAScore: { x: 320, y: 41, width: 144, height: 105, fontSize: 96, visible: true }, // Score A
  model1_teamBScore: { x: 584, y: 41, width: 144, height: 105, fontSize: 96, visible: true }, // Score B
  model1_logo: { x: 405, y: 0, width: 238, height: 188, visible: true, fontSize: 0 }, // Logo on top
  model1_half: { x: 405, y: 179, width: 233, height: 48, fontSize: 36, visible: true }, // Half below
  model1_scoreContainer: { x: 320, y: 41, width: 408, height: 105, visible: true, fontSize: 0 }, // Central container

  // Model 2 Defaults
  model2_teamAName: { x: 0, y: 41, width: 320, height: 105, fontSize: 82, visible: true },
  model2_teamBName: { x: 728, y: 41, width: 320, height: 105, fontSize: 82, visible: true },
  model2_teamAScore: { x: 249, y: 41, width: 160, height: 105, fontSize: 96, visible: true },
  model2_teamBScore: { x: 584, y: 41, width: 144, height: 105, fontSize: 96, visible: true },
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
        updateData.pauseTime = scoreboard.time;
    } 
    // --- PAUSING the timer ---
    else if (data.isRunning === false && scoreboard.isRunning) {
        const elapsed = Math.floor((Date.now() - scoreboard.startTime) / 1000);
        const newTime = Math.max(0, scoreboard.pauseTime - elapsed);
        updateData.time = newTime;
        updateData.pauseTime = newTime; 
    } 
    // --- SETTING NEW TIME ---
    else if (typeof data.initialTime !== 'undefined') {
       updateData.time = data.initialTime;
       updateData.pauseTime = data.initialTime;
       updateData.isRunning = false;
    }
    
    await update(scoreboardRef, updateData);
  }, [database, scoreboard, scoreboardRef]);

  // This effect runs the VISUAL timer on the client side based on server data
  useEffect(() => {
    if (timerRef.current) {
        clearInterval(timerRef.current);
    }
    
    if (scoreboard?.isRunning) {
        timerRef.current = setInterval(() => {
            if (scoreboard) { 
                const elapsed = Math.floor((Date.now() - scoreboard.startTime) / 1000);
                const newTime = Math.max(0, scoreboard.pauseTime - elapsed);
                set(ref(database, `${SCOREBOARD_PATH}/time`), newTime);
                
                if (newTime === 0) {
                  update(ref(database, SCOREBOARD_PATH), { isRunning: false });
                }
            }
        }, 1000);
    }

    return () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
  }, [scoreboard?.isRunning, scoreboard?.startTime, scoreboard?.pauseTime, database]);

  const resetScoreboard = useCallback(() => {
    if (!database || !scoreboard) return;
    
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
