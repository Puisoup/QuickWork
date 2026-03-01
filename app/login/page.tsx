'use client'
import { login } from '../auth/actions'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Willkommen zurück</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Melde dich bei QuickWork an.</p>
                </div>

                <form action={login} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-Mail Adresse</label>
                        <input name="email" type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3 border dark:bg-zinc-700 dark:border-zinc-600 dark:text-white" placeholder="du@beispiel.com" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Passwort</label>
                            <a href="/login/forgot-password" className="text-xs text-gray-500 hover:text-black dark:hover:text-white">
                                Passwort vergessen?
                            </a>
                        </div>
                        <input name="password" type="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3 border dark:bg-zinc-700 dark:border-zinc-600 dark:text-white" placeholder="******" />
                    </div>

                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors">
                        Anmelden
                    </button>

                    <div className="text-center text-sm text-gray-500 mt-4">
                        Noch kein Konto? <a href="/register" className="font-semibold text-black dark:text-white hover:underline">Registrieren</a>
                    </div>
                </form>
            </div>
        </div>
    )
}
