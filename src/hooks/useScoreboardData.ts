
'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

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
  const firestore = useFirestore();
  const { user } = useUser();
  const scoreboardRef = useMemoFirebase(() => doc(firestore, 'scoreboards', SCOREBOARD_ID), [firestore]);

  const { data: scoreboard, isLoading: loading, error } = useDoc<Scoreboard>(scoreboardRef);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize doc if it doesn't exist (only if admin)
  useEffect(() => {
    if (!loading && !scoreboard && firestore && user) {
        // Check if user is an admin before creating the document
        // This is a client-side check. The real security is in firestore.rules
        doc(firestore, `roles_admin/${user.uid}`).get().then(adminDoc => {
            if (adminDoc.exists()) {
                const newScoreboardData = {
                    ...defaultScoreboard,
                    updatedAt: serverTimestamp(),
                };
                setDoc(scoreboardRef, newScoreboardData).catch(e => {
                    const contextualError = new FirestorePermissionError({
                        path: scoreboardRef.path,
                        operation: 'create',
                        requestResourceData: newScoreboardData,
                    });
                    errorEmitter.emit('permission-error', contextualError);
                });
            }
        });
    }
  }, [loading, scoreboard, firestore, scoreboardRef, user]);

  // Timer logic - ONLY RUNS ON CONTROLLER
  useEffect(() => {
    // Exit if not running, or if scoreboard data isn't loaded
    if (!scoreboard?.isRunning || !scoreboardRef) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Only allow the timer to run on one client to prevent conflicts.
    // A simple way is to only run it for admins, assuming controllers are admins.
    const checkAdminAndRunTimer = async () => {
        if (!user) return;
        const adminDoc = await doc(firestore, `roles_admin/${user.uid}`).get();
        if (!adminDoc.exists()) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        // We are an admin, start the timer interval
        if (timerRef.current) clearInterval(timerRef.current); // Clear existing timers

        timerRef.current = setInterval(() => {
          // Use a function to get the latest time from the database to avoid stale state
          doc(firestore, 'scoreboards', SCOREBOARD_ID).get().then(docSnap => {
            if (docSnap.exists()) {
              const currentTime = docSnap.data().time as number;
              const isStillRunning = docSnap.data().isRunning as boolean;

              if (currentTime > 0 && isStillRunning) {
                updateDocumentNonBlocking(scoreboardRef, { time: currentTime - 1 });
              } else if (isStillRunning) {
                // Time is up, stop the timer
                updateDocumentNonBlocking(scoreboardRef, { time: 0, isRunning: false });
              }
            }
          });
        }, 1000);
    }
    
    checkAdminAndRunTimer();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // Re-run this effect if the `isRunning` state changes or if the user/admin status changes.
  }, [scoreboard?.isRunning, scoreboardRef, firestore, user]);

  const updateScoreboard = useCallback((data: Partial<Omit<Scoreboard, 'id'>>) => {
    const dataWithTimestamp = {
        ...data,
        updatedAt: serverTimestamp()
    };
    updateDocumentNonBlocking(scoreboardRef, dataWithTimestamp);
  }, [scoreboardRef]);

  return { scoreboard, loading, error, updateScoreboard };
}

    