//#region ----- IMPORTS -----
import styled from "styled-components"

import { useProjectStore } from "../../../../store/projectStore"
import { MediaQueries } from "../../../../themes/mediaQueries"
import { useTabStore } from "../../../../store/tabStore"
//#endregion

//#region ----- Component Logic -----
export const CommentHeader = () => {
  const project = useProjectStore((state) => state.project)
  const activeTab = useTabStore((state) => state.activeTab)
  const setActiveTab = useTabStore((state) => state.setActiveTab)

  if (!project) return null
  //#endregion

  //#region ----- RENDER -----
  return (
    <Container>
      <Title>{project.projectName}</Title>
      <ButtonGroup
        role="tablist"
        aria-label="Comment tabs"
      >
        <TabButton
          role="tab"
          id="tab-description"
          aria-selected={activeTab === "description"}
          $active={activeTab === "description"}
          onClick={() => setActiveTab("description")}
        >
          Description
        </TabButton>
        <TabButton
          role="tab"
          id="tab-question"
          aria-selected={activeTab === "question" || activeTab === "public"}
          $active={activeTab === "question" || activeTab === "public"}
          onClick={() => setActiveTab("question")}
        >
          Question
        </TabButton>
        <TabButton
          role="tab"
          id="tab-private"
          aria-selected={activeTab === "private"}
          $active={activeTab === "private"}
          onClick={() => setActiveTab("private")}
        >
          Comments
        </TabButton>
      </ButtonGroup>
    </Container>
  )
  //#endregion
}

//#region ----- STYLED COMPONENTS -----
const Container = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  background-color: ${({ theme }) => theme.colors.offBackground};
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);

  @media ${MediaQueries.biggerSizes} {
    padding: 0 0 10px 0;
  }
`

const Title = styled.h3`
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 700;

  @media ${MediaQueries.biggerSizes} {
    margin: 25px 0;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;

  @media ${MediaQueries.smallPhone} {
    gap: 2px;
  }

  @media ${MediaQueries.biggerSizes} {
    gap: 16px;
  }
`

const TabButton = styled.button<{ $active?: boolean }>`
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
  color: ${({ $active }) => ($active ? "white" : "#1566e9")};
  border: 2px solid #1566e9;
  padding: 8px 15px;
  border-radius: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    background-color: ${({ $active }) => ($active ? "#0056b3" : "#e6f0ff")};
    transform: scale(0.96);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgb(0 123 255 / 0.5);
  }

  @media ${MediaQueries.smallPhone} {
    padding: 4px 10px;
  }
`
//#endregion
