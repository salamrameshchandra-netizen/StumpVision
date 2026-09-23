/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bowler, BowlingSide } from '../types';
import { User, Plus, Check, Trash2, Award, Save, Edit2, X } from 'lucide-react';

interface BowlerManagerProps {
  bowlers: Bowler[];
  onAddBowler: (name: string, hand: 'Right-arm' | 'Left-arm', style: string, preferredSide?: BowlingSide) => void;
  onSelectBowler: (id: string) => void;
  selectedBowlerId: string | null;
  onDeleteBowler?: (id: string) => void;
  onUpdateBowler?: (id: string, name: string) => void;
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
  onUpdateBowler,
}: BowlerManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [quickPlayerName, setQuickPlayerName] = useState('');
  const [name, setName] = useState('');
  const [hand, setHand] = useState<'Right-arm' | 'Left-arm'>('Right-arm');
  const [preferredSide, setPreferredSide] = useState<BowlingSide>('over_the_wicket');
  const [style, setStyle] = useState(COMMON_BOWLING_STYLES[0]);
  const [customStyle, setCustomStyle] = useState('');
  const [isCustomStyleSelected, setIsCustomStyleSelected] = useState(false);

  // State for inline editing bowler's name
  const [editingBowlerId, setEditingBowlerId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  const handleQuickSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPlayerName.trim()) return;
    onAddBowler(quickPlayerName.trim(), 'Right-arm', 'Medium Fast', 'over_the_wicket');
    setQuickPlayerName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStyle = isCustomStyleSelected ? customStyle.trim() : style;
    if (!name.trim()) return;
    onAddBowler(name.trim(), hand, finalStyle || 'Medium Fast', preferredSide);
    setName('');
    setCustomStyle('');
    setIsCustomStyleSelected(false);
    setShowAddForm(false);
  };

  const handleStartEdit = (bowler: Bowler, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBowlerId(bowler.id);
    setEditNameValue(bowler.name);
  };

  const handleSaveEdit = (bowlerId: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editNameValue.trim() && onUpdateBowler) {
      onUpdateBowler(bowlerId, editNameValue.trim());
    }
    setEditingBowlerId(null);
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
            Full Profile
          </button>
        ) : (
          <button
            onClick={() => setShowAddForm(false)}
            className="text-xs font-semibold hover:text-slate-900 dark:hover:text-white text-slate-500 transition-colors cursor-pointer"
          >
            Close
          </button>
        )}
      </div>

      {/* Quick Save Player Name Bar with dedicated button */}
      <form onSubmit={handleQuickSave} className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Quick Save Player
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type player's name (e.g. Jasprit Bumrah)..."
            value={quickPlayerName}
            onChange={(e) => setQuickPlayerName(e.target.value)}
            className="flex-1 text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            id="btn-quick-save-player"
            disabled={!quickPlayerName.trim()}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
            title="Save Player Name"
          >
            <Save className="w-3.5 h-3.5" />
            Save Player Name
          </button>
        </div>
      </form>

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
                className="w-full text-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
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
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Default Bowling Angle
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['over_the_wicket', 'around_the_wicket'] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setPreferredSide(side)}
                    className={`text-xs py-1.5 px-3 rounded-lg border font-medium transition-all ${
                      preferredSide === side
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {side === 'around_the_wicket' ? 'Around the Wicket' : 'Over the Wicket'}
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
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
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
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                  required
                />
              )}
            </div>

            <button
              type="submit"
              id="btn-save-player-name-profile"
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Player Name
            </button>
          </div>
        </form>
      )}

      {/* Bowlers Registry List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[300px] md:max-h-none">
        {bowlers.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5">
            <User className="w-8 h-8 opacity-40 text-slate-400" />
            <span>No bowlers registered. Enter name above and click Save Player Name.</span>
          </div>
        ) : (
          bowlers.map((bowler) => {
            const isSelected = selectedBowlerId === bowler.id;
            const isEditing = editingBowlerId === bowler.id;

            return (
              <div
                key={bowler.id}
                onClick={() => !isEditing && onSelectBowler(bowler.id)}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/10 dark:bg-indigo-950/20 border-indigo-500 shadow-sm'
                    : 'bg-white dark:bg-slate-800/10 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {bowler.name[0]?.toUpperCase() || 'B'}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        className="text-xs px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-400 rounded focus:outline-none flex-1 min-w-0 text-slate-900 dark:text-slate-100"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(bowler.id, e);
                          if (e.key === 'Escape') setEditingBowlerId(null);
                        }}
                      />
                      <button
                        onClick={(e) => handleSaveEdit(bowler.id, e)}
                        className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer shrink-0"
                        title="Save Player Name"
                      >
                        <Save className="w-3 h-3" />
                        Save Player Name
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBowlerId(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer shrink-0"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-sans truncate">
                        {bowler.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {bowler.hand} • {bowler.bowlingStyle} • {bowler.preferredBowlingSide === 'around_the_wicket' ? 'Around Wicket' : 'Over Wicket'}
                      </div>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                        <Check className="w-3.5 h-3.5" />
                        ACTIVE
                      </span>
                    )}
                    {onUpdateBowler && (
                      <button
                        onClick={(e) => handleStartEdit(bowler, e)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        title="Edit Player's Name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
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
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
