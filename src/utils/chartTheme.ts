import { useEffect, useState } from 'react'

export interface ChartTheme {
  axis: { fill: string; fontSize: number; fontFamily: string }
  grid: string
  border: string
  surface: string
  text: string
  textMuted: string
  textFaint: string
  accent: string
  palette: string[]
  tooltip: {
    contentStyle: React.CSSProperties
    labelStyle: React.CSSProperties
    itemStyle: React.CSSProperties
    cursor: { fill: string }
  }
}

const PALETTE_DARK = [
  '#C7BDFF',
  '#86EFAC',
  '#FCD9A5',
  '#FCA5A5',
  '#7DD3FC',
  '#F0ABFC',
  '#FDE68A',
  '#A7F3D0',
]

const PALETTE_LIGHT = [
  '#7C6FE8',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#0EA5E9',
  '#A855F7',
  '#CA8A04',
  '#059669',
]

function readVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

function buildTheme(isDark: boolean): ChartTheme {
  const text = readVar('--text', isDark ? '#EDEDF1' : '#0A0A0B')
  const textMuted = readVar('--text-muted', isDark ? '#A1A1AA' : '#52525B')
  const textFaint = readVar('--text-faint', isDark ? '#6B7280' : '#9CA3AF')
  const border = readVar('--border', isDark ? '#1F2024' : '#E5E5EA')
  const borderStrong = readVar('--border-strong', isDark ? '#2A2B30' : '#D4D4D8')
  const surface = readVar('--surface-2', isDark ? '#101114' : '#F5F5F7')
  const accent = readVar('--accent', isDark ? '#C7BDFF' : '#7C6FE8')

  return {
    axis: {
      fill: textMuted,
      fontSize: 11,
      fontFamily: '"Geist Mono", ui-monospace, monospace',
    },
    grid: borderStrong,
    border: borderStrong,
    surface,
    text,
    textMuted,
    textFaint,
    accent,
    palette: isDark ? PALETTE_DARK : PALETTE_LIGHT,
    tooltip: {
      contentStyle: {
        backgroundColor: surface,
        border: `1px solid ${borderStrong}`,
        borderRadius: 12,
        boxShadow: '0 12px 32px -8px rgba(0,0,0,0.35)',
        padding: '8px 12px',
        fontFamily: '"Geist Mono", ui-monospace, monospace',
        fontSize: 12,
      },
      labelStyle: {
        color: textMuted,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: 4,
      },
      itemStyle: {
        color: text,
        fontFamily: '"Geist Mono", ui-monospace, monospace',
      },
      cursor: { fill: `${accent}1f` },
    },
  }
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(() =>
    buildTheme(typeof document !== 'undefined' && document.documentElement.classList.contains('dark')),
  )

  useEffect(() => {
    if (typeof document === 'undefined') return
    const update = () => {
      setTheme(buildTheme(document.documentElement.classList.contains('dark')))
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return theme
}
