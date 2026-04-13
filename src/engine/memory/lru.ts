import type { Frame, ReplacementStep } from './types'

function cloneFrames(frames: Frame[]): Frame[] {
  return frames.map((f) => ({ ...f }))
}

export function lru(
  referenceString: { pid: number; page: number }[],
  numFrames: number,
): ReplacementStep[] {
  const steps: ReplacementStep[] = []
  let frames: Frame[] = Array.from({ length: numFrames }, (_, i) => ({
    frameNumber: i,
    pid: null,
    pageNumber: null,
  }))
  const lastUsed = new Map<string, number>()

  for (let t = 0; t < referenceString.length; t++) {
    const ref = referenceString[t]
    const key = `${ref.pid}:${ref.page}`

    const hitIdx = frames.findIndex(
      (f) => f.pid === ref.pid && f.pageNumber === ref.page,
    )

    if (hitIdx !== -1) {
      lastUsed.set(key, t)
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
      let lruIdx = 0
      let lruTime = Infinity

      for (let i = 0; i < frames.length; i++) {
        const fKey = `${frames[i].pid}:${frames[i].pageNumber}`
        const useTime = lastUsed.get(fKey) ?? -1
        if (useTime < lruTime) {
          lruTime = useTime
          lruIdx = i
        }
      }

      evictedPage = frames[lruIdx].pageNumber!
      evictedPid = frames[lruIdx].pid!
      const evictKey = `${evictedPid}:${evictedPage}`
      lastUsed.delete(evictKey)
      loadedIntoFrame = lruIdx

      frames = cloneFrames(frames)
      frames[lruIdx] = {
        frameNumber: lruIdx,
        pid: ref.pid,
        pageNumber: ref.page,
      }
    }

    lastUsed.set(key, t)

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
