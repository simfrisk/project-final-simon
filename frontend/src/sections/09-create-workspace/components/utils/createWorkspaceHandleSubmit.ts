import type { NavigateFunction } from "react-router"
import type { FormEvent } from "react"

type CreateWorkspaceFunction = (
  workspaceName: string
) => Promise<{ success: boolean; message?: string; workspaceId?: string }>

export const handleCreateWorkspaceSubmit = async (
  e: FormEvent<HTMLFormElement>,
  createWorkspace: CreateWorkspaceFunction,
  setError: (msg: string | null) => void,
  navigate: NavigateFunction
) => {
  e.preventDefault()

  const form = e.currentTarget as HTMLFormElement & {
    workspaceName: HTMLInputElement
  }

  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const result = await createWorkspace(form.workspaceName.value)

  if (result.success) {
    setError(null)
    navigate("/library")
  } else {
    setError(result.message || "Failed to create workspace")
  }
}
