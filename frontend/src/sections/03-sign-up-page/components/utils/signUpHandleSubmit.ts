import type { NavigateFunction } from "react-router"
import type { FormEvent } from "react"

type CreateUserFunction = (formData: FormData) => Promise<{ success: boolean; message?: string }>

export const handleSignUpSubmit = async (
  e: FormEvent<HTMLFormElement>,
  createUser: CreateUserFunction,
  setError: (msg: string | null) => void,
  navigate: NavigateFunction
) => {
  e.preventDefault()

  const form = e.currentTarget as HTMLFormElement & {
    fullName: HTMLInputElement
    email: HTMLInputElement
    password: HTMLInputElement
    profileImage: HTMLInputElement
  }

  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const formData = new FormData()
  formData.append("name", form.fullName.value)
  formData.append("email", form.email.value)
  formData.append("password", form.password.value)
  formData.append("role", "teacher") // Automatically set role as teacher
  if (form.profileImage.files?.[0]) {
    formData.append("image", form.profileImage.files[0])
  }

  const result = await createUser(formData)

  if (result.success) {
    setError(null)
    navigate("/create-workspace")
  } else {
    setError(result.message || "Sign up failed")
  }
}
