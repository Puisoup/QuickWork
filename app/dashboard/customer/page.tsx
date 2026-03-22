import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createRequest } from './actions'
import { CollapsibleCard } from '@/components/CollapsibleCard'
import { CustomerRequestTabs } from '@/components/dashboard/CustomerRequestTabs'
import { toCustomerBundle } from '@/app/dashboard/customer/bundle'

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
                ? 'border border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100'
                : status === 'BIDDING'
                  ? 'border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200'
                  : status === 'OPEN'
                    ? 'border border-amber-200/70 bg-amber-50/80 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100'
                    : 'border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200'
        return (
            <span className={`rounded-md px-2.5 py-1 text-xs font-medium tracking-wide ${cls}`}>{status}</span>
        )
    }

    return (
        <div className="mx-auto max-w-3xl space-y-10">
            <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Meine Anfragen</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Pro Auftrag: Registerkarten für Übersicht, Gutachten, Angebote, Nachrichten – bei abgeschlossenen
                    Aufträgen zusätzlich Abschluss und Bewertung.
                </p>
            </header>

            <CollapsibleCard title="Neue Anfrage erstellen" defaultOpen toggleTone="neutral" showOpenHint={false}>
                <form action={createRequest} className="space-y-5 pt-2">
                    <div>
                        <label className="mb-2 block text-base font-medium text-zinc-800 dark:text-zinc-200">Titel</label>
                        <input
                            name="title"
                            required
                            className="block w-full rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/25 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                            placeholder="z. B. Dach reparieren"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-base font-medium text-zinc-800 dark:text-zinc-200">Beschreibung</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            className="block w-full rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/25 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                            placeholder="Was soll erledigt werden?"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-base font-medium text-zinc-800 dark:text-zinc-200">Bild (optional)</label>
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            className="block w-full text-base text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-50 file:px-4 file:py-3 file:font-semibold file:text-amber-900 hover:file:bg-amber-100 dark:file:bg-amber-950/50 dark:file:text-amber-100"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-xl bg-amber-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-amber-600"
                    >
                        Anfrage senden
                    </button>
                </form>
            </CollapsibleCard>

            <div className="grid gap-6">
                {requests.length === 0 && (
                    <p className="text-lg text-zinc-500 dark:text-zinc-400">Noch keine Anfragen – oben kannst du eine erstellen.</p>
                )}
                {requests.map((req: any) => (
                    <CollapsibleCard key={req.id} title={req.title} subtitle={req.description} badge={statusBadge(req.status)}>
                        <CustomerRequestTabs bundle={toCustomerBundle(req)} userId={userId} />
                    </CollapsibleCard>
                ))}
            </div>
        </div>
    )
}
