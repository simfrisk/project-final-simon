import styled from "styled-components"
import { useProjectStore } from "../../../../store/projectStore"

export const DescriptionSection = () => {
  const project = useProjectStore((state) => state.project)

  if (!project) return null // You could replace this with a loading spinner for better UX

  return (
    <CommentListContainer
      role="region"
      aria-labelledby="project-title"
      aria-describedby="project-description"
    >
      <h3 id="project-title">{project.projectName}</h3>
      <p id="project-description">{project.projectDescription}</p>
    </CommentListContainer>
  )
}

const CommentListContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.offBackground};
`
