import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Section } from "../../global-components/Section"
import { Container as BaseContainer } from "../../global-components/Section"
import styled from "styled-components"
import {
  StyledForm,
  FormGroup,
  StyledLabel,
  StyledInput,
  ButtonWrapper,
  StyledButton,
  ErrorMessage,
  StyledLink,
  LinkContainer,
} from "../../global-components/StyledForm"
import { useTeamStore } from "../../store/teamStore"
import { useWorkspaceStore } from "../../store/workspaceStore"

export const CreateTeam = () => {
  const navigate = useNavigate()
  const { createTeam, loading, error, message } = useTeamStore()
  const { currentWorkspaceId } = useWorkspaceStore()

  const [formData, setFormData] = useState({
    teamName: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

      // If successful, navigate back to teams view
      if (message && message.includes("successfully")) {
        navigate("/admin/users", { state: { activeTab: "teams" } })
      }
    } catch (error) {
      console.error("Failed to create team:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Section>
        <Container>
          <h1>Create Team</h1>
          <StyledForm
            onSubmit={handleSubmit}
            noValidate
          >
            <FormGroup>
              <StyledLabel htmlFor="teamName">Team Name</StyledLabel>
              <StyledInput
                type="text"
                id="teamName"
                name="teamName"
                placeholder="Enter Team Name"
                value={formData.teamName}
                onChange={handleChange}
                required
              />
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {message && <ErrorMessage style={{ color: "green" }}>{message}</ErrorMessage>}

            <ButtonWrapper>
              <StyledButton
                type="submit"
                disabled={loading || isSubmitting || !currentWorkspaceId}
              >
                {loading || isSubmitting ? "Creating..." : "Create Team"}
              </StyledButton>
            </ButtonWrapper>

            {!currentWorkspaceId && (
              <ErrorMessage>Please select a workspace to create a team</ErrorMessage>
            )}

            <LinkContainer>
              <p>Already have a team?</p>
              <StyledLink
                to="/admin/users"
                state={{ activeTab: "teams" }}
              >
                View Teams
              </StyledLink>
            </LinkContainer>
          </StyledForm>
        </Container>
      </Section>
    </>
  )
}

const Container = styled(BaseContainer)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
