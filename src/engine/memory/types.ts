export interface PageTableEntry {
  pageNumber: number
  frameNumber: number | null
  pid: number
  loaded: boolean
}

export interface Frame {
  frameNumber: number
  pid: number | null
  pageNumber: number | null
}

export interface ReplacementStep {
  requestedPage: number
  pid: number
  frameState: Frame[]
  isPageFault: boolean
  evictedPage?: number
  evictedPid?: number
  referenceBits?: boolean[]
  loadedIntoFrame?: number
}

export interface MemoryState {
  frames: Frame[]
  pageTables: Map<number, PageTableEntry[]>
  totalPageFaults: number
  internalFragmentation: number
}

export type ReplacementFn = (
  referenceString: { pid: number; page: number }[],
  numFrames: number,
) => ReplacementStep[]
