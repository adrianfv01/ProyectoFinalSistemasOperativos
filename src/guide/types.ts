import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface GuideStepDefinition {
  id: string
  title: string
  hook?: string
  icon?: LucideIcon
  accent?: string
  render: () => ReactNode
  canAdvance?: () => boolean
  blockedHint?: string
}

export interface GuideChapterDefinition {
  id: string
  slug: string
  label: string
  shortLabel: string
  icon: LucideIcon
  accent: string
  steps: GuideStepDefinition[]
}
