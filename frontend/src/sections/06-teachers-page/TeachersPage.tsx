import { useEffect } from "react";
import { Navigation } from "../../global-components/Navigation";
import { commentStore } from "../../store/commentStore";

export const TeachersPage = () => {
  const comments = commentStore((state) => state.messages);
  const fetchAllComments = commentStore((state) => state.fetchAllComments);

  useEffect(() => {
    fetchAllComments();
  }, [fetchAllComments]);

  return (
    <>
      <Navigation />
      <p>Teachers dashboard</p>
      {comments.map((comment) => (
        <p key={comment._id}>{comment.content}</p>
      ))}
    </>
  );
};