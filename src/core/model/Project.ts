// src/core/model/Project.ts

import type { Pattern } from "./Pattern";
import type { LiveTake } from "./LiveTake";
import type { SongStructure } from "./Song";

export interface Project {
  version: string;
  patterns: Pattern[];
  liveTakes: LiveTake[];
  song: SongStructure;
}
