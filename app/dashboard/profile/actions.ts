'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

export async function saveProfile(formData: FormData) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('quickwork_user_id')?.value
  const role = cookieStore.get('quickwork_role')?.value
  if (!userId || !role) redirect('/login')

  const headline = (formData.get('headline') as string) || null
  const bio = (formData.get('bio') as string) || null
  const phone = (formData.get('phone') as string) || null
  const region = (formData.get('region') as string) || null
  const website = role === 'COMPANY' ? ((formData.get('website') as string) || null) : null
  const services = role === 'COMPANY' ? ((formData.get('services') as string) || null) : null
  const specialties = role === 'EXPERT' ? ((formData.get('specialties') as string) || null) : null

  const existing = await prisma.profile.findUnique({ where: { userId } })

  let nextAvatar = existing?.avatarUrl ?? null
  const avatarFile = formData.get('avatar') as File | null
  if (avatarFile && typeof avatarFile === 'object' && avatarFile.size > 0) {
    const bytes = await avatarFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    const safe = avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `avatar-${userId.slice(0, 8)}-${Date.now()}-${safe}`
    await writeFile(join(uploadDir, fileName), buffer)
    nextAvatar = `/uploads/${fileName}`
  }

  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      headline,
      bio,
      phone,
      region,
      website,
      services,
      specialties,
      avatarUrl: nextAvatar,
    },
    update: {
      headline,
      bio,
      phone,
      region,
      website,
      services,
      specialties,
      avatarUrl: nextAvatar,
    },
  })

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard', 'layout')
  revalidatePath(`/profile/${userId}`)
  redirect('/dashboard/profile')
}
