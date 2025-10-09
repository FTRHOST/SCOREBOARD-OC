
'use client';

import { useEffect, useCallback, useState } from 'react';
import { useDatabase } from '@/firebase';
import { ref, onValue, update, set } from 'firebase/database';

const VOLLEYBALL_PATH = 'volleyball';
const SCOREBOARD_PATH = 'scoreboard'; // For shared data like eventTitle
const TEAM_A_COLOR = '#B72FCE';
const TEAM_B_COLOR = '#F97316'; // orange-400
const MAX_SETS = 5;
const INITIAL_COLOR_SUGGESTIONS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFFFFF', '#000000'];

export interface VolleyballLayoutStyle {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  visible: boolean;
}

export interface VolleyballLayout {
  // Model 1
  model1_teamABox: VolleyballLayoutStyle;
  model1_teamBBox: VolleyballLayoutStyle;
  model1_centerScoreBox: VolleyballLayoutStyle;
  model1_matchTitleBox: VolleyballLayoutStyle;
  model1_teamAName: VolleyballLayoutStyle;
  model1_teamBName: VolleyballLayoutStyle;
  model1_teamASets: VolleyballLayoutStyle;
  model1_teamBSets: VolleyballLayoutStyle;
  model1_matchTitleText: VolleyballLayoutStyle;
  model1_logo: VolleyballLayoutStyle;
  // Model 2
  model2_teamABox: VolleyballLayoutStyle;
  model2_teamBBox: VolleyballLayoutStyle;
  model2_centerScoreBox: VolleyballLayoutStyle;
  model2_matchTitleBox: VolleyballLayoutStyle;
  model2_teamASetHistoryBox: VolleyballLayoutStyle;
  model2_teamBSetHistoryBox: VolleyballLayoutStyle;
  model2_teamAName: VolleyballLayoutStyle;
  model2_teamBName: VolleyballLayoutStyle;
  model2_teamASets: VolleyballLayoutStyle;
  model2_teamBSets: VolleyballLayoutStyle;
  model2_matchTitleText: VolleyballLayoutStyle;
  model2_logo: VolleyballLayoutStyle;
  model2_teamASet1Score: VolleyballLayoutStyle;
  model2_teamASet2Score: VolleyballLayoutStyle;
  model2_teamASet3Score: VolleyballLayoutStyle;
  model2_teamBSet1Score: VolleyballLayoutStyle;
  model2_teamBSet2Score: VolleyballLayoutStyle;
  model2_teamBSet3Score: VolleyballLayoutStyle;
  // Model 3
  model3_teamANameBox: VolleyballLayoutStyle;
  model3_teamBNameBox: VolleyballLayoutStyle;
  model3_teamASetBox: VolleyballLayoutStyle;
  model3_teamBSetBox: VolleyballLayoutStyle;
  model3_logoBox: VolleyballLayoutStyle;
  model3_teamASetHistoryBox: VolleyballLayoutStyle;
  model3_teamBSetHistoryBox: VolleyballLayoutStyle;
  model3_matchTitleBox: VolleyballLayoutStyle;
  model3_teamANameText: VolleyballLayoutStyle;
  model3_teamBNameText: VolleyballLayoutStyle;
  model3_teamASetsText: VolleyballLayoutStyle;
  model3_teamBSetsText: VolleyballLayoutStyle;
  model3_matchTitleText: VolleyballLayoutStyle;
  model3_logoImage: VolleyballLayoutStyle;
}

export const defaultVolleyballLayout: VolleyballLayout = {
  // Model 1
  model1_teamABox: { x: 0, y: 41, width: 320, height: 112, visible: true, fontSize: 0 },
  model1_teamBBox: { x: 728, y: 41, width: 320, height: 112, visible: true, fontSize: 0 },
  model1_centerScoreBox: { x: 320, y: 41, width: 408, height: 112, visible: true, fontSize: 0 },
  model1_matchTitleBox: { x: 407, y: 178, width: 240, height: 48, visible: true, fontSize: 0 },
  model1_teamAName: { x: 0, y: 41, width: 320, height: 112, visible: true, fontSize: 88 },
  model1_teamBName: { x: 728, y: 41, width: 320, height: 112, visible: true, fontSize: 88 },
  model1_teamASets: { x: 351, y: 20, width: 96, height: 96, visible: true, fontSize: 96 },
  model1_teamBSets: { x: 602, y: 20, width: 96, height: 96, visible: true, fontSize: 96 },
  model1_matchTitleText: { x: 407, y: 178, width: 240, height: 48, visible: true, fontSize: 48 },
  model1_logo: { x: 405, y: 0, width: 238, height: 188, visible: true, fontSize: 0 },
  // Model 2
  model2_teamABox: { x: 1, y: 41, width: 320, height: 112, visible: true, fontSize: 0 },
  model2_teamBBox: { x: 729, y: 41, width: 320, height: 112, visible: true, fontSize: 0 },
  model2_centerScoreBox: { x: 321, y: 41, width: 408, height: 112, visible: true, fontSize: 0 },
  model2_matchTitleBox: { x: 408, y: 189, width: 240, height: 48, visible: true, fontSize: 0 },
  model2_teamASetHistoryBox: { x: 0, y: 146, width: 320, height: 112, visible: true, fontSize: 0 },
  model2_teamBSetHistoryBox: { x: 727, y: 146, width: 320, height: 112, visible: true, fontSize: 0 },
  model2_teamAName: { x: 1, y: 41, width: 320, height: 96, visible: true, fontSize: 88 },
  model2_teamBName: { x: 729, y: 41, width: 320, height: 96, visible: true, fontSize: 88 },
  model2_teamASets: { x: 352, y: 20, width: 96, height: 96, visible: true, fontSize: 96 },
  model2_teamBSets: { x: 603, y: 20, width: 96, height: 96, visible: true, fontSize: 96 },
  model2_matchTitleText: { x: 408, y: 189, width: 240, height: 48, visible: true, fontSize: 48 },
  model2_logo: { x: 406, y: 0, width: 238, height: 188, visible: true, fontSize: 0 },
  model2_teamASet1Score: { x: 35, y: 146, width: 64, height: 96, fontSize: 72, visible: true },
  model2_teamASet2Score: { x: 129, y: 146, width: 64, height: 96, fontSize: 72, visible: true },
  model2_teamASet3Score: { x: 222, y: 146, width: 64, height: 96, fontSize: 72, visible: true },
  model2_teamBSet1Score: { x: 759, y: 146, width: 64, height: 96, fontSize: 72, visible: true },
  model2_teamBSet2Score: { x: 852, y: 146, width: 64, height: 96, fontSize: 72, visible: true },
  model2_teamBSet3Score: { x: 945, y: 146, width: 64, height: 96, fontSize: 72, visible: true },
  // Model 3
  model3_teamANameBox: { x: 163, y: 20, width: 160, height: 64, visible: true, fontSize: 0 },
  model3_teamBNameBox: { x: 163, y: 90, width: 160, height: 64, visible: true, fontSize: 0 },
  model3_teamASetBox: { x: 321, y: 20, width: 80, height: 64, visible: true, fontSize: 0 },
  model3_teamBSetBox: { x: 321, y: 92, width: 80, height: 64, visible: true, fontSize: 0 },
  model3_logoBox: { x: 0, y: 20, width: 160, height: 136, visible: true, fontSize: 0 },
  model3_teamASetHistoryBox: { x: 385, y: 0, width: 288, height: 80, visible: true, fontSize: 0 },
  model3_teamBSetHistoryBox: { x: 385, y: 73, width: 288, height: 80, visible: true, fontSize: 0 },
  model3_matchTitleBox: { x: 0, y: 164, width: 673, height: 48, visible: true, fontSize: 0 },
  model3_teamANameText: { x: 163, y: 20, width: 160, height: 64, visible: true, fontSize: 48 },
  model3_teamBNameText: { x: 163, y: 90, width: 160, height: 64, visible: true, fontSize: 48 },
  model3_teamASetsText: { x: 321, y: 20, width: 80, height: 64, visible: true, fontSize: 72 },
  model3_teamBSetsText: { x: 321, y: 92, width: 80, height: 64, visible: true, fontSize: 72 },
  model3_matchTitleText: { x: 0, y: 164, width: 673, height: 48, visible: true, fontSize: 48 },
  model3_logoImage: { x: 17, y: 33, width: 130, height: 113, visible: true, fontSize: 0 },
};


export interface VolleyballScoreboard {
  teamAName: string;
  teamBName: string;
  teamASets: number;
  teamBSets: number;
  teamAPoints: number;
  teamBPoints: number;
  currentSet: number;
  teamAColor: string;
  teamBColor: string;
  logoSrc: string | null;
  matchTitle: string;
  setHistory: Array<{ teamAScore: number; teamBScore: number }>;
  colorSuggestions: string[];
  layout: VolleyballLayout;
  eventTitle: string;
}

const defaultVolleyballScoreboard: VolleyballScoreboard = {
  teamAName: 'Tim A',
  teamBName: 'Tim B',
  teamASets: 0,
  teamBSets: 0,
  teamAPoints: 0,
  teamBPoints: 0,
  currentSet: 1,
  teamAColor: TEAM_A_COLOR,
  teamBColor: TEAM_B_COLOR,
  logoSrc: null,
  matchTitle: "FINAL",
  setHistory: Array(MAX_SETS).fill({ teamAScore: 0, teamBScore: 0 }),
  colorSuggestions: INITIAL_COLOR_SUGGESTIONS,
  layout: defaultVolleyballLayout,
  eventTitle: 'SCOREBOARD'
};

export function useVolleyballData() {
  const database = useDatabase();
  const [scoreboard, setScoreboard] = useState<VolleyballScoreboard | null>(null);
  const [loading, setLoading] = useState(true);
  const error = null; // Simplified for now

  useEffect(() => {
    if (!database) return;

    const volleyballRef = ref(database, VOLLEYBALL_PATH);
    const scoreboardRef = ref(database, SCOREBOARD_PATH);
    
    let volleyballData: any = null;
    let sharedData: any = null;

    const checkAndSetData = () => {
      if (volleyballData && sharedData) {
        
        const mergedLayout = { ...defaultVolleyballLayout };
        for (const modelKey in defaultVolleyballLayout) {
            // @ts-ignore
            mergedLayout[modelKey] = { ...defaultVolleyballLayout[modelKey], ...(volleyballData.layout?.[modelKey] || {}) };
        }

        const history = volleyballData.setHistory || [];
        const newHistory = Array(MAX_SETS).fill({ teamAScore: 0, teamBScore: 0 });
        for(let i=0; i < history.length && i < MAX_SETS; i++) {
          newHistory[i] = history[i] || { teamAScore: 0, teamBScore: 0 };
        }
        
        const data = { 
          ...defaultVolleyballScoreboard, 
          ...volleyballData, 
          layout: mergedLayout, 
          setHistory: newHistory,
          logoSrc: sharedData.logoSrc,
          eventTitle: sharedData.eventTitle,
        };

        if (!data.colorSuggestions) {
          data.colorSuggestions = INITIAL_COLOR_SUGGESTIONS;
        }
        
        setScoreboard(data);
        setLoading(false);
      }
    };
    
    const unsubscribeVoli = onValue(volleyballRef, (snapshot) => {
      if (snapshot.exists()) {
        volleyballData = snapshot.val();
      } else {
        set(volleyballRef, defaultVolleyballScoreboard); // Initialize if not present
        volleyballData = defaultVolleyballScoreboard;
      }
      checkAndSetData();
    });
    
    const unsubscribeShared = onValue(scoreboardRef, (snapshot) => {
        if(snapshot.exists()) {
            sharedData = snapshot.val();
            checkAndSetData();
        } else {
            sharedData = {};
            checkAndSetData();
        }
    });

    return () => {
        unsubscribeVoli();
        unsubscribeShared();
    }
  }, [database]);
  
  
  const updateScoreboard = useCallback(async (data: Partial<VolleyballScoreboard>, isShared: boolean = false) => {
    if (!database) return;
    const path = isShared ? SCOREBOARD_PATH : VOLLEYBALL_PATH;
    const dataRef = ref(database, path);
    await update(dataRef, data);
  }, [database]);

  const updatePoints = (team: 'A' | 'B', delta: number) => {
    if (!scoreboard) return;
    const currentPoints = team === 'A' ? scoreboard.teamAPoints : scoreboard.teamBPoints;
    const newPoints = Math.max(0, currentPoints + delta);
    updateScoreboard(team === 'A' ? { teamAPoints: newPoints } : { teamBPoints: newPoints });
  };

  const updateSets = (team: 'A' | 'B', delta: number) => {
    if (!scoreboard) return;
    const currentSets = team === 'A' ? scoreboard.teamASets : scoreboard.teamBSets;
    const newSets = Math.max(0, currentSets + delta);
    updateScoreboard(team === 'A' ? { teamASets: newSets } : { teamBSets: newSets });
  };
  
  const winSet = (winner: 'A' | 'B') => {
    if (!scoreboard || scoreboard.currentSet > MAX_SETS) return;

    const { teamAPoints, teamBPoints, teamASets, teamBSets, currentSet, setHistory } = scoreboard;

    const newSetHistory = [...setHistory];
    newSetHistory[currentSet - 1] = { teamAScore: teamAPoints, teamBScore: teamBPoints };
    
    const newTeamASets = teamASets + (winner === 'A' ? 1 : 0);
    const newTeamBSets = teamBSets + (winner === 'B' ? 1 : 0);

    updateScoreboard({
      teamAPoints: 0,
      teamBPoints: 0,
      teamASets: newTeamASets,
      teamBSets: newTeamBSets,
      currentSet: Math.min(currentSet + 1, MAX_SETS + 1),
      setHistory: newSetHistory,
    });
  };
  
  const updateSetHistoryScore = useCallback((setIndex: number, team: 'A' | 'B', score: number) => {
    if (!database || !scoreboard || setIndex >= scoreboard.setHistory.length) return;

    const newHistory = [...scoreboard.setHistory];
    const updatedSet = { ...newHistory[setIndex] };
    
    if (team === 'A') {
      updatedSet.teamAScore = score;
    } else {
      updatedSet.teamBScore = score;
    }
    newHistory[setIndex] = updatedSet;
    
    const teamASets = newHistory.reduce((acc, set, index) => {
        if (index < MAX_SETS && set.teamAScore > set.teamBScore) return acc + 1;
        return acc;
    }, 0);
    const teamBSets = newHistory.reduce((acc, set, index) => {
        if (index < MAX_SETS && set.teamBScore > set.teamAScore) return acc + 1;
        return acc;
    }, 0);

    update(ref(database, VOLLEYBALL_PATH), { setHistory: newHistory, teamASets, teamBSets });
  }, [database, scoreboard]);


  const resetSet = () => {
    updateScoreboard({ teamAPoints: 0, teamBPoints: 0 });
  };

  const resetMatch = () => {
    if (!scoreboard) return;
    updateScoreboard({
      teamASets: 0,
      teamBSets: 0,
      teamAPoints: 0,
      teamBPoints: 0,
      currentSet: 1,
      setHistory: Array(MAX_SETS).fill({ teamAScore: 0, teamBScore: 0 }),
    });
  };
  
  const swapTeams = () => {
    if (!scoreboard) return;
    const newHistory = scoreboard.setHistory.map(set => ({
      teamAScore: set.teamBScore,
      teamBScore: set.teamAScore
    }));

    updateScoreboard({
      teamAName: scoreboard.teamBName,
      teamBName: scoreboard.teamAName,
      teamAColor: scoreboard.teamBColor,
      teamBColor: scoreboard.teamAColor,
      teamASets: scoreboard.teamBSets,
      teamBSets: scoreboard.teamASets,
      teamAPoints: scoreboard.teamBPoints,
      teamBPoints: scoreboard.teamAPoints,
      setHistory: newHistory,
    });
  };

  const deleteColorSuggestion = useCallback((colorToDelete: string) => {
    if (!database || !scoreboard) return;
    const currentSuggestions = scoreboard.colorSuggestions || [];
    const newSuggestions = currentSuggestions.filter(color => color !== colorToDelete);
    update(ref(database, VOLLEYBALL_PATH), { colorSuggestions: newSuggestions });
  }, [database, scoreboard]);


  return { scoreboard, loading, error, updateScoreboard, updatePoints, updateSets, winSet, resetSet, resetMatch, swapTeams, updateSetHistoryScore, deleteColorSuggestion };
}

    
