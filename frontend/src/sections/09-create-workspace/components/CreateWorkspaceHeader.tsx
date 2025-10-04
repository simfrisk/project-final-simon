import styled from "styled-components"

export const CreateWorkspaceHeader = () => {
  return (
    <div>
      <CenteredHeader>Create Workspace</CenteredHeader>
    </div>
  )
}

const CenteredHeader = styled.h1`
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`
