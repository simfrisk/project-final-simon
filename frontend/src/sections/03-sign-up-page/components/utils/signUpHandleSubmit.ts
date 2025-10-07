import type { NavigateFunction } from "react-router"
import type { FormEvent } from "react"

type CreateUserFunction = (formData: FormData) => Promise<{ success: boolean; message?: string }>

export const handleSignUpSubmit = async (
  e: FormEvent<HTMLFormElement>,
  createUser: CreateUserFunction,
  setError: (msg: string | null) => void,
  navigate: NavigateFunction,
  invitationToken?: string | null,
  invitationRole?: string | null
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
  // Set role based on invitation role, or default to teacher if no invitation
  const role = invitationToken && invitationRole ? invitationRole : "teacher"
  formData.append("role", role)
  if (invitationToken) {
    formData.append("invitationToken", invitationToken)
  }
  if (form.profileImage.files?.[0]) {
    formData.append("image", form.profileImage.files[0])
  }

  const result = await createUser(formData)

  if (result.success) {
    setError(null)
    if (invitationToken) {
      // User signed up with invitation, redirect to library
      navigate("/library")
    } else {
      // Regular signup, redirect to create workspace
      navigate("/create-workspace")
    }
  } else {
    setError(result.message || "Sign up failed")
  }
}
