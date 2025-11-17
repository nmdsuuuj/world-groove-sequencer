// src/core/model/Song.ts

export interface TrackSegment {
  trackId: string;
  type: "pattern" | "livetake";
  refId: string;
  startBar: number;
  repeatCount: number;
}

export interface SongSection {
  id: string;
  lengthBars: number;
  trackSegments: TrackSegment[];
}

export interface SongStructure {
  sections: SongSection[];
}
