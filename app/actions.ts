'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function loginAction(email: string) {
    // Determine role based on email for PoC
    let role = 'CUSTOMER';
    if (email.includes('expert')) role = 'EXPERT';
    if (email.includes('company')) role = 'COMPANY';
    if (email.includes('admin')) role = 'ADMIN';

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: email.split('@')[0],
            password: 'mock_password',
            role,
        },
    })

    // Set auth cookie
    const cookieStore = await cookies()
    cookieStore.set('quickwork_user_id', user.id)
    cookieStore.set('quickwork_role', user.role)

    // Redirect based on role
    if (user.role === 'ADMIN') redirect('/dashboard/admin')
    if (user.role === 'EXPERT') redirect('/dashboard/expert')
    if (user.role === 'COMPANY') redirect('/dashboard/company')
    redirect('/dashboard/customer')
}
