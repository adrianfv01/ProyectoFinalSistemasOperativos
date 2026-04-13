import type { Frame, ReplacementStep } from './types'

function cloneFrames(frames: Frame[]): Frame[] {
  return frames.map((f) => ({ ...f }))
}

export function clock(
  referenceString: { pid: number; page: number }[],
  numFrames: number,
): ReplacementStep[] {
  const steps: ReplacementStep[] = []
  let frames: Frame[] = Array.from({ length: numFrames }, (_, i) => ({
    frameNumber: i,
    pid: null,
    pageNumber: null,
  }))
  const referenceBits: boolean[] = new Array(numFrames).fill(false)
  let hand = 0

  for (const ref of referenceString) {
    const hitIdx = frames.findIndex(
      (f) => f.pid === ref.pid && f.pageNumber === ref.page,
    )

    if (hitIdx !== -1) {
      referenceBits[hitIdx] = true
      steps.push({
        requestedPage: ref.page,
        pid: ref.pid,
        frameState: cloneFrames(frames),
        isPageFault: false,
        referenceBits: [...referenceBits],
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
      referenceBits[emptyIdx] = true
      if (emptyIdx === hand) {
        hand = (hand + 1) % numFrames
      }
    } else {
      while (referenceBits[hand]) {
        referenceBits[hand] = false
        hand = (hand + 1) % numFrames
      }

      evictedPage = frames[hand].pageNumber!
      evictedPid = frames[hand].pid!
      loadedIntoFrame = hand

      frames = cloneFrames(frames)
      frames[hand] = {
        frameNumber: hand,
        pid: ref.pid,
        pageNumber: ref.page,
      }
      referenceBits[hand] = true
      hand = (hand + 1) % numFrames
    }

    steps.push({
      requestedPage: ref.page,
      pid: ref.pid,
      frameState: cloneFrames(frames),
      isPageFault: true,
      evictedPage,
      evictedPid,
      referenceBits: [...referenceBits],
      loadedIntoFrame,
    })
  }

  return steps
}
