'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans dark:bg-zinc-950">
      <nav className="flex w-full items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-zinc-900">
        <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white">QuickWork</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Registrieren
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-8">
          <h2 className="text-5xl font-bold leading-tight tracking-tighter text-black md:text-7xl dark:text-white">
            Arbeit erledigt.{' '}
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Schnell.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-500 dark:text-gray-400">
            Verbinde dich mit geprüften Experten und bringe deine Projekte voran. Egal ob du eine Reparatur brauchst oder
            deine Dienste anbieten möchtest – QuickWork ist die Plattform für dich.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="rounded-xl bg-black px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-gray-900 hover:shadow-md dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              Loslegen
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-gray-100 px-8 py-4 text-lg font-bold text-gray-900 transition-colors hover:bg-gray-200 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            >
              Ich habe einen Account
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-400">
        <p>&copy; 2026 QuickWork Inc.</p>
      </footer>
    </div>
  )
}
