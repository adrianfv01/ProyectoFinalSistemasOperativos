import { useState } from 'react'
import { Info } from 'lucide-react'
import AboutDialog from './AboutDialog'

interface AboutButtonProps {
  /**
   * `icon` muestra solo el ícono (ideal para barras superiores móviles).
   * `inline` añade el texto "Acerca de" (ideal para el sidebar de escritorio).
   */
  variant?: 'icon' | 'inline'
  className?: string
}

/**
 * Botón discreto que abre el diálogo "Acerca del proyecto".
 * Maneja su propio estado para no obligar a las barras a levantarlo.
 */
export default function AboutButton({
  variant = 'icon',
  className = '',
}: AboutButtonProps) {
  const [open, setOpen] = useState(false)

  const ariaLabel = 'Acerca del proyecto'

  if (variant === 'inline') {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={ariaLabel}
          title={ariaLabel}
          className={`flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-[12px] text-[color:var(--text-muted)] transition hover:border-[color:var(--border)] hover:bg-[color:var(--surface)] hover:text-[color:var(--text)] ${className}`}
        >
          <Info size={14} />
          <span>Acerca del proyecto</span>
        </button>
        <AboutDialog open={open} onClose={() => setOpen(false)} />
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] transition-colors active:scale-95 hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)] ${className}`}
      >
        <Info className="h-[15px] w-[15px]" />
      </button>
      <AboutDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
