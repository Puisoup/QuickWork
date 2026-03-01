'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type Theme = 'light' | 'dark' | 'system'

export async function saveSettings(formData: FormData) {
    const cookieStore = await cookies()
    const userId = cookieStore.get('quickwork_user_id')?.value
    if (!userId) {
        redirect('/login')
    }

    const theme = (formData.get('theme') as Theme) || 'system'
    const emailNewMessages = formData.get('emailNewMessages') === 'on'
    const emailNewOffers = formData.get('emailNewOffers') === 'on'

    cookieStore.set('quickwork_theme', theme, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    cookieStore.set('quickwork_email_new_messages', emailNewMessages ? '1' : '0', { path: '/', maxAge: 60 * 60 * 24 * 365 })
    cookieStore.set('quickwork_email_new_offers', emailNewOffers ? '1' : '0', { path: '/', maxAge: 60 * 60 * 24 * 365 })

    redirect('/dashboard/settings')
}
