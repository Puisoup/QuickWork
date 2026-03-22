import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createRequest, acceptOffer, submitReview } from './actions'
import Chat from '@/components/Chat'
import { RequestFlowProgress } from '@/components/RequestFlowProgress'

export default async function CustomerDashboard() {
    const cookieStore = await cookies()
    const userId = cookieStore.get('quickwork_user_id')?.value

    if (!userId) return <div>Please log in</div>

    const requests = await prisma.request.findMany({
        where: { customerId: userId },
        include: {
            offers: { include: { company: true } },
            expert: true,
            framework: true,
            images: true,
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Meine Anfragen</h2>
                <p className="text-gray-500">Verwalte deine Anfragen und sieh dir Angebote an.</p>
            </header>

            {/* Create New Request */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Neue Anfrage erstellen</h3>
                <form action={createRequest} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titel</label>
                        <input name="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="z.B. Dachreparatur" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Beschreibung</label>
                        <textarea name="description" required rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="Beschreibe dein Problem..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bild hochladen (Optional)</label>
                        <input name="image" type="file" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" />
                    </div>
                    <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 font-medium transition-colors">
                        Anfrage senden
                    </button>
                </form>
            </div>

            {/* Request List */}
            <div className="grid gap-6">
                {requests.length === 0 && <p className="text-gray-500">Keine Anfragen gefunden. Erstelle oben eine neue.</p>}
                {requests.map((req: any) => {
                    const acceptedOffer = req.offers.find((o: any) => o.status === 'ACCEPTED');

                    return (
                        <div key={req.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{req.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">{req.description}</p>

                                    {/* Images */}
                                    {req.images && req.images.length > 0 && (
                                        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                                            {req.images.map((img: any) => (
                                                <img
                                                    key={img.id}
                                                    src={img.url}
                                                    alt="Request Image"
                                                    className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-zinc-700"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${req.status === 'DONE' ? 'bg-purple-100 text-purple-800' :
                                    req.status === 'BIDDING' ? 'bg-blue-100 text-blue-800' :
                                        req.status === 'OPEN' ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                    {req.status}
                                </span>
                            </div>

                            <RequestFlowProgress status={req.status} hasFramework={!!req.framework} />

                            {req.framework && (
                                <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-xs text-gray-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-gray-300">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">Gutachten: </span>
                                    {req.framework.budget != null && <span>~{req.framework.budget} CHF · </span>}
                                    {req.framework.timeline && <span>{req.framework.timeline}</span>}
                                    {req.framework.attachmentUrl && (
                                        <a href={req.framework.attachmentUrl} target="_blank" className="ml-2 text-blue-600 hover:underline">📎</a>
                                    )}
                                </div>
                            )}

                            {/* Chat Section */}
                            {(req.expertId && !req.framework) && (
                                <div className="mt-6">
                                    <Chat
                                        title={`Chat mit Experte`}
                                        requestId={req.id}
                                        currentUserId={userId}
                                        otherUserId={req.expertId}
                                        initialMessages={req.messages || []}
                                    />
                                </div>
                            )}

                            {/* Offers Section (Only show if NOT done) */}
                            {req.offers.length > 0 && req.status !== 'DONE' && (
                                <div className="mt-6">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Erhaltene Angebote</h4>
                                    <div className="space-y-3">
                                        {req.offers.map((offer: any) => (
                                            <div key={offer.id} className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="font-bold text-lg dark:text-white">{offer.amount} CHF</div>
                                                        <div className="text-sm text-gray-500">
                                                            {offer.company.name} - {offer.description}
                                                            {offer.attachmentUrl && (
                                                                <a href={offer.attachmentUrl} target="_blank" className="text-blue-600 hover:underline ml-2 text-xs">📎 Anhang ansehen</a>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {offer.status === 'ACCEPTED' ? (
                                                        <span className="text-green-600 font-bold text-sm">Angenommen</span>
                                                    ) : (
                                                        <form action={acceptOffer}>
                                                            <input type="hidden" name="offerId" value={offer.id} />
                                                            <input type="hidden" name="requestId" value={req.id} />
                                                            <button className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition">
                                                                Annehmen
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>

                                                {/* Chat with Company upon Acceptance */}
                                                {offer.status === 'ACCEPTED' && (
                                                    <div className="border-t border-gray-200 dark:border-zinc-700 pt-2 mt-2">
                                                        <Chat
                                                            title={`Chat mit ${offer.company.name}`}
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

                            {/* DONE State: Show Accepted Offer & Review Form */}
                            {req.status === 'DONE' && acceptedOffer && (
                                <div className="mt-6 flex flex-col gap-4">

                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <p className="text-green-800 dark:text-green-200 font-semibold text-center mb-1">
                                            Arbeit erledigt von {acceptedOffer.company.name}
                                        </p>
                                        <p className="text-center text-sm text-green-700 dark:text-green-300">
                                            Vereinbarter Preis: {acceptedOffer.amount} CHF
                                        </p>
                                        {acceptedOffer.executionDate && (
                                            <p className="text-center text-sm text-blue-700 dark:text-blue-300 font-bold mt-2">
                                                📅 Ausführungstermin: {new Date(acceptedOffer.executionDate).toLocaleString()}
                                            </p>
                                        )}

                                        <div className="mt-4 border-t border-green-200 dark:border-green-800 pt-4">
                                            <Chat
                                                title={`Chat mit ${acceptedOffer.company.name}`}
                                                requestId={req.id}
                                                currentUserId={userId}
                                                otherUserId={acceptedOffer.companyId}
                                                initialMessages={req.messages || []}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-100 dark:border-zinc-700">
                                        <h4 className="font-semibold text-sm mb-3 dark:text-gray-200">Unternehmen bewerten</h4>
                                        <form action={submitReview} className="flex gap-4 items-end">
                                            <input type="hidden" name="companyId" value={acceptedOffer.companyId} />
                                            <div className="flex-1">
                                                <input name="comment" required placeholder="Schreibe eine Bewertung..." className="w-full text-sm rounded-md border-gray-300 shadow-sm p-2 border dark:bg-zinc-900 dark:border-zinc-700" />
                                            </div>
                                            <div className="w-20">
                                                <input name="rating" type="number" min="1" max="5" defaultValue="5" required className="w-full text-sm rounded-md border-gray-300 shadow-sm p-2 border dark:bg-zinc-900 dark:border-zinc-700" />
                                            </div>
                                            <button className="bg-gray-900 dark:bg-white dark:text-black text-white px-4 py-2 rounded-md text-sm font-medium">
                                                Bewerten
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
