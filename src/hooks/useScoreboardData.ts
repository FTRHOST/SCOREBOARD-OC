
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDatabase, useUser } from '@/firebase';
import { ref, onValue, update, get, set } from 'firebase/database';

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
};

export function useScoreboardData() {
  const database = useDatabase();
  const { user } = useUser();
  const [scoreboard, setScoreboard] = useState<Scoreboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const scoreboardRef = ref(database, SCOREBOARD_PATH);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect for fetching and subscribing to data
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onValue(scoreboardRef, (snapshot) => {
      if (snapshot.exists()) {
        setScoreboard(snapshot.val());
      } else {
        // If no data exists, admin should create it.
        // For viewers, they'll just see a loading/empty state.
        setScoreboard(null); 
      }
      setLoading(false);
    }, (err) => {
      console.error("RTDB read failed:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [database]); // Dependency on database instance

  // Effect to initialize data if it doesn't exist (only if admin)
  useEffect(() => {
    if (!loading && !scoreboard && database && user) {
        const adminRef = ref(database, `roles_admin/${user.uid}`);
        get(adminRef).then(adminSnapshot => {
            if (adminSnapshot.exists()) {
                // Check again to avoid race conditions
                get(scoreboardRef).then(scoreboardSnapshot => {
                    if (!scoreboardSnapshot.exists()) {
                        set(scoreboardRef, defaultScoreboard);
                    }
                });
            }
        });
    }
  }, [loading, scoreboard, database, user]);

  // Timer logic - ONLY RUNS ON CONTROLLER (admin client)
  useEffect(() => {
    if (!scoreboard?.isRunning || !database || !user) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Only allow the timer to run for admins.
    const checkAdminAndRunTimer = async () => {
        const adminRef = ref(database, `roles_admin/${user.uid}`);
        const adminSnapshot = await get(adminRef);
        if (!adminSnapshot.exists()) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(async () => {
          // Get latest data directly from DB to avoid stale state
          const snapshot = await get(scoreboardRef);
          if (snapshot.exists()) {
              const currentData = snapshot.val() as Scoreboard;
              if (currentData.time > 0 && currentData.isRunning) {
                  update(ref(database, SCOREBOARD_PATH), { time: currentData.time - 1 });
              } else if (currentData.isRunning) {
                  update(ref(database, SCOREBOARD_PATH), { time: 0, isRunning: false });
              }
          }
        }, 1000);
    }
    
    checkAdminAndRunTimer();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scoreboard?.isRunning, database, user]);

  const updateScoreboard = useCallback((data: Partial<Scoreboard>) => {
    update(scoreboardRef, data);
  }, [database]);

  const resetScoreboard = useCallback(() => {
    if (confirm('Are you sure you want to reset all scoreboard data?')) {
        set(scoreboardRef, defaultScoreboard);
    }
  }, [database]);

  return { scoreboard, loading, error, updateScoreboard, resetScoreboard };
}
