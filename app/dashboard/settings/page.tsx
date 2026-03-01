import { cookies } from 'next/headers'
import { saveSettings } from './actions'

export default async function SettingsPage() {
    const cookieStore = await cookies()
    const theme = (cookieStore.get('quickwork_theme')?.value as 'light' | 'dark' | 'system') || 'system'
    const emailNewMessages = cookieStore.get('quickwork_email_new_messages')?.value === '1'
    const emailNewOffers = cookieStore.get('quickwork_email_new_offers')?.value === '1'

    return (
        <div className="space-y-8 max-w-2xl">
            <header>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Einstellungen</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Passe deine Präferenzen für QuickWork an.
                </p>
            </header>

            <form action={saveSettings} className="space-y-8">
                {/* Appearance */}
                <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Darstellung</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Design
                        </label>
                        <select
                            name="theme"
                            defaultValue={theme}
                            className="block w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2.5"
                        >
                            <option value="light">Hell</option>
                            <option value="dark">Dunkel</option>
                            <option value="system">System (automatisch)</option>
                        </select>
                        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                            Wähle, ob die Oberfläche hell, dunkel oder an dein Gerät angepasst sein soll.
                        </p>
                    </div>
                </section>

                {/* Notifications */}
                <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Benachrichtigungen</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        E-Mail-Benachrichtigungen (in dieser PoC-Version nur Einstellung, Versand nicht implementiert).
                    </p>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="emailNewMessages"
                                defaultChecked={emailNewMessages}
                                className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-yellow-500 focus:ring-yellow-500 dark:bg-zinc-800"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                E-Mail bei neuen Nachrichten
                            </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="emailNewOffers"
                                defaultChecked={emailNewOffers}
                                className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-yellow-500 focus:ring-yellow-500 dark:bg-zinc-800"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                E-Mail bei neuen Angeboten
                            </span>
                        </label>
                    </div>
                </section>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-yellow-500 text-gray-900 px-5 py-2.5 rounded-md hover:bg-yellow-600 font-medium transition-colors"
                    >
                        Speichern
                    </button>
                </div>
            </form>
        </div>
    )
}
