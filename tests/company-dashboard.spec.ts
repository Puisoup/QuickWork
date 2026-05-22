import { test, expect, Page } from '@playwright/test'

// ─── Login Helpers ────────────────────────────────────────────────────────────

async function loginAs(page: Page, role: 'customer' | 'company') {
    const credentials = {
        customer: { email: 'customer@example.com', password: 'password' },
        company: { email: 'company@example.com', password: 'password' },
    }
    await page.goto('/login')
    await page.locator('input[name="email"]').fill(credentials[role].email)
    await page.locator('input[name="password"]').fill(credentials[role].password)
    await page.getByRole('button', { name: /Anmelden/i }).click()
    await page.waitForURL(/\/dashboard/)
}

// ─── EPIC 1: Kategorisierungssystem ──────────────────────────────────────────

test('Kategorie-Dropdown ist im Formular sichtbar', async ({ page }) => {
    await loginAs(page, 'customer')
    await page.goto('/dashboard/customer')
    await expect(page.locator('select[name="category"]')).toBeVisible()
})

test('Anfrage mit Kategorie erstellen', async ({ page }) => {
    await loginAs(page, 'customer')
    await page.goto('/dashboard/customer')
    await page.locator('input[name="title"]').fill('Playwright Test - Elektroinstallation')
    await page.locator('textarea[name="description"]').fill('Automatisierter Testauftrag')
    await page.locator('select[name="category"]').selectOption('Elektro')
    await page.getByRole('button', { name: /Anfrage senden/i }).click()
    await page.waitForTimeout(1000)
    // Anfrage erscheint in der Liste
    await expect(page.getByText('Playwright Test - Elektroinstallation').first()).toBeVisible()
})

// ─── EPIC 2: Textsuchfunktion ─────────────────────────────────────────────────

test('Suchfeld ist im Company-Dashboard sichtbar', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company')
    await expect(page.getByPlaceholder(/Anfragen durchsuchen/i)).toBeVisible()
})

test('Suche aktualisiert URL-Parameter', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company')
    await page.getByPlaceholder(/Anfragen durchsuchen/i).fill('Elektro')
    await page.waitForTimeout(500) // Debounce abwarten
    await expect(page).toHaveURL(/search=Elektro/)
})

test('Suche nach nicht vorhandenem Begriff zeigt Meldung', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company?search=xyzxyzxyz123')
    await expect(page.getByText(/xyzxyzxyz123/i)).toBeVisible()
})

test('Suchfeld X-Button leert die Suche', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company')
    const input = page.getByPlaceholder(/Anfragen durchsuchen/i)
    await input.fill('Test')
    await page.waitForTimeout(500)
    // X-Button ist sichtbar wenn Eingabe vorhanden
    const clearBtn = page.locator('input[placeholder*="durchsuchen"] ~ button').first()
    await clearBtn.click()
    await expect(input).toHaveValue('')
})

// ─── EPIC 3: Filterkomponenten ────────────────────────────────────────────────

test('Filterkomponenten sind sichtbar', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company')
    await expect(page.locator('select').filter({ hasText: /Alle Kategorien/i })).toBeVisible()
    await expect(page.locator('select').filter({ hasText: /Alle Regionen/i })).toBeVisible()
    await expect(page.getByPlaceholder(/Budget ab/i)).toBeVisible()
    await expect(page.getByPlaceholder(/Budget bis/i)).toBeVisible()
})

test('Kategoriefilter schreibt URL-Parameter', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company')
    await page.locator('select').filter({ hasText: /Alle Kategorien/i }).selectOption('Elektro')
    await expect(page).toHaveURL(/category=Elektro/)
})

test('Aktiver Filter wird als Tag angezeigt', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company?category=Elektro')
    await expect(page.getByText(/Kategorie: Elektro/i)).toBeVisible()
})

test('Filter-Tag kann einzeln entfernt werden', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company?category=Elektro&region=Z%C3%BCrich')
    // Kategorie-Tag entfernen
    await page.getByRole('button', { name: /category entfernen/i }).click()
    await expect(page).not.toHaveURL(/category=/)
    await expect(page).toHaveURL(/region=/) // Region bleibt erhalten
})

test('Alle Filter zurücksetzen funktioniert', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company?category=Elektro&budgetMin=100')
    await page.getByRole('button', { name: /Alle zurücksetzen/i }).click()
    await expect(page).not.toHaveURL(/category=/)
    await expect(page).not.toHaveURL(/budgetMin=/)
})

test('Mehrere Filter gleichzeitig kombinierbar', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company')
    await page.locator('select').filter({ hasText: /Alle Kategorien/i }).selectOption('Elektro')
    await page.waitForURL(/category=Elektro/)
    await page.getByPlaceholder(/Budget ab/i).fill('100')
    await page.waitForURL(/budgetMin=100/)
    await expect(page).toHaveURL(/category=Elektro/)
})

// ─── EPIC 4: URL-Parameter & Polish ──────────────────────────────────────────

test('Filtereinstellungen bleiben nach Neuladen erhalten', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company?search=Test&category=Elektro')
    await page.reload()
    await expect(page.getByPlaceholder(/Anfragen durchsuchen/i)).toHaveValue('Test')
    await expect(page.getByRole('combobox').filter({ hasText: /Elektro/i })).toBeVisible()
})

test('View-Switcher behält Filterparameter beim Wechsel', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company?search=Test&category=Elektro')
    await page.locator('main').getByRole('link', { name: /Meine Aufträge/i }).click()
    await expect(page).toHaveURL(/view=active/)
    await expect(page).toHaveURL(/search=Test/)
    await expect(page).toHaveURL(/category=Elektro/)
})

test('Trefferanzahl wird angezeigt', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/dashboard/company')
    await expect(page.getByText(/Anfrage(n)? gefunden/i)).toBeVisible()
})
