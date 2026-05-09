import type { Process } from '../processes/types'
import type { Frame, MemoryState, PageTableEntry } from './types'

export function initializeFrames(numFrames: number): Frame[] {
  return Array.from({ length: numFrames }, (_, i) => ({
    frameNumber: i,
    pid: null,
    pageNumber: null,
  }))
}

export function allocatePages(
  processes: Process[],
  numFrames: number,
): MemoryState {
  const frames = initializeFrames(numFrames)
  const pageTables = new Map<number, PageTableEntry[]>()
  let frameIndex = 0
  let totalPageFaults = 0

  for (const proc of processes) {
    const entries: PageTableEntry[] = []

    for (let page = 0; page < proc.numPages; page++) {
      if (frameIndex < numFrames) {
        frames[frameIndex] = {
          frameNumber: frameIndex,
          pid: proc.pid,
          pageNumber: page,
        }
        entries.push({
          pageNumber: page,
          frameNumber: frameIndex,
          pid: proc.pid,
          loaded: true,
        })
        frameIndex++
      } else {
        entries.push({
          pageNumber: page,
          frameNumber: null,
          pid: proc.pid,
          loaded: false,
        })
        totalPageFaults++
      }
    }

    pageTables.set(proc.pid, entries)
  }

  return {
    frames: frames.map((f) => ({ ...f })),
    pageTables,
    totalPageFaults,
    internalFragmentation: 0,
  }
}

function buildLocalityPattern(numPages: number, length: number): number[] {
  if (numPages <= 0 || length <= 0) return []
  const pattern: number[] = []

  for (let i = 0; i < numPages && pattern.length < length; i++) {
    pattern.push(i)
  }

  if (numPages === 1) {
    while (pattern.length < length) pattern.push(0)
    return pattern
  }

  const hotSize = Math.max(1, Math.floor(numPages / 2))
  const tail = numPages - 1
  let cursor = 0

  while (pattern.length < length) {
    const phase = (pattern.length - numPages) % 9
    if (phase === 0 || phase === 2 || phase === 5) {
      pattern.push(cursor % hotSize)
      cursor++
    } else if (phase === 1 || phase === 6) {
      pattern.push(0)
    } else if (phase === 3) {
      pattern.push(Math.min(numPages - 1, hotSize))
    } else if (phase === 4) {
      pattern.push(1 % numPages)
    } else if (phase === 7) {
      pattern.push(tail)
    } else {
      pattern.push((cursor + 1) % numPages)
    }
  }

  return pattern.slice(0, length)
}

export function generateReferenceString(
  processes: Process[],
): { pid: number; page: number }[] {
  const refs: { pid: number; page: number }[] = []

  for (const proc of processes) {
    if (proc.numPages === 0) continue

    const count = Math.max(proc.burstTime, 1)
    const pattern = buildLocalityPattern(proc.numPages, count)
    for (const page of pattern) {
      refs.push({ pid: proc.pid, page })
    }
  }

  return refs
}

export function computeInternalFragmentation(
  totalMemory: number,
  pageSize: number,
  processes: Process[],
): number {
  let usedBytes = 0

  for (const proc of processes) {
    const fullyUsed = proc.numPages * pageSize
    usedBytes += fullyUsed
  }

  const allocatedFrames = Math.ceil(usedBytes / pageSize)
  const allocatedMemory = allocatedFrames * pageSize

  return allocatedMemory - usedBytes
}
