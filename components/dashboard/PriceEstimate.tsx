'use client'

import { useState, useEffect } from 'react'

interface PriceData {
  category: string
  complexity: string
  predicted_min: number
  predicted_max: number
  predicted_mean: number
  category_avg: number
  sample_count: number
  model_r2: number
}

export function PriceEstimate({
  category,
  description,
}: {
  category: string
  description: string
}) {
  const [data, setData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!category) {
      setData(null)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/predict-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, description }),
        })
        if (res.ok) {
          setData(await res.json())
        }
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [category, description])

  if (!category) return null

  if (loading) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800/50 dark:bg-blue-950/20">
        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Preisschätzung wird berechnet…
        </div>
      </div>
    )
  }

  if (!data) return null

  const complexityLabel =
    data.complexity === 'short' ? 'Klein' : data.complexity === 'medium' ? 'Mittel' : 'Gross'

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/20">
      <div className="mb-2 flex items-center gap-2">
        <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
        <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          ML-Preisschätzung
        </span>
        <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
          {complexityLabel}
        </span>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
          CHF {data.predicted_min.toLocaleString('de-CH')} – {data.predicted_max.toLocaleString('de-CH')}
        </div>
        <div className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-400">
          Durchschnitt: CHF {data.predicted_mean.toLocaleString('de-CH')}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-emerald-200 pt-2 text-xs text-emerald-600 dark:border-emerald-800/50 dark:text-emerald-500">
        <span>Basierend auf {data.sample_count} ähnlichen Aufträgen</span>
        <span>•</span>
        <span>Modell-Genauigkeit: {Math.round(data.model_r2 * 100)}%</span>
      </div>
    </div>
  )
}
