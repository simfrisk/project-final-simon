import { useBackendStatusStore } from '../store/backendStatusStore'

/**
 * Enhanced fetch wrapper that handles backend cold start scenarios
 * Automatically triggers health check and updates backend status when needed
 */
export const fetchWithErrorHandling = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 65000) // 65 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)

    // Check if this is a timeout or network error (likely cold start)
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        // Trigger backend status check
        const { checkBackendHealth, status } = useBackendStatusStore.getState()
        if (status === 'idle' || status === 'error') {
          checkBackendHealth()
        }
      }
    }

    throw error
  }
}

/**
 * Determines if an error is likely due to backend cold start
 */
export const isColdStartError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.name === 'AbortError' ||
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('Failed to fetch')
    )
  }
  return false
}

/**
 * Gets a user-friendly error message for cold start scenarios
 */
export const getColdStartErrorMessage = (): string => {
  return 'The backend is waking up. This may take up to 60 seconds on the free tier.'
}

/**
 * Generic error message getter with cold start detection
 */
export const getErrorMessage = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  if (isColdStartError(error)) {
    return getColdStartErrorMessage()
  }

  if (error instanceof Error) {
    return error.message
  }

  return defaultMessage
}
