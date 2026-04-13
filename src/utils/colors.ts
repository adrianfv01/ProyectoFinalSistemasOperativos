const PALETTE = [
  '#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#ef4444', '#84cc16',
  '#06b6d4', '#a855f7', '#f97316', '#22d3ee', '#e879f9',
  '#4ade80', '#fb923c', '#38bdf8', '#c084fc', '#fbbf24',
]

export function getProcessColor(pid: number): string {
  return PALETTE[(pid - 1) % PALETTE.length]
}

export function getProcessColorWithAlpha(pid: number, alpha: number): string {
  const hex = getProcessColor(pid)
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
