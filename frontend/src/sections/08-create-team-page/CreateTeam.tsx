//#region ----- IMPORTS -----
import { useState } from "react"
import styled from "styled-components"
import { useTeamStore } from "../../store/teamStore"
import { useWorkspaceStore } from "../../store/workspaceStore"
import { MediaQueries } from "../../themes/mediaQueries"
//#endregion

export const CreateTeam = () => {
  //#region ----- STORE HOOKS -----
  const { createTeam, loading, error, message, fetchTeams } = useTeamStore()
  const { currentWorkspaceId } = useWorkspaceStore()
  //#endregion

  //#region ----- STATE -----
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    teamName: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  //#endregion

  //#region ----- EVENT HANDLERS -----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentWorkspaceId) {
      return
    }

    setIsSubmitting(true)
    try {
      await createTeam(currentWorkspaceId, {
        teamName: formData.teamName,
      })

      // If successful, reset form and hide it
      if (message && message.includes("successfully")) {
        setFormData({ teamName: "" })
        setShowForm(false)
        // Refresh the teams list
        if (currentWorkspaceId) {
          fetchTeams(currentWorkspaceId)
        }
      }
    } catch (error) {
      console.error("Failed to create team:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  //#endregion

  //#region ----- RENDER -----
  return (
    <CreateTeamSection>
      {!showForm ? (
        <CreateButton onClick={() => setShowForm(true)}>➕ Create New Team</CreateButton>
      ) : (
        <FormContainer>
          <FormHeader>
            <FormTitle>Create New Team</FormTitle>
            <CloseButton
              onClick={() => {
                setShowForm(false)
                setFormData({ teamName: "" })
              }}
            >
              ✕
            </CloseButton>
          </FormHeader>

          <StyledForm
            onSubmit={handleSubmit}
            noValidate
          >
            <FormGroup>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                type="text"
                id="teamName"
                name="teamName"
                placeholder="Enter team name"
                value={formData.teamName}
                onChange={handleChange}
                required
                autoFocus
              />
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {message && <SuccessMessage>{message}</SuccessMessage>}

            {!currentWorkspaceId && (
              <ErrorMessage>Please select a workspace to create a team</ErrorMessage>
            )}

            <ButtonGroup>
              <CancelButton
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ teamName: "" })
                }}
              >
                Cancel
              </CancelButton>
              <SubmitButton
                type="submit"
                disabled={
                  loading || isSubmitting || !currentWorkspaceId || !formData.teamName.trim()
                }
              >
                {loading || isSubmitting ? "Creating..." : "Create Team"}
              </SubmitButton>
            </ButtonGroup>
          </StyledForm>
        </FormContainer>
      )}
    </CreateTeamSection>
  )
  //#endregion
}

//#region ----- STYLED COMPONENTS -----
const CreateTeamSection = styled.div`
  margin-bottom: 24px;
`

const CreateButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  display: block;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 14px 28px;
    font-size: 17px;
  }
`

const FormContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 0 auto;
  width: 100%;
  max-width: 600px;

  @media ${MediaQueries.biggerSizes} {
    max-width: 800px;
    padding: 32px;
    border-radius: 20px;
  }
`

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const FormTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};

  @media ${MediaQueries.biggerSizes} {
    font-size: 24px;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 8px;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};

  @media ${MediaQueries.biggerSizes} {
    font-size: 15px;
  }
`

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.offBackground};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.5;
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 14px 18px;
    font-size: 15px;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: #5a6268;
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 12px 24px;
    font-size: 15px;
  }
`

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 12px 24px;
    font-size: 15px;
  }
`

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 14px;
  margin-top: -8px;
`

const SuccessMessage = styled.div`
  color: #2ed573;
  font-size: 14px;
  margin-top: -8px;
`
//#endregion
