import { DocumentLinkCard } from '@/components/dashboard/DocumentLinkCard'

type Framework = {
  budget: number | null
  timeline: string | null
  description: string
  attachmentUrl: string | null
}

/** Gutachten: große Zahlen, Kommentar lesbar, Dokument klar hervorgehoben. */
export function GutachtenSection({ framework, compact = false }: { framework: Framework; compact?: boolean }) {
  return (
    <section
      className={`rounded-2xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900/50 ${compact ? 'p-4' : 'p-6'}`}
    >
      <h3 className={`font-semibold tracking-tight text-zinc-900 dark:text-white ${compact ? 'text-lg' : 'text-xl'}`}>Gutachten</h3>
      <p className={`mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400 ${compact ? 'text-sm' : 'text-base'}`}>
        Einschätzung durch unser Expertenteam – Grundlage für Angebote von Partnerbetrieben.
      </p>

      <div className={`grid gap-4 sm:grid-cols-2 ${compact ? 'mt-4' : 'mt-6 gap-6'}`}>
        <div className={`rounded-xl bg-zinc-50 dark:bg-zinc-800/60 ${compact ? 'px-4 py-3' : 'px-5 py-4'}`}>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">Budget (ca.)</p>
          <p
            className={`mt-1 font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white ${compact ? 'text-2xl' : 'text-3xl'}`}
          >
            {framework.budget != null ? (
              <>
                {framework.budget}
                <span className={`font-semibold text-zinc-500 ${compact ? 'text-lg' : 'text-xl'}`}> CHF</span>
              </>
            ) : (
              <span className={compact ? 'text-lg text-zinc-500' : 'text-xl text-zinc-500'}>Keine Angabe</span>
            )}
          </p>
        </div>
        <div className={`rounded-xl bg-zinc-50 dark:bg-zinc-800/60 ${compact ? 'px-4 py-3' : 'px-5 py-4'}`}>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">Zeitrahmen</p>
          <p className={`mt-1 font-semibold text-zinc-900 dark:text-white ${compact ? 'text-lg' : 'text-2xl'}`}>
            {framework.timeline ?? '—'}
          </p>
        </div>
      </div>

      {framework.description ? (
        <div className={`border-l-4 border-amber-400 pl-4 ${compact ? 'mt-4' : 'mt-6 pl-5'}`}>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">Kommentar des Experten</p>
          <p className={`mt-1 leading-relaxed text-zinc-800 dark:text-zinc-200 ${compact ? 'text-sm' : 'text-base'}`}>
            {framework.description}
          </p>
        </div>
      ) : null}

      {framework.attachmentUrl ? (
        <div className={compact ? 'mt-4' : 'mt-8'}>
          <p className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 sm:text-sm">Dokument zum Gutachten</p>
          <DocumentLinkCard
            href={framework.attachmentUrl}
            title="Gutachten-Dokument ansehen"
            hint="PDF oder Bild · wichtige Unterlage für deinen Auftrag"
          />
        </div>
      ) : (
        <p className={`text-zinc-500 dark:text-zinc-400 ${compact ? 'mt-4 text-sm' : 'mt-6 text-base'}`}>
          Kein zusätzliches Dokument angehängt.
        </p>
      )}
    </section>
  )
}
