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

export function generateReferenceString(
  processes: Process[],
): { pid: number; page: number }[] {
  const refs: { pid: number; page: number }[] = []

  for (const proc of processes) {
    if (proc.numPages === 0) continue

    const count = Math.max(proc.burstTime, 1)
    for (let i = 0; i < count; i++) {
      refs.push({ pid: proc.pid, page: i % proc.numPages })
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
