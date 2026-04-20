import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTutorialStore, type SchedulingChoice } from '../../store/tutorialStore'
import { miniToProcesses } from '../utils'
import { getScheduler } from '../../engine/scheduling'
import { ALGO_DESCRIPTIONS } from '../copy'

const ALGOS: SchedulingChoice[] = ['fcfs', 'sjf', 'roundRobin']

export default function WaitComparison() {
  const { miniProcesses, pagesPerProcess, schedulingQuantum, schedulingChoice } =
    useTutorialStore()

  const data = useMemo(() => {
    if (miniProcesses.length === 0) return []
    const procs = miniToProcesses(miniProcesses, pagesPerProcess)
    return ALGOS.map((algo) => {
      const fn = getScheduler(algo)
      const result = fn(
        procs.map((p) => ({ ...p })),
        { quantum: schedulingQuantum, quantumPerLevel: [2, 4, 8] },
      )
      return {
        algo,
        wait: result.averages.avgWaitingTime,
      }
    })
  }, [miniProcesses, pagesPerProcess, schedulingQuantum])

  if (data.length === 0) return null

  const max = Math.max(...data.map((d) => d.wait), 1)
  const winner = [...data].sort((a, b) => a.wait - b.wait)[0]?.algo

  return (
    <div className="surface-card p-4">
      <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        Espera promedio (menos es mejor)
      </p>

      <div className="space-y-3">
        {data.map((d) => {
          const pct = (d.wait / max) * 100
          const isSelected = d.algo === schedulingChoice
          const isWinner = d.algo === winner
          return (
            <div key={d.algo} className="space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span
                  className={`font-medium ${
                    isSelected ? 'text-[color:var(--accent)]' : 'text-[color:var(--text)]'
                  }`}
                >
                  {ALGO_DESCRIPTIONS[d.algo].name}
                  {isWinner && (
                    <span className="ml-2 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                      mejor
                    </span>
                  )}
                </span>
                <span className="font-mono tabular-nums text-[color:var(--text)]">
                  {d.wait.toFixed(2)} s
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    isWinner
                      ? 'bg-gradient-to-r from-emerald-300 to-emerald-200'
                      : isSelected
                        ? 'bg-gradient-to-r from-[color:var(--accent)] to-[#E7E2FF]'
                        : 'bg-[color:var(--border-strong)]'
                  }`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
