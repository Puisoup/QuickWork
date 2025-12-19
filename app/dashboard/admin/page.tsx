import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { deleteUser, deleteRequest } from './actions'

export default async function AdminDashboard() {
    // Verify Admin
    const cookieStore = await cookies()
    const role = cookieStore.get('quickwork_role')?.value
    if (role !== 'ADMIN') return <div className="p-8 text-red-500">Access Denied. Admins only.</div>

    // Fetch Data
    const [users, requests, offers] = await Promise.all([
        prisma.user.findMany(),
        prisma.request.findMany({ include: { customer: true, expert: true } }),
        prisma.offer.findMany()
    ])

    const stats = {
        totalUsers: users.length,
        totalRequests: requests.length,
        totalOffers: offers.length,
        pendingRequests: requests.filter((r: any) => r.status === 'OPEN').length
    }

    return (
        <div className="space-y-8">
            <header>
                <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-mono uppercase tracking-wider">Internal</span>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Konsole</h2>
                </div>
                <p className="text-gray-500">Plattform Übersicht und Verwaltung.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <div className="text-sm text-gray-500">Total Benutzer</div>
                    <div className="text-3xl font-bold dark:text-white">{stats.totalUsers}</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <div className="text-sm text-gray-500">Total Anfragen</div>
                    <div className="text-3xl font-bold dark:text-white">{stats.totalRequests}</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <div className="text-sm text-gray-500">Total Angebote</div>
                    <div className="text-3xl font-bold dark:text-white">{stats.totalOffers}</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <div className="text-sm text-gray-500">Offene Anfragen</div>
                    <div className="text-3xl font-bold text-yellow-500">{stats.pendingRequests}</div>
                </div>
            </div>

            {/* All Requests Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold dark:text-white">Alle Anfragen</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Titel</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Kunde</th>
                                <th className="px-6 py-3">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {requests.map((req: any) => (
                                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="px-6 py-3 font-mono text-xs text-gray-400">{req.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-3 font-medium dark:text-gray-200">{req.title}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs ${req.status === 'DONE' ? 'bg-purple-100 text-purple-800' :
                                            req.status === 'BIDDING' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>{req.status}</span>
                                    </td>
                                    <td className="px-6 py-3 dark:text-gray-400">{req.customer.email}</td>
                                    <td className="px-6 py-3">
                                        <form action={deleteRequest}>
                                            <input type="hidden" name="requestId" value={req.id} />
                                            <button className="text-red-500 hover:text-red-700 text-xs font-bold uppercase">Löschen</button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Directory */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold dark:text-white">Benutzerverzeichnis</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Rolle</th>
                                <th className="px-6 py-3">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {users.map((u: any) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="px-6 py-3 font-medium dark:text-gray-200">{u.name}</td>
                                    <td className="px-6 py-3 dark:text-gray-400">{u.email}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                            u.role === 'COMPANY' ? 'bg-indigo-100 text-indigo-800' :
                                                u.role === 'EXPERT' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>{u.role}</span>
                                    </td>
                                    <td className="px-6 py-3">
                                        {u.role !== 'ADMIN' && (
                                            <form action={deleteUser}>
                                                <input type="hidden" name="userId" value={u.id} />
                                                <button className="text-red-500 hover:text-red-700 text-xs font-bold uppercase">Löschen</button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
