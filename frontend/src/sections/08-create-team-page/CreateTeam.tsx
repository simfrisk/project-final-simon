import React, { useState } from "react"
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

export const CreateTeam = () => {
  const [formData, setFormData] = useState({
    teamName: "",
    description: "",
    email: "",
  })
  const [error] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Create team form submitted:", formData)
    // Add your create team logic here
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

            <FormGroup>
              <StyledLabel htmlFor="description">Description</StyledLabel>
              <StyledInput
                type="text"
                id="description"
                name="description"
                placeholder="Enter Team Description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <StyledLabel htmlFor="email">Contact Email</StyledLabel>
              <StyledInput
                type="email"
                id="email"
                name="email"
                placeholder="Enter Contact Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <ButtonWrapper>
              <StyledButton type="submit">Create Team</StyledButton>
            </ButtonWrapper>

            <LinkContainer>
              <p>Already have a team?</p>
              <StyledLink to="/teams">View Teams</StyledLink>
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
