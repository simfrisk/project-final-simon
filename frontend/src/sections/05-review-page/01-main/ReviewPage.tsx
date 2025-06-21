import styled from "styled-components";
import { CommentForm } from "../components/comment-form/CommentForm";
import { CommentSection } from "../components/comment-section/01-main/CommentSection";
import { VideoSection } from "../components/video-section/VideoSection";
import { CommentHeader } from "../components/comment-header/CommentHeader";
import { MediaQueries } from "../../../themes/mediaQueries";

export const ReviewPage = () => {
  return (
    <Container>
      <StyledVideoSection />
      <RightColumn>
        <StyledCommentHeader />
        <StyledCommentSection />
      </RightColumn>
      <StyledCommentForm />
    </Container>
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
  background-color: #f5f5f5;
  height: 100vh;
}
`;

const StyledCommentHeader = styled(CommentHeader)`
  /* No grid-area needed now, it's inside RightColumn */
`;

const StyledCommentSection = styled(CommentSection)`
  /* Same here */
`;