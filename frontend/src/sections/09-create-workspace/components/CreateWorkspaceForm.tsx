//#region ----- IMPORTS -----
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useWorkspaceStore } from "../../../store/workspaceStore"
import { handleCreateWorkspaceSubmit } from "./utils/createWorkspaceHandleSubmit"
import {
  StyledForm,
  FormGroup,
  StyledButton,
  ButtonWrapper,
  ErrorMessage,
} from "../../../global-components/StyledForm"
//#endregion

//#region ----- COMPONENT LOGIC -----
export const CreateWorkspaceForm: React.FC = () => {
  const navigate = useNavigate()
  const { createWorkspace } = useWorkspaceStore()

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) =>
    handleCreateWorkspaceSubmit(e, createWorkspace, setError, navigate)

  //#endregion

  //#region ----- RENDERED UI -----
  return (
    <StyledForm
      onSubmit={handleSubmit}
      noValidate
      aria-describedby="form-error"
    >
      <FormGroup>
        <label htmlFor="workspaceName">Workspace name</label>
        <input
          type="text"
          id="workspaceName"
          name="workspaceName"
          placeholder="Enter workspace name"
          minLength={2}
          maxLength={100}
          required
          aria-required="true"
        />
      </FormGroup>

      {error && <ErrorMessage id="form-error">{error}</ErrorMessage>}

      <ButtonWrapper>
        <StyledButton type="submit">Create Workspace</StyledButton>
      </ButtonWrapper>
    </StyledForm>
  )
}
//#endregion
