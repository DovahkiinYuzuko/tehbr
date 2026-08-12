export type Alignment = 'left' | 'center' | 'right';

export interface TehbrIR {
  headers: string[];
  rows: string[][];
  alignments?: (Alignment | null)[];
}
