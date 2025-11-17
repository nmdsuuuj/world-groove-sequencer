// src/core/model/Pattern.ts

export interface OrnamentEvent {
  t: number;
  pitch: number;
  vel: number;
  dur: number;
}

export type FollowMode = "overlap" | "cut" | "wait";
export type PlayMode = "oneShot" | "loop" | "loopRoll";

export interface Ornament {
  mode: "plain" | "extended";
  internalDuration: number;
  followMode: FollowMode;
  playMode: PlayMode;
  loopCount: number | "infinite" | null;
  events: OrnamentEvent[];
}

export interface Step {
  hasNote: boolean;
  basePitch: number | null;
  velocity: number;
  gate: number;
  active: boolean;
  ornament: Ornament;
}

export interface Pattern {
  id: string;
  lengthBars: number; // always 2
  stepsPerBar: number; // always 16
  steps: Step[]; // length 32
}
