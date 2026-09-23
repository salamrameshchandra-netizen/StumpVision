/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { OverRecord, Bowler, PitchLength, PITCH_LENGTHSList, getBowlingLineName } from '../types';
import PitchVisualizer from './PitchVisualizer';
import {
  FileText,
  Filter,
  Calendar,
  Eye,
  X,
  Compass,
  TrendingUp,
  Percent,
  MapPin,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

interface DashboardProps {
  completedOvers: OverRecord[];
  bowlers: Bowler[];
  onExportPDF: (
    oversList: OverRecord[],
    statsSummary: any,
    dateRange: { start: string; end: string },
    bowlerName: string
  ) => void;
}

export default function Dashboard({
  completedOvers,
  bowlers,
  onExportPDF,
}: DashboardProps) {
  // Filtering states
  const [selectedBowlerFilter, setSelectedBowlerFilter] = useState<string>('all');
  const [startDateStr, setStartDateStr] = useState<string>('');
  const [endDateStr, setEndDateStr] = useState<string>('');

  // Modal inspection of an over
  const [inspectingOver, setInspectingOver] = useState<OverRecord | null>(null);

  // Filtered dataset
  const filteredOvers = useMemo(() => {
    return completedOvers.filter((ov) => {
      // Bowler match
      if (selectedBowlerFilter !== 'all' && ov.bowlerId !== selectedBowlerFilter) {
        return false;
      }
      // Date constraints
      if (startDateStr && new Date(ov.date) < new Date(startDateStr)) {
        return false;
      }
      if (endDateStr) {
        const endDay = new Date(endDateStr);
        endDay.setHours(23, 59, 59, 999);
        if (new Date(ov.date) > endDay) return false;
      }
      return true;
    });
  }, [completedOvers, startDateStr, endDateStr, selectedBowlerFilter]);

  // Compute statistics including bowling side breakdown
  const stats = useMemo(() => {
    let totalBalls = 0;
    let totalWickets = 0;
    let onStumpsCount = 0;
    let outsideOffCount = 0;
    let downLegCount = 0;

    let otwBalls = 0;
    let atwBalls = 0;
    let otwRuns = 0;
    let atwRuns = 0;
    let otwWickets = 0;
    let atwWickets = 0;

    const lengthCounts: Record<PitchLength, number> = {
      short_pitch: 0,
      short_of_good: 0,
      good_length: 0,
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

        // Track bowling side (Over the Wicket vs Around the Wicket)
        if (ball.bowlingSide === 'around_the_wicket') {
          atwBalls++;
          atwRuns += ball.runs || 0;
          if (ball.type === 'wicket') atwWickets++;
        } else {
          otwBalls++;
          otwRuns += ball.runs || 0;
          if (ball.type === 'wicket') otwWickets++;
        }

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

    const legalBalls = totalBalls;
    const oversBowledDecimal = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;

    const goodLengthCount = lengthCounts['good_length'] || 0;
    const goodLengthPercent = totalBalls > 0 ? Math.round((goodLengthCount / totalBalls) * 100) : 0;

    const yorkerCount = lengthCounts['yorker'] || 0;
    const yorkerPercent = totalBalls > 0 ? Math.round((yorkerCount / totalBalls) * 100) : 0;

    const onStumpsPercent = totalBalls > 0 ? Math.round((onStumpsCount / totalBalls) * 100) : 0;

    const otwPercent = totalBalls > 0 ? Math.round((otwBalls / totalBalls) * 100) : 0;
    const atwPercent = totalBalls > 0 ? Math.round((atwBalls / totalBalls) * 100) : 0;

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
      otwBalls,
      atwBalls,
      otwRuns,
      atwRuns,
      otwWickets,
      atwWickets,
      otwPercent,
      atwPercent,
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

  const getLengthShort = (id: PitchLength): string => {
    if (id === 'short_pitch') return 'SHT';
    if (id === 'short_of_good') return 'BKL';
    if (id === 'good_length') return 'GD';
    if (id === 'full_length') return 'FUL';
    if (id === 'yorker') return 'YKR';
    return 'FUL';
  };

  const inspectingBowler = inspectingOver
    ? bowlers.find((b) => b.id === inspectingOver.bowlerId)
    : null;

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
            <h2 className="text-xl font-bold font-display tracking-tight text-white">
              Pitching Performance Analytics Deck
            </h2>
          </div>

          <button
            onClick={handleExportTrigger}
            disabled={filteredOvers.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-indigo-400" />
              Filter by Bowler
            </label>
            <select
              value={selectedBowlerFilter}
              onChange={(e) => setSelectedBowlerFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Bowlers Combined</option>
              {bowlers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.hand})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-400" />
              Start Date
            </label>
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-400" />
              End Date
            </label>
            <input
              type="date"
              value={endDateStr}
              onChange={(e) => setEndDateStr(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {filteredOvers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm font-semibold">No pitch records match the active criteria.</p>
          <p className="text-xs mt-1">Bowlers can be logged in the Live Studio tab to generate performance metrics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-column wide metrics and over tables */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Overs Bowled */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overs Bowled</span>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1">
                  {stats.totalOvers}
                </div>
                <div className="text-[9px] text-slate-500 font-medium mt-1">
                  {stats.totalBalls} deliveries
                </div>
              </div>

              {/* Total Wickets */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Wickets</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  {stats.totalWickets}
                </div>
                <div className="text-[9px] text-slate-500 font-medium mt-1">
                  {filteredOvers.length} overs logged
                </div>
              </div>

              {/* Good Length / Yorker % */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Good/Ykr %</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1">
                  {stats.goodLengthPercent + stats.yorkerPercent}%
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Optimal corridor
                </div>
              </div>

              {/* Stump Line Targeting */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Stump Line %</span>
                  <Percent className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1">
                  {stats.onStumpsPercent}%
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Direct stump attack
                </div>
              </div>
            </div>

            {/* Completed Overs Detailed Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5 font-display">
                <ClipboardList className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Historical Overs Log Ledger
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                      <th className="p-3 font-semibold font-mono">Date</th>
                      <th className="p-3 font-semibold">Bowler</th>
                      <th className="p-3 font-semibold">Deliveries Feed</th>
                      <th className="p-3 font-semibold font-mono text-center">Length Accuracy</th>
                      <th className="p-3 font-semibold text-right">Map</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredOvers.map((ov) => {
                      const goodCountInOver = ov.balls.filter(
                        (b) => b.pitchLength === 'good_length' || b.pitchLength === 'yorker'
                      ).length;
                      const accuracyPct =
                        ov.balls.length > 0 ? Math.round((goodCountInOver / ov.balls.length) * 100) : 0;

                      return (
                        <tr
                          key={ov.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                            {new Date(ov.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {ov.bowlerName}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {ov.balls.map((b) => {
                                const isAround = b.bowlingSide === 'around_the_wicket';
                                return (
                                  <span
                                    key={b.id}
                                    className="text-[9px] px-1.5 py-0.5 rounded font-bold font-mono tracking-tighter bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-800/50 dark:text-indigo-300 flex items-center gap-0.5"
                                    title={`${b.pitchLength} • ${isAround ? 'Around the Wicket' : 'Over the Wicket'}`}
                                  >
                                    <span>{getLengthShort(b.pitchLength)}</span>
                                    <span className="text-[7.5px] opacity-75 font-sans uppercase">
                                      ({isAround ? 'ATW' : 'OTW'})
                                    </span>
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

          {/* Right sidebar panel: Pitching Length & Bowling Angle Distributions */}
          <div className="space-y-6">
            {/* Bowling Angle Breakdown Card (Over the Wicket vs Around the Wicket) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-850 dark:text-slate-200 mb-3.5 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5 font-display">
                <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Bowling Angle Breakdown
              </h3>

              <div className="space-y-3">
                {/* Over the Wicket bar */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                      Over the Wicket (OTW)
                    </span>
                    <span className="font-bold text-slate-500 font-mono">
                      {stats.otwBalls} balls ({stats.otwPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${stats.otwPercent}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-mono">
                    <span>Runs: {stats.otwRuns}</span>
                    <span>Wickets: {stats.otwWickets}</span>
                  </div>
                </div>

                {/* Around the Wicket bar */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      Around the Wicket (ATW)
                    </span>
                    <span className="font-bold text-slate-500 font-mono">
                      {stats.atwBalls} balls ({stats.atwPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.atwPercent}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-mono">
                    <span>Runs: {stats.atwRuns}</span>
                    <span>Wickets: {stats.atwWickets}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pitching Length Distribution */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-850 dark:text-slate-200 mb-4 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5 font-display">
                <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Pitching Length Distribution
              </h3>

              <div className="space-y-3.5">
                {[...PITCH_LENGTHSList]
                  .sort((a, b) => b.rangeMinY - a.rangeMinY)
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

                        <div className="text-[10px] text-slate-400 mt-0.5 max-w bg-slate-50 dark:bg-slate-800/25 p-1 rounded font-mono hidden group-hover:block transition-all border border-slate-200/30 dark:border-slate-750">
                          {zone.description}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-5 p-3.5 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/20 dark:border-indigo-900/30 rounded-xl">
                <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono uppercase tracking-wide">
                  Coaching Insight Desk
                </span>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 mt-1">
                  Targeting Good Length and changing the angle from Over to Around the Wicket creates awkward angles that disrupt the batsman&apos;s footwork.
                </p>
              </div>
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
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800">
                <PitchVisualizer
                  balls={inspectingOver.balls}
                  interactive={false}
                  bowlerHand={inspectingBowler?.hand || 'Right-arm'}
                  bowlingSide={inspectingOver.balls[0]?.bowlingSide || 'over_the_wicket'}
                />
              </div>

              {/* Data panel on the right */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 font-mono uppercase tracking-widest block">
                    SESSION MAP INSPECTION
                  </span>
                  <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1 tracking-tight">
                    {inspectingOver.bowlerName}&apos;s Over
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Logged at {new Date(inspectingOver.date).toLocaleString()}
                  </p>
                </div>

                {/* Over mini banner */}
                <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Accuracy</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {inspectingOver.balls.length > 0
                        ? Math.round(
                            (inspectingOver.balls.filter(
                              (b) => b.pitchLength === 'good_length' || b.pitchLength === 'yorker'
                            ).length /
                              inspectingOver.balls.length) *
                              100
                          )
                        : 0}%
                    </div>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Deliveries</span>
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
                        className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-sans hover:border-slate-300 dark:hover:border-slate-600 transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black font-mono flex items-center justify-center text-[10px]">
                            {b.ballIndex}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {PITCH_LENGTHSList.find((z) => z.id === b.pitchLength)?.name || b.pitchLength}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                Ball #{b.ballIndex} •
                              </span>
                              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono">
                                {b.bowlingSide === 'around_the_wicket' ? 'Around the Wicket' : 'Over the Wicket'}
                              </span>
                            </div>
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
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
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
