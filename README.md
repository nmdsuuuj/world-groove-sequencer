# World Groove Ornament Sequencer

次世代のステップシーケンサー + オーナメントシステム + Live Take + ソングモードを統合した、世界中のグルーヴと装飾を扱う実験的リズム／フレーズエンジンの仕様＆骨組み実装です。

このリポジトリは **仕様書 + データスキーマ + コアモデルの TypeScript インターフェース** を含む、実装者向けの「スターター・パッケージ」です。

## ディレクトリ構成

- `docs/`
  - `spec_core.md` … コンセプト／要件定義／全体仕様
  - `spec_architecture.md` … クラス構造・データ構造の最適化案
  - `spec_ui.md` … 編集画面・ライブ画面の UI / UX フロー
  - `spec_songmode.md` … ソングモード & Live Take / オーナメントの関係
  - `spec_platform_notes.md` … Android / Windows タブレット差異メモ（ドラフト）
- `schemas/`
  - JSON Schema 群（project / pattern / ornament / livetake / groove / song など）
- `src/core/model/`
  - コアデータモデルの TypeScript インターフェース
- `src/core/engine/`
  - Groove / Swap / Clock などのエンジン骨組み（ロジックの枠組みのみ）
- `examples/`
  - 簡単なパターン／グルーヴプリセットの JSON 例

## 想定する使い方

- このまま GitHub に置いて、実装フェーズで
  - 言語を選ぶ（TypeScript / Kotlin / C++ など）
  - `src/core` を実装していく
  - `schemas/` を元に保存フォーマットを固める
- あるいは、この仕様書だけを他の AI や開発者に渡して、  別実装（JUCE / Android / WebAudio など）を行う。

