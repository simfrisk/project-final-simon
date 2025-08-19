import { useUserStore } from "../store/userStore"
import { Navigate } from "react-router-dom"

export const RequireAuthentication = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return <>{children}</>
}
