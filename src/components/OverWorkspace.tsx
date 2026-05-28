/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bowler, BallDetail, PitchLength, BallType, PITCH_LENGTHSList, getBowlingLineName } from '../types';
import { Play, RotateCcw, Save, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react';

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
}: OverWorkspaceProps) {
  const [lineControl, setLineControl] = useState<number>(50);
  const [lengthControl, setLengthControl] = useState<PitchLength>('good_length');

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
    });
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
    if (id === 'over_pitch') return 'OVP';
    if (id === 'full_length') return 'FUL';
    if (id === 'yorker') return 'YKR';
    return '';
  };

  const getPillColor = (ball: BallDetail) => {
    if (ball.type === 'wicket') return 'bg-red-600 border-red-700 text-white';
    if (ball.type === 'wide' || ball.type === 'no_ball') return 'bg-amber-500 border-amber-600 text-slate-900';
    
    const config = PITCH_LENGTHSList.find((z) => z.id === ball.pitchLength);
    if (config?.id === 'good_length') return 'bg-green-600 border-green-700 text-white';
    if (config?.id === 'yorker') return 'bg-pink-600 border-pink-700 text-white';
    if (config?.id === 'short_pitch') return 'bg-red-500 border-red-600 text-white';
    if (config?.id === 'short_of_good') return 'bg-orange-500 border-orange-600 text-white';
    if (config?.id === 'over_pitch') return 'bg-blue-500 border-blue-600 text-white';
    if (config?.id === 'full_length') return 'bg-purple-500 border-purple-600 text-white';
    return 'bg-slate-700 border-slate-800 text-white';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 flex flex-col h-full">
      {/* active Bowler Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            ACTIVE OVER ENGINE
          </h3>
          <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100 font-display tracking-tight mt-0.5">
            {activeBowler ? activeBowler.name : 'Assign Bowler First'}
          </h2>
          {activeBowler && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {activeBowler.hand} • {activeBowler.bowlingStyle}
            </span>
          )}
        </div>

        {activeBowler && (
          <div className="text-right flex flex-col items-end">
            <span className="text-xs font-bold text-slate-400 font-mono">DELIVERIES LOGGED</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono leading-none mt-1">
              {totalLegitimateBalls} / 6
              <span className="text-xs font-semibold text-slate-500 ml-1">
                (ov)
              </span>
            </div>
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
            Please select an active bowler from the Squad Directory to unlock the Pitch Plotter and logging controls.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          {/* Over Progression Balls Ribbon */}
          <div>
            <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 font-mono mb-2">
              BALL DELEGATION FEED
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {currentOverBalls.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2">
                  No balls plotted yet. Click the turf visualizer to plot!
                </div>
              ) : (
                currentOverBalls.map((ball) => {
                  const isBallSelected = selectedBallIndex === ball.ballIndex;
                  return (
                    <button
                      key={ball.id}
                      onClick={() => setSelectedBallIndex(isBallSelected ? null : ball.ballIndex)}
                      className={`min-w-[42px] h-10 flex flex-col items-center justify-center rounded-lg border text-xs font-bold font-mono transition-all cursor-pointer ${getPillColor(
                        ball
                      )} ${isBallSelected ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'opacity-85 hover:opacity-100'}`}
                    >
                      <span>
                        {ball.type === 'wicket'
                          ? 'W'
                          : ball.type === 'wide'
                          ? 'Wd'
                          : ball.type === 'no_ball'
                          ? 'Nb'
                          : getLengthShorthand(ball.pitchLength)}
                      </span>
                      <span className="text-[7px] tracking-tighter opacity-80 uppercase leading-none mt-0.5">
                        B{ball.ballIndex}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Contextual Editor for Selected plotted ball */}
          <AnimatePresence mode="wait">
            {activeBall ? (
              <motion.div
                key="ball-editor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-indigo-50/10 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl p-4.5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-505 bg-indigo-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-indigo-805 dark:text-indigo-400 font-mono">
                      BALL #{activeBall.ballIndex} CALIBRATOR
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteBall(activeBall.ballIndex)}
                    className="text-xs text-red-650 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Ball
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {/* Calibrated Line of Ball (Horizontal Pitch coordinate) */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Calibrated Line
                    </label>
                    <div className="flex gap-1.5 items-center bg-white dark:bg-slate-805 border border-slate-200 dark:border-slate-700 rounded-md p-1.5 h-9">
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                        {getBowlingLineName(activeBall.x)}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono ml-auto">
                        x: {activeBall.x}%
                      </span>
                    </div>
                  </div>

                  {/* Calibrate Pitch Length */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Overwrite Pitch Spot
                    </label>
                    <select
                      value={activeBall.pitchLength}
                      onChange={(e) => handleUpdateActiveBall('pitchLength', e.target.value)}
                      className="w-full text-xs px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-550 text-slate-800 dark:text-slate-100 h-9"
                    >
                      {PITCH_LENGTHSList.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3 text-right">
                  <button
                    onClick={() => setSelectedBallIndex(null)}
                    className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline cursor-pointer"
                  >
                    Lock Selection & Continue
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Simple Manual Input fallback if mouse is not clicking pitch */
              <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <span className="block text-[10.5px] font-bold text-slate-450 font-mono mb-2 uppercase tracking-wide">
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
                  className="w-full text-xs font-semibold py-1.5 text-center bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Log Middle-Pitch Delivery
                </button>
              </div>
            )}
          </AnimatePresence>

          {/* Over Summary & Actions Pin */}
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={onClearOver}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-355 py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Over
            </button>

            {isOverComplete ? (
              <button
                onClick={onSaveOver}
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-white py-2 px-6 bg-indigo-650 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-colors shadow-md animate-pulse cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-100" />
                Register & Lock Over ({totalLegitimateBalls} Balls Complete)
              </button>
            ) : (
              <button
                disabled
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 py-2 px-5 rounded-lg opacity-85 cursor-not-allowed"
                title="Deliver 6 legitimate balls to finalize the over"
              >
                <Save className="w-4 h-4 opacity-50" />
                Over Incomplete ({totalLegitimateBalls}/6 leg. balls)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
