export const CATEGORIES = [
    'Elektro',
    'Sanitär',
    'Malerei',
    'Garten',
    'Reinigung',
    'Sonstiges',
] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_COLORS: Record<Category, string> = {
    Elektro: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300',
    Sanitär: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
    Malerei: 'bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300',
    Garten: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300',
    Reinigung: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300',
    Sonstiges: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
}
