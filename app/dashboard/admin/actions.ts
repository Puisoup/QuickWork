'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteUser(formData: FormData) {
    const userId = formData.get('userId') as string
    if (!userId) return

    // Cascade delete requests and offers manually if needed, or rely on db cascade (assuming simple relations for PoC)
    // For PoC with SQLite, better to be safe
    try {
        await prisma.offer.deleteMany({ where: { companyId: userId } })
        await prisma.request.deleteMany({ where: { customerId: userId } })
        await prisma.review.deleteMany({ where: { OR: [{ customerId: userId }, { companyId: userId }] } })

        await prisma.user.delete({
            where: { id: userId }
        })
    } catch (e) {
        console.error('Failed to delete user', e)
    }

    revalidatePath('/dashboard/admin')
}

export async function deleteRequest(formData: FormData) {
    const requestId = formData.get('requestId') as string
    if (!requestId) return

    try {
        await prisma.framework.deleteMany({ where: { requestId } })
        await prisma.offer.deleteMany({ where: { requestId } })
        await prisma.request.delete({ where: { id: requestId } })
    } catch (e) {
        console.error('Failed to delete request', e)
    }

    revalidatePath('/dashboard/admin')
}
