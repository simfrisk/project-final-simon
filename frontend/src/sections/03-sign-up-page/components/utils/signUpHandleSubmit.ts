import type { NavigateFunction } from "react-router"
import type { FormEvent } from "react"
import type { CreateUserData, CreateUserResult } from "../../../../store/userStore"

type CreateUserFunction = (data: CreateUserData, imageFile?: File) => Promise<CreateUserResult>

// How long a follow up warning stays visible before moving on to the next page.
const WARNING_DELAY_MS = 4000

export const handleSignUpSubmit = async (
  e: FormEvent<HTMLFormElement>,
  createUser: CreateUserFunction,
  setError: (msg: string | null) => void,
  navigate: NavigateFunction,
  invitationToken?: string | null,
  invitationRole?: string | null,
  setNotice?: (msg: string | null) => void
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

  // Set role based on invitation role, or default to teacher if no invitation
  const role = invitationToken && invitationRole ? invitationRole : "teacher"
  const data: CreateUserData = {
    name: form.fullName.value,
    email: form.email.value,
    password: form.password.value,
    role,
    ...(invitationToken ? { invitationToken } : {}),
  }
  const imageFile = form.profileImage.files?.[0]

  const result = await createUser(data, imageFile)

  if (result.success) {
    setError(null)
    const destination = invitationToken ? "/library" : "/create-workspace"

    if (result.warning && setNotice) {
      // The account exists. Show what went wrong with the picture, then continue.
      setNotice(result.warning)
      setTimeout(() => navigate(destination), WARNING_DELAY_MS)
      return
    }

    // With an invitation the user goes to the library, otherwise to workspace setup
    navigate(destination)
  } else {
    setError(result.message || "Sign up failed")
  }
}
