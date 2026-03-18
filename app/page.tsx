'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col font-sans">

      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-zinc-900">
        <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white">
          QuickWork
        </h1>
        <div className="space-x-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
            Anmelden
          </Link>
          <Link href="/register" className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Registrieren
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-8 animate-fade-in-up">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-black dark:text-white leading-tight">
            Arbeit erledigt. <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Schnell.</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto dark:text-gray-400 leading-relaxed">
            Verbinde dich mit geprüften Experten und bringe deine Projekte voran. Egal ob du eine Reparatur brauchst oder deine Dienste anbieten möchtest – QuickWork ist die Plattform für dich.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/register" className="px-8 py-4 bg-black text-white rounded-xl font-bold text-lg hover:scale-105 transform transition-all shadow-lg hover:shadow-xl dark:bg-white dark:text-black">
              Loslegen
            </Link>
            <Link href="/login" className="px-8 py-4 bg-gray-100 text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors dark:bg-zinc-900 dark:text-white">
              Ich habe einen Account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400">
        <p>&copy; 2026 QuickWork Inc.</p>
      </footer>
    </div>
  );
}
