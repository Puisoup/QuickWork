import type { Metadata } from "next";
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { UserMenu } from '@/components/UserMenu';

export const metadata: Metadata = {
    title: "QuickWork Dashboard",
    description: "User dashboard",
};

const ROLE_LABELS: Record<string, string> = {
    CUSTOMER: 'Kunde',
    EXPERT: 'Experte',
    COMPANY: 'Unternehmen',
    ADMIN: 'Admin',
}

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('quickwork_user_id')?.value
    const role = cookieStore.get('quickwork_role')?.value

    if (!userId) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
    })
    if (!user) {
        redirect('/login')
    }

    const roleLabel = role ? (ROLE_LABELS[role] ?? role) : ''

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-900 font-sans" data-role={role}>
            {/* Sidebar */}
            <aside
                className="w-64 shrink-0 border-r border-gray-200 dark:border-zinc-800 p-6 flex flex-col"
                style={{
                    backgroundColor: 'var(--role-sidebar-bg, #ffffff)',
                    borderLeft: '4px solid var(--role-600, #e5e7eb)',
                }}
            >
                <div className="mb-3 pl-2">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Quick<span style={{ color: 'var(--role-600, #eab308)' }}>Work</span>
                    </h1>
                </div>

                {roleLabel && (
                    <div className="mb-6 pl-2">
                        <span
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                            style={{
                                backgroundColor: 'var(--role-100, #fef3c7)',
                                color: 'var(--role-700, #92400e)',
                            }}
                        >
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: 'var(--role-600, #d97706)' }}
                            />
                            {roleLabel}
                        </span>
                    </div>
                )}

                <nav className="flex-1 space-y-1">
                    {role === 'CUSTOMER' && (
                        <Link href="/dashboard/customer" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            Meine Anfragen
                        </Link>
                    )}
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
            </aside>

            {/* Main: accent bar + top bar + content */}
            <div className="flex min-w-0 flex-1 flex-col">
                <div style={{ height: '3px', backgroundColor: 'var(--role-600, #e5e7eb)', flexShrink: 0 }} />
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 sm:px-8">
                    {roleLabel && (
                        <span
                            className="hidden text-sm font-semibold sm:block"
                            style={{ color: 'var(--role-600, #6b7280)' }}
                        >
                            {roleLabel}
                        </span>
                    )}
                    <div className="ml-auto">
                        <UserMenu
                            userName={user.name}
                            userId={user.id}
                            avatarUrl={user.profile?.avatarUrl ?? null}
                        />
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6 sm:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
