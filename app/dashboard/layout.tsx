import type { Metadata } from "next";
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: "QuickWork Dashboard",
    description: "User dashboard",
};

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Simple protection
    const cookieStore = await cookies();
    const userId = cookieStore.get('quickwork_user_id')?.value
    const role = cookieStore.get('quickwork_role')?.value

    if (!userId) {
        redirect('/login')
    }

    const logout = async () => {
        'use server'
        const c = await cookies()
        c.delete('quickwork_user_id')
        c.delete('quickwork_role')
        redirect('/')
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-900 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-zinc-800 p-6 flex flex-col">
                <div className="mb-8 pl-2">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Quick<span className="text-yellow-500">Work</span>
                    </h1>
                </div>

                <nav className="flex-1 space-y-1">
                    {role === 'CUSTOMER' && (
                        <Link href="/dashboard/customer" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            Meine Anfragen
                        </Link>
                    )}
                    {/* Expert & Company links should ideally be conditional, but for now we show all or rely on page-level checks. 
                        Ideally we'd assume role separation in UI too. 
                        Let's keep it simple and translated. 
                    */}
                    {role === 'EXPERT' && (
                        <Link href="/dashboard/expert" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            Gutachten
                        </Link>
                    )}
                    {role === 'COMPANY' && (
                        <>
                            <Link href="/dashboard/company?view=active" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                Meine Aufträge
                            </Link>
                            <Link href="/dashboard/company" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                Aufträge finden
                            </Link>
                        </>
                    )}
                    {role === 'ADMIN' && (
                        <Link href="/dashboard/admin" className="block px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                            Admin Konsole
                        </Link>
                    )}
                </nav>

                <div className="mt-auto border-t border-gray-200 dark:border-zinc-800 pt-6">
                    <div className="mb-4 px-4 text-xs text-gray-500">
                        Angemeldet als: <span className="font-bold">{role}</span>
                    </div>
                    <form action={logout}>
                        <button type="submit" className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-md hover:opacity-80 transition-opacity">
                            Abmelden
                        </button>
                    </form>
                </div>
            </aside>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
