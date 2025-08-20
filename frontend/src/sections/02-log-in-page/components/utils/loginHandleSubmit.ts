// utils/auth.ts
import type { NavigateFunction } from "react-router"

type LoginFunction = (
  email: string,
  password: string
) => Promise<{ success: boolean; message?: string }>

export const handleLoginSubmit = async (
  e: React.FormEvent<HTMLFormElement>,
  formData: { email: string; password: string },
  login: LoginFunction,
  setError: (msg: string | null) => void,
  navigate: NavigateFunction
) => {
  e.preventDefault()
  const form = e.currentTarget as HTMLFormElement & {
    email: HTMLInputElement
    password: HTMLInputElement
  }

  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const result = await login(formData.email, formData.password)

  if (result.success) {
    setError(null)
    navigate("/library")
  } else {
    setError(result.message || "Login failed")
  }
}
