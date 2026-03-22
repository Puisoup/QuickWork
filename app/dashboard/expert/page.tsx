import { prisma } from '@/lib/prisma'
import { createFramework } from './actions'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Chat from '@/components/Chat'

export default async function ExpertDashboard() {
    // Role Protection
    const cookieStore = await cookies()
    const role = cookieStore.get('quickwork_role')?.value

    if (role !== 'EXPERT') {
        redirect('/dashboard/' + (role?.toLowerCase() || 'login'))
    }

    const expertUserId = cookieStore.get('quickwork_user_id')?.value ?? ''

    // Find requests that need a framework (Status OPEN, no framework yet)
    const requests = await prisma.request.findMany({
        where: {
            status: 'OPEN'
        },
        include: {
            customer: true,
            framework: true,
            images: true,
            messages: {
                where: {
                    OR: [
                        { senderId: cookieStore.get('quickwork_user_id')?.value },
                        { receiverId: cookieStore.get('quickwork_user_id')?.value }
                    ]
                },
                orderBy: { createdAt: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    const publishedWhere = {
        expertId: expertUserId,
        framework: { isNot: null } as const,
    }

    const [publishedCount, recentlyPublished] = await Promise.all([
        prisma.request.count({ where: publishedWhere }),
        prisma.request.findMany({
            where: publishedWhere,
            include: { customer: true, framework: true },
            orderBy: { updatedAt: 'desc' },
            take: 6,
        }),
    ])

    return (
        <div className="space-y-8">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-mono uppercase tracking-wider">Expert</span>
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

            {/* Open Requests List */}
            <div className="grid gap-6">
                {requests.length === 0 && <p className="text-gray-500">Keine offenen Anfragen zur Überprüfung.</p>}

                {requests.map((req: any) => (
                    <div key={req.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                        <div className="mb-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{req.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                        {req.status}
                                    </span>
                                    <time dateTime={req.createdAt.toISOString()}>
                                        {req.createdAt.toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' })}
                                    </time>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">{req.description}</p>

                            {/* Images */}
                            {req.images && req.images.length > 0 && (
                                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                                    {req.images.map((img: any) => (
                                        <img
                                            key={img.id}
                                            src={img.url}
                                            alt="Request Image"
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-zinc-700 hover:scale-105 transition-transform cursor-pointer"
                                            title="Klicken zum Vergrößern"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="text-xs text-gray-400 mt-2">Kunde: {req.customer.name}</div>
                        </div>

                        {!req.framework ? (
                            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex flex-1 items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white">1</span>
                                        <div className="h-0.5 flex-1 bg-yellow-300 dark:bg-yellow-700" />
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-300 text-xs font-bold text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300">2</span>
                                    </div>
                                </div>
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-500 mb-3">
                                    {req.status === 'VISIT_PLANNED' ? 'Nach Besichtigung' : 'Offen'}
                                </h4>

                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-zinc-800 p-4 border rounded-lg">
                                        <h5 className="font-bold text-sm mb-2 text-blue-600 dark:text-blue-400">1 · Chat</h5>
                                        <Chat
                                            requestId={req.id}
                                            currentUserId={cookieStore.get('quickwork_user_id')?.value!}
                                            otherUserId={req.customerId}
                                            initialMessages={req.messages || []}
                                        />
                                    </div>

                                    <div className="border-t border-yellow-100 pt-4 dark:border-yellow-900/30">
                                        <h5 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">2 · Gutachten</h5>
                                        <form action={createFramework} className="space-y-3">
                                            <input type="hidden" name="requestId" value={req.id} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500">Budget (CHF)</label>
                                                    <input name="budget" type="number" required placeholder="1000" className="w-full text-sm border p-1 rounded" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500">Zeitrahmen</label>
                                                    <input name="timeline" type="text" required placeholder="7 Tage" className="w-full text-sm border p-1 rounded" />
                                                </div>
                                            </div>
                                            <textarea name="comment" required rows={2} placeholder="Expertenkommentar..." className="w-full text-sm border p-1 rounded" />
                                            <div className="mt-2">
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-400">Datei anhängen (z.B. nach Besichtigung)</label>
                                                <input name="attachment" type="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" />
                                            </div>
                                            <button className="bg-black dark:bg-white dark:text-black text-white px-3 py-2 rounded text-sm font-bold w-full mt-2">
                                                Freigeben → Markt öffnet
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-900/30 flex justify-between items-center">
                                <div>
                                    <div className="text-green-800 dark:text-green-400 font-bold">Gutachten erstellt</div>
                                    <div className="text-sm text-green-700 dark:text-green-500">Budget: ~{req.framework.budget} CHF | Zeit: {req.framework.timeline}</div>
                                </div>
                                <span className="text-2xl">✅</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {recentlyPublished.length > 0 && (
                <section className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Zuletzt freigegeben</h3>
                    <ul className="grid gap-2">
                        {recentlyPublished.map((r) => (
                            <li
                                key={r.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">{r.title}</span>
                                <span className="text-xs text-zinc-500">
                                    {r.customer.name} · {r.framework?.budget != null ? `~${r.framework.budget} CHF` : '—'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    )
}
