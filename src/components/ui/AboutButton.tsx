import { useCallback, useState } from 'react'
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

  // En táctil, dar feedback visual y abrir el diálogo desde el primer
  // contacto evita la sensación de "no pasó nada" mientras Safari aún
  // espera a confirmar el click.
  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  if (variant === 'inline') {
    return (
      <>
        <button
          type="button"
          onClick={handleOpen}
          aria-label={ariaLabel}
          title={ariaLabel}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          className={`flex w-full select-none items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-[12px] text-[color:var(--text-muted)] transition hover:border-[color:var(--border)] hover:bg-[color:var(--surface)] hover:text-[color:var(--text)] active:bg-[color:var(--surface-2)] active:text-[color:var(--text)] ${className}`}
        >
          <Info size={14} />
          <span>Acerca del proyecto</span>
        </button>
        <AboutDialog open={open} onClose={handleClose} />
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={ariaLabel}
        title={ariaLabel}
        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        className={`flex h-8 w-8 select-none items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] transition-[transform,background-color,border-color,color] duration-150 ease-out hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)] active:scale-95 active:border-[color:var(--accent)]/50 active:bg-[color:var(--surface-2)] active:text-[color:var(--text)] ${className}`}
      >
        <Info className="h-[15px] w-[15px] pointer-events-none" />
      </button>
      <AboutDialog open={open} onClose={handleClose} />
    </>
  )
}
