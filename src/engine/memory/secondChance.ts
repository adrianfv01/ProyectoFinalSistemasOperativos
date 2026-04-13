import type { Frame, ReplacementStep } from './types'

function cloneFrames(frames: Frame[]): Frame[] {
  return frames.map((f) => ({ ...f }))
}

interface QueueEntry {
  frameIndex: number
  referenceBit: boolean
}

export function secondChance(
  referenceString: { pid: number; page: number }[],
  numFrames: number,
): ReplacementStep[] {
  const steps: ReplacementStep[] = []
  let frames: Frame[] = Array.from({ length: numFrames }, (_, i) => ({
    frameNumber: i,
    pid: null,
    pageNumber: null,
  }))
  let queue: QueueEntry[] = []

  function buildReferenceBits(): boolean[] {
    const bits = new Array<boolean>(numFrames).fill(false)
    for (const entry of queue) {
      bits[entry.frameIndex] = entry.referenceBit
    }
    return bits
  }

  for (const ref of referenceString) {
    const hitIdx = frames.findIndex(
      (f) => f.pid === ref.pid && f.pageNumber === ref.page,
    )

    if (hitIdx !== -1) {
      queue = queue.map((e) =>
        e.frameIndex === hitIdx ? { ...e, referenceBit: true } : { ...e },
      )
      steps.push({
        requestedPage: ref.page,
        pid: ref.pid,
        frameState: cloneFrames(frames),
        isPageFault: false,
        referenceBits: buildReferenceBits(),
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
      queue = [...queue, { frameIndex: emptyIdx, referenceBit: true }]
    } else {
      let victimFound = false
      let safetyLimit = queue.length * 2

      while (!victimFound && safetyLimit > 0) {
        safetyLimit--
        const front = queue[0]
        if (front.referenceBit) {
          queue = [
            ...queue.slice(1),
            { frameIndex: front.frameIndex, referenceBit: false },
          ]
        } else {
          queue = queue.slice(1)
          evictedPage = frames[front.frameIndex].pageNumber!
          evictedPid = frames[front.frameIndex].pid!
          loadedIntoFrame = front.frameIndex

          frames = cloneFrames(frames)
          frames[front.frameIndex] = {
            frameNumber: front.frameIndex,
            pid: ref.pid,
            pageNumber: ref.page,
          }
          queue = [
            ...queue,
            { frameIndex: front.frameIndex, referenceBit: true },
          ]
          victimFound = true
        }
      }

      if (!victimFound) {
        const front = queue[0]
        queue = queue.slice(1)
        evictedPage = frames[front.frameIndex].pageNumber!
        evictedPid = frames[front.frameIndex].pid!
        loadedIntoFrame = front.frameIndex

        frames = cloneFrames(frames)
        frames[front.frameIndex] = {
          frameNumber: front.frameIndex,
          pid: ref.pid,
          pageNumber: ref.page,
        }
        queue = [
          ...queue,
          { frameIndex: front.frameIndex, referenceBit: true },
        ]
      }
    }

    steps.push({
      requestedPage: ref.page,
      pid: ref.pid,
      frameState: cloneFrames(frames),
      isPageFault: true,
      evictedPage,
      evictedPid,
      referenceBits: buildReferenceBits(),
      loadedIntoFrame: loadedIntoFrame!,
    })
  }

  return steps
}
