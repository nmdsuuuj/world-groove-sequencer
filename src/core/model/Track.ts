// src/core/model/Track.ts

import type { Pattern } from "./Pattern";
import type { SwapEngineState } from "./SwapEngineState";

export type TrackType =
  | "dr"
  | "bs"
  | "kd"
  | "sd"
  | "pc"
  | "ld"
  | "ch"
  | "fx"
  | string;

export interface Track {
  id: string;
  type: TrackType;
  timeScale: number; // 1.0, 0.5, 0.25 ...
  activePatternId: string;
  mute: boolean;
  solo: boolean;
  shift: number;
  activeLength: number;
  swapEngineState: SwapEngineState;
  ornamentDepth: number;
}
