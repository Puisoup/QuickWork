'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/Avatar'
import { logout } from '@/app/dashboard/logout-action'

export function UserMenu({
  userName,
  userId,
  avatarUrl,
}: {
  userName: string
  userId: string
  avatarUrl: string | null
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-0.5 shadow-sm transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Konto-Menü"
      >
        <Avatar name={userName} src={avatarUrl} size="md" />
        <span className="hidden pr-2 text-sm font-medium text-gray-700 sm:inline dark:text-gray-200">{userName.split(' ')[0]}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <Link
            href="/dashboard/profile"
            className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-zinc-800"
            onClick={() => setOpen(false)}
          >
            Profil bearbeiten
          </Link>
          <Link
            href="/dashboard/settings"
            className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-zinc-800"
            onClick={() => setOpen(false)}
          >
            Einstellungen
          </Link>
          <Link
            href={`/profile/${userId}`}
            className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-zinc-800"
            onClick={() => setOpen(false)}
          >
            Öffentliches Profil
          </Link>
          <div className="my-1 border-t border-gray-100 dark:border-zinc-800" />
          <form action={logout}>
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Abmelden
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
