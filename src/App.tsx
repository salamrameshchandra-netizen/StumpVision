/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bowler, BallDetail, OverRecord, PitchLength, BowlingSide } from './types';
import PitchVisualizer from './components/PitchVisualizer';
import OverWorkspace from './components/OverWorkspace';
import BowlerManager from './components/BowlerManager';
import Dashboard from './components/Dashboard';
import { exportPitchingStatsPDF } from './utils/pdfExporter';
import {
  Target,
  Users2,
  BarChart3,
  CircleCheck,
  ShieldCheck,
  Info,
  FlameKindling,
  Sun,
  Moon,
} from 'lucide-react';

// Prefilled mock dataset to provide immediate visual metrics on first load
const INITIAL_BOWLERS: Bowler[] = [
  {
    id: 'b-bumrah',
    name: 'Jasprit Bumrah',
    bowlingStyle: 'Right-arm Fast',
    hand: 'Right-arm',
    preferredBowlingSide: 'over_the_wicket',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'b-starc',
    name: 'Mitchell Starc',
    bowlingStyle: 'Left-arm Fast',
    hand: 'Left-arm',
    preferredBowlingSide: 'over_the_wicket',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'b-rashid',
    name: 'Rashid Khan',
    bowlingStyle: 'Right-arm Leg-spin',
    hand: 'Right-arm',
    preferredBowlingSide: 'over_the_wicket',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_OVERS: OverRecord[] = [
  {
    id: 'ov-bumrah-1',
    bowlerId: 'b-bumrah',
    bowlerName: 'Jasprit Bumrah',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    balls: [
      { id: 'b1', ballIndex: 1, actualBallNumber: 1, pitchLength: 'good_length', type: 'normal', runs: 0, x: 48, y: 58, bowlingSide: 'over_the_wicket', timestamp: new Date().toISOString() },
      { id: 'b2', ballIndex: 2, actualBallNumber: 2, pitchLength: 'good_length', type: 'normal', runs: 0, x: 50, y: 55, bowlingSide: 'over_the_wicket', timestamp: new Date().toISOString() },
      { id: 'b3', ballIndex: 3, actualBallNumber: 3, pitchLength: 'short_of_good', type: 'normal', runs: 1, x: 42, y: 38, bowlingSide: 'over_the_wicket', timestamp: new Date().toISOString() },
      { id: 'b4', ballIndex: 4, actualBallNumber: 4, pitchLength: 'good_length', type: 'normal', runs: 0, x: 53, y: 62, bowlingSide: 'over_the_wicket', timestamp: new Date().toISOString() },
      { id: 'b5', ballIndex: 5, actualBallNumber: 5, pitchLength: 'yorker', type: 'wicket', runs: 0, x: 50, y: 83, bowlingSide: 'over_the_wicket', timestamp: new Date().toISOString() },
      { id: 'b6', ballIndex: 6, actualBallNumber: 6, pitchLength: 'short_pitch', type: 'normal', runs: 2, x: 38, y: 18, bowlingSide: 'around_the_wicket', timestamp: new Date().toISOString() },
    ],
    totalRuns: 3,
    wickets: 1,
    isCompleted: true,
  },
  {
    id: 'ov-starc-1',
    bowlerId: 'b-starc',
    bowlerName: 'Mitchell Starc',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    balls: [
      { id: 's1', ballIndex: 1, actualBallNumber: 1, pitchLength: 'full_length', type: 'normal', runs: 0, x: 52, y: 74, bowlingSide: 'over_the_wicket', timestamp: new Date().toISOString() },
      { id: 's2', ballIndex: 2, actualBallNumber: 2, pitchLength: 'yorker', type: 'wicket', runs: 0, x: 50, y: 84, bowlingSide: 'over_the_wicket', timestamp: new Date().toISOString() },
      { id: 's3', ballIndex: 3, actualBallNumber: 3, pitchLength: 'good_length', type: 'normal', runs: 4, x: 35, y: 55, bowlingSide: 'over_the_wicket', timestamp: new Date().toISOString() },
      { id: 's4', ballIndex: 4, actualBallNumber: 4, pitchLength: 'short_of_good', type: 'normal', runs: 0, x: 58, y: 36, bowlingSide: 'around_the_wicket', timestamp: new Date().toISOString() },
      { id: 's5', ballIndex: 5, actualBallNumber: 5, pitchLength: 'good_length', type: 'normal', runs: 1, x: 49, y: 61, bowlingSide: 'around_the_wicket', timestamp: new Date().toISOString() },
      { id: 's6', ballIndex: 6, actualBallNumber: 6, pitchLength: 'yorker', type: 'normal', runs: 0, x: 51, y: 82, bowlingSide: 'around_the_wicket', timestamp: new Date().toISOString() },
    ],
    totalRuns: 5,
    wickets: 1,
    isCompleted: true,
  },
  {
    id: 'ov-rashid-1',
    bowlerId: 'b-rashid',
    bowlerName: 'Rashid Khan',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    balls: [
      { id: 'rk1', ballIndex: 1, actualBallNumber: 1, pitchLength: 'good_length', type: 'normal', runs: 1, x: 45, y: 60, bowlingSide: 'over_the_wicket', timestamp: new Date().toISOString() },
      { id: 'rk2', ballIndex: 2, actualBallNumber: 2, pitchLength: 'good_length', type: 'normal', runs: 2, x: 55, y: 62, bowlingSide: 'over_the_wicket', timestamp: new Date().toISOString() },
      { id: 'rk3', ballIndex: 3, actualBallNumber: 3, pitchLength: 'full_length', type: 'normal', runs: 0, x: 48, y: 72, bowlingSide: 'over_the_wicket', timestamp: new Date().toISOString() },
      { id: 'rk4', ballIndex: 4, actualBallNumber: 4, pitchLength: 'full_length', type: 'normal', runs: 6, x: 51, y: 70, bowlingSide: 'around_the_wicket', timestamp: new Date().toISOString() },
      { id: 'rk5', ballIndex: 5, actualBallNumber: 5, pitchLength: 'yorker', type: 'normal', runs: 1, x: 49, y: 83, bowlingSide: 'around_the_wicket', timestamp: new Date().toISOString() },
      { id: 'rk6', ballIndex: 6, actualBallNumber: 6, pitchLength: 'good_length', type: 'normal', runs: 0, x: 52, y: 56, bowlingSide: 'over_the_wicket', timestamp: new Date().toISOString() },
    ],
    totalRuns: 10,
    wickets: 0,
    isCompleted: true,
  }
];

export default function App() {
  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('stumpvision_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'dark'; // Default to dark mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('stumpvision_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  // Load initial datasets from localStorage or default static database
  const [bowlers, setBowlers] = useState<Bowler[]>(() => {
    const saved = localStorage.getItem('cricket_bowlers');
    return saved ? JSON.parse(saved) : INITIAL_BOWLERS;
  });

  const [completedOvers, setCompletedOvers] = useState<OverRecord[]>(() => {
    const saved = localStorage.getItem('cricket_completed_overs');
    if (!saved) return INITIAL_OVERS;
    try {
      const parsed: OverRecord[] = JSON.parse(saved);
      return parsed.map((over) => ({
        ...over,
        balls: over.balls.map((b) => {
          if (b.pitchLength === 'yorker' && b.y > 87) {
            return { ...b, y: 83 };
          }
          return b;
        }),
      }));
    } catch {
      return INITIAL_OVERS;
    }
  });

  // Navigation tabs: live tracking, bowlers squad, aggregate analytics panel
  const [activeTab, setActiveTab] = useState<'pitch_studio' | 'squad' | 'dashboard'>('pitch_studio');

  // Bowler selection & active over construction state
  const [selectedBowlerId, setSelectedBowlerId] = useState<string | null>(() => {
    return bowlers[0]?.id || null;
  });
  const [currentOverBalls, setCurrentOverBalls] = useState<BallDetail[]>([]);
  const [selectedBallIndex, setSelectedBallIndex] = useState<number | null>(null);

  // Active bowling side: 'over_the_wicket' | 'around_the_wicket'
  const [currentBowlingSide, setCurrentBowlingSide] = useState<BowlingSide>('over_the_wicket');

  // Floating notifications/alerts toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync state to local storage database persistently
  useEffect(() => {
    localStorage.setItem('cricket_bowlers', JSON.stringify(bowlers));
  }, [bowlers]);

  useEffect(() => {
    localStorage.setItem('cricket_completed_overs', JSON.stringify(completedOvers));
  }, [completedOvers]);

  const activeBowler = bowlers.find((b) => b.id === selectedBowlerId) || null;

  // Sync bowler's preferred bowling side when active bowler changes
  useEffect(() => {
    if (activeBowler?.preferredBowlingSide) {
      setCurrentBowlingSide(activeBowler.preferredBowlingSide);
    }
  }, [selectedBowlerId]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- Handlers ---
  const handleAddBowler = (
    name: string,
    hand: 'Right-arm' | 'Left-arm',
    style: string,
    preferredSide: BowlingSide = 'over_the_wicket'
  ) => {
    const newBowler: Bowler = {
      id: `b-${Date.now()}`,
      name: name.trim(),
      hand,
      bowlingStyle: style,
      preferredBowlingSide: preferredSide,
      createdAt: new Date().toISOString(),
    };
    setBowlers((prev) => [...prev, newBowler]);
    setSelectedBowlerId(newBowler.id); // Set as active bowler immediately
    setCurrentBowlingSide(preferredSide);
    showToast(`Player "${name.trim()}" saved to squad!`, 'success');
  };

  const handleUpdateBowler = (id: string, name: string) => {
    const trimmedName = name.trim();
    setBowlers((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, name: trimmedName } : b));
      localStorage.setItem('cricket_bowlers', JSON.stringify(updated));
      return updated;
    });
    setCompletedOvers((prev) => {
      const updated = prev.map((ov) => (ov.bowlerId === id ? { ...ov, bowlerName: trimmedName } : ov));
      localStorage.setItem('cricket_completed_overs', JSON.stringify(updated));
      return updated;
    });
    showToast(`Player name updated to ${trimmedName}!`, 'success');
  };

  const handleDeleteBowler = (id: string) => {
    setBowlers((prev) => prev.filter((b) => b.id !== id));
    if (selectedBowlerId === id) {
      setSelectedBowlerId(null);
    }
    showToast('Bowler de-registered from local records.', 'info');
  };

  const handlePitchCoordsSelected = (x: number, y: number, length: PitchLength) => {
    if (!activeBowler) {
      showToast('Please register or assign an active bowler first.', 'error');
      return;
    }

    const nextBallIndex = currentOverBalls.length + 1;

    // Check if over is already complete
    if (currentOverBalls.length >= 6) {
      showToast('Maximum 6 balls already reached. Click "End Over" to conclude and record.', 'info');
      return;
    }

    const newBall: BallDetail = {
      id: `ball-${Date.now()}`,
      ballIndex: nextBallIndex,
      actualBallNumber: nextBallIndex,
      pitchLength: length,
      type: 'normal',
      runs: 0,
      x: parseFloat(x.toFixed(1)),
      y: parseFloat(y.toFixed(1)),
      bowlingSide: currentBowlingSide,
      timestamp: new Date().toISOString(),
    };

    setCurrentOverBalls((prev) => [...prev, newBall]);
    setSelectedBallIndex(nextBallIndex); // Focus editing workspace on this just plotted ball
  };

  const handleWorkspaceAddBall = (ballData: Omit<BallDetail, 'id' | 'ballIndex' | 'actualBallNumber' | 'timestamp'>) => {
    const nextBallIndex = currentOverBalls.length + 1;

    if (currentOverBalls.length >= 6) {
      showToast('Maximum 6 balls already reached. Click "End Over" to conclude and record.', 'info');
      return;
    }

    const newBall: BallDetail = {
      ...ballData,
      bowlingSide: ballData.bowlingSide || currentBowlingSide,
      id: `ball-${Date.now()}`,
      ballIndex: nextBallIndex,
      actualBallNumber: nextBallIndex,
      timestamp: new Date().toISOString(),
    };

    setCurrentOverBalls((prev) => [...prev, newBall]);
    setSelectedBallIndex(nextBallIndex);
  };

  const handleUpdateBall = (index: number, updatedFields: Partial<BallDetail>) => {
    setCurrentOverBalls((prev) =>
      prev.map((ball) => (ball.ballIndex === index ? { ...ball, ...updatedFields } : ball))
    );
  };

  const handleDeleteBall = (index: number) => {
    setCurrentOverBalls((prev) => {
      const filtered = prev.filter((b) => b.ballIndex !== index);
      return filtered.map((b, idx) => {
        const sequentialIndex = idx + 1;
        return {
          ...b,
          ballIndex: sequentialIndex,
          actualBallNumber: sequentialIndex,
        };
      });
    });
    setSelectedBallIndex(null);
  };

  const handleClearOver = () => {
    setCurrentOverBalls([]);
    setSelectedBallIndex(null);
    showToast('Active over records cleared.', 'info');
  };

  // End and save the completed over
  const handleSaveOver = () => {
    if (!activeBowler) return;
    if (currentOverBalls.length === 0) return;

    const completedOver: OverRecord = {
      id: `over-${Date.now()}`,
      bowlerId: activeBowler.id,
      bowlerName: activeBowler.name,
      balls: currentOverBalls,
      totalRuns: currentOverBalls.reduce((acc, b) => acc + (b.runs || 0), 0),
      wickets: currentOverBalls.filter((b) => b.type === 'wicket').length,
      isCompleted: true,
      date: new Date().toISOString(),
    };

    setCompletedOvers((prev) => [completedOver, ...prev]);
    setCurrentOverBalls([]); // Reset active logging pitch canvas
    setSelectedBallIndex(null);

    // Auto bowler alternation if multiple bowlers exist (e.g. 2 bowlers switching back and forth)
    if (bowlers.length > 1) {
      const currentIndex = bowlers.findIndex((b) => b.id === activeBowler.id);
      const nextIndex = (currentIndex + 1) % bowlers.length;
      const nextBowler = bowlers[nextIndex];
      setSelectedBowlerId(nextBowler.id);
      if (nextBowler.preferredBowlingSide) {
        setCurrentBowlingSide(nextBowler.preferredBowlingSide);
      }
      showToast(
        `Over concluded and recorded for ${activeBowler.name}! Rotated to ${nextBowler.name} for the next over.`,
        'success'
      );
    } else {
      showToast(`Over concluded and recorded for ${activeBowler.name}! Ready for next over.`, 'success');
    }
  };

  // PDF report wrapper delegating calculations and files locally
  const handleExportPDF = (
    oversList: OverRecord[],
    statsSummary: any,
    dateRange: { start: string; end: string },
    bowlerName: string
  ) => {
    try {
      exportPitchingStatsPDF(oversList, statsSummary, dateRange, bowlerName);
      showToast('PDF compilation complete. Downloading file!', 'success');
    } catch (err) {
      console.error(err);
      showToast('PDF compilation failed. See developer logs.', 'error');
    }
  };

  // Preloaded data clear handler to allow starting from scratch
  const handleDeletePreloadedData = () => {
    setBowlers([]);
    setCompletedOvers([]);
    setSelectedBowlerId(null);
    setCurrentOverBalls([]);
    setSelectedBallIndex(null);
    localStorage.setItem('cricket_bowlers', JSON.stringify([]));
    localStorage.setItem('cricket_completed_overs', JSON.stringify([]));
    showToast('All preloaded data and history cleared. Ready for fresh squad registration!', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      {/* Premium Navbar Panel */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3.5">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Target className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-none">
                  StumpVision
                </h1>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Live v1.3
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider">
                PROFESSIONAL BALL PITCHING & ANALYTICS
              </span>
            </div>
          </div>

          {/* Tab Navigation Cockpit & Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <button
                onClick={() => setActiveTab('pitch_studio')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pitch_studio'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700/50 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                Live Studio
              </button>
              <button
                id="tab-squad"
                onClick={() => setActiveTab('squad')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'squad'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700/50 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users2 className="w-3.5 h-3.5" />
                Squad Directory
              </button>
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700/50 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Performance Deck
              </button>
            </div>

            {/* Dark Mode / Light Mode Switcher */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            <button
              id="clear-preloaded-btn"
              onClick={handleDeletePreloadedData}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 transition cursor-pointer"
              title="Delete all preloaded bowlers and history to start fresh"
            >
              Clear Preloaded Data
            </button>
          </div>
        </div>
      </header>

      {/* Floating Dynamic Informative Toast alerts */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-55 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border animate-slideIn bg-slate-900 border-slate-800 text-white">
          {toast.type === 'success' && <CircleCheck className="w-4 h-4 text-emerald-400 font-bold" />}
          {toast.type === 'error' && <ShieldCheck className="w-4 h-4 text-rose-500 font-bold" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 font-bold" />}
          <span className="text-xs font-medium text-slate-200 select-none">
            {toast.message}
          </span>
        </div>
      )}

      {/* Main Body Application Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'pitch_studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Module Panel: Directory Squad Selector */}
            <div className="lg:col-span-3">
              <BowlerManager
                bowlers={bowlers}
                onAddBowler={handleAddBowler}
                onSelectBowler={(id) => {
                  setSelectedBowlerId(id);
                  setCurrentOverBalls([]); // clear current active over whenever template changes bowler
                  setSelectedBallIndex(null);
                }}
                selectedBowlerId={selectedBowlerId}
                onDeleteBowler={handleDeleteBowler}
                onUpdateBowler={handleUpdateBowler}
              />
            </div>

            {/* Middle Module Panel: Turf Interactive Coordinates Plotter with Angle indicator */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-[500px]">
              <div className="text-center mb-3">
                <h3 className="text-sm font-bold font-display tracking-tight text-slate-800 dark:text-slate-100">
                  Interactive Pitch Canvas
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                  Tapping closer to footer places Yorker length. Bouncers register near collar top.
                </p>
              </div>
              <PitchVisualizer
                onCoordsSelected={handlePitchCoordsSelected}
                balls={currentOverBalls}
                activeBallIndex={selectedBallIndex || undefined}
                interactive={selectedBowlerId !== null}
                bowlingSide={currentBowlingSide}
                bowlerHand={activeBowler?.hand || 'Right-arm'}
                onToggleBowlingSide={setCurrentBowlingSide}
              />
            </div>

            {/* Right Module Panel: Engine Ball workspace controls */}
            <div className="lg:col-span-4">
              <OverWorkspace
                activeBowler={activeBowler}
                currentOverBalls={currentOverBalls}
                onAddBall={handleWorkspaceAddBall}
                onUpdateBall={handleUpdateBall}
                onDeleteBall={handleDeleteBall}
                onClearOver={handleClearOver}
                onSaveOver={handleSaveOver}
                selectedBallIndex={selectedBallIndex}
                setSelectedBallIndex={setSelectedBallIndex}
                bowlers={bowlers}
                onSelectBowler={(id) => {
                  setSelectedBowlerId(id);
                  setCurrentOverBalls([]);
                  setSelectedBallIndex(null);
                }}
                onAddBowler={handleAddBowler}
                currentBowlingSide={currentBowlingSide}
                onChangeBowlingSide={setCurrentBowlingSide}
              />
            </div>
          </div>
        )}

        {activeTab === 'squad' && (
          <div className="max-w-2xl mx-auto">
            <BowlerManager
              bowlers={bowlers}
              onAddBowler={handleAddBowler}
              onSelectBowler={(id) => {
                setSelectedBowlerId(id);
                setCurrentOverBalls([]);
                setSelectedBallIndex(null);
                setActiveTab('pitch_studio');
                showToast(`Switched active training bowler to ${bowlers.find(b => b.id === id)?.name}`);
              }}
              selectedBowlerId={selectedBowlerId}
              onDeleteBowler={handleDeleteBowler}
              onUpdateBowler={handleUpdateBowler}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            completedOvers={completedOvers}
            bowlers={bowlers}
            onExportPDF={handleExportPDF}
          />
        )}
      </main>

      {/* Footer Branding credits */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
          <div className="flex items-center gap-1.5">
            <FlameKindling className="w-3.5 h-3.5 text-orange-500" />
            <span>StumpVision Pitch Tracker &copy; 2026. Local Database Storage Offline-First.</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Precision Index: 99.8%</span>
            <span className="h-3 w-px bg-slate-200 dark:bg-slate-800"></span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              SECURE TRAINING CONSOLE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
