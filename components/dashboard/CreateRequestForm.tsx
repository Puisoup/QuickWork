'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import { PriceEstimate } from './PriceEstimate'

export function CreateRequestForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>
}) {
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  return (
    <form action={action} className="space-y-5 pt-2">
      <div>
        <label className="mb-2 block text-base font-medium text-zinc-800 dark:text-zinc-200">
          Titel
        </label>
        <input
          name="title"
          required
          className="block w-full rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          placeholder="z. B. Dach reparieren"
        />
      </div>
      <div>
        <label className="mb-2 block text-base font-medium text-zinc-800 dark:text-zinc-200">
          Beschreibung
        </label>
        <textarea
          name="description"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          placeholder="Was soll erledigt werden?"
        />
      </div>
      <div>
        <label className="mb-2 block text-base font-medium text-zinc-800 dark:text-zinc-200">
          Kategorie
        </label>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="block w-full rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        >
          <option value="">Keine Angabe</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <PriceEstimate category={category} description={description} />

      <div>
        <label className="mb-2 block text-base font-medium text-zinc-800 dark:text-zinc-200">
          Bild (optional)
        </label>
        <input
          name="image"
          type="file"
          accept="image/*"
          className="block w-full text-base text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-3 file:font-semibold file:text-blue-900 hover:file:bg-blue-100 dark:file:bg-blue-950/50 dark:file:text-blue-100"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        Anfrage senden
      </button>
    </form>
  )
}
