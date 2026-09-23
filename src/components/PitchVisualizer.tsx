/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PitchLength, BallDetail, BowlingSide, PITCH_LENGTHSList } from '../types';
import { ArrowDownLeft, ArrowDownRight, Compass } from 'lucide-react';

interface PitchVisualizerProps {
  onCoordsSelected?: (x: number, y: number, length: PitchLength) => void;
  balls: BallDetail[];
  activeBallIndex?: number;
  interactive?: boolean;
  bowlingSide?: BowlingSide;
  bowlerHand?: 'Right-arm' | 'Left-arm';
  onToggleBowlingSide?: (side: BowlingSide) => void;
}

export default function PitchVisualizer({
  onCoordsSelected,
  balls,
  activeBallIndex,
  interactive = true,
  bowlingSide = 'over_the_wicket',
  bowlerHand = 'Right-arm',
  onToggleBowlingSide,
}: PitchVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [showTrajectoryLines, setShowTrajectoryLines] = useState(true);

  // Parse Y-coordinate to determine the PitchLength zone
  const getLengthFromY = (yVal: number): PitchLength => {
    const sorted = [...PITCH_LENGTHSList].sort((a, b) => a.rangeMinY - b.rangeMinY);
    for (const zone of sorted) {
      if (yVal >= zone.rangeMinY && yVal <= zone.rangeMaxY) {
        return zone.id;
      }
    }
    // If yVal >= 88 (at or behind the popping crease / stump mark), record as yorker
    if (yVal >= 88) return 'yorker';
    return 'good_length'; // fallback
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Constrain percentages between 0 and 100
    const clampedY = Math.max(0, Math.min(100, y));
    const clampedX = Math.max(0, Math.min(100, x));

    setMousePos({ x: clampedX, y: clampedY });
    if (clampedY >= 88) {
      setHoveredZone('Stump Mark / Yorker');
    } else {
      const currentZoneId = getLengthFromY(clampedY);
      const matchedZone = PITCH_LENGTHSList.find((z) => z.id === currentZoneId);
      setHoveredZone(matchedZone ? matchedZone.name : null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredZone(null);
    setMousePos(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current || !onCoordsSelected) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(2, Math.min(98, x)); // slightly inset from outermost edges
    const clampedY = Math.max(0.5, Math.min(99.5, y));

    const selectedLength = getLengthFromY(clampedY);
    onCoordsSelected(clampedX, clampedY, selectedLength);
  };

  // Calculate release point X coordinate based on arm and bowling angle (Over vs Around wicket)
  // Looking down pitch from bowler end to batsman end:
  // Right-arm: Over the Wicket = Left side of stumps (~22% X), Around the Wicket = Right side of stumps (~78% X)
  // Left-arm: Over the Wicket = Right side of stumps (~78% X), Around the Wicket = Left side of stumps (~22% X)
  const isRightArm = bowlerHand !== 'Left-arm';
  const isOverTheWicket = bowlingSide === 'over_the_wicket';
  const activeReleaseX = (isRightArm ? isOverTheWicket : !isOverTheWicket) ? 24 : 76;
  const releaseY = 4; // Top crease position %

  const getBallReleaseX = (ballSide?: BowlingSide) => {
    const isBallOver = (ballSide || bowlingSide) === 'over_the_wicket';
    return (isRightArm ? isBallOver : !isBallOver) ? 24 : 76;
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Bowling Side Selector Option Bar */}
      <div className="w-full max-w-xs mb-3 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col gap-1.5 shadow-sm">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
            <Compass className="w-3.5 h-3.5 text-indigo-500" />
            <span>BOWLING ANGLE:</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {bowlerHand}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            id="btn-over-the-wicket"
            onClick={() => onToggleBowlingSide?.('over_the_wicket')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              bowlingSide === 'over_the_wicket'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
            title="Over the Wicket: Standard angle of attack"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Over the Wicket</span>
          </button>

          <button
            type="button"
            id="btn-around-the-wicket"
            onClick={() => onToggleBowlingSide?.('around_the_wicket')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              bowlingSide === 'around_the_wicket'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
            title="Around the Wicket: Wide angle coming across the batsman"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Around the Wicket</span>
          </button>
        </div>
      </div>

      {/* Pitch Canvas Header with targeting tooltip */}
      <div className="mb-2 flex items-center justify-between w-full max-w-xs px-1">
        <span className="text-xs font-semibold text-slate-400 font-mono">
          {interactive ? 'TAP TURF TO PLOT' : 'OVERVIEW'}
        </span>
        {interactive && hoveredZone && (
          <span className="text-xs bg-slate-100 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full font-mono font-medium animate-pulse">
            Targeting: {hoveredZone}
          </span>
        )}
      </div>

      {/* Main Pitch Graphics Container */}
      <div
        id="cricket-pitch-canvas"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`relative w-64 md:w-72 h-[480px] rounded-lg border-4 border-amber-800 bg-[#344e41] shadow-inner overflow-hidden select-none transition-all ${
          interactive ? 'cursor-crosshair hover:shadow-2xl hover:border-amber-700' : ''
        }`}
        style={{
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Pitch Turf Texture and Grass Lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-repeating-linear bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:16px_16px]"></div>

        {/* Outer grass boundary edges */}
        <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-green-700 opacity-60"></div>
        <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-green-700 opacity-60"></div>

        {/* Bowling End Crease (Top, 0% to 10%) */}
        <div className="absolute top-[8%] left-2.5 right-2.5 h-0.5 bg-white opacity-80 pointer-events-none"></div>
        {/* Return creases at the side */}
        <div className="absolute top-0 h-[8%] left-8 w-0.5 bg-white opacity-60 pointer-events-none"></div>
        <div className="absolute top-0 h-[8%] right-8 w-0.5 bg-white opacity-60 pointer-events-none"></div>

        {/* Stumps - Bowling End (Top, inside crease) */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
          <div className="w-1 h-3 bg-[#e65f2b] rounded-t-sm shadow shadow-black"></div>
          <div className="w-1.5 h-3.5 bg-[#e65f2b] rounded-t-sm shadow shadow-black"></div>
          <div className="w-1 h-3 bg-[#e65f2b] rounded-t-sm shadow shadow-black"></div>
        </div>

        {/* Visual Bowler Delivery Release Point Indicator at Bowling Crease */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center z-25 transition-all duration-300"
          style={{
            left: `${activeReleaseX}%`,
            top: `${releaseY}%`,
          }}
        >
          <div className="w-5 h-5 rounded-full bg-indigo-500/90 border-2 border-white flex items-center justify-center text-white shadow-md animate-pulse">
            <span className="text-[9px] font-black leading-none">
              {isOverTheWicket ? 'O' : 'A'}
            </span>
          </div>
          <span className="text-[8px] font-bold text-white bg-black/60 px-1 py-0.2 rounded mt-0.5 uppercase tracking-tighter whitespace-nowrap shadow-sm">
            {isOverTheWicket ? 'Over Wkt' : 'Around Wkt'}
          </span>
        </div>

        {/* Dynamic Pitch Length Zone Boundaries & Labels (0% to 88%: Short, Short of Good, Good, Full, Yorker) */}
        {PITCH_LENGTHSList.map((zone) => {
          const isHovered =
            interactive && mousePos && mousePos.y >= zone.rangeMinY && mousePos.y <= zone.rangeMaxY;

          return (
            <div
              key={zone.id}
              className="absolute left-2.5 right-2.5 border-b border-white/20 flex flex-col items-center justify-center pointer-events-none"
              style={{
                top: `${zone.rangeMinY}%`,
                height: `${zone.rangeMaxY - zone.rangeMinY}%`,
                backgroundColor: isHovered ? zone.bgColor : 'transparent',
                transition: 'background-color 150ms ease-in-out',
              }}
            >
              <div
                className={`text-[9px] font-mono select-none tracking-wider font-semibold uppercase text-center ${
                  isHovered ? zone.textColor : 'text-stone-300/40'
                }`}
                style={{
                  transition: 'color 150ms ease',
                }}
              >
                {zone.name}
              </div>
            </div>
          );
        })}

        {/* Batting Crease & STUMP MARK (Positioned AFTER the Yorker Mark: 88% to 100%) */}
        <div
          className="absolute left-2.5 right-2.5 pointer-events-none"
          style={{
            top: '88%',
            height: '12%',
            backgroundColor:
              interactive && mousePos && mousePos.y >= 88 ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
            transition: 'background-color 150ms ease-in-out',
          }}
        >
          {/* Popping Crease line (directly separates Yorker mark from Stump mark) */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white opacity-90 pointer-events-none"></div>

          {/* Batting Crease Return lines */}
          <div className="absolute top-0 bottom-1 left-8 w-0.5 bg-white opacity-60 pointer-events-none"></div>
          <div className="absolute top-0 bottom-1 right-8 w-0.5 bg-white opacity-60 pointer-events-none"></div>

          {/* Bowling Crease / Stump Line across pitch at 50% of crease box (Y = 94%) */}
          <div className="absolute top-[50%] left-8 right-8 h-0.5 bg-white/70 pointer-events-none"></div>

          {/* Stumps - Batting End (Placed on the stump line at 94%, coming after Yorker) */}
          <div className="absolute top-[18%] left-1/2 -translate-x-1/2 flex items-end gap-1.5 pointer-events-none">
            <div className="w-1.5 h-4.5 bg-[#f8961e] rounded-t-sm shadow-md shadow-black border-t border-amber-200"></div>
            <div className="w-1.5 h-5 bg-[#f8961e] rounded-t-sm shadow-md shadow-black border-t border-amber-200"></div>
            <div className="w-1.5 h-4.5 bg-[#f8961e] rounded-t-sm shadow-md shadow-black border-t border-amber-200"></div>
          </div>

          {/* Stump Mark Label */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-widest font-bold uppercase text-amber-300/80 whitespace-nowrap pointer-events-none">
            STUMP MARK
          </div>
        </div>

        {/* SVG Angle of Delivery Trajectory Lines */}
        {showTrajectoryLines && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
            {balls.map((ball) => {
              const bReleaseX = getBallReleaseX(ball.bowlingSide);
              const isActive = activeBallIndex === ball.ballIndex;
              return (
                <line
                  key={`line-${ball.id}`}
                  x1={`${bReleaseX}%`}
                  y1={`${releaseY}%`}
                  x2={`${ball.x}%`}
                  y2={`${ball.y}%`}
                  stroke={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.45)'}
                  strokeWidth={isActive ? '2.5' : '1.5'}
                  strokeDasharray={isActive ? 'none' : '3,3'}
                />
              );
            })}
            {/* Live Mouse Aiming Preview Line */}
            {interactive && mousePos && (
              <line
                x1={`${activeReleaseX}%`}
                y1={`${releaseY}%`}
                x2={`${mousePos.x}%`}
                y2={`${mousePos.y}%`}
                stroke="rgba(99, 102, 241, 0.7)"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
            )}
          </svg>
        )}

        {/* Plotted Balls with Animations */}
        <AnimatePresence>
          {balls.map((ball) => {
            const isActive = activeBallIndex === ball.ballIndex;
            const ballSide = ball.bowlingSide || bowlingSide;
            const sideLabel = ballSide === 'around_the_wicket' ? 'Around' : 'Over';

            return (
              <motion.div
                key={ball.id}
                id={`ball-plot-${ball.id}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isActive ? 1.3 : 1,
                  opacity: 1,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute w-8 h-8 rounded-full flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono shadow-lg cursor-pointer ring-4 ring-white/30 text-white font-bold select-none"
                style={{
                  left: `${ball.x}%`,
                  top: `${ball.y}%`,
                  zIndex: isActive ? 30 : 20,
                  backgroundColor: PITCH_LENGTHSList.find((z) => z.id === ball.pitchLength)?.color || '#4f46e5',
                }}
                title={`Ball #${ball.ballIndex}: ${sideLabel} the Wicket • Length: ${PITCH_LENGTHSList.find((z) => z.id === ball.pitchLength)?.name || ''}`}
                whileHover={{ scale: 1.25, zIndex: 40 }}
              >
                <span>{ball.ballIndex}</span>
                <span className="text-[7px] leading-none opacity-85 font-sans font-extrabold uppercase">
                  {ballSide === 'around_the_wicket' ? 'ATW' : 'OTW'}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Temporary Mouse Hover Coordinate Dot */}
        {interactive && mousePos && (
          <div
            className="absolute w-6 h-6 border-2 border-white rounded-full bg-white/30 animate-ping -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
            }}
          ></div>
        )}
      </div>

      {/* Toggle Trajectory line & Pitch Legend */}
      <div className="mt-3 flex items-center justify-between w-full max-w-xs text-[11px] px-1">
        <button
          type="button"
          onClick={() => setShowTrajectoryLines(!showTrajectoryLines)}
          className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          {showTrajectoryLines ? 'Hide Trajectory Lines' : 'Show Trajectory Lines'}
        </button>
        <span className="text-[10px] text-slate-400 font-mono">
          OTW = Over • ATW = Around
        </span>
      </div>

      {/* Guide/Key Box beneath the Pitch */}
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-full max-w-xs text-[10px]">
        {PITCH_LENGTHSList.map((zone) => (
          <div key={zone.id} className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-800/50 p-1 rounded border border-slate-200 dark:border-slate-700">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }}></div>
            <span className="text-slate-600 dark:text-slate-350 font-medium truncate">{zone.shortName}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-800/50 p-1 rounded border border-amber-300 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#f8961e]"></div>
          <span className="text-amber-700 dark:text-amber-300 font-semibold truncate">Stump Mark</span>
        </div>
      </div>
    </div>
  );
}
