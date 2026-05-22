'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

export function SearchBar() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [value, setValue] = useState(searchParams.get('search') ?? '')
    const debounced = useDebounce(value, 400)

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (debounced) {
            params.set('search', debounced)
        } else {
            params.delete('search')
        }
        router.replace(`?${params.toString()}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced])

    return (
        <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
            </span>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Anfragen durchsuchen..."
                className="w-full rounded-xl border border-zinc-200 py-2.5 pl-9 pr-4 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
            />
            {value && (
                <button
                    onClick={() => setValue('')}
                    className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    )
}
