import { create } from 'zustand'
import { baseUrl } from '../config/api'

interface BackendStatusState {
  status: 'checking' | 'ready' | 'error' | 'idle'
  isSpinningUp: boolean
  error: string | null
  lastChecked: number | null
  checkBackendHealth: () => Promise<void>
  resetStatus: () => void
}

export const useBackendStatusStore = create<BackendStatusState>((set, get) => ({
  status: 'idle',
  isSpinningUp: false,
  error: null,
  lastChecked: null,

  checkBackendHealth: async () => {
    const startTime = Date.now()
    set({ status: 'checking', isSpinningUp: false, error: null })

    try {
      // Try to ping a lightweight health endpoint or any endpoint
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 65000) // 65 second timeout (slightly more than Render spin-up)

      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        set({
          status: 'ready',
          isSpinningUp: false,
          error: null,
          lastChecked: Date.now()
        })
        return
      } else {
        throw new Error(`Backend returned status: ${response.status}`)
      }
    } catch (error) {
      const elapsed = Date.now() - startTime

      // If we've been waiting for a while, it's likely spinning up
      if (elapsed > 10000 && elapsed < 65000) {
        set({
          status: 'checking',
          isSpinningUp: true,
          error: 'Backend is waking up, please wait...',
          lastChecked: Date.now()
        })

        // Retry after a delay
        setTimeout(() => {
          const currentStatus = get().status
          if (currentStatus === 'checking') {
            get().checkBackendHealth()
          }
        }, 5000)
      } else {
        set({
          status: 'error',
          isSpinningUp: false,
          error: error instanceof Error ? error.message : 'Unable to connect to backend',
          lastChecked: Date.now()
        })
      }
    }
  },

  resetStatus: () => {
    set({ status: 'idle', isSpinningUp: false, error: null })
  },
}))
