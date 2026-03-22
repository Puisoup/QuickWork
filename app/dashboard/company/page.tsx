import { prisma } from '@/lib/prisma'
import { createOffer, setExecutionDate } from './actions'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Chat from '@/components/Chat'
import { CollapsibleCard } from '@/components/CollapsibleCard'
import { ProfileLinkRow } from '@/components/ProfileLinkRow'

const profileSelect = { select: { avatarUrl: true } as const }

export default async function CompanyDashboard(props: { searchParams: Promise<{ view?: string }> }) {
    const searchParams = await props.searchParams
    const cookieStore = await cookies()
    const role = cookieStore.get('quickwork_role')?.value

    if (role !== 'COMPANY') {
        redirect('/dashboard/' + (role?.toLowerCase() || 'login'))
    }

    const view = searchParams?.view || 'market'
    const userId = cookieStore.get('quickwork_user_id')?.value

    let whereClause: any = { status: 'BIDDING' }
    if (view === 'active') {
        whereClause = {
            OR: [{ status: 'BIDDING' }, { status: 'DONE' }],
        }
    }

    const requests = await prisma.request.findMany({
        where: whereClause,
        include: {
            framework: true,
            expert: { include: { profile: profileSelect } },
            customer: { include: { profile: profileSelect } },
            images: true,
            offers: {
                where: {
                    companyId: userId,
                },
            },
            messages: {
                where: {
                    OR: [{ senderId: userId }, { receiverId: userId }],
                },
                orderBy: { createdAt: 'asc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    const activeRequests = requests.filter((r: any) =>
        r.offers.some((o: any) => o.companyId === userId && o.status === 'ACCEPTED'),
    )
    const marketRequests = requests.filter(
        (r: any) => r.status === 'BIDDING' && !r.offers.some((o: any) => o.companyId === userId && o.status === 'ACCEPTED'),
    )

    const displayRequests = view === 'active' ? activeRequests : marketRequests
    const pageTitle = view === 'active' ? 'Meine Aktiven Aufträge' : 'Verfügbare Aufträge'

    return (
        <div className="space-y-8">
            <header>
                <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-100 px-2 py-1 font-mono text-xs uppercase tracking-wider text-blue-800">
                        Company
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{pageTitle}</h2>
                </div>
                <p className="text-gray-500">
                    {view === 'active'
                        ? 'Verwalte deine laufenden Projekte und kommuniziere mit Kunden.'
                        : 'Finde neue Aufträge und erstelle Angebote.'}
                </p>
            </header>

            <div className="grid gap-4">
                {displayRequests.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
                        <p className="text-gray-500">Keine Aufträge in dieser Ansicht.</p>
                        {view === 'active' && (
                            <a href="/dashboard/company" className="mt-2 inline-block text-blue-600 hover:underline">
                                Zu den verfügbaren Aufträgen
                            </a>
                        )}
                    </div>
                )}

                {displayRequests.map((req: any) => {
                    const myOffer = req.offers.find((o: any) => o.companyId === userId)
                    const isAccepted = myOffer?.status === 'ACCEPTED'

                    const statusBadge = (
                        <span
                            className={`rounded px-2 py-1 text-xs font-bold ${
                                req.status === 'DONE'
                                    ? 'bg-purple-100 text-purple-800'
                                    : isAccepted
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-blue-100 text-blue-800'
                            }`}
                        >
                            {req.status === 'DONE' ? 'Abgeschlossen' : isAccepted ? 'Aktiv' : 'Offen'}
                        </span>
                    )

                    return (
                        <CollapsibleCard key={req.id} title={req.title} subtitle={req.description} badge={statusBadge}>
                            <div className="mb-4 max-w-lg">
                                <ProfileLinkRow
                                    userId={req.customerId}
                                    name={req.customer.name}
                                    avatarUrl={req.customer.profile?.avatarUrl}
                                    label="Kunde"
                                />
                            </div>

                            {req.images && req.images.length > 0 && (
                                <div className="mb-4 flex gap-4 overflow-x-auto pb-2">
                                    {req.images.map((img: any) => (
                                        <img
                                            key={img.id}
                                            src={img.url}
                                            alt="Request Image"
                                            className="h-32 w-32 shrink-0 rounded-lg border border-gray-200 object-cover transition-transform hover:scale-105 dark:border-zinc-700"
                                        />
                                    ))}
                                </div>
                            )}

                            {req.framework && (
                                <div className="mb-6 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                                    <h5 className="mb-2 font-bold text-gray-700 dark:text-gray-300">Experten-Gutachten</h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="block text-xs text-gray-500">Budget-Schätzung</span>
                                            <span className="font-mono text-lg font-bold">
                                                {req.framework.budget ? `${req.framework.budget} CHF` : 'Keine Angabe'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500">Zeitrahmen</span>
                                            <span className="font-bold">{req.framework.timeline || 'Keine Angabe'}</span>
                                        </div>
                                    </div>
                                    {req.framework.description && (
                                        <div className="mt-3 border-t border-gray-200 pt-3 dark:border-zinc-700">
                                            <span className="mb-1 block text-xs text-gray-500">Kommentar</span>
                                            <p className="italic text-gray-600 dark:text-gray-400">&quot;{req.framework.description}&quot;</p>
                                        </div>
                                    )}
                                    {req.framework.attachmentUrl && (
                                        <div className="mt-2 text-right">
                                            <a href={req.framework.attachmentUrl} target="_blank" className="text-xs text-blue-600 hover:underline">
                                                📎 Gutachten anzeigen
                                            </a>
                                        </div>
                                    )}
                                    {req.expert && req.expertId && (
                                        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-zinc-700">
                                            <ProfileLinkRow
                                                userId={req.expertId}
                                                name={req.expert.name}
                                                avatarUrl={req.expert.profile?.avatarUrl}
                                                label="Experte"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {view === 'active' && isAccepted && (
                                <div className="mt-6 grid gap-6 border-t pt-6 md:grid-cols-2">
                                    <div>
                                        <div className="mb-4 rounded border border-green-100 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
                                            <h5 className="mb-2 text-sm font-bold text-green-800 dark:text-green-400">
                                                Dein angenommenes Angebot
                                            </h5>
                                            <div className="text-xl font-bold text-green-700 dark:text-green-300">{myOffer.amount} CHF</div>
                                            <div className="text-sm text-green-600 dark:text-green-500">{myOffer.description}</div>
                                        </div>

                                        {req.status !== 'DONE' && (
                                            <div className="rounded border border-yellow-100 bg-yellow-50 p-4 dark:border-yellow-900/30 dark:bg-yellow-900/10">
                                                <h5 className="mb-2 text-sm font-bold text-yellow-800 dark:text-yellow-500">Terminplanung</h5>
                                                {!myOffer.executionDate ? (
                                                    <form action={setExecutionDate} className="space-y-2">
                                                        <input type="hidden" name="offerId" value={myOffer.id} />
                                                        <div>
                                                            <label className="mb-1 block text-xs text-gray-500">Ausführungstermin wählen</label>
                                                            <input
                                                                name="executionDate"
                                                                type="datetime-local"
                                                                required
                                                                className="w-full rounded border p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                                                            />
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            className="w-full rounded bg-blue-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-blue-700"
                                                        >
                                                            Termin festlegen
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <div className="text-sm font-bold text-blue-700 dark:text-blue-400">
                                                        📅 Termin: {new Date(myOffer.executionDate).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h5 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">Kommunikation</h5>
                                        <Chat
                                            title={`Chat mit ${req.customer.name}`}
                                            otherUserProfileId={req.customerId}
                                            requestId={req.id}
                                            currentUserId={userId!}
                                            otherUserId={req.customerId}
                                            initialMessages={req.messages || []}
                                        />
                                    </div>
                                </div>
                            )}

                            {view !== 'active' && !isAccepted && (
                                <div className="mt-6 border-t pt-6">
                                    {!myOffer ? (
                                        <div>
                                            <h5 className="mb-3 font-bold">Angebot abgeben</h5>
                                            <form action={createOffer} className="grid items-end gap-4 md:grid-cols-4">
                                                <input type="hidden" name="requestId" value={req.id} />
                                                <div className="md:col-span-1">
                                                    <label className="mb-1 block text-xs text-gray-500">Betrag (CHF)</label>
                                                    <input
                                                        name="amount"
                                                        type="number"
                                                        required
                                                        placeholder="0.00"
                                                        className="w-full rounded border p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="mb-1 block text-xs text-gray-500">Beschreibung / Leistungen</label>
                                                    <input
                                                        name="description"
                                                        required
                                                        placeholder="Wir bieten..."
                                                        className="w-full rounded border p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                                                    />
                                                </div>
                                                <div className="md:col-span-3">
                                                    <label className="mb-1 block text-xs text-gray-500">
                                                        Angebot/Dokument anhängen (Optional)
                                                    </label>
                                                    <input
                                                        name="attachment"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.jpg,.png"
                                                        className="w-full text-xs text-gray-500 file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:text-xs file:text-gray-700 hover:file:bg-gray-200"
                                                    />
                                                </div>
                                                <div className="flex items-end md:col-span-1">
                                                    <button
                                                        type="submit"
                                                        className="w-full rounded bg-black px-4 py-2 text-sm font-bold text-white hover:opacity-80 dark:bg-white dark:text-black"
                                                    >
                                                        Offerieren
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between rounded border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                                            <div>
                                                <span className="block text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                                    Dein Angebot
                                                </span>
                                                <span className="text-xl font-bold text-blue-800 dark:text-blue-300">{myOffer.amount} CHF</span>
                                                <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">- {myOffer.description}</span>
                                            </div>
                                            <div className="rounded bg-white px-3 py-1 font-mono text-xs font-bold text-gray-500 shadow-sm dark:bg-zinc-800">
                                                {myOffer.status}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CollapsibleCard>
                    )
                })}
            </div>
        </div>
    )
}
