/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bowler } from '../types';
import { User, Plus, Check, Trash2, Award } from 'lucide-react';

interface BowlerManagerProps {
  bowlers: Bowler[];
  onAddBowler: (name: string, hand: 'Right-arm' | 'Left-arm', style: string) => void;
  onSelectBowler: (id: string) => void;
  selectedBowlerId: string | null;
  onDeleteBowler?: (id: string) => void;
}

const COMMON_BOWLING_STYLES = [
  'Fast',
  'Fast-Medium',
  'Medium',
  'Off-spin (Offbreak)',
  'Leg-spin (Legbreak)',
  'Left-arm Orthodox Spin',
  'Left-arm Unorthodox Chinaman',
];

export default function BowlerManager({
  bowlers,
  onAddBowler,
  onSelectBowler,
  selectedBowlerId,
  onDeleteBowler,
}: BowlerManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [hand, setHand] = useState<'Right-arm' | 'Left-arm'>('Right-arm');
  const [style, setStyle] = useState(COMMON_BOWLING_STYLES[0]);
  const [customStyle, setCustomStyle] = useState('');
  const [isCustomStyleSelected, setIsCustomStyleSelected] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStyle = isCustomStyleSelected ? customStyle.trim() : style;
    if (!name.trim()) return;
    onAddBowler(name.trim(), hand, finalStyle || 'Medium Fast');
    setName('');
    setCustomStyle('');
    setIsCustomStyleSelected(false);
    setShowAddForm(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display tracking-tight">
            Squad Directory
          </h2>
        </div>
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Bowler
          </button>
        ) : (
          <button
            onClick={() => setShowAddForm(false)}
            className="text-xs font-semibold hover:text-slate-900 text-slate-500 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-4 bg-slate-50 dark:bg-slate-800/45 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 animate-fadeIn">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Register New Bowler
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Jasprit Bumrah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-550 text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Bowling Arm
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Right-arm', 'Left-arm'] as const).map((arm) => (
                  <button
                    key={arm}
                    type="button"
                    onClick={() => setHand(arm)}
                    className={`text-xs py-1.5 px-3 rounded-lg border font-medium transition-all ${
                      hand === arm
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {arm}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Bowling Style
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomStyleSelected(!isCustomStyleSelected)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  {isCustomStyleSelected ? 'Select from list' : 'Write custom style'}
                </button>
              </div>

              {!isCustomStyleSelected ? (
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-550 text-slate-900 dark:text-slate-100"
                >
                  {COMMON_BOWLING_STYLES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Legbreak Googly"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-550 text-slate-900 dark:text-slate-100"
                  required
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full text-xs font-medium py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
            >
              Confirm Registration
            </button>
          </div>
        </form>
      )}

      {/* Bowlers Registry List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[300px] md:max-h-none">
        {bowlers.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5">
            <User className="w-8 h-8 opacity-40 text-slate-400" />
            <span>No bowlers registered. Add above.</span>
          </div>
        ) : (
          bowlers.map((bowler) => {
            const isSelected = selectedBowlerId === bowler.id;
            return (
              <div
                key={bowler.id}
                onClick={() => onSelectBowler(bowler.id)}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/10 dark:bg-indigo-950/20 border-indigo-500 shadow-sm'
                    : 'bg-white dark:bg-slate-800/10 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {bowler.name[0]?.toUpperCase() || 'B'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-sans">
                      {bowler.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {bowler.hand} • {bowler.bowlingStyle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isSelected && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" />
                      ACTIVE
                    </span>
                  )}
                  {onDeleteBowler && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBowler(bowler.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                      title="De-register Bowler"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
