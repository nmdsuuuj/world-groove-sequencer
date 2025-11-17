# Cursor 2.0 用 実装プロンプト集

この文書は、上のロードマップに対応した **コピペ用プロンプト集** です。各ステップごとに Cursor に貼り付けて使う想定です。

---

## STEP 0: リポジトリの骨組みを作る

```text
You are an expert TypeScript and audio-tools engineer.
Create a new GitHub-ready repository layout for a project called
"world-groove-sequencer".

Requirements:
- Use a standard Node/TypeScript structure, but DO NOT add any heavy frameworks yet.
- Add the following folders:
  - docs/
  - src/
  - src/core/
  - src/core/model/
  - src/core/engine/
  - schemas/
  - examples/
- Create a minimal package.json with:
  - name: "world-groove-sequencer"
  - type: "module"
  - scripts:
    - "build": "tsc"
    - "test": "echo \"no tests yet\""
- Add a tsconfig.json appropriate for a small TypeScript library (target ES2020).
- Add a README.md that briefly explains:
  - This is a next-generation step sequencer with ornament, groove, swap, and Live Take.
  - Code will live under src/core.
Return all created files.
```

---

## STEP 1: コアモデル定義（Pattern / Track / LiveTake / Song / Project）

```text
You are now working inside the world-groove-sequencer repo.

Goal:
Define the core data model as TypeScript interfaces only. No logic yet.

Create the following files under src/core/model/:

1) Pattern.ts
- Define:
  - OrnamentEvent { t: number; pitch: number; vel: number; dur: number }
  - FollowMode = "overlap" | "cut" | "wait"
  - PlayMode = "oneShot" | "loop" | "loopRoll"
  - Ornament {
      mode: "plain" | "extended";
      internalDuration: number;
      followMode: FollowMode;
      playMode: PlayMode;
      loopCount: number | "infinite" | null;
      events: OrnamentEvent[];
    }
  - Step {
      hasNote: boolean;
      basePitch: number | null;
      velocity: number;
      gate: number;
      active: boolean;
      ornament: Ornament;
    }
  - Pattern {
      id: string;
      lengthBars: number;   // always 2
      stepsPerBar: number;  // always 16
      steps: Step[];        // length 32
    }

2) SwapEngineState.ts
- Define:
  - SwapMode = "none" | "neighbor" | "rotate" | "block" | "oddloop" | "chaos"
  - SwapEngineState {
      mode: SwapMode;
      fader: number; // 0.0 - 1.0
      styleParams?: Record<string, unknown>;
    }

3) Track.ts
- TrackType =
    "dr" | "bs" | "kd" | "sd" | "pc" | "ld" | "ch" | "fx" | string;
- Track {
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

4) LiveTake.ts
- LiveNote { time: number; pitch: number; gate: number; velocity: number; }
- LiveTake {
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

5) Song.ts
- TrackSegment {
    trackId: string;
    type: "pattern" | "livetake";
    refId: string;
    startBar: number;
    repeatCount: number;
  }
- SongSection {
    id: string;
    lengthBars: number;
    trackSegments: TrackSegment[];
  }
- SongStructure { sections: SongSection[]; }

6) Project.ts
- Project {
    version: string;
    patterns: Pattern[];
    liveTakes: LiveTake[];
    song: SongStructure;
  }

Make sure all imports between these files are correct.
Return the full content of each file.
```

---

## STEP 2: オーナメント展開ロジック（LiveNote 列の生成）

```text
You are still in the world-groove-sequencer repo.

Goal:
From a Pattern and Track, generate a flat array of LiveNote
for one pattern loop (2 bars), expanding Ornament events.

Tasks:
1) Under src/core/engine/, create SequencerEngine.ts with:
   - interface SequencerContext {
       pattern: Pattern;
       track: Track;
       bars: number; // usually 2
     }
   - class SequencerEngine {
       generateLiveNotes(ctx: SequencerContext): LiveNote[];
     }

2) Implement generateLiveNotes as follows (approximate):
   - Assume pattern.lengthBars === ctx.bars.
   - For each Step and its Ornament:
     - If step.hasNote && step.active && !track.mute:
       - For each OrnamentEvent in ornament.events:
         - Compute time within the pattern:
           baseStepTime = stepIndex / (stepsPerBar * lengthBars)
           // plus OrnamentEvent.t normalized inside the step
         - Apply track.timeScale by stretching the time.
         - Push a LiveNote with:
           time, pitch, gate (use event.dur * track.timeScale), velocity.

3) For now, ignore followMode / playMode and assume oneShot behavior only.

4) Add a minimal test-like example in comments showing how this would be used.

Return the full content of SequencerEngine.ts.
```

---

## STEP 3: グルーヴエンジンの実装

```text
Goal:
Implement a simple GrooveEngine that offsets LiveNote.time
based on a groove pattern and grvDepth.

Tasks:
1) Under src/core/engine/, create GrooveEngine.ts with:
   - GroovePatternStep { offset: number; } // -1.0 .. +1.0
   - GroovePattern { id: string; steps: GroovePatternStep[]; }
   - GrooveSettings { grvDepth: number; patternId: string; }
   - class GrooveEngine {
       constructor(public patterns: GroovePattern[]) {}
       applyGroove(notes: LiveNote[], settings: GrooveSettings): LiveNote[];
     }

2) Implement applyGroove:
   - Find the pattern by id.
   - For each LiveNote, compute an index:
       idx = floor(note.time * pattern.steps.length) % pattern.steps.length
   - Take pattern.steps[idx].offset and multiply by settings.grvDepth
   - Add this to note.time to create a shifted copy.
   - Return a new array; do not mutate the original.

3) Add a small example pattern and demonstrate usage in comments.

Return the full content of GrooveEngine.ts.
```

---

## STEP 4: スワップエンジンの実装（シンプル版から）

```text
Goal:
Implement SwapEngine.applySwap that reorders active steps
according to SwapEngineState.

Tasks:
1) Under src/core/engine/, create SwapEngine.ts with:
   - class SwapEngine {
       applySwap(steps: Step[], state: SwapEngineState): Step[];
     }

2) Behavior:
   - If state.mode === "none" or state.fader <= 0, return steps as-is.
   - Collect indices of active steps:
       const activeIndices = steps
         .map((s, i) => ({ s, i }))
         .filter(x => x.s.hasNote && x.s.active)
         .map(x => x.i);
   - If length <= 1, return steps.

3) For now, implement only:
   - "rotate": rotate activeIndices by N positions,
     where N is derived from state.fader (0..1 → 0..activeIndices.length).
   - For all other modes, just return the same order.

4) Rebuild a new Step[] based on the rotated indices,
   keeping non-active steps in place.

Return the full content of SwapEngine.ts.
```

---

## STEP 5: Live Take 録音ロジック

```text
Goal:
Implement a simple LiveTakeRecorder that collects LiveNote
emitted over time and stores them as a LiveTake.

Tasks:
1) Under src/core/engine/, create LiveTakeRecorder.ts with:
   - class LiveTakeRecorder {
       private recording: boolean;
       private startTime: number;
       private buffer: LiveNote[];
       private targetTrackType: string | null;

       start(trackType: string): void;
       recordNotes(notes: LiveNote[], currentTime: number): void;
       stop(loopLengthBars: number): LiveTake;
     }

2) Behavior:
   - start(trackType):
       - set recording = true
       - set targetTrackType
       - clear buffer
       - set startTime = currentTime (passed externally in future)
       (for now you can treat startTime as 0 inside this class)
   - recordNotes(notes):
       - if not recording, do nothing
       - append all notes into buffer
   - stop(loopLengthBars):
       - set recording = false
       - compute a new LiveTake:
           id: generate some temporary id like "LT_TEMP"
           targetTrackType: stored value
           loopLength: loopLengthBars
           notes: buffer
           grvDepth/timeScale/shift/transpose: default 0 or 1.0
       - return the LiveTake

3) We will wire this recorder into the sequencer later.

Return the full content of LiveTakeRecorder.ts.
```

---

## STEP 6: 最低限の Web UI（グリッド & 再生）

※ ここは実装者に任せる部分が多いので、プロンプトは方針だけ与えます。

```text
Goal:
Add a minimal Web UI (React or plain HTML/TS) that:
- displays a 16x2-bar grid for one Pattern
- lets me toggle hasNote on each Step
- has a Play button that:
  - generates LiveNote using SequencerEngine
  - logs them to the console for now

Tasks:
- Choose a simple UI stack (e.g. Vite + React + TS) but keep it small.
- Create a single-page app under src/ui/ or similar.
- Hardcode one Pattern in TS and render its steps.
- Wire the grid to Pattern.steps.hasNote.
- On Play, call SequencerEngine.generateLiveNotes and console.log the result.

Return all new files you create or modify.
```

---

## STEP 7: ライブパフォーマンス画面の骨組み

```text
Goal:
Create a Live Performance View component with three vertical regions:
- Top: buttons
- Middle: faders/knobs
- Bottom: a mini-sequencer grid

Tasks:
- Under src/ui/, create LivePerformanceView.tsx (if using React).
- Props can be simple for now:
  - patterns, tracks, currentPatternId, callbacks like onMute, onSwapModeChange, onSwapFaderChange, etc.
- Layout:
  - Top row: track mute/solo buttons, swap style buttons A-E, step loop buttons.
  - Middle row: one big horizontal Swap Fader, some small knobs (dummy for now).
  - Bottom row: small 16-step grid showing active/muted steps.

- The logic can be dummy (e.g. no real audio), but:
  - clicking swap style buttons should update UI state
  - moving the swap fader should update a numeric value
  - muting steps should be visually reflected

Return the full component code and any supporting files.
```

---

## STEP 8: ソングモード（Pattern / LiveTake モザイク）

```text
Goal:
Add basic SongStructure support using TrackSegment,
so that a Track timeline can contain both pattern and livetake segments.

Tasks:
1) Implement utility functions under src/core/engine/SongEngine.ts:
   - function flattenSong(
       song: SongStructure,
       project: Project
     ): { [trackId: string]: LiveNote[] }

   Behavior (approx):
   - For each SongSection in order:
     - For each TrackSegment:
       - If type === "pattern":
           - Use SequencerEngine to generate notes for that pattern
       - If type === "livetake":
           - Take the LiveTake.notes as-is
       - Offset note.time by the section's position on the timeline
       - Append notes to that track's LiveNote list

2) Ignore groove/swap for now; just flatten the structure.

Return the full content of SongEngine.ts.
```

---

## STEP 9: プリセット JSON の作成依頼

```text
Goal:
Create example JSON files for patterns and groove presets
to serve as initial "world groove" templates.

Tasks:
1) Under examples/, create:
   - patterns_demo.json
   - grooves_demo.json

2) patterns_demo.json:
   - Include at least one Pattern representing a simple 4-on-the-floor kick:
       - 2 bars, 16 steps per bar
       - Kick on every quarter note
       - Ornament mode "plain" with one event per active step

3) grooves_demo.json:
   - Include at least one GroovePattern "GRV_SWING_16" with 16 steps,
     where odd steps have offset 0 and even steps have a small positive offset.

Return the full content of these JSON files and, if needed, any small loader helpers.
```

---

必要に応じて、さらに細かいステップ用のプロンプトも追加できますが、ひとまずこの 0〜9 の流れで、かなりの部分まで実装を進められるはずです。

