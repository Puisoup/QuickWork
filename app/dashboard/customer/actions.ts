'use server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function createRequest(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageFile = formData.get('image') as File

    const cookieStore = await cookies()
    const userId = cookieStore.get('quickwork_user_id')?.value

    if (!userId) return

    let imagePath = null
    if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        const fileName = `${Date.now()}-${imageFile.name}`
        const filePath = join(uploadDir, fileName)

        await writeFile(filePath, buffer)
        imagePath = `/uploads/${fileName}`
    }

    await prisma.request.create({
        data: {
            title,
            description,
            customerId: userId,
            status: 'OPEN',
            images: imagePath ? {
                create: { url: imagePath }
            } : undefined
        }
    })

    revalidatePath('/dashboard/customer')
}

export async function acceptOffer(formData: FormData) {
    const offerId = formData.get('offerId') as string
    const requestId = formData.get('requestId') as string

    await prisma.$transaction([
        prisma.offer.update({
            where: { id: offerId },
            data: { status: 'ACCEPTED' }
        }),
        prisma.request.update({
            where: { id: requestId },
            data: { status: 'DONE' }
        })
    ])

    revalidatePath('/dashboard/customer')
}

export async function submitReview(formData: FormData) {
    const companyId = formData.get('companyId') as string
    const rating = parseInt(formData.get('rating') as string)
    const comment = formData.get('comment') as string

    const cookieStore = await cookies()
    const userId = cookieStore.get('quickwork_user_id')?.value
    if (!userId) return

    await prisma.review.create({
        data: {
            rating,
            comment,
            customerId: userId,
            companyId
        }
    })

    revalidatePath('/dashboard/customer')
    revalidatePath(`/profile/${companyId}`)
}
