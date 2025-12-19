'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        // Return null or throw in a real app, for now just void to satisfy type
        return
    }

    const user = await prisma.user.findUnique({
        where: { email }
    })

    // In a real app, verify password hash here. For PoC, simple check.
    if (!user || user.password !== password) {
        // Return null or throw in a real app, for now just void to satisfy type
        return
    }

    const cookieStore = await cookies()
    cookieStore.set('quickwork_user_id', user.id)
    cookieStore.set('quickwork_role', user.role)

    if (user.role === 'ADMIN') redirect('/dashboard/admin')
    if (user.role === 'EXPERT') redirect('/dashboard/expert')
    if (user.role === 'COMPANY') redirect('/dashboard/company')
    redirect('/dashboard/customer')
}

export async function register(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string

    if (!email || !password || !name || !role) {
        return
    }

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password, // NOTE: In prod, hash this!
                name,
                role
            }
        })

        const cookieStore = await cookies()
        cookieStore.set('quickwork_user_id', user.id)
        cookieStore.set('quickwork_role', user.role)
    } catch (e) {
        return
    }

    if (role === 'EXPERT') redirect('/dashboard/expert')
    if (role === 'COMPANY') redirect('/dashboard/company')
    redirect('/dashboard/customer')
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('quickwork_user_id')
    cookieStore.delete('quickwork_role')
    redirect('/')
}
