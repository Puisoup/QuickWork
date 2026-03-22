/** Ziel nach Login bzw. „Zurück“ von öffentlichen Profilseiten. */
export function getDashboardHomePath(role: string | undefined): string {
  if (!role) return '/'
  switch (role) {
    case 'CUSTOMER':
      return '/dashboard/customer'
    case 'EXPERT':
      return '/dashboard/expert'
    case 'COMPANY':
      return '/dashboard/company'
    case 'ADMIN':
      return '/dashboard/admin'
    default:
      return '/'
  }
}
