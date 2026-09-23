/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bowler, BallDetail, PitchLength, BowlingSide, PITCH_LENGTHSList, getBowlingLineName } from '../types';
import { RotateCcw, Save, Trash2, ShieldAlert, CheckCircle2, Flag, Plus, Check, Compass } from 'lucide-react';

interface OverWorkspaceProps {
  activeBowler: Bowler | null;
  currentOverBalls: BallDetail[];
  onAddBall: (ball: Omit<BallDetail, 'id' | 'ballIndex' | 'actualBallNumber' | 'timestamp'>) => void;
  onUpdateBall: (index: number, updated: Partial<BallDetail>) => void;
  onDeleteBall: (index: number) => void;
  onClearOver: () => void;
  onSaveOver: () => void;
  selectedBallIndex: number | null;
  setSelectedBallIndex: (index: number | null) => void;
  bowlers?: Bowler[];
  onSelectBowler?: (id: string) => void;
  onAddBowler?: (name: string, hand: 'Right-arm' | 'Left-arm', style: string) => void;
  currentBowlingSide?: BowlingSide;
  onChangeBowlingSide?: (side: BowlingSide) => void;
}

export default function OverWorkspace({
  activeBowler,
  currentOverBalls,
  onAddBall,
  onUpdateBall,
  onDeleteBall,
  onClearOver,
  onSaveOver,
  selectedBallIndex,
  setSelectedBallIndex,
  bowlers = [],
  onSelectBowler,
  onAddBowler,
  currentBowlingSide = 'over_the_wicket',
  onChangeBowlingSide,
}: OverWorkspaceProps) {
  const [lineControl, setLineControl] = useState<number>(50);
  const [lengthControl, setLengthControl] = useState<PitchLength>('good_length');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Compute stats of the active over
  const totalLegitimateBalls = currentOverBalls.length;
  const isOverComplete = totalLegitimateBalls >= 6;

  // Selected ball details (for editing)
  const activeBall = currentOverBalls.find((b) => b.ballIndex === selectedBallIndex);

  const handleUpdateActiveBall = (field: string, value: any) => {
    if (!activeBall) return;
    onUpdateBall(activeBall.ballIndex, { [field]: value });
  };

  const handleManualAddBall = () => {
    onAddBall({
      pitchLength: lengthControl,
      type: 'normal',
      runs: 0,
      x: lineControl,
      y: getAverageYForLength(lengthControl),
      bowlingSide: currentBowlingSide,
    });
  };

  const handleSavePlayerName = () => {
    if (!newPlayerName.trim() || !onAddBowler) return;
    onAddBowler(newPlayerName.trim(), 'Right-arm', 'Medium Fast');
    setNewPlayerName('');
    setShowQuickAdd(false);
  };

  const getAverageYForLength = (len: PitchLength): number => {
    const config = PITCH_LENGTHSList.find((z) => z.id === len);
    if (!config) return 50;
    return (config.rangeMinY + config.rangeMaxY) / 2;
  };

  const getLengthShorthand = (id: PitchLength): string => {
    if (id === 'short_pitch') return 'SHT';
    if (id === 'short_of_good') return 'BKL';
    if (id === 'good_length') return 'GD';
    if (id === 'full_length') return 'FUL';
    if (id === 'yorker') return 'YKR';
    return 'FUL';
  };

  const getPillColor = (ball: BallDetail) => {
    if (ball.type === 'wicket') return 'bg-red-600 border-red-700 text-white';
    if (ball.type === 'wide' || ball.type === 'no_ball') return 'bg-amber-500 border-amber-600 text-slate-900';
    
    const config = PITCH_LENGTHSList.find((z) => z.id === ball.pitchLength);
    if (config?.id === 'good_length') return 'bg-green-600 border-green-700 text-white';
    if (config?.id === 'yorker') return 'bg-pink-600 border-pink-700 text-white';
    if (config?.id === 'short_pitch') return 'bg-red-500 border-red-600 text-white';
    if (config?.id === 'short_of_good') return 'bg-orange-500 border-orange-600 text-white';
    if (config?.id === 'full_length') return 'bg-purple-500 border-purple-600 text-white';
    return 'bg-slate-700 border-slate-800 text-white';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 flex flex-col h-full">
      {/* Active Bowler Header with Quick Switcher and Add Player Option */}
      <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              ACTIVE OVER ENGINE
            </h3>
            {activeBowler ? (
              <div className="flex items-baseline gap-2 mt-0.5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display tracking-tight truncate">
                  {activeBowler.name}
                </h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                  • {activeBowler.hand}, {activeBowler.bowlingStyle}
                </span>
              </div>
            ) : (
              <h2 className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">
                Assign Bowler First
              </h2>
            )}
          </div>

          {activeBowler && (
            <div className="text-right flex flex-col items-end shrink-0">
              <span className="text-[10px] font-bold text-slate-400 font-mono">DELIVERIES LOGGED</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono leading-none mt-1">
                {totalLegitimateBalls} / 6
                <span className="text-xs font-semibold text-slate-500 ml-1">
                  (ov)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bowler Quick Switcher Pill Bar & Add Player */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
              Bowler:
            </span>
            {bowlers.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBowler?.(b.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  activeBowler?.id === b.id
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {activeBowler?.id === b.id && <Check className="w-3 h-3 text-white" />}
                {b.name}
              </button>
            ))}
          </div>

          {onAddBowler && (
            <button
              type="button"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer ml-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              {showQuickAdd ? 'Close' : 'Add Bowler'}
            </button>
          )}
        </div>

        {/* Inline Quick Add Bowler input */}
        {showQuickAdd && (
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex flex-col sm:flex-row gap-2 items-center animate-fadeIn">
            <input
              type="text"
              placeholder="Enter bowler's name..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSavePlayerName();
              }}
              className="w-full sm:flex-1 text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button
              type="button"
              id="btn-workspace-add-bowler"
              onClick={handleSavePlayerName}
              disabled={!newPlayerName.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Bowler
            </button>
          </div>
        )}
      </div>

      {!activeBowler ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 min-h-[220px]">
          <ShieldAlert className="w-10 h-10 text-indigo-500 mb-3 animate-bounce" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Bowler Assignment Required
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
            Please select an active bowler above or add a new player to begin logging balls.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3.5">
          {/* Bowling Side Option: Over the Wicket vs Around the Wicket */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
                  Bowling Angle
                </span>
                <span className="text-xs font-bold text-slate-850 dark:text-slate-150">
                  {currentBowlingSide === 'around_the_wicket' ? 'Around the Wicket' : 'Over the Wicket'}
                </span>
              </div>
            </div>

            {onChangeBowlingSide && (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => onChangeBowlingSide('over_the_wicket')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    currentBowlingSide === 'over_the_wicket'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Over the Wicket"
                >
                  Over
                </button>
                <button
                  type="button"
                  onClick={() => onChangeBowlingSide('around_the_wicket')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    currentBowlingSide === 'around_the_wicket'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Around the Wicket"
                >
                  Around
                </button>
              </div>
            )}
          </div>

          {/* Over Completed Notification Banner */}
          {isOverComplete && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center justify-between gap-3 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Over Completed (6/6 Deliveries Bowled)
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    6th ball bowled! End this over and rotate to the next bowler.
                  </div>
                </div>
              </div>
              <button
                id="btn-end-over-banner"
                onClick={onSaveOver}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer animate-pulse"
              >
                <Flag className="w-3.5 h-3.5" />
                End Over &amp; Change Bowler
              </button>
            </div>
          )}

          {/* Over Progression Balls Ribbon with Over/Around tags */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">
                BALL PROGRESSION ({totalLegitimateBalls}/6)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                OTW / ATW
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                const ball = currentOverBalls[slotIdx];
                const isSelected = ball && selectedBallIndex === ball.ballIndex;
                const isAround = ball?.bowlingSide === 'around_the_wicket';

                return (
                  <button
                    key={slotIdx}
                    onClick={() => ball && setSelectedBallIndex(ball.ballIndex)}
                    className={`h-16 rounded-xl border flex flex-col items-center justify-center transition-all relative overflow-hidden ${
                      ball
                        ? `${getPillColor(ball)} ${
                            isSelected
                              ? 'ring-2 ring-indigo-500 scale-102 shadow-md'
                              : 'opacity-95 hover:opacity-100 hover:scale-101'
                          }`
                        : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-slate-400'
                    }`}
                  >
                    {ball ? (
                      <>
                        <div className="flex items-center gap-0.5 leading-none">
                          <span className="text-[9px] font-mono opacity-80">
                            #{ball.ballIndex}
                          </span>
                          <span className="text-[7.5px] font-bold px-1 rounded bg-black/30 leading-tight">
                            {isAround ? 'ATW' : 'OTW'}
                          </span>
                        </div>
                        <span className="text-xs font-bold font-mono tracking-tight mt-0.5">
                          {getLengthShorthand(ball.pitchLength)}
                        </span>
                        <span className="text-[9px] font-medium opacity-90 leading-none mt-0.5">
                          {ball.type === 'wicket' ? 'WKT' : `${ball.runs}r`}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-mono text-slate-400">
                        {slotIdx + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calibrator Panel for Active Ball or Manual Addition */}
          <AnimatePresence mode="wait">
            {activeBall ? (
              <motion.div
                key={activeBall.ballIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="bg-indigo-50/20 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 p-4 rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-indigo-800 dark:text-indigo-400 font-mono">
                      BALL #{activeBall.ballIndex} CALIBRATOR
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteBall(activeBall.ballIndex)}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Ball
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                  {/* Calibrated Line of Ball */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Calibrated Line
                    </label>
                    <div className="flex gap-1.5 items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-1.5 h-9">
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono truncate">
                        {getBowlingLineName(activeBall.x)}
                      </span>
                    </div>
                  </div>

                  {/* Pitch Length Category */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Pitch Length Zone
                    </label>
                    <select
                      value={activeBall.pitchLength}
                      onChange={(e) => handleUpdateActiveBall('pitchLength', e.target.value)}
                      className="w-full text-xs px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 h-9"
                    >
                      {PITCH_LENGTHSList.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bowling Side for this delivery */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Bowling Angle
                    </label>
                    <select
                      value={activeBall.bowlingSide || currentBowlingSide}
                      onChange={(e) => handleUpdateActiveBall('bowlingSide', e.target.value as BowlingSide)}
                      className="w-full text-xs px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 h-9"
                    >
                      <option value="over_the_wicket">Over the Wicket</option>
                      <option value="around_the_wicket">Around the Wicket</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setSelectedBallIndex(null)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
                  >
                    Lock Selection & Continue
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Simple Manual Input fallback */
              <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <span className="block text-[10.5px] font-bold text-slate-400 font-mono mb-2 uppercase tracking-wide">
                  NO BALL ACTIVE (TAP TURF CARD OR LOG MANUALLY BENEATH)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase">Length</label>
                    <select
                      value={lengthControl}
                      onChange={(e) => setLengthControl(e.target.value as PitchLength)}
                      className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-100"
                    >
                      {PITCH_LENGTHSList.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.shortName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase">Line</label>
                    <select
                      value={lineControl}
                      onChange={(e) => setLineControl(Number(e.target.value))}
                      className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-100"
                    >
                      <option value={20}>Wide Outside Off</option>
                      <option value={35}>Outside Off</option>
                      <option value={50}>On the Stumps</option>
                      <option value={65}>Down Leg Side</option>
                      <option value={80}>Wide Down Leg</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualAddBall}
                  className="w-full text-xs font-semibold py-1.5 text-center bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Log Middle-Pitch Delivery ({currentBowlingSide === 'around_the_wicket' ? 'Around Wicket' : 'Over Wicket'})
                </button>
              </div>
            )}
          </AnimatePresence>

          {/* Over Summary & End Over Action Pin */}
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={onClearOver}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Over
            </button>

            {isOverComplete ? (
              <button
                id="btn-end-over"
                onClick={onSaveOver}
                className="flex items-center justify-center gap-2 text-xs font-bold text-white py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all shadow-md animate-pulse cursor-pointer"
              >
                <Flag className="w-4 h-4 text-emerald-100" />
                End Over &amp; Change Bowler (6/6 Deliveries)
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {totalLegitimateBalls > 0 && (
                  <button
                    id="btn-end-over-early"
                    onClick={onSaveOver}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 py-2 px-3 rounded-lg transition-colors cursor-pointer"
                    title="End over early with current deliveries"
                  >
                    <Flag className="w-3.5 h-3.5 text-slate-500" />
                    End Over ({totalLegitimateBalls}/6)
                  </button>
                )}
                <button
                  disabled
                  className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 py-2 px-4 rounded-lg opacity-85 cursor-not-allowed"
                  title="Deliver 6 legitimate balls to finalize the over"
                >
                  <Save className="w-4 h-4 opacity-50" />
                  Deliver 6 Balls to Complete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
