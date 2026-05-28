/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PitchLength, BallDetail, PITCH_LENGTHSList } from '../types';

interface PitchVisualizerProps {
  onCoordsSelected?: (x: number, y: number, length: PitchLength) => void;
  balls: BallDetail[];
  activeBallIndex?: number;
  interactive?: boolean;
}

export default function PitchVisualizer({
  onCoordsSelected,
  balls,
  activeBallIndex,
  interactive = true,
}: PitchVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Parse Y-coordinate to determine the PitchLength zone
  const getLengthFromY = (yVal: number): PitchLength => {
    const sorted = [...PITCH_LENGTHSList].sort((a, b) => a.rangeMinY - b.rangeMinY);
    for (const zone of sorted) {
      if (yVal >= zone.rangeMinY && yVal <= zone.rangeMaxY) {
        return zone.id;
      }
    }
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
    const currentZoneId = getLengthFromY(clampedY);
    const matchedZone = PITCH_LENGTHSList.find((z) => z.id === currentZoneId);
    setHoveredZone(matchedZone ? matchedZone.name : null);
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

  const getBallBadgeColor = (ball: BallDetail) => {
    return 'ring-4 ring-white/30 text-white font-bold';
  };

  const getBallText = (ball: BallDetail) => {
    return `${ball.ballIndex}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 flex items-center justify-between w-full px-2">
        <span className="text-xs font-semibold text-slate-400 font-mono">
          {interactive ? 'CLICK ON THE PITCH TO PLOT BALL' : 'PITCH LOG OVERVIEW'}
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
        className={`relative w-64 md:w-72 h-[480px] rounded-lg border-4 border-amber-800 bg-[#344e41] shadow-inner overflow-hidden select-none select-none transition-all ${
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
        {/* Crease Line (white, around 10% y) */}
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

        {/* Batsman Crease / Batting End (Bottom, around 90%) */}
        {/* Crease Line (white, around 90% y) */}
        <div className="absolute bottom-[10%] left-2.5 right-2.5 h-0.5 bg-white opacity-80 pointer-events-none"></div>
        {/* Crease details */}
        <div className="absolute bottom-[3%] h-[7%] left-10 w-0.5 bg-white opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-[3%] right-10 w-0.5 bg-white opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-[3%] left-10 right-10 h-0.5 bg-white opacity-40 pointer-events-none"></div>

        {/* Stumps - Batting End (Bottom) */}
        <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
          {/* Three stumps connected by tiny bails line */}
          <div className="w-1 h-4 bg-[#f8961e] rounded-t-sm shadow-md shadow-black"></div>
          <div className="w-1.5 h-4.5 bg-[#f8961e] rounded-t-sm shadow-md shadow-black"></div>
          <div className="w-1 h-4 bg-[#f8961e] rounded-t-sm shadow-md shadow-black"></div>
        </div>

        {/* Dynamic Zone Boundaries & Labels */}
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
              {/* Length indicator label subtly printed in turf */}
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

        {/* Plotted Balls with Animations */}
        <AnimatePresence>
          {balls.map((ball) => {
            const isActive = activeBallIndex === ball.ballIndex;
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
                className={`absolute w-8 h-8 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono shadow-lg cursor-pointer ${getBallBadgeColor(
                  ball
                )} select-none`}
                style={{
                  left: `${ball.x}%`,
                  top: `${ball.y}%`,
                  zIndex: isActive ? 30 : 20,
                  backgroundColor: PITCH_LENGTHSList.find((z) => z.id === ball.pitchLength)?.color || '#4f46e5',
                }}
                title={`Ball #${ball.ballIndex}: Length: ${PITCH_LENGTHSList.find((z) => z.id === ball.pitchLength)?.name || ''}`}
                whileHover={{ scale: 1.25, zIndex: 40 }}
              >
                {getBallText(ball)}
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

      {/* Guide/Key Box beneath the Pitch */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-full max-w-xs text-[10px]">
        {PITCH_LENGTHSList.map((zone) => (
          <div key={zone.id} className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-800/50 p-1 rounded border border-slate-200 dark:border-slate-700">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }}></div>
            <span className="text-slate-600 dark:text-slate-350 font-medium truncate">{zone.shortName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
