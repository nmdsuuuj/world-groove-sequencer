// src/core/engine/SequencerClock.ts

export interface ClockListener {
  onTick(step: number, bar: number): void;
}

export class SequencerClock {
  private listeners: ClockListener[] = [];

  addListener(l: ClockListener) {
    this.listeners.push(l);
  }

  removeListener(l: ClockListener) {
    this.listeners = this.listeners.filter(x => x !== l);
  }

  // NOTE: 実際の実装ではオーディオスレッドとの同期が必要。
  // ここでは枠組みだけ定義。
  tick(step: number, bar: number) {
    for (const l of this.listeners) {
      l.onTick(step, bar);
    }
  }
}
