import Link from 'next/link'
import { Avatar } from '@/components/Avatar'

/** Klickbare Zeile: kleines Profilbild links, Name – führt zum öffentlichen Profil. */
export function ProfileLinkRow({
  userId,
  name,
  avatarUrl,
  subtitle,
  label,
  className = '',
  /** `compact` = dezent, eine Zeile, für Dashboard-Karten (Standard). */
  variant = 'compact',
}: {
  userId: string
  name: string
  avatarUrl?: string | null
  subtitle?: string
  label?: string
  className?: string
  variant?: 'compact' | 'comfortable'
}) {
  const isCompact = variant === 'compact'

  return (
    <Link
      href={`/profile/${userId}`}
      className={
        isCompact
          ? `group flex max-w-full items-center gap-2 rounded-md border border-zinc-200/70 bg-zinc-50/50 px-2 py-1 text-left transition hover:border-zinc-300 hover:bg-zinc-100/80 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80 ${className}`
          : `flex items-center gap-3 rounded-xl border border-zinc-200/90 bg-zinc-50/90 px-3 py-2.5 transition hover:border-amber-400/50 hover:bg-amber-50/40 dark:border-zinc-600 dark:bg-zinc-800/60 dark:hover:border-amber-600/40 dark:hover:bg-zinc-800 ${className}`
      }
    >
      <Avatar
        name={name}
        src={avatarUrl}
        size={isCompact ? 'xs' : 'md'}
        className={`shrink-0 ${isCompact ? '' : 'ring-2 ring-white dark:ring-zinc-900'}`}
      />
      <div className="min-w-0 flex-1">
        {isCompact ? (
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0">
            {label && (
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                {label}
              </span>
            )}
            <span className="truncate text-sm font-medium text-zinc-800 group-hover:text-amber-800 dark:text-zinc-100 dark:group-hover:text-amber-200">
              {name}
            </span>
            {subtitle && (
              <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">· {subtitle}</span>
            )}
          </div>
        ) : (
          <>
            {label && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</div>
            )}
            <div className={`truncate font-semibold text-zinc-900 dark:text-white ${label ? 'mt-0.5' : ''}`}>{name}</div>
            {subtitle && <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</div>}
          </>
        )}
      </div>
      <span
        className={`shrink-0 text-zinc-400 transition group-hover:text-amber-600 dark:text-zinc-500 dark:group-hover:text-amber-400 ${isCompact ? 'text-xs' : 'text-sm font-medium'}`}
        aria-hidden
      >
        →
      </span>
    </Link>
  )
}
