'use client'
import { register } from '../auth/actions'

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Konto erstellen</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Werde Teil von QuickWork.</p>
                </div>

                <form action={register} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Typ</label>
                        <select name="role" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3 border dark:bg-zinc-700 dark:border-zinc-600 dark:text-white">
                            <option value="CUSTOMER">Ich brauche Hilfe (Kunde)</option>
                            <option value="COMPANY">Ich biete Dienstleistungen (Unternehmen)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vollständiger Name</label>
                        <input name="name" type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3 border dark:bg-zinc-700 dark:border-zinc-600 dark:text-white" placeholder="Max Mustermann" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-Mail Adresse</label>
                        <input name="email" type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3 border dark:bg-zinc-700 dark:border-zinc-600 dark:text-white" placeholder="du@beispiel.com" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Passwort</label>
                        <input name="password" type="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3 border dark:bg-zinc-700 dark:border-zinc-600 dark:text-white" placeholder="******" />
                    </div>

                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors">
                        Registrieren
                    </button>

                    <div className="text-center text-sm text-gray-500 mt-4">
                        Bereits registriert? <a href="/login" className="font-semibold text-black dark:text-white hover:underline">Anmelden</a>
                    </div>
                </form>
            </div>
        </div>
    )
}
