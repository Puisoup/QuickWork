import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createRequest, acceptOffer, submitReview } from './actions'
import Chat from '@/components/Chat'
import { RequestFlowProgress } from '@/components/RequestFlowProgress'
import { CollapsibleCard } from '@/components/CollapsibleCard'
import { ProfileLinkRow } from '@/components/ProfileLinkRow'

const profileSelect = { select: { avatarUrl: true } as const }

export default async function CustomerDashboard() {
    const cookieStore = await cookies()
    const userId = cookieStore.get('quickwork_user_id')?.value

    if (!userId) return <div>Please log in</div>

    const requests = await prisma.request.findMany({
        where: { customerId: userId },
        include: {
            offers: { include: { company: { include: { profile: profileSelect } } } },
            expert: { include: { profile: profileSelect } },
            framework: true,
            images: true,
            messages: {
                orderBy: { createdAt: 'asc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    function statusBadge(status: string) {
        const cls =
            status === 'DONE'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200'
                : status === 'BIDDING'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                  : status === 'OPEN'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
        return (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${cls}`}>{status}</span>
        )
    }

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Meine Anfragen</h2>
                <p className="text-gray-500">Verwalte deine Anfragen und sieh dir Angebote an.</p>
            </header>

            <CollapsibleCard title="Neue Anfrage erstellen" defaultOpen toggleTone="neutral" showOpenHint={false}>
                <form action={createRequest} className="space-y-4 pt-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titel</label>
                        <input
                            name="title"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-yellow-500 focus:ring-yellow-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            placeholder="z.B. Dachreparatur"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Beschreibung</label>
                        <textarea
                            name="description"
                            required
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-yellow-500 focus:ring-yellow-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            placeholder="Beschreibe dein Problem..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bild hochladen (Optional)</label>
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-yellow-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-yellow-700 hover:file:bg-yellow-100"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-md bg-yellow-500 px-4 py-2 font-medium text-white transition-colors hover:bg-yellow-600"
                    >
                        Anfrage senden
                    </button>
                </form>
            </CollapsibleCard>

            <div className="grid gap-4">
                {requests.length === 0 && (
                    <p className="text-gray-500">Keine Anfragen gefunden. Erstelle oben eine neue.</p>
                )}
                {requests.map((req: any) => {
                    const acceptedOffer = req.offers.find((o: any) => o.status === 'ACCEPTED')

                    return (
                        <CollapsibleCard key={req.id} title={req.title} subtitle={req.description} badge={statusBadge(req.status)}>
                            {req.framework && req.expert && req.expertId && (
                                <div className="mb-4 max-w-lg">
                                    <ProfileLinkRow
                                        userId={req.expertId}
                                        name={req.expert.name}
                                        avatarUrl={req.expert.profile?.avatarUrl}
                                        label="Experte"
                                    />
                                </div>
                            )}

                            {req.images && req.images.length > 0 && (
                                <div className="mt-2 flex gap-4 overflow-x-auto pb-2">
                                    {req.images.map((img: any) => (
                                        <img
                                            key={img.id}
                                            src={img.url}
                                            alt="Request Image"
                                            className="h-32 w-32 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-zinc-700"
                                        />
                                    ))}
                                </div>
                            )}

                            <RequestFlowProgress status={req.status} hasFramework={!!req.framework} />

                            {req.framework && (
                                <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-xs text-gray-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-gray-300">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">Gutachten: </span>
                                    {req.framework.budget != null && <span>~{req.framework.budget} CHF · </span>}
                                    {req.framework.timeline && <span>{req.framework.timeline}</span>}
                                    {req.framework.attachmentUrl && (
                                        <a href={req.framework.attachmentUrl} target="_blank" className="ml-2 text-blue-600 hover:underline">
                                            📎
                                        </a>
                                    )}
                                </div>
                            )}

                            {req.expertId && !req.framework && (
                                <div className="mt-6">
                                    <Chat
                                        title={req.expert ? `Chat mit ${req.expert.name}` : 'Chat mit Experte'}
                                        otherUserProfileId={req.expertId}
                                        requestId={req.id}
                                        currentUserId={userId}
                                        otherUserId={req.expertId}
                                        initialMessages={req.messages || []}
                                    />
                                </div>
                            )}

                            {req.offers.length > 0 && req.status !== 'DONE' && (
                                <div className="mt-6">
                                    <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Erhaltene Angebote</h4>
                                    <div className="space-y-3">
                                        {req.offers.map((offer: any) => (
                                            <div
                                                key={offer.id}
                                                className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-800/80"
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <div className="text-lg font-bold text-gray-900 dark:text-white">{offer.amount} CHF</div>
                                                        <p className="mt-1 max-w-prose text-sm text-gray-600 dark:text-gray-400">{offer.description}</p>
                                                        {offer.attachmentUrl && (
                                                            <a
                                                                href={offer.attachmentUrl}
                                                                target="_blank"
                                                                className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                                                            >
                                                                📎 Anhang ansehen
                                                            </a>
                                                        )}
                                                    </div>
                                                    {offer.status === 'ACCEPTED' ? (
                                                        <span className="shrink-0 text-sm font-bold text-green-600">Angenommen</span>
                                                    ) : (
                                                        <form action={acceptOffer} className="shrink-0">
                                                            <input type="hidden" name="offerId" value={offer.id} />
                                                            <input type="hidden" name="requestId" value={req.id} />
                                                            <button
                                                                type="submit"
                                                                className="rounded bg-green-600 px-3 py-1.5 text-sm text-white transition hover:bg-green-700"
                                                            >
                                                                Annehmen
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>
                                                <div className="max-w-lg border-t border-gray-200/80 pt-3 dark:border-zinc-600/80">
                                                    <ProfileLinkRow
                                                        userId={offer.companyId}
                                                        name={offer.company.name}
                                                        avatarUrl={offer.company.profile?.avatarUrl}
                                                        label="Anbieter"
                                                    />
                                                </div>

                                                {offer.status === 'ACCEPTED' && (
                                                    <div className="mt-2 border-t border-gray-200 pt-4 dark:border-zinc-700">
                                                        <Chat
                                                            title={`Chat mit ${offer.company.name}`}
                                                            otherUserProfileId={offer.companyId}
                                                            requestId={req.id}
                                                            currentUserId={userId}
                                                            otherUserId={offer.companyId}
                                                            initialMessages={req.messages || []}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {req.status === 'DONE' && acceptedOffer && (
                                <div className="mt-6 flex flex-col gap-4">
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                        <p className="mb-3 text-center text-sm font-semibold text-green-800 dark:text-green-200">
                                            Arbeit erledigt
                                        </p>
                                        <div className="mx-auto max-w-lg">
                                            <ProfileLinkRow
                                                userId={acceptedOffer.companyId}
                                                name={acceptedOffer.company.name}
                                                avatarUrl={acceptedOffer.company.profile?.avatarUrl}
                                                label="Unternehmen"
                                                subtitle={`${acceptedOffer.amount} CHF vereinbart`}
                                            />
                                        </div>
                                        {acceptedOffer.executionDate && (
                                            <p className="mt-3 text-center text-sm font-bold text-blue-700 dark:text-blue-300">
                                                📅 Ausführungstermin: {new Date(acceptedOffer.executionDate).toLocaleString()}
                                            </p>
                                        )}

                                        <div className="mt-4 border-t border-green-200 pt-4 dark:border-green-800">
                                            <Chat
                                                title={`Chat mit ${acceptedOffer.company.name}`}
                                                otherUserProfileId={acceptedOffer.companyId}
                                                requestId={req.id}
                                                currentUserId={userId}
                                                otherUserId={acceptedOffer.companyId}
                                                initialMessages={req.messages || []}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-gray-100 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                                        <h4 className="mb-3 text-sm font-semibold dark:text-gray-200">Unternehmen bewerten</h4>
                                        <form action={submitReview} className="flex flex-wrap items-end gap-4">
                                            <input type="hidden" name="companyId" value={acceptedOffer.companyId} />
                                            <div className="min-w-[200px] flex-1">
                                                <input
                                                    name="comment"
                                                    required
                                                    placeholder="Schreibe eine Bewertung..."
                                                    className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                                                />
                                            </div>
                                            <div className="w-20">
                                                <input
                                                    name="rating"
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    defaultValue="5"
                                                    required
                                                    className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
                                            >
                                                Bewerten
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </CollapsibleCard>
                    )
                })}
            </div>
        </div>
    )
}
