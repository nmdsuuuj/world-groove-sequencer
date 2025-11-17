# Advanced Cursor 2.0 Prompts (EN + JA)
# アドバンスド Cursor 2.0 プロンプト集（英語 + 日本語）

> 用途：world-groove-sequencer プロジェクトを実装するための詳細プロンプト集。  
> 使い方：**英語部分を Cursor にコピーして使用**し、日本語部分は自分用のメモとして読む。

---

## 1. Core Data Model – Deep Version (Pattern / Ornament / Track / LiveTake)

### EN Prompt

You are an expert TypeScript and audio-tools engineer.
We are building a next-generation step sequencer called **world-groove-sequencer**,
with ornament (per-step micro-sequences), groove, swap, and Live Take recording.

Goal of this step:
Refine and complete the core data model interfaces under `src/core/model/`,
making sure they are consistent, well-documented, and ready for long-term evolution.

Context and constraints:

- A **Pattern** is always 2 bars long, with 16 steps per bar (32 steps total).
- Each **Step** can contain an **Ornament** which is effectively a mini-sequencer inside the step.
- Ornaments can be in `plain` mode (single simple note) or `extended` mode (multiple micro-events).
- A **Track** has a `timeScale` (1.0, 0.5, 0.25 ...) so that the same 32 steps can span 2, 4, 8 bars in *real* time.
- A **LiveTake** is a flat array of final notes (LiveNote[]), with no automation or ornament structure inside.

Tasks:

1) Open and refine the following files (create them if missing) under `src/core/model/`:
   - Pattern.ts
   - SwapEngineState.ts
   - Track.ts
   - LiveTake.ts
   - Song.ts
   - Project.ts

2) For each file, make sure to:
   - Export clear TypeScript interfaces for each concept, including doc comments (JSDoc) that explain:
     - what this entity represents conceptually,
     - any invariants (e.g. lengthBars should be 2, stepsPerBar should be 16).
   - Use explicit types for enums like FollowMode, PlayMode, SwapMode, TrackType.
   - Make imports between files consistent and relative (e.g. `"./Pattern"` not `"../Pattern"`).

3) Specific details to include:

   **Pattern.ts**
   - OrnamentEvent, Ornament, Step, Pattern as we discussed:
     - OrnamentEvent has `t`, `pitch`, `vel`, `dur`.
     - Ornament has:
       - `mode: "plain" | "extended"`
       - `internalDuration: number` (in "step-local time units")
       - `followMode: "overlap" | "cut" | "wait"`
       - `playMode: "oneShot" | "loop" | "loopRoll"`
       - `loopCount: number | "infinite" | null`
       - `events: OrnamentEvent[]`
     - Step:
       - `hasNote: boolean`
       - `basePitch: number | null`
       - `velocity: number`
       - `gate: number`
       - `active: boolean`
       - `ornament: Ornament`
     - Pattern:
       - `id: string`
       - `lengthBars: number` (must be 2)
       - `stepsPerBar: number` (must be 16)
       - `steps: Step[]` (should be length 32)

   **SwapEngineState.ts**
   - SwapMode = "none" | "neighbor" | "rotate" | "block" | "oddloop" | "chaos"
   - SwapEngineState { mode, fader, styleParams? }

   **Track.ts**
   - TrackType =
       "dr" | "bs" | "kd" | "sd" | "pc" | "ld" | "ch" | "fx" | string;
   - Track fields:
       - id, type
       - timeScale (1.0, 0.5, 0.25 ...)
       - activePatternId
       - mute, solo
       - shift, activeLength
       - swapEngineState
       - ornamentDepth

   **LiveTake.ts**
   - LiveNote { time, pitch, gate, velocity }
   - LiveTake fields:
     - id
     - targetTrackType
     - loopLength
     - notes
     - grvDepth
     - timeScale
     - shift
     - transpose
     - stepLoopPatternId?

   **Song.ts**
   - TrackSegment { trackId, type: "pattern" | "livetake", refId, startBar, repeatCount }
   - SongSection { id, lengthBars, trackSegments }
   - SongStructure { sections }

   **Project.ts**
   - Project { version, patterns, liveTakes, song }

4) After updating these interfaces, ensure that:
   - `tsc` (TypeScript compiler) runs without errors.
   - All imports resolve correctly.

Return the full contents of all modified files.

### JA 解説＆プロンプト

あなたは TypeScript とオーディオツールに精通したエンジニアです。
いま作っているのは **world-groove-sequencer** という、
オーナメント（ステップ内部ミニシーケンサー）、グルーヴ、スワップ、Live Take を備えた次世代シーケンサーです。

このステップの目標：  
`src/core/model/` 以下の **コアデータモデル** を完成させ、
将来にわたって使える形に整えます。  
音はまだ鳴らさず、「頭の中の構造」を TypeScript インターフェースで固める段階です。

制約・背景：

- Pattern は常に 2 小節、1 小節は 16 ステップ（合計 32 ステップ）。
- 各 Step は Ornament を 1 つ持ち、これはステップ内部のミニシーケンサーのように振る舞う。
- Ornament は `plain`（1音だけ）か `extended`（複数イベント）を取りうる。
- Track には `timeScale` があり、1.0 / 0.5 / 0.25 … のように実時間での長さだけを変えられる。
- LiveTake は装飾やオートメーションを持たない、**最終ノート列だけ** のシンプルな構造。

やってほしいこと：

1. `src/core/model/` の以下のファイルを開き、足りないものは作成して、整理してください：
   - Pattern.ts
   - SwapEngineState.ts
   - Track.ts
   - LiveTake.ts
   - Song.ts
   - Project.ts

2. 各ファイルで：
   - TypeScript の interface を分かりやすく定義し、JSDoc コメントで
     - 何を表しているか
     - 不変条件（例：lengthBars は 2、stepsPerBar は 16）
     を説明する。
   - FollowMode / PlayMode / SwapMode / TrackType などは明示的な型を使う。
   - import は `"./Pattern"` のように相対パスで統一する。

3. 詳細な仕様は上の英語セクションの通りです。

4. すべて更新したら：
   - `tsc` がエラーなく通ること
   - import のパスが正しく解決していること
   を確認してください。

出力として、変更した TypeScript ファイルの内容をすべて返してください。

---

## 2. Ornament Expansion → LiveNote Generation

### EN Prompt

You are now implementing the **sequencing core** for world-groove-sequencer.

Goal:
From a Pattern and a Track, expand all Steps and their Ornaments into
a flat array of final notes (LiveNote[]) for one pattern loop (2 bars),
taking into account `timeScale` but ignoring groove and swap for now.

Tasks:

1) Under `src/core/engine/`, create `SequencerEngine.ts` with:

```ts
import type { Pattern, Step, Ornament, OrnamentEvent } from "../model/Pattern";
import type { Track } from "../model/Track";
import type { LiveNote } from "../model/LiveTake";

export interface SequencerContext {
  pattern: Pattern;
  track: Track;
  bars: number; // usually 2
}

export class SequencerEngine {
  generateLiveNotes(ctx: SequencerContext): LiveNote[] {
    // TODO: implement
  }
}
```

2) Implement `generateLiveNotes` as follows (pseudo-logic):

- Assume `ctx.pattern.lengthBars === ctx.bars === 2` and `stepsPerBar === 16`.
- For each Step (index `stepIndex`) in `pattern.steps`:
  - If `step.hasNote`, `step.active` and `!track.mute`:
    - Let `orn = step.ornament`.
    - For each `evt` in `orn.events`:
      - Compute base step time (0.0–1.0 normalized over the whole pattern):
        - `const totalSteps = pattern.lengthBars * pattern.stepsPerBar; // 32`
        - `const stepPos = stepIndex / totalSteps;`
      - Compute local offset in step (evt.t is in "step-local" units, assume 0–1 for now):
        - `const localOffset = evt.t / totalSteps;`
      - Base time before timeScale:
        - `let t = stepPos + localOffset;`
      - Apply track.timeScale as a stretch of the total pattern duration:
        - For now, we can treat `timeScale` as a multiplier for gate/duration
          and keep `t` in 0.0–1.0 for one logical loop.
      - Create a LiveNote:
        - `time: t`
        - `pitch: evt.pitch` (or step.basePitch if you want to mix)
        - `gate: evt.dur * track.timeScale`
        - `velocity: evt.vel` (or combine with step.velocity)

3) Ignore `followMode` and `playMode` for now (assume oneShot behavior).

4) Add small inline comments and docstrings explaining any assumptions.

5) At the bottom of the file (in comments), add a miniature usage example:
   - Construct a dummy Pattern with a kick on every quarter note.
   - Construct a dummy Track with timeScale 1.0.
   - Show (in comments) how `generateLiveNotes` would be called and what approximate
     LiveNote results look like.

Return the complete SequencerEngine.ts file.

### JA 解説＆プロンプト

今度は **シーケンサーの中枢ロジック** を実装します。

目標：  
Pattern と Track から、すべての Step と Ornament を展開して、  
1 回のパターンループ（2 小節）に対する **最終ノート列（LiveNote[]）** を生成します。  
この段階では、`timeScale` だけ考慮し、グルーヴ（Groove）やスワップ（Swap）は無視します。

やること：

1. `src/core/engine/SequencerEngine.ts` を作成し、上の英語ブロックのような
   `SequencerContext` と `SequencerEngine` クラスの枠を用意してください。

2. `generateLiveNotes` の中で：
   - Pattern が 2 小節、16 step / bar（計 32 step）である前提で処理。
   - 各 Step について、`hasNote` かつ `active` かつ `!track.mute` のときのみ処理。
   - Step のインデックスから、パターン全体における 0.0〜1.0 の位置を計算。
   - OrnamentEvent ごとに、ステップ内部の相対時間 `evt.t` を足して最終 time を算出。
   - `track.timeScale` はゲート長（dur）に掛ける形でまずは簡易的に扱う。
   - LiveNote { time, pitch, gate, velocity } を配列に push。

3. followMode / playMode はまだ無視して構いません（常に oneShot とみなす）。

4. コード内にコメントで、
   - どの単位で time を扱っているか
   - timeScale をどう解釈しているか
   を簡潔に記述してください。

5. ファイルの末尾にコメントとして、
   - キック 4 つ打ちの Pattern と Track を組み立てて
   - `generateLiveNotes` を呼ぶミニ例
   を書いてください（実行はしなくて良い）。

完成した `SequencerEngine.ts` を返してください。

---

## 3. Groove Engine – Extreme GrvDepth (±800%)

### EN Prompt

We now implement the **GrooveEngine** for world-groove-sequencer.

Goal:
Given a list of LiveNote and a GroovePattern, apply timing offsets
according to `grvDepth`, supporting extreme values (up to ±800%).

Constraints and design:

- We treat each LiveNote.time as a normalized position in [0, 1) over one logical pattern loop.
- A GroovePattern is defined as an array of steps, each with a small offset in [-1.0, +1.0].
- `grvDepth` is a scalar multiplier; for now we can allow values like -8.0 .. +8.0,
  which correspond to -800% .. +800% conceptually.
- Implementation should be light enough to run in real time on Android / Windows tablets.

Tasks:

1) Open or create `src/core/engine/GrooveEngine.ts` with:

- GroovePatternStep { offset: number; }  // -1.0 .. +1.0
- GroovePattern { id: string; steps: GroovePatternStep[]; }
- GrooveSettings { grvDepth: number; patternId: string; }

- class GrooveEngine {
    constructor(public patterns: GroovePattern[]) {}
    applyGroove(notes: LiveNote[], settings: GrooveSettings): LiveNote[];
  }

2) Implement applyGroove as follows:

- Find the GroovePattern by settings.patternId.
- For each LiveNote:
  - Compute index into the groove steps:
    - `const idx = Math.floor(note.time * pattern.steps.length) % pattern.steps.length;`
  - Get `offset = pattern.steps[idx].offset`.
  - Compute `delta = offset * settings.grvDepth`.
  - New time = `note.time + delta`.
  - Optionally clamp new time to some safe range (e.g. -0.5 .. 1.5) but do not overcomplicate.
- Return a new array of LiveNote with shifted times (do not mutate the input).

3) Add comments explaining that:

- With larger grvDepth, the pattern can become very "broken" or "drunk", which is intentional.
- The actual audio engine may later clamp or wrap times as needed.

Return the full GrooveEngine.ts file.

### JA 解説＆プロンプト

次は **GrooveEngine（グルーヴエンジン）** を実装します。

目標：  
LiveNote の配列に対して、GroovePattern と GrvDepth をもとに時間オフセットを掛け、  
最大 ±800% 相当の極端なグルーヴ変形も可能にします。

設計上のポイント：

- LiveNote.time は 0〜1 の範囲で、「パターン 1 ループ内の正規化位置」として扱います。
- GroovePattern は `steps: [{ offset: number }, ...]` で定義され、
  offset は -1.0〜+1.0 の小さな値とします。
- `grvDepth` はスカラー倍率で、-8.0〜+8.0（-800%〜+800%）ぐらいまで許容します。
- 実装は軽量にし、Android / Windows タブレットでも問題なく動作すること。

やること：

1. `src/core/engine/GrooveEngine.ts` に、上の英語セクションのような
   - GroovePatternStep
   - GroovePattern
   - GrooveSettings
   - GrooveEngine クラス
   を定義します。

2. `applyGroove` の中では：
   - pattern.steps.length を使ってインデックスを計算。
   - `idx = floor(note.time * steps.length) % steps.length`。
   - `offset = steps[idx].offset`、`delta = offset * grvDepth` を計算。
   - `note.time + delta` を新しい time とし、新しい LiveNote にコピーする。
   - 元の配列は変更せず、新しい配列を返す。

3. コメントで、
   - grvDepth が大きいほど「酔っ払ったような」「壊れたような」グルーヴになること
   - 実際のオーディオエンジン側で必要なら clamp / wrap する可能性があること
   を補足してください。

完成した `GrooveEngine.ts` を返してください。

---

## 4. Swap Engine – Multiple Styles + Fader

### EN Prompt

We now enhance the **SwapEngine** to support multiple swap styles
controlled by a single fader, as discussed in the design.

Goal:
From a list of Steps and a SwapEngineState, reorder only the active Steps
according to the selected SwapMode ("neighbor", "rotate", "block", "oddloop", "chaos"),
with the fader (0.0–1.0) controlling the intensity/degree of reordering.

Tasks:

1) Open `src/core/engine/SwapEngine.ts`.
   If it does not exist, create it with:

```ts
import type { Step } from "../model/Pattern";
import type { SwapEngineState, SwapMode } from "../model/SwapEngineState";

export class SwapEngine {
  applySwap(steps: Step[], state: SwapEngineState): Step[] {
    // TODO
  }
}
```

2) Implement applySwap with the following behavior:

- If state.mode === "none" or state.fader <= 0, return steps as-is.
- Extract indices of active steps:
  - active = steps where step.hasNote && step.active
- If active.length <= 1, return steps as-is.
- For now, implement the following modes:

  - "rotate":
    - Compute `n = Math.round(state.fader * active.length)`.
    - Rotate active indices by n positions to the right (circular).
  - "neighbor":
    - Use state.fader to control how many adjacent swaps to perform.
    - For example, iterate from left to right and with some probability (derived from fader),
      swap the current active index with the next one.
  - "block":
    - Treat groups of 4 steps as blocks.
    - Reorder these blocks based on fader (e.g. small fader = almost original,
      large fader = reversed or shuffled order).
  - "oddloop":
    - Use an odd-length loop window (e.g. 3 or 5) sliding across active steps.
    - Fader can control the window size or how many times to apply the loop.
  - "chaos":
    - Use a pseudo-random shuffle seeded by fader (or simply random for now).

- Rebuild a new Step[]:
  - Non-active steps stay at the same indices.
  - Active steps are placed according to the new order.

3) Add clear comments that this is a **view-time transformation** and does not modify
   the underlying Pattern data permanently.

Return the full SwapEngine.ts file.

### JA 解説＆プロンプト

ここでは **SwapEngine（スワップエンジン）** を拡張し、
1 本のフェーダーと複数のスワップスタイルを備えた形にします。

目標：  
Step[] と SwapEngineState から、`hasNote && active` なステップだけを並べ替え、  
選択された SwapMode（neighbor / rotate / block / oddloop / chaos）と  
fader（0.0〜1.0）の値に応じて「崩れ方」を制御します。

やること：

1. `src/core/engine/SwapEngine.ts` を開き、まだなければ英語ブロックのような骨組みを作成。

2. `applySwap` では：
   - mode が "none" か、fader が 0 以下ならそのまま返す。
   - `hasNote && active` なステップのインデックスのみを抽出。
   - その数が 1 以下ならそのまま返す。
   - mode ごとに、active なインデックス順を組み替えるロジックを実装：
     - rotate: fader に応じて何ステップ分回転させるか決める。
     - neighbor: 左から右へ走査し、fader に応じた確率で隣と入れ替える。
     - block: 4 ステップ単位などのブロックを入れ替える。
     - oddloop: 3 or 5 ステップ単位のループ窓を適用。
     - chaos: 擬似ランダムに並べ替える（初期段階では単純 shuffle でも可）。
   - 結果として、新しい Step[] を作り、非アクティブなステップは元の位置、
     アクティブステップだけ新しい順序に入れ替える。

3. コメントで、
   - これは「ビュー変換」であり、Pattern の生データは書き換えないこと
   - ライブ再生時に都度適用される変形であること
   を明記してください。

完成した `SwapEngine.ts` を返してください。

---

## 5. Live Take Recorder – Result-Only Recording

### EN Prompt

We now implement a **LiveTakeRecorder** that records only the final notes
produced by the sequencer (result-only, no automation).

Goal:
Provide a small utility class that allows:

- start(trackType)
- recordNotes(liveNotes)
- stop(loopLengthBars) → LiveTake

Tasks:

1) Under `src/core/engine/`, create `LiveTakeRecorder.ts` with:

```ts
import type { LiveNote, LiveTake } from "../model/LiveTake";

export class LiveTakeRecorder {
  private recording = false;
  private buffer: LiveNote[] = [];
  private targetTrackType: string | null = null;

  start(trackType: string): void {
    // TODO
  }

  recordNotes(notes: LiveNote[]): void {
    // TODO
  }

  stop(loopLengthBars: number): LiveTake {
    // TODO
  }
}
```

2) Implement behavior:

- start(trackType):
  - set recording = true
  - set targetTrackType = trackType
  - clear buffer
- recordNotes(notes):
  - if not recording, do nothing
  - otherwise, push copies of all notes into buffer
- stop(loopLengthBars):
  - set recording = false
  - create a LiveTake:
    - id: for now use a placeholder like `"LT_" + Date.now()`
    - targetTrackType: stored trackType
    - loopLength: loopLengthBars
    - notes: copy of buffer
    - grvDepth: 0
    - timeScale: 1.0
    - shift: 0
    - transpose: 0
    - stepLoopPatternId: null
  - clear buffer
  - return the LiveTake

3) Add comments explaining that:

- This recorder does not know anything about "real time".
  It just collects the **resulting notes** for one logical loop.
- Timing (time field) is assumed to be in pattern-normalized units [0, 1).

Return the full LiveTakeRecorder.ts file.

### JA 解説＆プロンプト

ここでは、**結果ノートだけを録音する LiveTakeRecorder** を実装します。  
オートメーションや UI 状態は一切録らず、SequencerEngine が吐き出した LiveNote だけを集めます。

目標：

- start(trackType) で録音開始
- recordNotes(liveNotes) で LiveNote をバッファに追加
- stop(loopLengthBars) で LiveTake を生成して返す

やること：

1. `src/core/engine/LiveTakeRecorder.ts` に英語ブロックのようなクラス骨組みを作る。

2. メソッドの挙動：
   - start(trackType):
     - recording = true
     - targetTrackType に保存
     - buffer をクリア
   - recordNotes(notes):
     - recording でないときは何もしない
     - recording 中なら、notes を buffer に全てコピー
   - stop(loopLengthBars):
     - recording = false
     - buffer から LiveTake を組み立てる
     - id は一旦 `"LT_" + Date.now()` のようなプレースホルダで OK
     - grvDepth / timeScale / shift / transpose はデフォルト値にする
     - buffer をクリアして返す

3. コメントで、
   - このクラスは「結果ノート」を 1 ループ分集めるだけで、リアルタイムの概念は持たないこと
   - time は 0〜1 の範囲で、パターン内の位置として扱うこと
   を説明してください。

完成した `LiveTakeRecorder.ts` を返してください。

---

## 6. Song Engine – Pattern + LiveTake Mosaic

### EN Prompt

We now add a **SongEngine** to flatten SongStructure into per-track LiveNote arrays,
combining Pattern segments and LiveTake segments in a mosaic.

Goal:
Given a Project (with patterns, liveTakes, and a song structure),
produce a dictionary `{ [trackId]: LiveNote[] }` representing the full song timeline
for each track.

Tasks:

1) Under `src/core/engine/`, create `SongEngine.ts` with:

```ts
import type { Project } from "../model/Project";
import type { SongStructure, SongSection, TrackSegment } from "../model/Song";
import type { LiveNote } from "../model/LiveTake";
import { SequencerEngine } from "./SequencerEngine";

export class SongEngine {
  constructor(private sequencer: SequencerEngine, private project: Project) {}

  flattenSong(): Record<string, LiveNote[]> {
    // TODO
  }
}
```

2) Implement `flattenSong` as follows (simplified logic):

- Initialize an empty dictionary: `const result: Record<string, LiveNote[]> = {};`
- For each track in project.tracks (you may need to add tracks to Project.ts):
  - Initialize `result[track.id] = []`.
- For each section in project.song.sections, in order:
  - Keep track of the absolute bar position of the section start (e.g. sectionStartBar).
  - For each TrackSegment in section.trackSegments:
    - Let `startBar = sectionStartBar + segment.startBar`.
    - If segment.type === "pattern":
      - Find the Pattern by refId.
      - Use SequencerEngine to generate LiveNote[] for that pattern+track.
      - Offset each note.time by `startBar` (or normalized equivalent).
      - Repeat according to segment.repeatCount.
    - If segment.type === "livetake":
      - Find the LiveTake by refId.
      - Clone its notes and offset note.time by `startBar` (and section position).
      - Repeat according to segment.repeatCount.
    - Append resulting notes to result[segment.trackId].

3) For now, ignore groove/swap in this flattening step; they can be applied later.

4) Add doc comments explaining that this is a **high-level composition layer**
   that treats patterns and LiveTakes as building blocks on a timeline.

Return the full SongEngine.ts file.

### JA 解説＆プロンプト

ここでは、SongStructure を「Pattern ＋ LiveTake のモザイク」に展開する  
**SongEngine** を実装します。

目標：  
Project（patterns / liveTakes / song を含む）から、  
`{ [trackId]: LiveNote[] }` という形の「曲全体のタイムライン」を得る。

やること：

1. `src/core/engine/SongEngine.ts` に英語ブロックのようなクラスを作成。

2. `flattenSong` の処理：
   - `result: Record<string, LiveNote[]> = {}` を用意。
   - 全 Track を走査して、`result[track.id] = []` を初期化。
   - song.sections を順に処理し、section ごとの開始小節位置を覚えておく。
   - section.trackSegments を走査：
     - type === "pattern" の場合：
       - refId から Pattern を見つけ、SequencerEngine で LiveNote[] を生成。
       - section + segment の startBar を time に加算してオフセット。
       - repeatCount 回繰り返す。
     - type === "livetake" の場合：
       - refId から LiveTake を見つけ、notes をコピーして startBar 分オフセット。
       - repeatCount 回繰り返す。
     - 出来上がった LiveNote[] を `result[segment.trackId]` に append。

3. この段階では groove / swap を無視して構いません。
   （あとで別レイヤーで適用）

4. コメントで、
   - SongEngine は「高レベルの作曲レイヤー」であり、
     Pattern / LiveTake をタイムライン上に貼り付ける役割であること
   を説明してください。

完成した `SongEngine.ts` を返してください。

---

## 7. Presets & Weird Templates (JSON)

### EN Prompt

We now create **preset JSON files** for patterns and groove templates,
so that the sequencer feels fun immediately even with no user data.

Goal:
Under `examples/`, define several JSON files containing:

- Simple 4-on-the-floor drums.
- A few "weird" hi-hat division patterns (3, 5, 7 divisions).
- Basic groove patterns (16th swing, amapiano-like, etc.).

Tasks:

1) Under `examples/`, create:

- `patterns_kick_hihat_weird.json`
- `grooves_world_mix.json`

2) `patterns_kick_hihat_weird.json` should contain an object with a `patterns` array.
   Each Pattern object should conform to the Pattern schema:
   - One pattern: 2 bars, kick on every quarter note (4-on-the-floor).
   - One pattern: hi-hat with 3 divisions inside each beat (triplet feel).
   - One pattern: hi-hat with 5 divisions, emphasizing odd groupings.
   - One pattern: hi-hat with 7 divisions per beat (very "broken").

3) `grooves_world_mix.json` should contain a `grooves` array.
   Each groove has:
   - id, name, steps[] with small offsets.
   Include at least:
   - GRV_SWING_16: classic 16th swing.
   - GRV_AMAPIANO_16: Amapiano-like late snare/hat offsets.
   - GRV_AFRO_ODD_12: odd, slightly uneven 12-step feel.

4) Make sure JSON is valid, nicely indented, and easy to extend.

Return the full content of both JSON files.

### JA 解説＆プロンプト

ここでは、**プリセット JSON** を作ります。  
ユーザーが何も打ち込まなくても、すぐ変態的なパターンで遊べるようにします。

目標：

- 4 つ打ちキック
- 3 / 5 / 7 分割ハイハットパターン
- スウィング / Amapiano / Afro 的なグルーヴパターン

を `examples/` 以下に JSON として用意。

やること：

1. `examples/` フォルダに以下を作成：
   - `patterns_kick_hihat_weird.json`
   - `grooves_world_mix.json`

2. `patterns_kick_hihat_weird.json`：
   - `{"patterns": [ ... ]}` の形にし、Pattern スキーマに沿って作る。
   - Pattern 例：
     - 2 小節、16 step / bar。
     - 4 つ打ちキック。
     - 3 分割ハイハット（拍ごとに 3 イベント）。
     - 5 分割ハイハット（少し変則的）。
     - 7 分割ハイハット（かなり変態寄り）。

3. `grooves_world_mix.json`：
   - `{"grooves": [ ... ]}` にし、GroovePattern スキーマに沿ってオフセットを定義。
   - 少なくとも：
     - GRV_SWING_16
     - GRV_AMAPIANO_16
     - GRV_AFRO_ODD_12
   を含める。

4. JSON はインデント付きで読みやすくしてください。

完成した 2 つの JSON ファイルの中身を返してください。

---

## 8. Future Extensions Appendix – For Later Implementation

### EN Prompt

Create a Markdown file `docs/extensions_appendix_en_ja.md` that lists
possible future extensions we discussed, each with:

- name
- short description
- rough difficulty estimate (Low / Medium / High)
- notes on why it might be musically interesting

Include (at least):

1) Code/Scale Track
2) LiveTake → Promote to Pattern (reverse-engineering)
3) Ornament Preset Library (world-music ornaments)
4) Advanced odd-metric templates (mixed 5, 7, 9 sub-beats)
5) UI "face deformation" tools for ornament editing
6) Cross-track interactions (e.g. bass reacting to kick pattern)
7) Audio-rate modulation ideas (for Windows desktop only, maybe)

Write the file in English with a Japanese translation under each item.

Return the full content of `docs/extensions_appendix_en_ja.md`.

### JA 解説＆プロンプト

将来的に実装したい「拡張機能」をまとめた付録を、Markdown で作ります。

やること：

- `docs/extensions_appendix_en_ja.md` というファイルを作り、
  各機能について：
  - 名前
  - 短い説明
  - 難易度の目安（Low / Medium / High）
  - なぜ音楽的に面白いか
  を書く。

含めるべき項目（少なくとも）：

1. コード / スケールトラック
2. LiveTake → Pattern 昇格（逆変換）
3. 世界の装飾音ライブラリ（Ornament Preset Library）
4. 5/7/9 拍子的な変則細分テンプレート
5. 顔変形系オーナメント編集 UI
6. クロストラック相互作用（キックに反応してベースが変形 etc.）
7. Windows 版限定のオーディオレート変調アイディア

全て **英語で書き、そのすぐ下に日本語訳** を付けてください。

完成した `docs/extensions_appendix_en_ja.md` の内容を返してください。

