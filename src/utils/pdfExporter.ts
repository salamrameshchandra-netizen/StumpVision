/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { OverRecord, PITCH_LENGTHSList } from '../types';

export function exportPitchingStatsPDF(
  overs: OverRecord[],
  stats: any,
  dateRange: { start: string; end: string },
  selectedBowlerName: string
) {
  const doc = new jsPDF();
  const timestampStr = new Date().toLocaleString();

  // --- Document Styles ---
  const accentColor = [16, 185, 129]; // Emerald (10, 185, 129)
  const darkSlate = [15, 23, 42]; // Slate-900

  // Draw Header Border & Title
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(0, 0, 210, 40, 'F');

  // Title Text inside Dark Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CRICKET PITCHING REPORT', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text('Ball Pitching Tracker & Bowling Analysis', 15, 25);

  doc.setFontSize(9);
  doc.text(`Generated: ${timestampStr}`, 155, 14);
  doc.text('Confidential Training Ledger', 155, 20);

  // Divider Line underneath Header
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 40, 210, 3, 'F');

  // --- Session Metadata Panel ---
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SESSION PARAMETERS', 15, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Bowler Scope:    ${selectedBowlerName}`, 15, 62);
  doc.text(`Date Target:      ${dateRange.start || 'Beginning'}  to  ${dateRange.end || 'Today'}`, 15, 68);
  doc.text(`Overs Recorded:   ${overs.length} logged overs`, 15, 74);

  // --- KPIs Grid ---
  doc.setFillColor(248, 250, 252); // extremely light gray/slate (Slate-50)
  doc.rect(15, 82, 180, 26, 'F');
  doc.setDrawColor(226, 232, 240); // borders (Slate-200)
  doc.rect(15, 82, 180, 26, 'S');

  // Box Dividers
  doc.line(60, 82, 60, 108);
  doc.line(105, 82, 105, 108);
  doc.line(150, 82, 150, 108);

  // Box 1: Overs
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('OVERS', 18, 88);
  doc.setFontSize(14);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(String(stats.totalOvers), 18, 98);

  // Box 2: Good Length Accuracy
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('GOOD / YKR ACCURACY', 63, 88);
  doc.setFontSize(14);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`${stats.goodLengthPercent + stats.yorkerPercent}%`, 63, 98);

  // Box 3: Stump Line Targeting
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('STUMPS TARGETED', 108, 88);
  doc.setFontSize(14);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`${stats.onStumpsCount} Balls`, 108, 98);

  // Box 4: Stump Line Targeting
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('STUMP LINE %', 153, 88);
  doc.setFontSize(14);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`${stats.onStumpsPercent}%`, 153, 98);

  // --- Length Frequency Section ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PITCHING LENGTH DISPERSION', 15, 120);

  // Table header for lengths
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(15, 124, 180, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('Pitching Length Zone', 18, 129);
  doc.text('Occurrences (Balls)', 100, 129);
  doc.text('Percentage Tally', 150, 129);

  let currentY = 132;
  const sortedZones = [...PITCH_LENGTHSList].sort((a, b) => b.rangeMinY - a.rangeMinY); // Yorker at bottom
  
  sortedZones.forEach((z) => {
    const ballCount = stats.lengthCounts[z.id] || 0;
    const percentVal = stats.totalBalls > 0 ? Math.round((ballCount / stats.totalBalls) * 100) : 0;

    // Row Background alternations
    doc.line(15, currentY + 6, 195, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

    // Color code indicator dot
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.ellipse(18, currentY + 2.5, 1, 1, 'F');

    doc.text(z.name, 22, currentY + 3.5);
    doc.text(String(ballCount), 100, currentY + 3.5);
    doc.text(`${percentVal}%`, 150, currentY + 3.5);

    currentY += 8;
  });

  // --- Detailed Overs Table ---
  doc.addPage();

  // Fresh Page Header Banner
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 20, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DETAILED COMPLETED OVERS LOG', 15, 13);

  // Table header for Overs
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFontSize(12);
  doc.text('INDIVIDUAL LOG SUMMARY', 15, 34);

  doc.setFillColor(241, 245, 249);
  doc.rect(15, 38, 180, 8, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Date', 18, 43);
  doc.text('Bowler', 42, 43);
  doc.text('Over Progression Feed', 80, 43);
  doc.text('Deliveries', 152, 43);
  doc.text('Accuracy', 180, 43);

  let gridY = 46;
  overs.forEach((ov, index) => {
    // Page breaking constraint
    if (gridY > 265) {
      doc.addPage();
      // Fresh mini-header
      doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.rect(0, 0, 210, 15, 'F');
      gridY = 25;

      doc.setFillColor(241, 245, 249);
      doc.rect(15, gridY, 180, 8, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8.5);
      doc.text('Date', 18, gridY + 5);
      doc.text('Bowler', 42, gridY + 5);
      doc.text('Over Progression Feed', 80, gridY + 5);
      doc.text('Deliveries', 152, gridY + 5);
      doc.text('Accuracy', 180, gridY + 5);
      gridY += 10;
    }

    const overDateStr = new Date(ov.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

    const getShorthand = (id: string): string => {
      if (id === 'short_pitch') return 'SHT';
      if (id === 'short_of_good') return 'BKL';
      if (id === 'good_length') return 'GD';
      if (id === 'over_pitch') return 'OVP';
      if (id === 'full_length') return 'FUL';
      if (id === 'yorker') return 'YKR';
      return '';
    };

    const ballString = ov.balls
      .map((b) => getShorthand(b.pitchLength))
      .join(' ');

    const goodCountInOver = ov.balls.filter((b) => b.pitchLength === 'good_length' || b.pitchLength === 'yorker').length;
    const accuracyPct = ov.balls.length > 0 ? Math.round((goodCountInOver / ov.balls.length) * 100) : 0;

    doc.line(15, gridY + 6, 195, gridY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    doc.text(overDateStr, 18, gridY + 4);
    doc.setFont('helvetica', 'bold');
    doc.text(ov.bowlerName, 42, gridY + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(ballString, 80, gridY + 4, { maxWidth: 68 });
    doc.text(`${ov.balls.length} Balls`, 154, gridY + 4);
    doc.text(`${accuracyPct}%`, 180, gridY + 4);

    gridY += 9;
  });

  // Footer note on the second page
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(
    '* Report dynamically formulated on-device. No cloud replication has taken place.',
    15,
    285
  );

  // Save the PDF locally on the user's browser
  const filename = `${selectedBowlerName.toLowerCase().replace(/\s+/g, '_')}_pitch_analysis_${
    new Date().toISOString().split('T')[0]
  }.pdf`;
  doc.save(filename);
}
