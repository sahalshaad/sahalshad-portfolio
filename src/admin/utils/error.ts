export function formatSupabaseError(error: unknown): string {
  if (!error) return ''

  if (typeof error === 'string') {
    if (
      error.toLowerCase().includes('row-level security') ||
      error.toLowerCase().includes('permission denied')
    ) {
      return 'You do not have permission. Are you logged in as the admin?'
    }
    return error
  }

  const err = error as { message?: string; code?: string; status?: number; details?: string }
  const message = err.message || err.details || ''
  const code = err.code || ''
  const status = err.status

  if (
    code === '42501' ||
    status === 403 ||
    message.toLowerCase().includes('row-level security') ||
    message.toLowerCase().includes('permission denied') ||
    message.toLowerCase().includes('violates row-level security policy')
  ) {
    return 'You do not have permission. Are you logged in as the admin?'
  }

  return message || 'An unexpected error occurred. Please try again.'
}
