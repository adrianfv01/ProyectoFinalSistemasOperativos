import type { Frame, ReplacementStep } from './types'

function cloneFrames(frames: Frame[]): Frame[] {
  return frames.map((f) => ({ ...f }))
}

export function optimal(
  referenceString: { pid: number; page: number }[],
  numFrames: number,
): ReplacementStep[] {
  const steps: ReplacementStep[] = []
  let frames: Frame[] = Array.from({ length: numFrames }, (_, i) => ({
    frameNumber: i,
    pid: null,
    pageNumber: null,
  }))

  for (let t = 0; t < referenceString.length; t++) {
    const ref = referenceString[t]

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
    } else {
      let farthestIdx = 0
      let farthestUse = -1

      for (let i = 0; i < frames.length; i++) {
        let nextUse = Infinity
        for (let future = t + 1; future < referenceString.length; future++) {
          if (
            referenceString[future].pid === frames[i].pid &&
            referenceString[future].page === frames[i].pageNumber
          ) {
            nextUse = future
            break
          }
        }
        if (nextUse > farthestUse) {
          farthestUse = nextUse
          farthestIdx = i
        }
      }

      evictedPage = frames[farthestIdx].pageNumber!
      evictedPid = frames[farthestIdx].pid!
      loadedIntoFrame = farthestIdx

      frames = cloneFrames(frames)
      frames[farthestIdx] = {
        frameNumber: farthestIdx,
        pid: ref.pid,
        pageNumber: ref.page,
      }
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
