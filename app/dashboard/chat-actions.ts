'use server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function sendMessage(formData: FormData) {
    const requestId = formData.get('requestId') as string
    const receiverId = formData.get('receiverId') as string
    const content = formData.get('content') as string

    if (!content || !content.trim()) return;

    const cookieStore = await cookies()
    const senderId = cookieStore.get('quickwork_user_id')?.value

    if (!senderId) throw new Error('Unauthorized')

    const role = cookieStore.get('quickwork_role')?.value

    await prisma.message.create({
        data: {
            content,
            requestId,
            senderId,
            receiverId
        }
    })

    // If Expert sends message and not yet assigned, claim it.
    // This makes the chat visible to the customer.
    if (role === 'EXPERT') {
        const req = await prisma.request.findUnique({ where: { id: requestId } });
        if (req && !req.expertId) {
            await prisma.request.update({
                where: { id: requestId },
                data: { expertId: senderId }
            })
        }
    }

    revalidatePath('/dashboard')
}
