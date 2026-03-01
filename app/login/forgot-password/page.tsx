import Link from "next/link";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Passwort vergessen</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-3">
                    In dieser PoC-Version ist die Funktion nicht implementiert. Wende dich bei Zugangsproblemen an den Administrator.
                </p>
                <Link
                    href="/login"
                    className="mt-6 inline-block text-sm font-medium text-black dark:text-white hover:underline"
                >
                    ← Zurück zum Login
                </Link>
            </div>
        </div>
    );
}
