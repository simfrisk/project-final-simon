import styled from "styled-components";
import { useEffect } from "react";
import { CommentForm } from "../components/comment-form/CommentForm";
import { CommentSection } from "../components/comment-section/01-main/CommentSection";
import { VideoSection } from "../components/video-section/VideoSection";
import { CommentHeader } from "../components/comment-header/CommentHeader";
import { MediaQueries } from "../../../themes/mediaQueries";
import { DescriptionSection } from "../components/description/DescriptionSection";
import { useParams } from "react-router-dom";
import { useProjectStore } from "../../../store/projectStore";
import { commentStore } from "../../../store/commentStore";
import { ReviewNav } from "../components/nav/ReviewNav";
import { useTabStore } from "../../../store/tabStore";

export const ReviewPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const activeTab = useTabStore((state) => state.activeTab);
  const fetchProjectById = useProjectStore((state) => state.fetchProjectById);
  const fetchComments = commentStore((state) => state.fetchComments);
  const fetchPrivateComments = commentStore((state) => state.fetchPrivateComments);

  useEffect(() => {
    if (!projectId) return;

    fetchProjectById(projectId);
    fetchComments(projectId);
    fetchPrivateComments(projectId);

    return () => {
      useProjectStore.setState({ project: null });
      commentStore.setState({
        projectComments: [],
        privateComments: [],
      });
    };
  }, [projectId, fetchProjectById, fetchComments, fetchPrivateComments]);

  if (!projectId) {
    return <div>Project ID not found</div>;
  }

  return (
    <>
      <ReviewNav />
      <Container>
        <StyledVideoSection />
        <RightColumn>

          <StyledCommentHeader />

          {activeTab === "description" && 
            <StyledDescriptionSection />}

          {activeTab === "question" && (
            <StyledQuestionSection projectId={projectId} type="question" />
          )}

          {activeTab === "private" && (
            <StyledPrivateSection projectId={projectId} type="private" />
          )}
          
        </RightColumn>

          <StyledCommentForm />

      </Container>
    </>
  );
};

const Container = styled.div`
  display: grid;
  width: 100%;

  @media ${MediaQueries.biggerSizes} {
    grid-template-columns: 1fr 400px;
    grid-template-areas:
      "video right"
      "form right";
    align-items: start;
  }
`;

const StyledVideoSection = styled(VideoSection)`
  grid-area: video;
`;

const StyledCommentForm = styled(CommentForm)`
  grid-area: form;
`;


const RightColumn = styled.div`
  @media ${MediaQueries.biggerSizes} {
    grid-area: right;
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.offBackground};
    height: 100vh;
  }
`;

// Just use CommentHeader directly; no props needed
const StyledCommentHeader = styled(CommentHeader)``;

const StyledQuestionSection = styled(CommentSection)``;
const StyledPrivateSection = styled(CommentSection)``;
const StyledDescriptionSection = styled(DescriptionSection)``;