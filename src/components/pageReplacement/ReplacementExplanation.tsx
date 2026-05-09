import { useState } from 'react'
import { Calculator, ChevronDown } from 'lucide-react'
import { useMemoryStore } from '../../store/memoryStore'

interface SectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function Section({ title, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="text-[13px] font-semibold tracking-tight text-[color:var(--text)]">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-[color:var(--text-muted)] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="space-y-2 border-t border-[color:var(--border)] px-3 py-3 text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
          {children}
        </div>
      )}
    </div>
  )
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-1.5 font-mono text-[12px] tabular-nums text-[color:var(--text)]">
      {children}
    </div>
  )
}

export default function ReplacementExplanation() {
  const replacementSteps = useMemoryStore((s) => s.replacementSteps)

  if (replacementSteps.length === 0) return null

  const total = replacementSteps.length
  const faults = replacementSteps.filter((s) => s.isPageFault).length
  const hits = total - faults
  const faultRate = (faults / total) * 100
  const hitRate = (hits / total) * 100

  const faultEvents = replacementSteps
    .map((s, i) => ({ ...s, index: i }))
    .filter((s) => s.isPageFault)

  return (
    <div className="surface-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Calculator size={14} className="text-[color:var(--accent)]" />
        <h3 className="text-[14px] font-semibold tracking-tight text-[color:var(--text)]">
          ¿Cómo se calcularon estas métricas?
        </h3>
      </div>

      <p className="mb-3 text-[12px] leading-relaxed text-[color:var(--text-muted)]">
        El simulador recorre la cadena de referencias paso a paso. En cada
        referencia decide si es acierto (la página ya estaba en algún marco) o
        fallo (hay que cargarla, posiblemente expulsando otra).
      </p>

      <div className="space-y-2">
        <Section title="Tasa de fallos" defaultOpen>
          <Formula>Tasa de fallos = Fallos / Referencias totales × 100%</Formula>
          <p className="font-mono text-[12px] tabular-nums text-[color:var(--text)]">
            Tasa de fallos = {faults} / {total} × 100% ={' '}
            <strong className="text-rose-300">{faultRate.toFixed(1)}%</strong>
          </p>
        </Section>

        <Section title="Tasa de aciertos">
          <Formula>Tasa de aciertos = 1 − Tasa de fallos</Formula>
          <p className="font-mono text-[12px] tabular-nums text-[color:var(--text)]">
            Tasa de aciertos = ({total} − {faults}) / {total} × 100% ={' '}
            <strong className="text-emerald-300">{hitRate.toFixed(1)}%</strong>
          </p>
          <p>
            Equivalente: {hits} aciertos sobre {total} referencias.
          </p>
        </Section>

        <Section title="Detalle de los fallos">
          <Formula>
            Cada fila es una referencia que provocó cargar una página
          </Formula>
          {faultEvents.length === 0 ? (
            <p className="text-[11.5px] text-[color:var(--text-faint)]">
              No hubo fallos en esta simulación.
            </p>
          ) : (
            <ul className="space-y-0.5 pl-3">
              {faultEvents.map((ev) => (
                <li
                  key={ev.index}
                  className="font-mono text-[11.5px] tabular-nums text-[color:var(--text-muted)]"
                >
                  Paso {ev.index + 1}: P{ev.pid} pidió Pg{ev.requestedPage}
                  {ev.evictedPage !== undefined &&
                    ev.evictedPid !== undefined && (
                      <>
                        {' '}
                        · sale P{ev.evictedPid} Pg{ev.evictedPage}
                      </>
                    )}
                  {ev.loadedIntoFrame !== undefined && (
                    <> · entra en marco F{ev.loadedIntoFrame}</>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  )
}
