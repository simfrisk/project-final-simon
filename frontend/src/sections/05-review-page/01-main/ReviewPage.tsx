import { CommentForm } from "../components/comment-form/CommentForm";
import { CommentSection } from "../components/comment-section/01-main/CommentSection";
import { VideoSection } from "../components/video-section/VideoSection";


export const ReviewPage = () => {
  return (
    <>
    <p>Here is the video page</p>
    {/* <Options /> */}
    <CommentSection />
    <CommentForm />
    <VideoSection />
    </>
  )
};