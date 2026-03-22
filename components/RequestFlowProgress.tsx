import { Fragment } from 'react'

/**
 * QuickWork-Flow: Gutachten → dann Angebote (USP über UI).
 */
export function RequestFlowProgress({
  status,
  hasFramework,
}: {
  status: string
  hasFramework: boolean
}) {
  const steps = [
    { key: 'in', label: 'Eingang' },
    { key: 'gw', label: 'Gutachten' },
    { key: 'bid', label: 'Angebote' },
    { key: 'end', label: 'Abschluss' },
  ] as const

  let activeIndex = 1
  if (status === 'DONE') activeIndex = 3
  else if (status === 'BIDDING' && hasFramework) activeIndex = 2
  else if (status === 'OPEN') activeIndex = 1

  if (status === 'DONE') {
    return (
      <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/50">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
              aria-hidden
            >
              ✓
            </span>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Auftrag abgeschlossen</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Alle Schritte sind erledigt. Unterlagen und Bewertung findest du in den Registerkarten.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Ablauf</p>
      <div className="flex w-full items-center">
        {steps.map((step, i) => (
          <Fragment key={step.key}>
            <div className="flex min-w-0 flex-1 flex-col items-center text-center">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  i < activeIndex
                    ? 'border-zinc-400 bg-zinc-900 text-white dark:border-zinc-500 dark:bg-zinc-100 dark:text-zinc-900'
                    : i === activeIndex
                      ? 'border-zinc-900 bg-white text-zinc-900 dark:border-zinc-100 dark:bg-zinc-950 dark:text-white'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500'
                }`}
              >
                {i < activeIndex ? '✓' : i + 1}
              </span>
              <span
                className={`mt-2 max-w-[5.5rem] text-xs font-medium leading-tight sm:max-w-none sm:text-sm ${
                  i <= activeIndex ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mb-7 h-px min-w-[8px] flex-1 sm:min-w-[12px] ${
                  i < activeIndex ? 'bg-zinc-400 dark:bg-zinc-500' : 'bg-zinc-200 dark:bg-zinc-700'
                }`}
                aria-hidden
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
