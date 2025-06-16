import styled from "styled-components";
import { CommentForm } from "../components/comment-form/CommentForm";
import { CommentSection } from "../components/comment-section/01-main/CommentSection";
import { VideoSection } from "../components/video-section/VideoSection";
import { CommentHeader } from "../components/comment-header/CommentHeader";


export const ReviewPage = () => {
  return (
    <>
    {/* <Options /> */}
    <Container>
      <VideoSection />
      <CommentHeader />
      <CommentSection />
      <CommentForm />
    </Container>
    </>
  )
};


const Container = styled.div `
display: grid;
width: 100%;
`