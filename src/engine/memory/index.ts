export type {
  Frame,
  MemoryState,
  PageTableEntry,
  ReplacementFn,
  ReplacementStep,
} from './types'

export {
  allocatePages,
  computeInternalFragmentation,
  generateReferenceString,
  initializeFrames,
} from './paging'

export { fifo } from './fifo'
export { lru } from './lru'
export { optimal } from './optimal'
export { clock } from './clock'
export { secondChance } from './secondChance'

import type { ReplacementFn } from './types'
import { fifo } from './fifo'
import { lru } from './lru'
import { optimal } from './optimal'
import { clock } from './clock'
import { secondChance } from './secondChance'

const algorithms: Record<string, ReplacementFn> = {
  fifo,
  lru,
  optimal,
  clock,
  secondChance,
}

export function getReplacementAlgorithm(name: string): ReplacementFn {
  const fn = algorithms[name]
  if (!fn) {
    throw new Error(`Algoritmo de reemplazo desconocido: ${name}`)
  }
  return fn
}

export function getAvailableAlgorithms(): string[] {
  return Object.keys(algorithms)
}
