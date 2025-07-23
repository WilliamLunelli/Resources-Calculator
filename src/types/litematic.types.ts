export interface LitematicData {
  metadata: LitematicMetadata;
  regions: Record<string, LitematicRegion>;
}

export interface LitematicMetadata {
  name: string;
  author: string;
  total_blocks: number;
  total_volume: number;
  region_count: number;
  description: string;
  enclosing_size: {
    x: number;
    y: number;
    z: number;
  };
}

export interface LitematicRegion {
  size: {
    x: number;
    y: number;
    z: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  block_counts: Record<string, LitematicBlock>;
  total_blocks: number;
}

export interface LitematicBlock {
  name: string;
  properties: Record<string, string>;
  count: number;
  stacks: number;
  remainder: number;
  note?: string;
}

export interface ParsedLitematic {
  originalData: LitematicData;
  simplifiedBlocks: Record<string, number>; // { blockName: totalCount }
  summary: {
    totalBlocks: number;
    uniqueBlocks: number;
    dimensions: {
      x: number;
      y: number;
      z: number;
    };
  };
}
