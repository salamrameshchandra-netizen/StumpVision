/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PitchLength =
  | 'short_pitch'
  | 'short_of_good'
  | 'good_length'
  | 'over_pitch'
  | 'full_length'
  | 'yorker';

export interface PitchLengthConfig {
  id: PitchLength;
  name: string;
  shortName: string;
  rangeMinY: number; // percentage (0 - 100)
  rangeMaxY: number; // percentage (0 - 100)
  color: string; // Tailwind tint
  bgColor: string; // Tailwind background overlay
  textColor: string; // Tailwind text color
  description: string;
}

export const PITCH_LENGTHSList: PitchLengthConfig[] = [
  {
    id: 'short_pitch',
    name: 'Short Pitch',
    shortName: 'Short',
    rangeMinY: 0,
    rangeMaxY: 25,
    color: 'rgb(239, 68, 68)', // red
    bgColor: 'rgba(239, 68, 68, 0.1)',
    textColor: 'text-red-500',
    description: 'High bouncer targeting the shoulders/head. Hard to control, risky.',
  },
  {
    id: 'short_of_good',
    name: 'Short of Good Length',
    shortName: 'Back of Length',
    rangeMinY: 25,
    rangeMaxY: 45,
    color: 'rgb(249, 115, 22)', // orange
    bgColor: 'rgba(249, 115, 22, 0.1)',
    textColor: 'text-orange-500',
    description: 'Bounces to chest height. Defensive length forcing back foot play.',
  },
  {
    id: 'good_length',
    name: 'Good Length',
    shortName: 'Good',
    rangeMinY: 45,
    rangeMaxY: 65,
    color: 'rgb(34, 197, 94)', // green (the corridor of uncertainty)
    bgColor: 'rgba(34, 197, 94, 0.15)',
    textColor: 'text-green-500',
    description: 'The optimal corridor. Casts doubt on playing forward or back.',
  },
  {
    id: 'over_pitch',
    name: 'Over Pitch',
    shortName: 'Overpitch',
    rangeMinY: 65,
    rangeMaxY: 80,
    color: 'rgb(59, 130, 246)', // blue
    bgColor: 'rgba(59, 130, 246, 0.1)',
    textColor: 'text-blue-500',
    description: 'Full delivery inviting the batsman to drive. High boundary risk.',
  },
  {
    id: 'full_length',
    name: 'Full Length',
    shortName: 'Full',
    rangeMinY: 80,
    rangeMaxY: 90,
    color: 'rgb(168, 85, 247)', // purple
    bgColor: 'rgba(168, 85, 247, 0.1)',
    textColor: 'text-purple-500',
    description: 'Very full, close to bat. Induces drives, excellent for swing bowlers.',
  },
  {
    id: 'yorker',
    name: 'Yorker',
    shortName: 'Yorker',
    rangeMinY: 90,
    rangeMaxY: 100,
    color: 'rgb(236, 72, 153)', // pink/magenta
    bgColor: 'rgba(236, 72, 153, 0.15)',
    textColor: 'text-pink-500',
    description: 'Aimed directly at toes or the base of stumps. Extremely deadly.',
  },
];

export type BallType = 'normal' | 'wide' | 'no_ball' | 'wicket';

export interface BallDetail {
  id: string;
  ballIndex: number; // Sequential logged click count (1, 2, 3...)
  actualBallNumber: number; // 1 to 6 (only increments on legal balls)
  pitchLength: PitchLength;
  type: BallType;
  runs: number; // Runs scored off this ball (0, 1, 2, 3, 4, 6, etc.)
  x: number; // Horizontal position % on the pitch (0 to 100)
  y: number; // Vertical position % on the pitch (0 to 100)
  wicketType?: 'Bowled' | 'Caught' | 'LBW' | 'Run Out' | 'Stumped' | 'Other';
  timestamp: string;
}

export interface OverRecord {
  id: string;
  bowlerId: string;
  bowlerName: string;
  balls: BallDetail[];
  totalRuns: number; // inclusive of runs + extras
  wickets: number;
  isCompleted: boolean;
  date: string; // ISO String
}

export interface Bowler {
  id: string;
  name: string;
  bowlingStyle: string; // e.g. "Right-arm Fast", "Left-arm Orthodox Spin"
  hand: 'Right-arm' | 'Left-arm';
  createdAt: string;
}

export type BowlingLine = 'wide_off' | 'outside_off' | 'on_stumps' | 'down_leg' | 'wide_leg';

export function getBowlingLineName(x: number): string {
  if (x < 28) return 'Wide Outside Off';
  if (x < 42) return 'Outside Off';
  if (x >= 42 && x <= 58) return 'On the Stumps';
  if (x > 58 && x <= 72) return 'Down Leg Side';
  return 'Wide Down Leg';
}
