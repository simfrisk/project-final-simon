import { Navigation } from "../../global-components/navigation/Navigation"
import { CreateWorkspaceHeader } from "./components/CreateWorkspaceHeader"
import { CreateWorkspaceForm } from "./components/CreateWorkspaceForm"
import styled from "styled-components"

export const CreateWorkspacePage = () => {
  return (
    <>
      <Navigation />
      <Section>
        <CreateWorkspaceHeader />
        <CreateWorkspaceForm />
      </Section>
    </>
  )
}

const Section = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 500px;
  margin: 150px auto 0 auto;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`
