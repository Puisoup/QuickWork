import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createRequest } from './actions'
import { CollapsibleCard } from '@/components/CollapsibleCard'
import { CustomerRequestTabs } from '@/components/dashboard/CustomerRequestTabs'
import { toCustomerBundle } from '@/app/dashboard/customer/bundle'
import { CreateRequestForm } from '@/components/dashboard/CreateRequestForm'

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
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300'
                : status === 'BIDDING'
                  ? 'border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300'
                  : status === 'VISIT_PLANNED'
                    ? 'border border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800/50 dark:bg-violet-950/30 dark:text-violet-300'
                    : status === 'OPEN'
                      ? 'border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/50 dark:bg-blue-950/30 dark:text-blue-300'
                      : 'border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200'
        const label =
            status === 'DONE' ? 'Abgeschlossen'
            : status === 'BIDDING' ? 'Angebote'
            : status === 'VISIT_PLANNED' ? 'Besichtigung'
            : status === 'OPEN' ? 'Offen'
            : status
        return (
            <span className={`rounded-md px-2.5 py-1 text-xs font-medium tracking-wide ${cls}`}>{label}</span>
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
                <CreateRequestForm action={createRequest} />
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
