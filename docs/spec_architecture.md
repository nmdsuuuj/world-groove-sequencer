# World Groove Ornament Sequencer アーキテクチャ案

実装者向けに、クラス構造・データ構造のドラフトをまとめます。
（具体的な言語は仮に TypeScript / Kotlin / C++ などを想定してもよい設計）

## 1. コアモデル

### 1.1 Project

- `Project`
  - `patterns: Pattern[]`
  - `tracks: Track[]`
  - `liveTakes: LiveTake[]`
  - `song: SongStructure`
  - `settings: ProjectSettings`

### 1.2 Track

- `Track`
  - `id: string`
  - `type: "dr" | "bs" | "kd" | "sd" | "pc" | "ld" | "ch" | "fx" | ...`
  - `timeScale: number` (1.0, 0.5, 0.25 ...)
  - `patternRefs: PatternRef[]`（ソングモード用）
  - `activePatternId: string`
  - `mute: boolean`
  - `solo: boolean`
  - `shift: int`（step単位）
  - `activeLength: int`（8〜32 etc）
  - `swapEngineState: SwapEngineState`
  - `ornamentDepth: number`（ライブ用ノブ）

### 1.3 Pattern（オーナメントシーケンサー）

- `Pattern`
  - `id: string`（例：`PAT_A01`）
  - `lengthBars: number`（固定 2）
  - `stepsPerBar: number`（固定 16）
  - `steps: Step[]`（32 要素）

- `Step`
  - `hasNote: boolean`
  - `basePitch: int | null`（簡易表示用）
  - `velocity: float`
  - `gate: float`（0〜2.0）
  - `ornament: Ornament`
  - `active: boolean`（アクティブステップ）

- `Ornament`
  - `mode: "plain" | "extended"`
  - `internalDuration: float`（step単位 or beat単位）
  - `events: OrnamentEvent[]`
  - `followMode: "overlap" | "cut" | "wait"`
  - `playMode: "oneShot" | "loop" | "loopRoll"`
  - `loopCount: int | "infinite"`

- `OrnamentEvent`
  - `t: float`（0〜internalDuration）
  - `pitch: int`（絶対 or 相対）
  - `vel: float`
  - `dur: float`

### 1.4 LiveTake

- `LiveTake`
  - `id: string`（例：`LT_001`）
  - `targetTrackType: string`（`"bs"` など、由来レーン）
  - `loopLength: float`（bars）
  - `notes: LiveNote[]`
  - `grvDepth: float`
  - `timeScale: float`
  - `shift: int`
  - `transpose: int`（半音）
  - `stepLoopPatternId: string | null`

- `LiveNote`
  - `time: float`（pattern開始からの時間）
  - `pitch: int`
  - `gate: float`
  - `velocity: float`

---

## 2. ソング構造

- `SongStructure`
  - `sections: SongSection[]`

- `SongSection`
  - `id: string`
  - `lengthBars: int`
  - `trackPatternRefs: { [trackId: string]: PatternSequence }`

- `PatternSequence`
  - `events: PatternTrigger[]`

- `PatternTrigger`
  - `patternId: string`
  - `startBar: int`
  - `repeatCount: int`

> リアルタイムで「パターンをどのように切り替えたか」を録音する場合は、
> `PatternTrigger` 列をライブキャプチャとして構築する。

---

## 3. スワップエンジン

- `SwapEngineState`
  - `mode: "none" | "neighbor" | "rotate" | "block" | "oddloop" | "chaos"`
  - `fader: float`（0〜1）
  - `styleParams: any`（各モード固有の補助パラメータ）

スワップの適用は、レンダリング時に：

1. アクティブステップを抽出
2. `mode` & `fader` に応じて順番を再配置
3. 再配置された順番でノート出力

といった「ビュー変換」として扱う。

---

## 4. グルーヴエンジン

- `GrooveSettings`
  - `grvDepth: float`（-8.0〜+8.0 など、±800% を正規化）
  - `patternId: string`（groove pattern テーブル参照）
  - `laneOverrides: { [trackId: string]: LaneGrooveSettings }`

- `LaneGrooveSettings`
  - `enabled: boolean`
  - `depthScale: float`

実装としては、ステップの理論タイミングに対して、
groove テーブルのオフセットを適用。

---

## 5. ファイル構造（GitHub リポジトリ案）

- `/README.md`
- `/docs/spec_core.md`
- `/docs/spec_architecture.md`
- `/docs/spec_platform_notes.md`
- `/schemas/`
  - `project.schema.json`
  - `pattern.schema.json`
  - `livetake.schema.json`
- `/src/`
  - `core/`（将来：エンジン実装）
  - `ui/`（将来：UI 実装）
  - `platform/`（Android / Windows 差異対応用）

> 現段階では `schemas/` と `docs/` だけを埋めて、
> コードは別フェーズで追加する想定でもよい。
