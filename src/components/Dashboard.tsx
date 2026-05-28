/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { OverRecord, Bowler, PITCH_LENGTHSList, PitchLength, getBowlingLineName } from '../types';
import PitchVisualizer from './PitchVisualizer';
import {
  Calendar,
  Filter,
  TrendingUp,
  MapPin,
  ClipboardList,
  Eye,
  X,
  Sparkles,
  Download,
  Percent,
  Flame,
  Clock
} from 'lucide-react';

interface DashboardProps {
  completedOvers: OverRecord[];
  bowlers: Bowler[];
  onExportPDF: (filteredOvers: OverRecord[], stats: any, dateRange: { start: string; end: string }, selectedBowlerName: string) => void;
}

export default function Dashboard({ completedOvers, bowlers, onExportPDF }: DashboardProps) {
  const [startDateStr, setStartDateStr] = useState<string>(() => {
    // Default to 30 days ago
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDateStr, setEndDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedBowlerFilter, setSelectedBowlerFilter] = useState<string>('all');

  // Modal inspection state
  const [inspectingOver, setInspectingOver] = useState<OverRecord | null>(null);

  // Filter completed overs
  const filteredOvers = useMemo(() => {
    return completedOvers.filter((ov) => {
      const overDate = ov.date.split('T')[0];
      const matchStart = startDateStr ? overDate >= startDateStr : true;
      const matchEnd = endDateStr ? overDate <= endDateStr : true;
      const matchBowler =
        selectedBowlerFilter === 'all' ? true : ov.bowlerId === selectedBowlerFilter;
      return matchStart && matchEnd && matchBowler;
    });
  }, [completedOvers, startDateStr, endDateStr, selectedBowlerFilter]);

  // Compute statistics
  const stats = useMemo(() => {
    let totalBalls = 0;
    let totalWickets = 0;
    let onStumpsCount = 0;
    let outsideOffCount = 0;
    let downLegCount = 0;

    const lengthCounts: Record<PitchLength, number> = {
      short_pitch: 0,
      short_of_good: 0,
      good_length: 0,
      over_pitch: 0,
      full_length: 0,
      yorker: 0,
    };

    filteredOvers.forEach((ov) => {
      totalWickets += ov.wickets;
      ov.balls.forEach((ball) => {
        // Increment frequency count for length
        if (ball.pitchLength in lengthCounts) {
          lengthCounts[ball.pitchLength]++;
        }

        // Count total balls
        totalBalls++;

        // Track relative bowling lines
        if (ball.x >= 42 && ball.x <= 58) {
          onStumpsCount++;
        } else if (ball.x < 42) {
          outsideOffCount++;
        } else {
          downLegCount++;
        }
      });
    });

    // Legal balls
    const legalBalls = totalBalls;

    const oversBowledDecimal = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;

    const goodLengthCount = lengthCounts['good_length'] || 0;
    const goodLengthPercent = totalBalls > 0 ? Math.round((goodLengthCount / totalBalls) * 100) : 0;

    const yorkerCount = lengthCounts['yorker'] || 0;
    const yorkerPercent = totalBalls > 0 ? Math.round((yorkerCount / totalBalls) * 100) : 0;

    const onStumpsPercent = totalBalls > 0 ? Math.round((onStumpsCount / totalBalls) * 100) : 0;

    return {
      totalOvers: oversBowledDecimal,
      totalWickets,
      lengthCounts,
      totalBalls,
      onStumpsCount,
      outsideOffCount,
      downLegCount,
      goodLengthPercent,
      yorkerPercent,
      onStumpsPercent,
    };
  }, [filteredOvers]);

  // Selected Bowler Name for reporting
  const selectedBowlerName = useMemo(() => {
    if (selectedBowlerFilter === 'all') return 'All Bowlers';
    return bowlers.find((b) => b.id === selectedBowlerFilter)?.name || 'Unknown Bowler';
  }, [selectedBowlerFilter, bowlers]);

  const handleExportTrigger = () => {
    onExportPDF(
      filteredOvers,
      stats,
      { start: startDateStr, end: endDateStr },
      selectedBowlerName
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters and CSV/PDF export panels */}
      <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              Intelligence & Filtering
            </div>
            <h2 className="text-xl font-bold font-sans tracking-tight">Performance Deck</h2>
          </div>

          <button
            onClick={handleExportTrigger}
            disabled={filteredOvers.length === 0}
            className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              filteredOvers.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Extract Session PDF Report
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> From Date
            </label>
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="w-full text-xs text-slate-200 bg-slate-900 border border-slate-850 p-2 rounded focus:outline-none focus:ring-1 focus:ring-indigo-550"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> To Date
            </label>
            <input
              type="date"
              value={endDateStr}
              onChange={(e) => setEndDateStr(e.target.value)}
              className="w-full text-xs text-slate-200 bg-slate-900 border border-slate-850 p-2 rounded focus:outline-none focus:ring-1 focus:ring-indigo-550"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-500" /> Select Bowler
            </label>
            <select
              value={selectedBowlerFilter}
              onChange={(e) => setSelectedBowlerFilter(e.target.value)}
              className="w-full text-xs text-slate-200 bg-slate-900 border border-slate-850 p-2 rounded focus:outline-none focus:ring-1 focus:ring-indigo-550"
            >
              <option value="all">All Squad Bowlers</option>
              {bowlers.map((bowler) => (
                <option key={bowler.id} value={bowler.id}>
                  {bowler.name} ({bowler.bowlingStyle})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredOvers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No matching performance data</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Try adjusting your date filters or record additional match overs in the Pitch dashboard for {selectedBowlerName}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Widgets Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Overs */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Overs Bowled</span>
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1.5">
                  {stats.totalOvers}
                </div>
                <div className="text-[9px] text-slate-500 font-medium mt-1">
                  {stats.totalBalls} total deliveries
                </div>
              </div>

              {/* Good Length Consistency */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Good/Yorker %</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1.5">
                  {stats.goodLengthPercent + stats.yorkerPercent}%
                </div>
                <div className="text-[9px] text-slate-550 dark:text-slate-400 font-medium mt-1">
                  Lethal length consistency
                </div>
              </div>

              {/* Stump Line Targeting */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Stump Line %</span>
                  <Percent className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1.5">
                  {stats.onStumpsPercent}%
                </div>
                <div className="text-[9px] text-slate-550 dark:text-slate-400 font-medium mt-1">
                  Balls hitting the stumps line
                </div>
              </div>
            </div>

            {/* Completed Overs Detailed Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5 font-display">
                <ClipboardList className="w-4 h-4 text-indigo-605 dark:text-indigo-400" />
                Historical Overs Log Ledger
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                      <th className="p-3 font-semibold font-mono">Date</th>
                      <th className="p-3 font-semibold">Bowler</th>
                      <th className="p-3 font-semibold">Deliveries Feed</th>
                      <th className="p-3 font-semibold font-mono text-center">Length Accuracy</th>
                      <th className="p-3 font-semibold text-right">Map</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOvers.map((ov) => {
                      const overDateStr = new Date(ov.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });

                      const goodCountInOver = ov.balls.filter((b) => b.pitchLength === 'good_length' || b.pitchLength === 'yorker').length;
                      const accuracyPct = ov.balls.length > 0 ? Math.round((goodCountInOver / ov.balls.length) * 100) : 0;

                      return (
                        <tr
                          key={ov.id}
                          className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/70 dark:hover:bg-slate-850/40"
                        >
                          <td className="p-3 font-mono text-slate-500 dark:text-slate-400">
                            {overDateStr}
                          </td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                            {ov.bowlerName}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1 items-center max-w-[200px] overflow-x-auto">
                              {ov.balls.map((b) => {
                                const getLengthShort = (id: PitchLength): string => {
                                  if (id === 'short_pitch') return 'SHT';
                                  if (id === 'short_of_good') return 'BKL';
                                  if (id === 'good_length') return 'GD';
                                  if (id === 'over_pitch') return 'OVP';
                                  if (id === 'full_length') return 'FUL';
                                  if (id === 'yorker') return 'YKR';
                                  return '';
                                };

                                return (
                                  <span
                                    key={b.id}
                                    title={`Line: ${getBowlingLineName(b.x)}`}
                                    className="text-[9px] px-1 py-0.5 rounded font-bold font-mono tracking-tighter bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400"
                                  >
                                    {getLengthShort(b.pitchLength)}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-center text-slate-600 dark:text-slate-300 font-bold">
                            {accuracyPct}%
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setInspectingOver(ov)}
                              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold p-1 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Visualize pitch map"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Graphical Length Analysis right sidebar panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-850 dark:text-slate-200 mb-4 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2.5 font-display">
              <MapPin className="w-4 h-4 text-indigo-505 dark:text-indigo-400" />
              Pitching Length Distribution
            </h3>

            {/* Simulated interactive vertical length bars resembling pitching sections */}
            <div className="space-y-3.5">
              {[...PITCH_LENGTHSList]
                .sort((a, b) => b.rangeMinY - a.rangeMinY) // Top (Short) down to Yorker at bottom
                .map((zone) => {
                  const ballCount = stats.lengthCounts[zone.id] || 0;
                  const percentVal =
                    stats.totalBalls > 0 ? Math.round((ballCount / stats.totalBalls) * 100) : 0;

                  return (
                    <div key={zone.id} className="relative group">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: zone.color }}
                          ></span>
                          {zone.name}
                        </span>
                        <span className="font-bold text-slate-500 font-mono">
                          {ballCount} ball{ballCount !== 1 ? 's' : ''} ({percentVal}%)
                        </span>
                      </div>

                      {/* Bar Track */}
                      <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-700/50">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentVal}%`,
                            backgroundColor: zone.color,
                            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.25)',
                          }}
                        ></div>
                      </div>

                      {/* Tooltip snippet on hover */}
                      <div className="text-[10px] text-slate-400 mt-0.5 max-w bg-slate-50 dark:bg-slate-800/25 p-1 rounded font-mono hidden group-hover:block transition-all border border-slate-200/30 dark:border-slate-750">
                        {zone.description}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-5 p-3.5 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/20 dark:border-indigo-900/30 rounded-xl">
              <span className="block text-[10px] font-bold text-indigo-805 dark:text-indigo-400 font-mono uppercase tracking-wide">
                Coaching Insight Desk
              </span>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 mt-1">
                For standard overs, ideal good length percentage should hover between{' '}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">45% - 60%</span> to keep the
                batsman guessing. Yorker length is highly lethal at the death (overs 16-20).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT OVER MODAL PLOTTER OVERLAY */}
      {inspectingOver && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setInspectingOver(null)}
              className="absolute top-5 right-5 text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 transition-colors pointer-events-auto cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Pitch on the left */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-850">
                <PitchVisualizer
                  balls={inspectingOver.balls}
                  interactive={false}
                />
              </div>

              {/* Data panel on the right */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-650 dark:text-indigo-400 font-mono uppercase tracking-widest block">
                    SESSION MAP INSPECTION
                  </span>
                  <h3 className="text-2xl font-black text-slate-850 dark:text-slate-155 mt-1 tracking-tight">
                    {inspectingOver.bowlerName}&apos;s Over
                  </h3>
                  <p className="text-xs text-slate-450 dark:text-slate-500 font-mono mt-0.5">
                    Logged at {new Date(inspectingOver.date).toLocaleString()}
                  </p>
                </div>

                {/* Over mini banner */}
                <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-450 uppercase font-mono">Accuracy</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {inspectingOver.balls.length > 0
                        ? Math.round((inspectingOver.balls.filter((b) => b.pitchLength === 'good_length' || b.pitchLength === 'yorker').length / inspectingOver.balls.length) * 100)
                        : 0}%
                    </div>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-450 uppercase font-mono">Deliveries</span>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {inspectingOver.balls.length} Balls
                    </div>
                  </div>
                </div>

                {/* Ball list details */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider mb-2">
                    BALL BY BALL LEDGER
                  </h4>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {inspectingOver.balls.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between bg-white dark:bg-slate-850 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800 text-xs font-sans hover:border-slate-350 dark:hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black font-mono flex items-center justify-center text-[10px]">
                            {b.ballIndex}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {PITCH_LENGTHSList.find((z) => z.id === b.pitchLength)?.name || b.pitchLength}
                            </span>
                            <span className="text-[10px] text-zinc-400 block font-mono">
                              Ball Delivery Index: #{b.ballIndex}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono block">
                            {getBowlingLineName(b.x)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/85">
                  <button
                    onClick={() => setInspectingOver(null)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Close Inspection Pane
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
