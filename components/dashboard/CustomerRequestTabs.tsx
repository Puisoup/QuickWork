'use client'

import { useEffect, useMemo, useState } from 'react'
import Chat from '@/components/Chat'
import { RequestFlowProgress } from '@/components/RequestFlowProgress'
import { ProfileLinkRow } from '@/components/ProfileLinkRow'
import { GutachtenSection } from '@/components/dashboard/GutachtenSection'
import { DocumentLinkCard } from '@/components/dashboard/DocumentLinkCard'
import { acceptOffer, submitReview } from '@/app/dashboard/customer/actions'
import type { CustomerRequestBundle } from '@/components/dashboard/customer-request-types'

function toChatMessages(bundle: CustomerRequestBundle) {
  return bundle.messages.map((m) => ({
    ...m,
    createdAt: new Date(m.createdAt),
  }))
}

type TabId = 'overview' | 'gutachten' | 'angebote' | 'nachrichten' | 'abschluss'

const TAB_LABELS: Record<TabId, string> = {
  overview: 'Übersicht',
  gutachten: 'Gutachten',
  angebote: 'Angebote',
  nachrichten: 'Nachrichten',
  abschluss: 'Abschluss',
}

/** Registerkarten – sachliche Darstellung, neutrale Flächen, klare Hierarchie. */
export function CustomerRequestTabs({ bundle, userId }: { bundle: CustomerRequestBundle; userId: string }) {
  const fw = bundle.framework
  const accepted = bundle.acceptedOffer
  const chatMessages = useMemo(() => toChatMessages(bundle), [bundle])

  const tabs = useMemo(() => {
    const list: TabId[] = ['overview']
    if (fw) list.push('gutachten')
    if (bundle.offers.length > 0 && bundle.status !== 'DONE') list.push('angebote')
    list.push('nachrichten')
    if (bundle.status === 'DONE' && accepted) list.push('abschluss')
    return list
  }, [fw, bundle.offers.length, bundle.status, accepted])

  const [active, setActive] = useState<TabId>('overview')

  useEffect(() => {
    if (!tabs.includes(active) && tabs[0]) {
      setActive(tabs[0])
    }
  }, [tabs, active])

  const safeActive = tabs.includes(active) ? active : (tabs[0] ?? 'overview')

  return (
    <div className="text-sm">
      <div className="rounded-t-lg border border-b-0 border-zinc-200 bg-zinc-100/90 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex gap-0 overflow-x-auto border-b border-zinc-200/80 px-1 pt-1 dark:border-zinc-700">
          {tabs.map((id) => {
            const isOn = safeActive === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isOn
                    ? 'rounded-t-md bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50'
                    : 'rounded-t-md text-zinc-600 hover:bg-white/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200'
                }`}
              >
                {TAB_LABELS[id]}
                {isOn && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-zinc-900 dark:bg-zinc-100"
                    aria-hidden
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-b-lg border border-t-0 border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
        {safeActive === 'overview' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-baseline gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Status</span>
              <span className="rounded border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-mono text-sm text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200">
                {bundle.status}
              </span>
            </div>
            {bundle.expertId && bundle.expert && bundle.status !== 'DONE' && fw && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
                <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Zuständiger Experte</p>
                <ProfileLinkRow
                  userId={bundle.expertId}
                  name={bundle.expert.name}
                  avatarUrl={bundle.expert.profile?.avatarUrl}
                  label="Profil"
                />
              </div>
            )}
            {bundle.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {bundle.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-md border border-zinc-200 object-cover dark:border-zinc-600"
                  />
                ))}
              </div>
            )}
            <RequestFlowProgress status={bundle.status} hasFramework={!!fw} />
          </div>
        )}

        {safeActive === 'gutachten' && fw && (
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800">
            <GutachtenSection
              compact
              framework={{
                budget: fw.budget,
                timeline: fw.timeline,
                description: fw.description,
                attachmentUrl: fw.attachmentUrl,
              }}
            />
          </div>
        )}

        {safeActive === 'angebote' && bundle.offers.length > 0 && bundle.status !== 'DONE' && (
          <div className="space-y-4">
            {bundle.offers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50/40 p-4 dark:border-zinc-700 dark:bg-zinc-900/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Angebotssumme</p>
                    <p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-white">
                      {offer.amount} CHF
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{offer.description}</p>
                  </div>
                  {offer.status === 'ACCEPTED' ? (
                    <span className="rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                      Angenommen
                    </span>
                  ) : (
                    <form action={acceptOffer}>
                      <input type="hidden" name="offerId" value={offer.id} />
                      <input type="hidden" name="requestId" value={bundle.id} />
                      <button
                        type="submit"
                        className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-emerald-500/40 transition hover:bg-emerald-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-emerald-600 dark:ring-emerald-400/30 dark:hover:bg-emerald-500 dark:focus-visible:ring-offset-zinc-950"
                      >
                        Annehmen
                      </button>
                    </form>
                  )}
                </div>
                {offer.attachmentUrl && (
                  <div className="mt-4">
                    <DocumentLinkCard href={offer.attachmentUrl} title="Anhang zum Angebot" hint="Vom Unternehmen" />
                  </div>
                )}
                <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-600">
                  <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">Anbieter</p>
                  <ProfileLinkRow
                    userId={offer.companyId}
                    name={offer.company.name}
                    avatarUrl={offer.company.profile?.avatarUrl}
                    label="Firma"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {safeActive === 'nachrichten' && (
          <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
            {accepted ? (
              <Chat
                className="max-w-full border-0 shadow-none"
                title={accepted.company.name}
                otherUserProfileId={accepted.companyId}
                requestId={bundle.id}
                currentUserId={userId}
                otherUserId={accepted.companyId}
                initialMessages={chatMessages}
              />
            ) : bundle.expertId && !fw && bundle.expert ? (
              <Chat
                className="max-w-full border-0 shadow-none"
                title={bundle.expert.name}
                otherUserProfileId={bundle.expertId}
                requestId={bundle.id}
                currentUserId={userId}
                otherUserId={bundle.expertId}
                initialMessages={chatMessages}
              />
            ) : (
              <p className="p-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Sobald du mit dem Experten schreibst oder ein Angebot annimmst, erscheint der Chat hier.
              </p>
            )}
          </div>
        )}

        {safeActive === 'abschluss' && bundle.status === 'DONE' && accepted && (
          <div className="space-y-6">
            {fw && (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-700">
                <GutachtenSection
                  compact
                  framework={{
                    budget: fw.budget,
                    timeline: fw.timeline,
                    description: fw.description,
                    attachmentUrl: fw.attachmentUrl,
                  }}
                />
              </div>
            )}

            <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Ausführendes Unternehmen
              </h4>
              <div className="mt-3 max-w-md">
                <ProfileLinkRow
                  variant="readable"
                  userId={accepted.companyId}
                  name={accepted.company.name}
                  avatarUrl={accepted.company.profile?.avatarUrl}
                  label="Profil"
                  subtitle={`${accepted.amount} CHF vereinbart`}
                />
              </div>
              {accepted.executionDate && (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">Termin:</span>{' '}
                  {new Date(accepted.executionDate).toLocaleString('de-CH', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              )}
            </section>

            <section className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Bewertung
              </h4>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Kurzes Feedback zur Ausführung.</p>
              <form action={submitReview} className="mt-4 flex flex-col gap-3">
                <input type="hidden" name="companyId" value={accepted.companyId} />
                <textarea
                  name="comment"
                  required
                  rows={3}
                  placeholder="Kommentar …"
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Sterne (1–5)
                    <input
                      name="rating"
                      type="number"
                      min="1"
                      max="5"
                      defaultValue="5"
                      required
                      className="w-14 rounded-md border border-zinc-200 px-2 py-1.5 text-center text-sm dark:border-zinc-600 dark:bg-zinc-900"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Bewertung senden
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
