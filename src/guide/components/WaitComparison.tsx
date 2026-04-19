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
    <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Espera promedio (menos es mejor)
      </p>

      <div className="space-y-2.5">
        {data.map((d) => {
          const pct = (d.wait / max) * 100
          const isSelected = d.algo === schedulingChoice
          const isWinner = d.algo === winner
          return (
            <div key={d.algo} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-medium ${
                    isSelected ? 'text-indigo-300' : 'text-gray-300'
                  }`}
                >
                  {ALGO_DESCRIPTIONS[d.algo].name}
                  {isWinner && (
                    <span className="ml-1.5 text-[10px] font-bold text-emerald-400">
                      mejor
                    </span>
                  )}
                </span>
                <span className="font-mono tabular-nums text-gray-200">
                  {d.wait.toFixed(2)} s
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    isWinner
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : isSelected
                      ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500'
                      : 'bg-gray-600'
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
