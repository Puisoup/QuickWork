'use server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createFramework(formData: FormData) {
    const requestId = formData.get('requestId') as string
    const description = formData.get('comment') as string
    const budget = parseFloat(formData.get('budget') as string)
    const timeline = formData.get('timeline') as string
    const visitDateStr = formData.get('visitDate') as string
    const attachFile = formData.get('attachment') as File

    // Validate Expert
    const cookieStore = await cookies()
    const userId = cookieStore.get('quickwork_user_id')?.value
    const role = cookieStore.get('quickwork_role')?.value

    if (!userId || role !== 'EXPERT') {
        throw new Error(`Unauthorized. UserID: ${userId}, Role: ${role}`)
    }

    let attachmentUrl = null
    if (attachFile && attachFile.size > 0) {
        const bytes = await attachFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const { join } = await import('path')
        const { writeFile, mkdir } = await import('fs/promises')

        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        const fileName = `expert-${Date.now()}-${attachFile.name}`
        const filePath = join(uploadDir, fileName)
        await writeFile(filePath, buffer)
        attachmentUrl = `/uploads/${fileName}`
    }

    let visitDate = null
    if (visitDateStr) {
        visitDate = new Date(visitDateStr)
    }

    // Check if framework already exists (e.g. from visit)
    const existingFramework = await prisma.framework.findUnique({ where: { requestId } })

    if (existingFramework) {
        // Update existing (Finalize after visit)
        await prisma.$transaction([
            prisma.framework.update({
                where: { requestId },
                data: {
                    description,
                    budget: isNaN(budget) ? null : budget,
                    timeline,
                    attachmentUrl,
                    // If finalizing, we can keep the visitDate for record or clear it. 
                    // Let's keep it but now the focus is on the specs.
                }
            }),
            prisma.request.update({
                where: { id: requestId },
                data: {
                    status: 'BIDDING',
                    expertId: userId
                }
            })
        ])
    } else {
        // Create new (Remote assessment)
        await prisma.$transaction([
            prisma.framework.create({
                data: {
                    description,
                    budget: isNaN(budget) ? null : budget,
                    timeline,
                    requestId,
                    visitDate, // Only set if provided here (unlikely in new flow but safe)
                    attachmentUrl
                }
            }),
            prisma.request.update({
                where: { id: requestId },
                data: {
                    status: 'BIDDING',
                    expertId: userId
                }
            })
        ])
    }

    revalidatePath('/dashboard/expert')
}

export async function scheduleVisit(formData: FormData) {
    const requestId = formData.get('requestId') as string
    const visitDateStr = formData.get('visitDate') as string

    const cookieStore = await cookies()
    const userId = cookieStore.get('quickwork_user_id')?.value
    const role = cookieStore.get('quickwork_role')?.value

    if (!userId || role !== 'EXPERT') {
        throw new Error('Unauthorized')
    }

    if (!visitDateStr) return

    await prisma.$transaction([
        prisma.framework.create({
            data: {
                description: 'Besuch geplant', // Temporary description
                requestId,
                visitDate: new Date(visitDateStr)
            }
        }),
        prisma.request.update({
            where: { id: requestId },
            data: {
                status: 'VISIT_PLANNED', // New status string
                expertId: userId
            }
        })
    ])

    revalidatePath('/dashboard/expert')
}
