import { Process, ProcessState } from '../engine/processes/types'

export interface MemoryConfig {
  totalMemory: number
  pageSize: number
  frames: number
}

export function parseProcessFile(content: string): Process[] {
  const lines = content.trim().split('\n')
  const processes: Process[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('PID') || trimmed.startsWith('#')) continue

    const parts = trimmed.split(',').map((s) => s.trim())
    if (parts.length < 5) continue

    const [pid, arrival, burst, priority, pages] = parts.map(Number)
    if ([pid, arrival, burst, priority, pages].some(isNaN)) continue

    processes.push({
      pid,
      arrivalTime: arrival,
      burstTime: burst,
      remainingTime: burst,
      priority,
      numPages: pages,
      state: ProcessState.New,
      threads: [],
    })
  }

  return processes
}

export function parseMemoryFile(content: string): MemoryConfig {
  const config: Partial<MemoryConfig> = {}
  const lines = content.trim().split('\n')

  for (const line of lines) {
    const [key, val] = line.split('=').map((s) => s.trim())
    const num = Number(val)
    if (isNaN(num)) continue

    if (key.toLowerCase() === 'memoria' || key.toLowerCase() === 'memory') config.totalMemory = num
    if (key.toLowerCase() === 'pagesize') config.pageSize = num
    if (key.toLowerCase() === 'frames') config.frames = num
  }

  return {
    totalMemory: config.totalMemory ?? 64,
    pageSize: config.pageSize ?? 4,
    frames: config.frames ?? 16,
  }
}
