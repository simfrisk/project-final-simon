// utils/token.ts
import { useUserStore } from "../store/userStore"

export const getToken = (): string | null => {
  return (
    useUserStore.getState().user?.accessToken ||
    localStorage.getItem("accessToken")
  )
}
