// src/core/model/LiveTake.ts

export interface LiveNote {
  time: number;
  pitch: number;
  gate: number;
  velocity: number;
}

export interface LiveTake {
  id: string;
  targetTrackType: string;
  loopLength: number; // in bars
  notes: LiveNote[];
  grvDepth: number;
  timeScale: number;
  shift: number;
  transpose: number;
  stepLoopPatternId?: string | null;
}
