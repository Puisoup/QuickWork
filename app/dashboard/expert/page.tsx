import { prisma } from '@/lib/prisma'
import { createFramework, scheduleVisit } from './actions'
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

    return (
        <div className="space-y-8">
            <header>
                <div className="flex items-center gap-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-mono uppercase tracking-wider">Expert</span>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gutachten Dashboard</h2>
                </div>
                <p className="text-gray-500">Erstelle Rahmenbedingungen für Kundenanfragen.</p>
            </header>

            {/* Open Requests List */}
            <div className="grid gap-6">
                {requests.length === 0 && <p className="text-gray-500">Keine offenen Anfragen zur Überprüfung.</p>}

                {requests.map((req: any) => (
                    <div key={req.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{req.title}</h3>
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
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-500 mb-3">
                                    {req.status === 'VISIT_PLANNED' ? 'Gutachten nach Besichtigung erstellen' : 'Aktion wählen'}
                                </h4>

                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-zinc-800 p-4 border rounded-lg">
                                        <h5 className="font-bold text-sm mb-2 text-blue-600">Chat mit Kunden</h5>
                                        <p className="text-xs text-gray-500 mb-2">Nutze den Chat, um Details zu klären oder eine Besichtigung zu vereinbaren.</p>
                                        <Chat
                                            requestId={req.id}
                                            currentUserId={cookieStore.get('quickwork_user_id')?.value!}
                                            otherUserId={req.customerId}
                                            initialMessages={req.messages || []}
                                        />
                                    </div>

                                    <div className="border-t pt-4">
                                        <h5 className="font-bold text-sm mb-2">Spezifikationen festlegen & Freigeben</h5>
                                        <p className="text-xs text-gray-500 mb-2">Sobald alles geklärt ist (Remote oder nach Besuch), erstelle das Gutachten hier.</p>
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
                                                Gutachten veröffentlichen (An Unternehmen)
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
        </div>
    )
}
