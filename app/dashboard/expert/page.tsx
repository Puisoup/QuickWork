import { prisma } from '@/lib/prisma'
import { createFramework } from './actions'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Chat from '@/components/Chat'
import { CollapsibleCard } from '@/components/CollapsibleCard'
import { ProfileLinkRow } from '@/components/ProfileLinkRow'

const profileSelect = { select: { avatarUrl: true } as const }

export default async function ExpertDashboard() {
    const cookieStore = await cookies()
    const role = cookieStore.get('quickwork_role')?.value

    if (role !== 'EXPERT') {
        redirect('/dashboard/' + (role?.toLowerCase() || 'login'))
    }

    const expertUserId = cookieStore.get('quickwork_user_id')?.value ?? ''

    const requests = await prisma.request.findMany({
        where: {
            status: 'OPEN',
        },
        include: {
            customer: { include: { profile: profileSelect } },
            framework: true,
            images: true,
            messages: {
                where: {
                    OR: [{ senderId: expertUserId }, { receiverId: expertUserId }],
                },
                orderBy: { createdAt: 'asc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    const publishedWhere = {
        expertId: expertUserId,
        framework: { isNot: null } as const,
    }

    const [publishedCount, recentlyPublished] = await Promise.all([
        prisma.request.count({ where: publishedWhere }),
        prisma.request.findMany({
            where: publishedWhere,
            include: { customer: { include: { profile: profileSelect } }, framework: true },
            orderBy: { updatedAt: 'desc' },
            take: 6,
        }),
    ])

    return (
        <div className="space-y-8">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-yellow-100 px-2 py-1 font-mono text-xs font-bold uppercase tracking-wider text-yellow-800">
                            Expert
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gutachten</h2>
                    </div>
                </div>
                <div className="flex gap-3 text-sm">
                    <span className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 font-medium text-yellow-900 dark:border-yellow-900/50 dark:bg-yellow-950/40 dark:text-yellow-100">
                        Offen: {requests.length}
                    </span>
                    <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
                        Freigegeben: {publishedCount}
                    </span>
                </div>
            </header>

            <div className="grid gap-4">
                {requests.length === 0 && <p className="text-gray-500">Keine offenen Anfragen zur Überprüfung.</p>}

                {requests.map((req: any) => (
                    <CollapsibleCard
                        key={req.id}
                        title={req.title}
                        subtitle={req.description}
                        badge={
                            <div className="flex flex-col items-end gap-1 text-right text-xs text-gray-500 dark:text-gray-400">
                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                    {req.status}
                                </span>
                                <time dateTime={req.createdAt.toISOString()} className="tabular-nums">
                                    {req.createdAt.toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' })}
                                </time>
                            </div>
                        }
                    >
                        <div className="mb-4 max-w-lg">
                            <ProfileLinkRow
                                userId={req.customerId}
                                name={req.customer.name}
                                avatarUrl={req.customer.profile?.avatarUrl}
                                label="Kunde"
                            />
                        </div>

                        {req.images && req.images.length > 0 && (
                            <div className="mt-2 flex gap-4 overflow-x-auto pb-2">
                                {req.images.map((img: any) => (
                                    <img
                                        key={img.id}
                                        src={img.url}
                                        alt="Request Image"
                                        className="h-32 w-32 shrink-0 cursor-pointer rounded-lg border border-gray-200 object-cover transition-transform hover:scale-105 dark:border-zinc-700"
                                        title="Klicken zum Vergrößern"
                                    />
                                ))}
                            </div>
                        )}

                        {!req.framework ? (
                            <div className="mt-4 rounded-lg border border-yellow-100 bg-yellow-50 p-4 dark:border-yellow-900/30 dark:bg-yellow-900/10">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex flex-1 items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white">
                                            1
                                        </span>
                                        <div className="h-0.5 flex-1 bg-yellow-300 dark:bg-yellow-700" />
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-300 text-xs font-bold text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300">
                                            2
                                        </span>
                                    </div>
                                </div>
                                <h4 className="mb-3 font-semibold text-yellow-800 dark:text-yellow-500">
                                    {req.status === 'VISIT_PLANNED' ? 'Nach Besichtigung' : 'Offen'}
                                </h4>

                                <div className="space-y-6">
                                    <div className="rounded-lg border bg-white p-4 dark:bg-zinc-800">
                                        <h5 className="mb-2 text-sm font-bold text-blue-600 dark:text-blue-400">1 · Chat</h5>
                                        <Chat
                                            title={`Chat mit ${req.customer.name}`}
                                            otherUserProfileId={req.customerId}
                                            requestId={req.id}
                                            currentUserId={expertUserId}
                                            otherUserId={req.customerId}
                                            initialMessages={req.messages || []}
                                        />
                                    </div>

                                    <div className="border-t border-yellow-100 pt-4 dark:border-yellow-900/30">
                                        <h5 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">2 · Gutachten</h5>
                                        <form action={createFramework} className="space-y-3">
                                            <input type="hidden" name="requestId" value={req.id} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500">Budget (CHF)</label>
                                                    <input
                                                        name="budget"
                                                        type="number"
                                                        required
                                                        placeholder="1000"
                                                        className="w-full rounded border p-1 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500">Zeitrahmen</label>
                                                    <input
                                                        name="timeline"
                                                        type="text"
                                                        required
                                                        placeholder="7 Tage"
                                                        className="w-full rounded border p-1 text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <textarea
                                                name="comment"
                                                required
                                                rows={2}
                                                placeholder="Expertenkommentar..."
                                                className="w-full rounded border p-1 text-sm"
                                            />
                                            <div className="mt-2">
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-400">
                                                    Datei anhängen (z.B. nach Besichtigung)
                                                </label>
                                                <input
                                                    name="attachment"
                                                    type="file"
                                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-yellow-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-yellow-700 hover:file:bg-yellow-100"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="mt-2 w-full rounded bg-black px-3 py-2 text-sm font-bold text-white dark:bg-white dark:text-black"
                                            >
                                                Freigeben → Markt öffnet
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 flex items-center justify-between rounded-lg border border-green-100 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
                                <div>
                                    <div className="font-bold text-green-800 dark:text-green-400">Gutachten erstellt</div>
                                    <div className="text-sm text-green-700 dark:text-green-500">
                                        Budget: ~{req.framework.budget} CHF | Zeit: {req.framework.timeline}
                                    </div>
                                </div>
                                <span className="text-2xl">✅</span>
                            </div>
                        )}
                    </CollapsibleCard>
                ))}
            </div>

            {recentlyPublished.length > 0 && (
                <CollapsibleCard
                    title="Zuletzt freigegeben"
                    subtitle="Kürzlich veröffentlichte Gutachten"
                    defaultOpen
                    toggleTone="neutral"
                    showOpenHint={false}
                >
                    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {recentlyPublished.map((r) => (
                            <li key={r.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">{r.title}</div>
                                <ProfileLinkRow
                                    userId={r.customerId}
                                    name={r.customer.name}
                                    avatarUrl={r.customer.profile?.avatarUrl}
                                    label="Kunde"
                                    subtitle={r.framework?.budget != null ? `~${r.framework.budget} CHF` : undefined}
                                />
                            </li>
                        ))}
                    </ul>
                </CollapsibleCard>
            )}
        </div>
    )
}
