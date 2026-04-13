import type { Frame, ReplacementStep } from './types'

function cloneFrames(frames: Frame[]): Frame[] {
  return frames.map((f) => ({ ...f }))
}

export function fifo(
  referenceString: { pid: number; page: number }[],
  numFrames: number,
): ReplacementStep[] {
  const steps: ReplacementStep[] = []
  let frames: Frame[] = Array.from({ length: numFrames }, (_, i) => ({
    frameNumber: i,
    pid: null,
    pageNumber: null,
  }))
  const queue: number[] = []

  for (const ref of referenceString) {
    const hit = frames.some(
      (f) => f.pid === ref.pid && f.pageNumber === ref.page,
    )

    if (hit) {
      steps.push({
        requestedPage: ref.page,
        pid: ref.pid,
        frameState: cloneFrames(frames),
        isPageFault: false,
      })
      continue
    }

    const emptyIdx = frames.findIndex((f) => f.pid === null)
    let evictedPage: number | undefined
    let evictedPid: number | undefined
    let loadedIntoFrame: number

    if (emptyIdx !== -1) {
      loadedIntoFrame = emptyIdx
      frames = cloneFrames(frames)
      frames[emptyIdx] = {
        frameNumber: emptyIdx,
        pid: ref.pid,
        pageNumber: ref.page,
      }
      queue.push(emptyIdx)
    } else {
      const victimFrameIdx = queue.shift()!
      evictedPage = frames[victimFrameIdx].pageNumber!
      evictedPid = frames[victimFrameIdx].pid!
      loadedIntoFrame = victimFrameIdx

      frames = cloneFrames(frames)
      frames[victimFrameIdx] = {
        frameNumber: victimFrameIdx,
        pid: ref.pid,
        pageNumber: ref.page,
      }
      queue.push(victimFrameIdx)
    }

    steps.push({
      requestedPage: ref.page,
      pid: ref.pid,
      frameState: cloneFrames(frames),
      isPageFault: true,
      evictedPage,
      evictedPid,
      loadedIntoFrame,
    })
  }

  return steps
}
