'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export function ViewSwitcher({ view }: { view: string }) {
    const searchParams = useSearchParams()

    function hrefFor(newView: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (newView === 'market') {
            params.delete('view')
        } else {
            params.set('view', newView)
        }
        const qs = params.toString()
        return `/dashboard/company${qs ? `?${qs}` : ''}`
    }

    const base = 'rounded-lg px-4 py-2 text-sm font-medium transition-colors'
    const active = 'bg-emerald-600 text-white shadow-sm'
    const inactive = 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'

    return (
        <div className="flex gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-900">
            <Link href={hrefFor('market')} className={`${base} ${view !== 'active' ? active : inactive}`}>
                Aufträge finden
            </Link>
            <Link href={hrefFor('active')} className={`${base} ${view === 'active' ? active : inactive}`}>
                Meine Aufträge
            </Link>
        </div>
    )
}
