
'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const SCOREBOARD_ID = 'main_scoreboard';
const TEAM_A_COLOR = '#b72fce';
const TEAM_B_COLOR = '#ef7438';
const INITIAL_TIME_SECONDS = 20 * 60;

export interface Scoreboard {
  id: string;
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
  updatedAt: any;
}

const defaultScoreboard: Omit<Scoreboard, 'id' | 'updatedAt'> = {
  teamAName: '10.1',
  teamBName: '10.2',
  teamAScore: 1,
  teamBScore: 1,
  teamAFouls: 0,
  teamBFouls: 1,
  time: INITIAL_TIME_SECONDS,
  initialTime: INITIAL_TIME_SECONDS,
  half: 'First Half',
  isRunning: false,
  teamAColor: TEAM_A_COLOR,
  teamBColor: TEAM_B_COLOR,
  logoSrc: null,
};

export function useScoreboardData() {
  const firestore = useFirestore();
  const scoreboardRef = useMemoFirebase(() => doc(firestore, 'scoreboards', SCOREBOARD_ID), [firestore]);

  const { data: scoreboard, isLoading: loading, error } = useDoc<Scoreboard>(scoreboardRef);

  const [localTime, setLocalTime] = useState(scoreboard?.time ?? INITIAL_TIME_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize doc if it doesn't exist
  useEffect(() => {
    if (!loading && !scoreboard && firestore) {
      const newScoreboardData = {
        ...defaultScoreboard,
        updatedAt: serverTimestamp(),
      };
      // Use setDoc with catch for error handling
      setDoc(scoreboardRef, newScoreboardData).catch(e => {
          const contextualError = new FirestorePermissionError({
            path: scoreboardRef.path,
            operation: 'create',
            requestResourceData: newScoreboardData,
          });
          errorEmitter.emit('permission-error', contextualError);
      });
    }
  }, [loading, scoreboard, firestore, scoreboardRef]);

  // Timer logic
  useEffect(() => {
    if (scoreboard?.isRunning) {
      setLocalTime(scoreboard.time);
      timerRef.current = setInterval(() => {
        setLocalTime(prevTime => {
          const newTime = prevTime > 0 ? prevTime - 1 : 0;
          if (newTime === 0) {
             updateDocumentNonBlocking(scoreboardRef, { isRunning: false, time: 0 });
          }
          // Only update firestore every 5 seconds to reduce writes
          if (newTime % 5 === 0) {
            updateDocumentNonBlocking(scoreboardRef, { time: newTime });
          }
          return newTime;
        });
      }, 1000);
    } else {
       if (timerRef.current) clearInterval(timerRef.current);
       if (scoreboard?.time !== undefined) {
         setLocalTime(scoreboard.time);
       }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scoreboard?.isRunning, scoreboard?.time, scoreboardRef]);


  const memoizedData = useMemo(() => {
    if (!scoreboard) return null;
    return {
      ...scoreboard,
      time: localTime, // Use local time for smooth countdown
    };
  }, [scoreboard, localTime]);

  const updateScoreboard = useCallback((data: Partial<Omit<Scoreboard, 'id'>>) => {
    // serverTimestamp cannot be passed to the error handler as it's not serializable.
    // We handle it separately.
    const dataWithTimestamp = {
        ...data,
        updatedAt: serverTimestamp()
    };
    updateDocumentNonBlocking(scoreboardRef, dataWithTimestamp);
  }, [scoreboardRef]);


  return { scoreboard: memoizedData, loading, error, updateScoreboard };
}
