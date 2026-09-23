/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bowler, BallDetail, PITCH_LENGTHSList, BowlingSide } from '../types';
import {
  Check,
  X,
  Flag,
  ArrowRight,
  Plus,
  Compass,
  Repeat,
  Trophy,
} from 'lucide-react';

interface OverEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBowler: Bowler | null;
  balls: BallDetail[];
  bowlers: Bowler[];
  onEndOver: (nextBowlerId?: string) => void;
  onAddBowler?: (name: string, hand: 'Right-arm' | 'Left-arm', style: string, preferredSide?: BowlingSide) => void;
}

export default function OverEndModal({
  isOpen,
  onClose,
  activeBowler,
  balls,
  bowlers,
  onEndOver,
  onAddBowler,
}: OverEndModalProps) {
  // Candidate alternate bowlers (excluding currently active bowler if others exist)
  const alternateBowlers = bowlers.filter((b) => b.id !== activeBowler?.id);
  const defaultNextBowlerId = alternateBowlers.length > 0 ? alternateBowlers[0].id : activeBowler?.id;

  const [selectedNextBowlerId, setSelectedNextBowlerId] = useState<string | undefined>(defaultNextBowlerId);
  const [showAddNewBowler, setShowAddNewBowler] = useState(false);
  const [newBowlerName, setNewBowlerName] = useState('');
  const [newBowlerHand, setNewBowlerHand] = useState<'Right-arm' | 'Left-arm'>('Right-arm');
  const [newBowlerStyle, setNewBowlerStyle] = useState('Fast-Medium');
  const [newBowlerSide, setNewBowlerSide] = useState<BowlingSide>('over_the_wicket');

  // Keep selectedNextBowlerId in sync when modal opens
  const prevIsOpenRef = React.useRef(false);
  const prevBowlersLengthRef = React.useRef(bowlers.length);

  React.useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const candidates = bowlers.filter((b) => b.id !== activeBowler?.id);
      setSelectedNextBowlerId(candidates.length > 0 ? candidates[0].id : activeBowler?.id);
      setShowAddNewBowler(false);
    } else if (isOpen && bowlers.length > prevBowlersLengthRef.current) {
      // A new bowler was just registered, select them automatically
      const latestBowler = bowlers[bowlers.length - 1];
      if (latestBowler) {
        setSelectedNextBowlerId(latestBowler.id);
      }
    }
    prevIsOpenRef.current = isOpen;
    prevBowlersLengthRef.current = bowlers.length;
  }, [isOpen, activeBowler?.id, bowlers]);

  if (!isOpen) return null;

  // Over performance calculation
  const totalRuns = balls.reduce((acc, b) => acc + (b.runs || 0), 0);
  const wickets = balls.filter((b) => b.type === 'wicket').length;
  const dotBalls = balls.filter((b) => (b.runs || 0) === 0 && b.type !== 'wide' && b.type !== 'no_ball').length;
  const accuracyCount = balls.filter((b) => b.pitchLength === 'good_length' || b.pitchLength === 'yorker').length;
  const accuracyPct = balls.length > 0 ? Math.round((accuracyCount / balls.length) * 100) : 0;

  const selectedNextBowler = bowlers.find((b) => b.id === selectedNextBowlerId);

  const handleCreateAndSelectBowler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBowlerName.trim() || !onAddBowler) return;

    onAddBowler(newBowlerName.trim(), newBowlerHand, newBowlerStyle, newBowlerSide);
    // Find candidate ID after adding (the parent updates state)
    setNewBowlerName('');
    setShowAddNewBowler(false);
  };

  const handleConfirmEndOver = () => {
    onEndOver(selectedNextBowlerId);
  };

  const getBallLengthName = (lengthId: string) => {
    const config = PITCH_LENGTHSList.find((z) => z.id === lengthId);
    return config ? config.shortName : lengthId;
  };

  const getPillBadgeColor = (ball: BallDetail) => {
    if (ball.type === 'wicket') return 'bg-red-600 text-white';
    if (ball.type === 'wide' || ball.type === 'no_ball') return 'bg-amber-500 text-slate-900';
    if (ball.pitchLength === 'good_length') return 'bg-emerald-600 text-white';
    if (ball.pitchLength === 'yorker') return 'bg-pink-600 text-white';
    if (ball.pitchLength === 'short_pitch') return 'bg-red-500 text-white';
    if (ball.pitchLength === 'short_of_good') return 'bg-orange-500 text-white';
    return 'bg-purple-600 text-white';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Top Banner & Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 px-6 py-5 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
              title="Close and review deliveries"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                <Flag className="w-3 h-3 text-emerald-200" />
                6th Ball Bowled • Over Completed
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
              End Over & Change Bowler
            </h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              {activeBowler?.name ? `${activeBowler.name} has finished this over.` : 'All 6 deliveries bowled.'} Select who bowls next or end the over.
            </p>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Over Performance Summary Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {activeBowler?.name ? activeBowler.name[0]?.toUpperCase() : 'B'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      {activeBowler?.name || 'Active Bowler'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {activeBowler?.hand} • {activeBowler?.bowlingStyle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg text-xs font-bold font-mono">
                  <Trophy className="w-3 h-3" />
                  {accuracyPct}% Pitch Accuracy
                </div>
              </div>

              {/* Over Stats Counter Chips */}
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/70 dark:border-slate-700/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Runs</span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono">{totalRuns}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/70 dark:border-slate-700/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Wickets</span>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">{wickets}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/70 dark:border-slate-700/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Dot Balls</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">{dotBalls}</span>
                </div>
              </div>

              {/* Balls Ribbon */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block mb-1.5">
                  Over Deliveries (6 Balls)
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {balls.map((b, idx) => (
                    <div
                      key={b.id || idx}
                      className="flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 shadow-2xs"
                    >
                      <span className="text-[9px] font-mono text-slate-400 mb-0.5">#{idx + 1}</span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-tight ${getPillBadgeColor(
                          b
                        )}`}
                      >
                        {b.type === 'wicket' ? 'W' : getBallLengthName(b.pitchLength)}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                        {b.type === 'wicket' ? 'WKT' : `${b.runs}r`}
                      </span>
                      <span className="text-[7px] text-slate-400 font-mono uppercase mt-0.5">
                        {b.bowlingSide === 'around_the_wicket' ? 'ATW' : 'OTW'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Change Bowler Selection Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                    Change Bowler for Next Over
                  </h3>
                </div>
                {onAddBowler && (
                  <button
                    type="button"
                    onClick={() => setShowAddNewBowler(!showAddNewBowler)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {showAddNewBowler ? 'Select Existing' : 'New Bowler'}
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                According to cricket rules, the same bowler cannot bowl consecutive overs. Choose the bowler for the next over:
              </p>

              {/* Inline Quick Add Bowler Form if requested */}
              {showAddNewBowler && onAddBowler && (
                <form
                  onSubmit={handleCreateAndSelectBowler}
                  className="mb-3 p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2.5 animate-fadeIn"
                >
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                    Quick Register Bowler
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New Bowler's Full Name..."
                      value={newBowlerName}
                      onChange={(e) => setNewBowlerName(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!newBowlerName.trim()}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-xs shrink-0"
                    >
                      Save & Pick
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <select
                      value={newBowlerHand}
                      onChange={(e) => setNewBowlerHand(e.target.value as any)}
                      className="p-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                    >
                      <option value="Right-arm">Right-arm</option>
                      <option value="Left-arm">Left-arm</option>
                    </select>
                    <select
                      value={newBowlerSide}
                      onChange={(e) => setNewBowlerSide(e.target.value as any)}
                      className="p-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                    >
                      <option value="over_the_wicket">Over the Wicket</option>
                      <option value="around_the_wicket">Around the Wicket</option>
                    </select>
                  </div>
                </form>
              )}

              {/* Bowlers Radio Grid */}
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {bowlers.map((bowler) => {
                  const isCurrent = bowler.id === activeBowler?.id;
                  const isSelected = selectedNextBowlerId === bowler.id;

                  return (
                    <div
                      key={bowler.id}
                      onClick={() => setSelectedNextBowlerId(bowler.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 shadow-xs'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {bowler.name[0]?.toUpperCase() || 'B'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-850 dark:text-slate-100">
                              {bowler.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-mono">
                                Just Bowled
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                            {bowler.hand} • {bowler.bowlingStyle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {bowler.preferredBowlingSide && (
                          <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] text-slate-400 font-mono">
                            <Compass className="w-2.5 h-2.5 text-indigo-500" />
                            {bowler.preferredBowlingSide === 'around_the_wicket' ? 'Around' : 'Over'}
                          </span>
                        )}
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {bowlers.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No other bowlers found. Use &apos;New Bowler&apos; to register one.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto text-xs font-semibold px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              Review / Edit Deliveries
            </button>

            <button
              type="button"
              id="btn-confirm-end-over-modal"
              onClick={handleConfirmEndOver}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              {selectedNextBowler && selectedNextBowler.id !== activeBowler?.id ? (
                <>
                  End Over &amp; Switch to {selectedNextBowler.name}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                'End Over & Start Next'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
