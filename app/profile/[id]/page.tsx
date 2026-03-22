import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Avatar } from '@/components/Avatar'
import { getDashboardHomePath } from '@/lib/dashboard-home'

type Props = { params: Promise<{ id: string }> }

export default async function PublicProfilePage(props: Props) {
  const { id } = await props.params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      receivedReviews: {
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  })

  if (!user) notFound()

  const cookieStore = await cookies()
  const sessionRole = cookieStore.get('quickwork_role')?.value
  const backHref = getDashboardHomePath(sessionRole)
  const isLoggedIn = !!sessionRole && backHref !== '/'
  const backLabel = isLoggedIn ? '← Zum Dashboard' : '← QuickWork'

  const role = user.role
  const p = user.profile
  const avgRating =
    user.receivedReviews.length > 0
      ? user.receivedReviews.reduce((s, r) => s + r.rating, 0) / user.receivedReviews.length
      : null

  const maskName = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0) + '.'
    return `${parts[0]} ${parts[parts.length - 1]?.charAt(0) ?? ''}.`
  }

  const roleLabel = role === 'COMPANY' ? 'Unternehmen' : role === 'EXPERT' ? 'QuickWork Expert' : 'Kunde'

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link
            href={backHref}
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            {backLabel}
          </Link>
          <span className="text-xs font-semibold tracking-tight text-zinc-400 dark:text-zinc-500">QuickWork</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 bg-gradient-to-br from-zinc-50 to-white px-6 py-8 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex flex-wrap items-start gap-5">
                <Avatar name={user.name} src={p?.avatarUrl} size="lg" className="ring-2 ring-white shadow-md dark:ring-zinc-700" />
                <div>
                  <span className="inline-block rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {roleLabel}
                  </span>
                  <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">{user.name}</h1>
                  {p?.headline ? (
                    <p className="mt-2 text-base text-zinc-600 dark:text-zinc-300">{p.headline}</p>
                  ) : (
                    <p className="mt-2 text-sm italic text-zinc-400 dark:text-zinc-500">Noch keine Kurzbeschreibung</p>
                  )}
                </div>
              </div>
              {role === 'COMPANY' && avgRating != null && (
                <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-5 py-3 text-center dark:border-amber-900/50 dark:bg-amber-950/40">
                  <div className="text-2xl font-bold tabular-nums text-amber-900 dark:text-amber-100">{avgRating.toFixed(1)}</div>
                  <div className="text-xs font-medium text-amber-800/90 dark:text-amber-200/90">
                    {user.receivedReviews.length} Bewertung{user.receivedReviews.length === 1 ? '' : 'en'}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 px-6 py-8">
            {p?.bio ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{p.bio}</p>
            ) : (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">Noch keine weiteren Angaben.</p>
            )}

            {(p?.region || p?.phone || (role === 'COMPANY' && p?.website)) && (
              <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                {p.region && <li className="flex items-center gap-1.5"><span className="text-zinc-400">📍</span>{p.region}</li>}
                {p.phone && <li className="flex items-center gap-1.5"><span className="text-zinc-400">📞</span>{p.phone}</li>}
                {role === 'COMPANY' && p?.website && (
                  <li>
                    <a
                      href={p.website.startsWith('http') ? p.website : `https://${p.website}`}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Website →
                    </a>
                  </li>
                )}
              </ul>
            )}

            {role === 'COMPANY' && p?.services && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Leistungen</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{p.services}</p>
              </section>
            )}

            {role === 'EXPERT' && p?.specialties && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Schwerpunkte</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{p.specialties}</p>
              </section>
            )}
          </div>

          {role === 'COMPANY' && (
            <section className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-8 dark:border-zinc-800 dark:bg-zinc-950/30">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Feedback</h2>
              {user.receivedReviews.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Noch keine Bewertungen.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {user.receivedReviews.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{maskName(r.customer.name)}</span>
                        <span className="text-amber-500 dark:text-amber-400" aria-label={`${r.rating} von 5 Sternen`}>
                          {'★'.repeat(r.rating)}
                          <span className="text-zinc-300 dark:text-zinc-600">{'☆'.repeat(5 - r.rating)}</span>
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{r.comment}</p>
                      <time className="mt-2 block text-xs text-zinc-400" dateTime={r.createdAt.toISOString()}>
                        {r.createdAt.toLocaleDateString('de-CH')}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </article>
      </main>
    </div>
  )
}
