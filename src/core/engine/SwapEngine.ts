// src/core/engine/SwapEngine.ts

import type { Step } from "../model/Pattern";
import type { SwapEngineState, SwapMode } from "../model/SwapEngineState";

export class SwapEngine {
  applySwap(steps: Step[], state: SwapEngineState): Step[] {
    if (state.mode === "none" || state.fader <= 0) return steps;

    const activeIndices = steps
      .map((s, i) => ({ s, i }))
      .filter(x => x.s.hasNote && x.s.active)
      .map(x => x.i);

    if (activeIndices.length <= 1) return steps;

    const cloned = steps.slice();

    const reorder = (indices: number[], mode: SwapMode, fader: number): number[] => {
      // NOTE: ここはあくまで枠組み。具体的なアルゴリズムは後で実装。
      switch (mode) {
        case "neighbor":
          return indices; // TODO
        case "rotate":
          return indices; // TODO
        case "block":
          return indices; // TODO
        case "oddloop":
          return indices; // TODO
        case "chaos":
          return indices; // TODO
        default:
          return indices;
      }
    };

    const newOrder = reorder(activeIndices, state.mode, state.fader);

    // naive: just mapping active steps to new positions
    const activeSteps = activeIndices.map(i => steps[i]);
    newOrder.forEach((targetIdx, idx) => {
      cloned[targetIdx] = activeSteps[idx];
    });

    return cloned;
  }
}
