"use client";

/**
 * lib/store.js
 * Lightweight client-side state for ChemMaster AI.
 *
 * Why localStorage instead of a database: this app deploys to Vercel,
 * whose serverless functions have no persistent, writable filesystem
 * (a SQLite file would reset on every cold start / redeploy). Storing
 * per-student state (bookmarks, XP, streak, progress, theme) in the
 * browser's localStorage keeps it genuinely persistent across visits
 * without needing a hosted database. Element/notes *content* is static
 * data served through the API routes in app/api/.
 *
 * If you later want state shared across devices, swap this module for
 * calls to a hosted DB (e.g. Vercel Postgres / Supabase) behind the
 * same function signatures used here - components don't need to change.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "chemmaster:v1";

const DEFAULT_STATE = {
  name: "Student",
  theme: "dark",
  xp: 0,
  coins: 0,
  streak: 0,
  lastActive: null,
  bookmarks: [], // { type: 'element' | 'note' | 'question', ref: string }
  progress: {},  // key `${classLevel}::${chapter}` -> boolean
  activity: [],  // { text, at }
  attempts: {},  // key `${classLevel}::${chapter}` -> { correct: number, total: number }
  mockTests: [], // { at, score, total, chapters: [chapter], durationSec, answers: [...] }
};

function loadState() {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage + apply daily streak logic on mount
  useEffect(() => {
    const loaded = loadState();
    const today = todayISO();
    if (loaded.lastActive !== today) {
      if (loaded.lastActive) {
        const diffDays = Math.round(
          (new Date(today) - new Date(loaded.lastActive)) / 86400000
        );
        loaded.streak = diffDays === 1 ? loaded.streak + 1 : 1;
      } else {
        loaded.streak = 1;
      }
      loaded.lastActive = today;
    }
    setState(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "light") root.classList.add("light");
    else root.classList.remove("light");
  }, [state.theme]);

  const toggleTheme = useCallback(() => {
    setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
  }, []);

  const addXp = useCallback((amount) => {
    setState((s) => ({ ...s, xp: s.xp + amount }));
  }, []);

  const logActivity = useCallback((text) => {
    setState((s) => ({
      ...s,
      activity: [{ text, at: new Date().toISOString() }, ...s.activity].slice(0, 12),
    }));
  }, []);

  const toggleBookmark = useCallback((type, ref) => {
    let nowBookmarked = false;
    setState((s) => {
      const key = `${type}:${ref}`;
      const exists = s.bookmarks.some((b) => `${b.type}:${b.ref}` === key);
      nowBookmarked = !exists;
      const bookmarks = exists
        ? s.bookmarks.filter((b) => `${b.type}:${b.ref}` !== key)
        : [...s.bookmarks, { type, ref: String(ref) }];
      return { ...s, bookmarks };
    });
    return nowBookmarked;
  }, []);

  const isBookmarked = useCallback(
    (type, ref) => state.bookmarks.some((b) => b.type === type && b.ref === String(ref)),
    [state.bookmarks]
  );

  const setProgress = useCallback((classLevel, chapter, completed) => {
    setState((s) => ({
      ...s,
      progress: { ...s.progress, [`${classLevel}::${chapter}`]: completed },
    }));
  }, []);

  const setName = useCallback((name) => {
    const clean = (name || "").trim().slice(0, 40);
    setState((s) => ({ ...s, name: clean || "Student" }));
  }, []);

  const isComplete = useCallback(
    (classLevel, chapter) => !!state.progress[`${classLevel}::${chapter}`],
    [state.progress]
  );

  const logAttempt = useCallback((classLevel, chapter, correct) => {
    setState((s) => {
      const key = `${classLevel}::${chapter}`;
      const prev = s.attempts[key] || { correct: 0, total: 0 };
      return {
        ...s,
        attempts: {
          ...s.attempts,
          [key]: { correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 },
        },
      };
    });
  }, []);

  const recordMockTest = useCallback((result) => {
    setState((s) => ({
      ...s,
      mockTests: [{ ...result, at: new Date().toISOString() }, ...s.mockTests].slice(0, 20),
    }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      hydrated,
      toggleTheme,
      addXp,
      logActivity,
      toggleBookmark,
      isBookmarked,
      setProgress,
      isComplete,
      logAttempt,
      recordMockTest,
      setName,
    }),
    [
      state,
      hydrated,
      toggleTheme,
      addXp,
      logActivity,
      toggleBookmark,
      isBookmarked,
      setProgress,
      isComplete,
      logAttempt,
      recordMockTest,
      setName,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
