'use client'

import { useState, type ReactNode } from 'react'

/** Aufklappbare Karte: Fokus auf Titel & Inhalt; Profil & Details erst nach dem Öffnen. */
export function CollapsibleCard({
  title,
  subtitle,
  badge,
  headerExtra,
  defaultOpen = false,
  /** `emphasize` = gut sichtbarer Aufklapp-Button (Anfragen). `neutral` = dezenter (z. B. Formular). */
  toggleTone = 'emphasize',
  /** „Antippen zum Öffnen“ – bei standardmäßig offenen Panels oft störend. */
  showOpenHint = true,
  children,
}: {
  title: string
  subtitle?: string
  badge?: ReactNode
  /** Optional, z. B. Filter-Chips – sparsam nutzen, damit der Kopf nicht überladen wirkt. */
  headerExtra?: ReactNode
  defaultOpen?: boolean
  toggleTone?: 'emphasize' | 'neutral'
  showOpenHint?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  const toggleClass =
    toggleTone === 'emphasize'
      ? 'border-2 border-amber-400/80 bg-amber-50 text-amber-900 shadow-sm dark:border-amber-600/70 dark:bg-amber-950/50 dark:text-amber-100'
      : 'border border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'

  const hintClass =
    toggleTone === 'emphasize'
      ? 'text-amber-800/90 dark:text-amber-200/90'
      : 'text-zinc-500 dark:text-zinc-400'

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Details einklappen' : `Details zu „${title}“ anzeigen`}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer gap-3 p-4 text-left transition-colors hover:bg-zinc-50/90 dark:hover:bg-zinc-800/60"
      >
        {/* Aufklapp-Steuerung: bei Anfragen gut sichtbar */}
        <span
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toggleClass}`}
          aria-hidden
        >
          <span className={`text-lg font-bold leading-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-lg font-bold leading-snug tracking-tight text-zinc-900 dark:text-white">{title}</h3>
            {badge ? <div className="shrink-0">{badge}</div> : null}
          </div>
          {subtitle && (
            <p className="mt-1.5 text-sm leading-snug text-zinc-500 line-clamp-2 dark:text-zinc-400">{subtitle}</p>
          )}
          {showOpenHint && !open && (
            <p className={`mt-2 text-xs font-medium ${hintClass}`}>Antippen zum Öffnen</p>
          )}
          {headerExtra ? <div className="mt-3">{headerExtra}</div> : null}
        </div>
      </button>
      {open && (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800">{children}</div>
      )}
    </div>
  )
}
