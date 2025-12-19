import { prisma } from '@/lib/prisma'
import { createOffer, setExecutionDate } from './actions'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Chat from '@/components/Chat'

export default async function CompanyDashboard(props: { searchParams: Promise<{ view?: string }> }) {
    const searchParams = await props.searchParams;
    // Role Protection
    const cookieStore = await cookies()
    const role = cookieStore.get('quickwork_role')?.value

    if (role !== 'COMPANY') {
        redirect('/dashboard/' + (role?.toLowerCase() || 'login'))
    }

    // Determine view mode
    const view = searchParams?.view || 'market' // 'market' (Bidding) or 'active' (My Jobs)
    const userId = cookieStore.get('quickwork_user_id')?.value

    // Fetch Requests based on View
    // Optimize query based on view to avoid fetching everything if possible, 
    // but for now let's keep it simple and filter in memory or minimal query adjustment.

    let whereClause: any = { status: 'BIDDING' }
    if (view === 'active') {
        // For active view, we want requests where we have an ACCEPTED offer
        // Prisma doesn't support complex cross-relation filtering easily in `where` at top level 
        // without some tricks. 
        // Let's fetch "all relevant" and filter. 
        // Or better: Find Offers first.
        // For PoC simplicity, let's just fetch all Bidding/Done requests and filter.
        whereClause = {
            OR: [
                { status: 'BIDDING' },
                { status: 'DONE' }
            ]
        }
    }

    const requests = await prisma.request.findMany({
        where: whereClause,
        include: {
            framework: true,
            expert: true,
            customer: true,
            images: true,
            offers: {
                where: {
                    companyId: userId
                }
            },
            messages: {
                where: {
                    OR: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                },
                orderBy: { createdAt: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Filter Logic
    const activeRequests = requests.filter((r: any) => r.offers.some((o: any) => o.companyId === userId && o.status === 'ACCEPTED'))
    const marketRequests = requests.filter((r: any) => r.status === 'BIDDING' && !r.offers.some((o: any) => o.companyId === userId && o.status === 'ACCEPTED'))

    const displayRequests = view === 'active' ? activeRequests : marketRequests
    const pageTitle = view === 'active' ? 'Meine Aktiven Aufträge' : 'Verfügbare Aufträge'

    return (
        <div className="space-y-8">
            <header>
                <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-mono uppercase tracking-wider">Company</span>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{pageTitle}</h2>
                </div>
                <p className="text-gray-500">
                    {view === 'active'
                        ? 'Verwalte deine laufenden Projekte und kommuniziere mit Kunden.'
                        : 'Finde neue Aufträge und erstelle Angebote.'}
                </p>
            </header>

            <div className="grid gap-6">
                {displayRequests.length === 0 && (
                    <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700">
                        <p className="text-gray-500">Keine Aufträge in dieser Ansicht.</p>
                        {view === 'active' && (
                            <a href="/dashboard/company" className="text-blue-600 hover:underline mt-2 inline-block">Zu den verfügbaren Aufträgen</a>
                        )}
                    </div>
                )}

                {displayRequests.map((req: any) => {
                    const myOffer = req.offers.find((o: any) => o.companyId === userId);
                    const isAccepted = myOffer?.status === 'ACCEPTED';

                    return (
                        <div key={req.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{req.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{req.description}</p>
                                    <div className="text-xs text-gray-400 mt-1">Kunde: {req.customer.name}</div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'DONE' ? 'bg-purple-100 text-purple-800' :
                                    isAccepted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {req.status === 'DONE' ? 'Abgeschlossen' : (isAccepted ? 'Aktiv' : 'Offen')}
                                </span>
                            </div>

                            {/* Images - RESTORED */}
                            {req.images && req.images.length > 0 && (
                                <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
                                    {req.images.map((img: any) => (
                                        <img
                                            key={img.id}
                                            src={img.url}
                                            alt="Request Image"
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-zinc-700 hover:scale-105 transition-transform"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Framework Details */}
                            {req.framework && (
                                <div className="mb-6 bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg text-sm border border-gray-100 dark:border-zinc-700">
                                    <h5 className="font-bold mb-2 text-gray-700 dark:text-gray-300">Experten-Gutachten</h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-gray-500 block text-xs">Budget-Schätzung</span>
                                            <span className="font-mono font-bold text-lg">{req.framework.budget ? `${req.framework.budget} CHF` : 'Keine Angabe'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-xs">Zeitrahmen</span>
                                            <span className="font-bold">{req.framework.timeline || 'Keine Angabe'}</span>
                                        </div>
                                    </div>
                                    {req.framework.description && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
                                            <span className="text-gray-500 block text-xs mb-1">Kommentar</span>
                                            <p className="italic text-gray-600 dark:text-gray-400">"{req.framework.description}"</p>
                                        </div>
                                    )}
                                    {req.framework.attachmentUrl && (
                                        <div className="mt-2 text-right">
                                            <a href={req.framework.attachmentUrl} target="_blank" className="text-xs text-blue-600 hover:underline">📎 Gutachten anzeigen</a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ACTIVE VIEW Specifics: Execution Date & Chat */}
                            {view === 'active' && isAccepted && (
                                <div className="grid md:grid-cols-2 gap-6 mt-6 border-t pt-6">
                                    <div>
                                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded border border-green-100 dark:border-green-900/30 mb-4">
                                            <h5 className="font-bold text-sm mb-2 text-green-800 dark:text-green-400">Dein angenommenes Angebot</h5>
                                            <div className="text-xl font-bold text-green-700 dark:text-green-300">{myOffer.amount} CHF</div>
                                            <div className="text-sm text-green-600 dark:text-green-500">{myOffer.description}</div>
                                        </div>

                                        {req.status !== 'DONE' && (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded border border-yellow-100 dark:border-yellow-900/30">
                                                <h5 className="font-bold text-sm mb-2 text-yellow-800 dark:text-yellow-500">Terminplanung</h5>
                                                {!myOffer.executionDate ? (
                                                    <form action={setExecutionDate} className="space-y-2">
                                                        <input type="hidden" name="offerId" value={myOffer.id} />
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Ausführungstermin wählen</label>
                                                            <input name="executionDate" type="datetime-local" required className="w-full text-sm border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" />
                                                        </div>
                                                        <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm w-full font-bold hover:bg-blue-700">Termin festlegen</button>
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
                                        <h5 className="font-bold text-sm mb-2 text-gray-700 dark:text-gray-300">Kommunikation</h5>
                                        <Chat
                                            title={`Chat mit ${req.customer.name}`}
                                            requestId={req.id}
                                            currentUserId={userId!}
                                            otherUserId={req.customerId}
                                            initialMessages={req.messages || []}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* MARKET VIEW Specifics: Bidding Form */}
                            {view !== 'active' && !isAccepted && (
                                <div className="mt-6 border-t pt-6">
                                    {!myOffer ? (
                                        <div>
                                            <h5 className="font-bold text-sm mb-3">Angebot abgeben</h5>
                                            <form action={createOffer} className="grid md:grid-cols-4 gap-4 items-end">
                                                <input type="hidden" name="requestId" value={req.id} />
                                                <div className="md:col-span-1">
                                                    <label className="block text-xs text-gray-500 mb-1">Betrag (CHF)</label>
                                                    <input name="amount" type="number" required placeholder="0.00" className="w-full text-sm border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs text-gray-500 mb-1">Beschreibung / Leistungen</label>
                                                    <input name="description" required placeholder="Wir bieten..." className="w-full text-sm border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700" />
                                                </div>
                                                <div className="md:col-span-3">
                                                    <label className="block text-xs text-gray-500 mb-1">Angebot/Dokument anhängen (Optional)</label>
                                                    <input name="attachment" type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                                                </div>
                                                <div className="md:col-span-1 flex items-end">
                                                    <button className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded text-sm font-bold w-full hover:opacity-80">
                                                        Bieten
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded border border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
                                            <div>
                                                <span className="block text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Dein Angebot</span>
                                                <span className="text-xl font-bold text-blue-800 dark:text-blue-300">{myOffer.amount} CHF</span>
                                                <span className="text-sm text-blue-600 dark:text-blue-400 ml-2">- {myOffer.description}</span>
                                            </div>
                                            <div className="px-3 py-1 bg-white dark:bg-zinc-800 rounded text-xs font-mono font-bold text-gray-500 shadow-sm">
                                                {myOffer.status}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
