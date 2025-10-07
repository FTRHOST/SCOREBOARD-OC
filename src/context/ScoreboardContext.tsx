"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';

const TEAM_A_COLOR = '#b72fce';
const TEAM_B_COLOR = '#ef7438';
const INITIAL_TIME = 20 * 60; // 20 minutes in seconds

interface ScoreboardState {
  teamAName: string;
  teamBName: string;
  teamAScore: number;
  teamBScore: number;
  teamAFouls: number;
  teamBFouls: number;
  time: number;
  half: string;
  isRunning: boolean;
  teamAColor: string;
  teamBColor: string;
  logoSrc: string | null;
  setLogoSrc: (src: string | null) => void;
  setTeamName: (team: 'A' | 'B', name: string) => void;
  updateScore: (team: 'A' | 'B', delta: number) => void;
  updateFouls: (team: 'A' | 'B') => void;
  resetFouls: (team: 'A' | 'B') => void;
  setHalf: (newHalf: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setInitialTime: (minutes: number) => void;
}

const ScoreboardContext = createContext<ScoreboardState | undefined>(undefined);

export const ScoreboardProvider = ({ children }: { children: ReactNode }) => {
  const [teamAName, setTeamAName] = useState('10.1');
  const [teamBName, setTeamBName] = useState('10.2');
  const [teamAScore, setTeamAScore] = useState(1);
  const [teamBScore, setTeamBScore] = useState(1);
  const [teamAFouls, setTeamAFouls] = useState(0);
  const [teamBFouls, setTeamBFouls] = useState(1);
  const [time, setTime] = useState(INITIAL_TIME);
  const [initialTimeValue, setInitialTimeValue] = useState(INITIAL_TIME);
  const [half, setHalf] = useState('First Half');
  const [isRunning, setIsRunning] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const setTeamName = (team: 'A' | 'B', name: string) => {
    if (team === 'A') setTeamAName(name);
    else setTeamBName(name);
  };

  const updateScore = useCallback((team: 'A' | 'B', delta: number) => {
    if (team === 'A') {
      setTeamAScore(prev => Math.max(0, prev + delta));
    } else {
      setTeamBScore(prev => Math.max(0, prev + delta));
    }
  }, []);

  const updateFouls = useCallback((team: 'A' | 'B') => {
    if (team === 'A') {
      setTeamAFouls(prev => prev + 1);
    } else {
      setTeamBFouls(prev => prev + 1);
    }
  }, []);

  const resetFouls = useCallback((team: 'A' | 'B') => {
    if (team === 'A') setTeamAFouls(0);
    else setTeamBFouls(0);
  }, []);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTime(initialTimeValue);
  }, [initialTimeValue]);

  const setInitialTime = (minutes: number) => {
    const newTimeInSeconds = minutes * 60;
    setInitialTimeValue(newTimeInSeconds);
    setTime(newTimeInSeconds);
    setIsRunning(false);
  };


  const value = {
    teamAName,
    teamBName,
    teamAScore,
    teamBScore,
    teamAFouls,
    teamBFouls,
    time,
    half,
    isRunning,
    teamAColor: TEAM_A_COLOR,
    teamBColor: TEAM_B_COLOR,
    logoSrc,
    setLogoSrc,
    setTeamName,
    updateScore,
    updateFouls,
    resetFouls,
    setHalf,
    startTimer,
    pauseTimer,
    resetTimer,
    setInitialTime,
  };

  return (
    <ScoreboardContext.Provider value={value}>
      {children}
    </ScoreboardContext.Provider>
  );
};

export const useScoreboard = () => {
  const context = useContext(ScoreboardContext);
  if (context === undefined) {
    throw new Error('useScoreboard must be used within a ScoreboardProvider');
  }
  return context;
};
