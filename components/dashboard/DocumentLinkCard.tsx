/**
 * Prominenter Link zu Gutachten-/Angebots-Dokumenten (lesbar, kein Mini-Icon).
 */
export function DocumentLinkCard({
  href,
  title,
  hint = 'Öffnet in einem neuen Tab',
  actionLabel = 'Öffnen',
}: {
  href: string
  title: string
  hint?: string
  actionLabel?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full max-w-xl items-center gap-4 rounded-2xl border-2 border-zinc-200 bg-gradient-to-br from-white to-zinc-50/80 p-4 shadow-sm transition hover:border-amber-400/90 hover:shadow-md dark:border-zinc-600 dark:from-zinc-900 dark:to-zinc-900/80 dark:hover:border-amber-600/80"
    >
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-2xl dark:bg-red-950/40"
        aria-hidden
      >
        📄
      </span>
      <div className="min-w-0 flex-1 text-left">
        <span className="block text-lg font-semibold leading-snug text-zinc-900 dark:text-white">{title}</span>
        <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">{hint}</span>
      </div>
      <span className="shrink-0 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-amber-600 dark:bg-white dark:text-zinc-900 dark:group-hover:bg-amber-500 dark:group-hover:text-white">
        {actionLabel}
      </span>
    </a>
  )
}
