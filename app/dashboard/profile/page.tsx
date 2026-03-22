import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { saveProfile } from './actions'
import { Avatar } from '@/components/Avatar'

const roleTitles: Record<string, string> = {
  CUSTOMER: 'Kunde',
  COMPANY: 'Unternehmen',
  EXPERT: 'Expert',
  ADMIN: 'Admin',
}

export default async function ProfileEditPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('quickwork_user_id')?.value
  const role = cookieStore.get('quickwork_role')?.value
  if (!userId || !role) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })
  if (!user) redirect('/login')

  const p = user.profile
  const roleTitle = roleTitles[role] ?? role

  const isPrivate = role === 'CUSTOMER' || role === 'ADMIN'
  const isExpert = role === 'EXPERT'
  const isCompany = role === 'COMPANY'

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-zinc-100 dark:text-zinc-900">
            {roleTitle}
          </span>
        </div>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Profil</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {isPrivate && 'Nur Angaben, die für dich als Privatperson sinnvoll sind. Öffentlich sichtbar auf deiner Profilseite.'}
          {isExpert && 'Sichtbar für Kunden z. B. im Chat über „Profil“. Schwerpunkte zeigen deine Fachkompetenz.'}
          {isCompany && 'Erweiterte Angaben für dein Unternehmen und öffentliche Bewertungen.'}
        </p>
      </header>

      <form action={saveProfile} className="space-y-6">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Profilbild</h3>
          <div className="flex flex-wrap items-center gap-6">
            <Avatar name={user.name} src={p?.avatarUrl} size="lg" />
            <div className="min-w-0 flex-1">
              <label htmlFor="avatar" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Bild hochladen
              </label>
              <input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="mt-2 block w-full text-sm text-zinc-500 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-amber-900 hover:file:bg-amber-100 dark:file:bg-amber-950/40 dark:file:text-amber-200"
              />
              <p className="mt-1.5 text-xs text-zinc-400">Ohne Bild: Initialen. JPEG, PNG, WebP oder GIF.</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {isPrivate ? 'Persönliche Angaben' : isExpert ? 'Kontakt & Vorstellung' : 'Stammdaten'}
          </h3>
          {isPrivate && (
            <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">Optional – hilft Partnern, dich einzuordnen.</p>
          )}

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{user.name}</p>
                <p className="mt-0.5 text-xs text-zinc-400">Änderung in dieser PoC nur über Admin</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">E-Mail</label>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
              </div>
            </div>

            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {isPrivate ? 'Kurzbeschreibung' : 'Claim / Kurzbeschreibung'}
              </label>
              <input
                id="headline"
                name="headline"
                defaultValue={p?.headline ?? ''}
                placeholder={
                  isPrivate
                    ? 'z. B. Eigenheim in Zürich, Fokus Renovation'
                    : isExpert
                      ? 'z. B. Begutachtung Gebäudehülle'
                      : 'z. B. Ihr Partner für Sanierung'
                }
                className="mt-1 block w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {isPrivate ? 'Über dich (optional)' : 'Über uns / Über mich'}
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={isPrivate ? 3 : 4}
                defaultValue={p?.bio ?? ''}
                placeholder={
                  isPrivate
                    ? 'Was möchtest du auf der Plattform erreichen? Nur das, was du teilen möchtest.'
                    : 'Mehr Hintergrund für Besucher deines Profils …'
                }
                className="mt-1 block w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Telefon {isPrivate && '(optional)'}
                </label>
                <input
                  id="phone"
                  name="phone"
                  defaultValue={p?.phone ?? ''}
                  placeholder={isPrivate ? 'für Rückfragen' : '+41 …'}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Region / Ort
                </label>
                <input
                  id="region"
                  name="region"
                  defaultValue={p?.region ?? ''}
                  placeholder="z. B. Zürich, Bern"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {isCompany && (
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Unternehmen</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={p?.website ?? ''}
                  placeholder="https://…"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="services" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Leistungen &amp; Schwerpunkte
                </label>
                <textarea
                  id="services"
                  name="services"
                  rows={5}
                  defaultValue={p?.services ?? ''}
                  placeholder="Was bietet ihr an? Branchen, Zertifikate, Team …"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>
          </section>
        )}

        {isExpert && (
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Fachkompetenz</h3>
            <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">Wird auf deinem öffentlichen Expertenprofil angezeigt.</p>
            <div>
              <label htmlFor="specialties" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Schwerpunkte &amp; Erfahrung
              </label>
              <textarea
                id="specialties"
                name="specialties"
                rows={4}
                defaultValue={p?.specialties ?? ''}
                placeholder="Fachgebiete, Jahre Erfahrung, relevante Normen …"
                className="mt-1 block w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </section>
        )}

        <div className="flex justify-end border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <button
            type="submit"
            className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-amber-400"
          >
            Speichern
          </button>
        </div>
      </form>
    </div>
  )
}
