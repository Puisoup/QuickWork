import Link from 'next/link'
import { Avatar } from '@/components/Avatar'

/** Klickbare Zeile: Avatar links, Name – führt zum öffentlichen Profil. */
export function ProfileLinkRow({
  userId,
  name,
  avatarUrl,
  subtitle,
  label,
  className = '',
  variant = 'compact',
}: {
  userId: string
  name: string
  avatarUrl?: string | null
  subtitle?: string
  label?: string
  className?: string
  /** `compact` Listen, `readable` Dashboard-Hervorhebung (größere Schrift). */
  variant?: 'compact' | 'comfortable' | 'readable'
}) {
  const isReadable = variant === 'readable'
  const isComfortable = variant === 'comfortable'

  const baseLink =
    isReadable
      ? `group flex max-w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-left shadow-sm transition hover:border-amber-300/80 hover:shadow dark:border-zinc-600 dark:bg-zinc-800/50 dark:hover:border-amber-700/60 ${className}`
      : isComfortable
        ? `flex items-center gap-3 rounded-xl border border-zinc-200/90 bg-zinc-50/90 px-3 py-2.5 transition hover:border-amber-400/50 hover:bg-amber-50/40 dark:border-zinc-600 dark:bg-zinc-800/60 dark:hover:border-amber-600/40 dark:hover:bg-zinc-800 ${className}`
        : `group flex max-w-full items-center gap-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/60 px-3 py-2 text-left transition hover:border-zinc-300 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 ${className}`

  const avatarSize = isReadable ? 'sm' : isComfortable ? 'md' : 'sm'

  return (
    <Link href={`/profile/${userId}`} className={baseLink}>
      <Avatar
        name={name}
        src={avatarUrl}
        size={avatarSize}
        className={`shrink-0 ${isComfortable ? 'ring-2 ring-white dark:ring-zinc-900' : ''}`}
      />
      <div className="min-w-0 flex-1">
        {isReadable ? (
          <>
            {label && <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>}
            <p className={`font-semibold text-zinc-900 dark:text-white ${label ? 'mt-0.5' : ''} text-lg leading-snug`}>
              {name}
            </p>
            {subtitle && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
          </>
        ) : isComfortable ? (
          <>
            {label && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</div>
            )}
            <div className={`truncate font-semibold text-zinc-900 dark:text-white ${label ? 'mt-0.5' : ''}`}>{name}</div>
            {subtitle && <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</div>}
          </>
        ) : (
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0">
            {label && (
              <span className="shrink-0 text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
            )}
            <span className="truncate text-base font-semibold text-zinc-900 group-hover:text-amber-800 dark:text-white dark:group-hover:text-amber-200">
              {name}
            </span>
            {subtitle && (
              <span className="truncate text-sm text-zinc-500 dark:text-zinc-400">· {subtitle}</span>
            )}
          </div>
        )}
      </div>
      <span
        className={`shrink-0 text-zinc-400 transition group-hover:text-amber-600 dark:text-zinc-500 dark:group-hover:text-amber-400 ${isReadable ? 'text-lg' : 'text-sm'}`}
        aria-hidden
      >
        →
      </span>
    </Link>
  )
}
