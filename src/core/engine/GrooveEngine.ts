// src/core/engine/GrooveEngine.ts

import type { LiveNote } from "../model/LiveTake";

export interface GrooveSettings {
  grvDepth: number; // e.g. -8.0 .. +8.0 (normalized ±800%)
  patternId: string;
}

export interface GroovePatternStep {
  offset: number; // -1.0 .. +1.0 relative offset
}

export interface GroovePattern {
  id: string;
  steps: GroovePatternStep[];
}

export class GrooveEngine {
  constructor(public patterns: GroovePattern[]) {}

  applyGroove(
    notes: LiveNote[],
    settings: GrooveSettings
  ): LiveNote[] {
    const pattern = this.patterns.find(p => p.id === settings.patternId);
    if (!pattern) return notes;

    const depth = settings.grvDepth;
    return notes.map(n => {
      const idx = Math.floor(n.time * pattern.steps.length) % pattern.steps.length;
      const step = pattern.steps[idx];
      const shifted: LiveNote = {
        ...n,
        time: n.time + (step.offset * depth)
      };
      return shifted;
    });
  }
}
