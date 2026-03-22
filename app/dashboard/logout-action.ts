'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  const c = await cookies()
  c.delete('quickwork_user_id')
  c.delete('quickwork_role')
  redirect('/')
}
