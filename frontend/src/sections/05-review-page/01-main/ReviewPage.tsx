import styled from "styled-components";
import { useEffect, useState } from "react";
import { CommentForm } from "../components/comment-form/CommentForm";
import { CommentSection } from "../components/comment-section/01-main/CommentSection";
import { VideoSection } from "../components/video-section/VideoSection";
import { CommentHeader } from "../components/comment-header/CommentHeader";
import { MediaQueries } from "../../../themes/mediaQueries";
import { DescriptionSection } from "../components/description/DescriptionSection"
import { useParams } from "react-router-dom";
import { useProjectStore } from "../../../store/projectStore";
import { commentStore } from "../../../store/commentStore";
import { ReviewNav } from "../components/nav/ReviewNav";

export const ReviewPage = () => {
  // const project = useProjectStore((state) => state.projects);

  const { projectId } = useParams<{ projectId: string }>();
  const [description, setDescription] = useState(true);
  
  const fetchProjectById = useProjectStore((state) => state.fetchProjectById);
  const fetchComments = commentStore((state) => state.fetchComments);


  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchComments(projectId);
    }

    return () => {
      useProjectStore.setState({ project: null });
      commentStore.setState({ comments: [] });
    };
  }, [projectId, fetchProjectById, fetchComments]);
  return (
    <>
    <ReviewNav />
    <Container>
      <StyledVideoSection />
      <RightColumn>
        <StyledCommentHeader setDescription={setDescription} description={description}/>
      {description && <StyledCommentSection />}
      {!description && <StyledDescriptionSection />}
      </RightColumn>
      {description && <StyledCommentForm />}
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

const StyledCommentHeader = styled(({ setDescription, ...props }) => (
  <CommentHeader {...props} setDescription={setDescription} />
))`
  /* styles */
`;

const StyledCommentSection = styled(CommentSection)`
  /* Same here */
`;

const StyledDescriptionSection = styled(DescriptionSection)`
  /* Same here */
`;