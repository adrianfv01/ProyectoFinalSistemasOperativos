import { ProcessState } from './types'

const validTransitions: Record<ProcessState, ProcessState[]> = {
  [ProcessState.New]: [ProcessState.Ready],
  [ProcessState.Ready]: [ProcessState.Running],
  [ProcessState.Running]: [ProcessState.Ready, ProcessState.Waiting, ProcessState.Terminated],
  [ProcessState.Waiting]: [ProcessState.Ready],
  [ProcessState.Terminated]: [],
}

export function canTransition(from: ProcessState, to: ProcessState): boolean {
  return validTransitions[from].includes(to)
}

export function transition(from: ProcessState, to: ProcessState): ProcessState {
  if (!canTransition(from, to)) {
    throw new Error(`Transición inválida: ${from} -> ${to}`)
  }
  return to
}

export function getTransitionLabel(from: ProcessState, to: ProcessState): string {
  const labels: Record<string, string> = {
    'new->ready': 'Admitido',
    'ready->running': 'Despachado',
    'running->ready': 'Interrumpido',
    'running->waiting': 'E/S solicitada',
    'running->terminated': 'Finalizado',
    'waiting->ready': 'E/S completada',
  }
  return labels[`${from}->${to}`] ?? ''
}
