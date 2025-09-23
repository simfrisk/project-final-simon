import { useUserStore } from "../store/userStore"
import { Navigate } from "react-router-dom"

export const RequireRole = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: string[]
}) => {
  const user = useUserStore((state) => state.user)
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return <>{children}</>
}
