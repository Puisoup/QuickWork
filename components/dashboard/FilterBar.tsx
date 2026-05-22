'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import { useDebounce } from '@/hooks/useDebounce'

interface FilterBarProps {
    regions: string[]
}

export function FilterBar({ regions }: FilterBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const category = searchParams.get('category') ?? ''
    const region = searchParams.get('region') ?? ''
    const sort = searchParams.get('sort') ?? ''

    const [budgetMin, setBudgetMin] = useState(searchParams.get('budgetMin') ?? '')
    const [budgetMax, setBudgetMax] = useState(searchParams.get('budgetMax') ?? '')
    const debouncedMin = useDebounce(budgetMin, 400)
    const debouncedMax = useDebounce(budgetMax, 400)

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        debouncedMin ? params.set('budgetMin', debouncedMin) : params.delete('budgetMin')
        router.replace(`?${params.toString()}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedMin])

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        debouncedMax ? params.set('budgetMax', debouncedMax) : params.delete('budgetMax')
        router.replace(`?${params.toString()}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedMax])

    function setParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.replace(`?${params.toString()}`)
    }

    function removeParam(key: string) {
        setParam(key, '')
    }

    const activeFilters = [
        category && { key: 'category', label: `Kategorie: ${category}` },
        region && { key: 'region', label: `Region: ${region}` },
        budgetMin && { key: 'budgetMin', label: `Budget ab: ${budgetMin} CHF` },
        budgetMax && { key: 'budgetMax', label: `Budget bis: ${budgetMax} CHF` },
        sort && { key: 'sort', label: sort === 'budget_desc' ? 'Budget: höchste zuerst' : sort === 'budget_asc' ? 'Budget: niedrigste zuerst' : sort === 'date_asc' ? 'Älteste zuerst' : '' },
    ].filter(Boolean) as { key: string; label: string }[]

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
                {/* Kategorie */}
                <select
                    value={category}
                    onChange={(e) => setParam('category', e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-blue-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                    <option value="">Alle Kategorien</option>
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                {/* Region */}
                <select
                    value={region}
                    onChange={(e) => setParam('region', e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-blue-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                    <option value="">Alle Regionen</option>
                    {regions.map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>

                {/* Budget Min */}
                <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="Budget ab (CHF)"
                    min={0}
                    className="w-40 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-blue-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />

                {/* Budget Max */}
                <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="Budget bis (CHF)"
                    min={0}
                    className="w-40 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-blue-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />

                {/* Sortierung */}
                <select
                    value={sort}
                    onChange={(e) => setParam('sort', e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-blue-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                    <option value="">Neueste zuerst</option>
                    <option value="date_asc">Älteste zuerst</option>
                    <option value="budget_desc">Budget: höchste zuerst</option>
                    <option value="budget_asc">Budget: niedrigste zuerst</option>
                </select>
            </div>

            {/* Aktive Filter Tags */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {activeFilters.map((f) => (
                        <span
                            key={f.key}
                            className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        >
                            {f.label}
                            <button
                                onClick={() => removeParam(f.key)}
                                className="ml-0.5 text-blue-400 hover:text-blue-700 dark:hover:text-blue-200"
                                aria-label={`Filter ${f.key} entfernen`}
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString())
                            ;['category', 'region', 'budgetMin', 'budgetMax', 'sort'].forEach((k) => params.delete(k))
                            router.replace(`?${params.toString()}`)
                        }}
                        className="rounded-full px-3 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                        Alle zurücksetzen
                    </button>
                </div>
            )}
        </div>
    )
}
