// src/core/model/SwapEngineState.ts

export type SwapMode =
  | "none"
  | "neighbor"
  | "rotate"
  | "block"
  | "oddloop"
  | "chaos";

export interface SwapEngineState {
  mode: SwapMode;
  fader: number; // 0.0 - 1.0
  styleParams?: Record<string, unknown>;
}
