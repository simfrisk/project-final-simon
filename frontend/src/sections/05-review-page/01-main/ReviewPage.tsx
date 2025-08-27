//#region ----- IMPORTS -----
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"

// Components
import { CommentForm } from "../components/comment-form/CommentForm"
import { CommentHeader } from "../components/comment-header/CommentHeader"
import { CommentSection } from "../components/comment-section/01-main/CommentSection"
import { DescriptionSection } from "../components/description/DescriptionSection"
import { ReviewNav } from "../components/nav/ReviewNav"
import { VideoSection } from "../components/video-section/VideoSection"

// Themes / Stores
import { MediaQueries } from "../../../themes/mediaQueries"
import { useProjectStore } from "../../../store/projectStore"
import { commentStore } from "../../../store/commentStore"
import { useTabStore } from "../../../store/tabStore"

//#endregion

//#region ----- COMPONENT -----
export const ReviewPage = () => {
  //#region ----- ROUTER / PARAMS -----
  const { projectId } = useParams<{ projectId: string }>()
  //#endregion

  //#region ----- STORE HOOKS -----
  const activeTab = useTabStore((state) => state.activeTab)
  const fetchProjectById = useProjectStore((state) => state.fetchProjectById)
  const fetchComments = commentStore((state) => state.fetchComments)
  const fetchPrivateComments = commentStore((state) => state.fetchPrivateComments)
  //#endregion

  //#region ----- EFFECTS -----
  useEffect(() => {
    if (!projectId) return

    fetchProjectById(projectId)
    fetchComments(projectId)
    fetchPrivateComments(projectId)

    return () => {
      useProjectStore.setState({ project: null })
      commentStore.setState({
        projectComments: [],
        privateComments: [],
      })
    }
  }, [projectId, fetchProjectById, fetchComments, fetchPrivateComments])
  //#endregion

  //#region ----- CONDITIONAL RENDERING -----
  if (!projectId) {
    return (
      <main
        role="main"
        aria-live="polite"
      >
        <p>Project ID not found</p>
      </main>
    )
  }
  //#endregion

  //#region ----- RENDER UI -----
  return (
    <>
      <InvisibleH1>Project Review</InvisibleH1>
      <ReviewNav aria-label="Review Navigation" />
      <MainContainer role="main">
        <StyledVideoSection aria-label="Project video" />

        <RightColumn>
          <StyledCommentHeader aria-label="Comments header" />

          {activeTab === "description" && (
            <StyledDescriptionSection aria-label="Project description" />
          )}
          {activeTab !== "description" && <StyledCommentSection aria-label="Project comments" />}
        </RightColumn>

        {activeTab !== "description" && <StyledCommentForm aria-label="Add a comment" />}
      </MainContainer>
    </>
  )
  //#endregion
}

//#region ----- STYLED COMPONENTS -----
const MainContainer = styled.div`
  display: grid;
  width: 100%;

  @media ${MediaQueries.biggerSizes} {
    grid-template-columns: minmax(auto, calc(80dvh * 16 / 9)) minmax(400px, 1fr);
    grid-template-areas:
      "video right"
      "form right";
    align-items: start;
  }
`

const StyledVideoSection = styled(VideoSection)`
  grid-area: video;
`

const StyledCommentForm = styled(CommentForm)`
  grid-area: form;
`

const RightColumn = styled.div`
  @media ${MediaQueries.biggerSizes} {
    grid-area: right;
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.offBackground};
    height: 100vh;
  }
`

const StyledCommentHeader = styled(CommentHeader)``

const StyledCommentSection = styled(CommentSection)``

const StyledDescriptionSection = styled(DescriptionSection)``

const InvisibleH1 = styled.h1`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
`

//#endregion
