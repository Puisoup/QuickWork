'use server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createOffer(formData: FormData) {
    const requestId = formData.get('requestId') as string
    const description = formData.get('description') as string
    const amount = parseFloat(formData.get('amount') as string)

    const attachFile = formData.get('attachment') as File

    // Validate Company
    const cookieStore = await cookies()
    const userId = cookieStore.get('quickwork_user_id')?.value
    const role = cookieStore.get('quickwork_role')?.value

    if (!userId || role !== 'COMPANY') {
        throw new Error('Unauthorized')
    }

    let attachmentUrl = null
    if (attachFile && attachFile.size > 0) {
        const bytes = await attachFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const { join } = await import('path')
        const { writeFile, mkdir } = await import('fs/promises')

        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        const fileName = `company-${Date.now()}-${attachFile.name}`
        const filePath = join(uploadDir, fileName)
        await writeFile(filePath, buffer)
        attachmentUrl = `/uploads/${fileName}`
    }

    await prisma.offer.create({
        data: {
            amount,
            description,
            requestId,
            companyId: userId,
            attachmentUrl
        }
    })

    revalidatePath('/dashboard/company')
}

export async function setExecutionDate(formData: FormData) {
    const offerId = formData.get('offerId') as string
    const executionDateStr = formData.get('executionDate') as string

    // Validate Company
    const cookieStore = await cookies()
    const userId = cookieStore.get('quickwork_user_id')?.value
    const role = cookieStore.get('quickwork_role')?.value

    if (!userId || role !== 'COMPANY') {
        throw new Error('Unauthorized')
    }

    if (!executionDateStr) return

    await prisma.offer.update({
        where: { id: offerId, companyId: userId },
        data: {
            executionDate: new Date(executionDateStr)
        }
    })

    revalidatePath('/dashboard/company')
}
