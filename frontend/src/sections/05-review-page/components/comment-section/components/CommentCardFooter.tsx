import styled from "styled-components";

interface CommentCardFooterProps {
  _id: string;
  likesCount?: number;
  user: { role?: string; userId?: string } | null;
  commentCreatedBy?: { role?: string; _id?: string };
  editingCommentId: string | null;
  setEditingCommentId: (id: string | null) => void;
  setEditedContent: (content: string) => void;
  content: string;
  deleteComment: (id: string) => void;
  toggleLike: (id: string) => void;
  setReplyToCommentId: (id: string) => void;
}

export const CommentCardFooter = ({
  _id,
  likesCount,
  user,
  commentCreatedBy,
  editingCommentId,
  setEditingCommentId,
  setEditedContent,
  content,
  deleteComment,
  toggleLike,
  setReplyToCommentId,
}: CommentCardFooterProps) => {
  return (
    <Container>
      <ReactionGroup>
        <ActionButton onClick={() => setReplyToCommentId(_id)}>Reply</ActionButton>
        <ActionButtonIcon onClick={() => toggleLike(_id)}>
          <img src="/icons/like.svg" alt="Like button" />
          <LikeCount $count={likesCount ?? 0}>{likesCount ?? 0}</LikeCount>
        </ActionButtonIcon>
      </ReactionGroup>

      {(user?.role === 'teacher' || user?.userId === commentCreatedBy?._id) && (
        <Edit>
          {editingCommentId !== _id && (
            <img
              src="/icons/edit.svg"
              alt="Edit Icon"
              onClick={() => {
                setEditingCommentId(_id);
                setEditedContent(content);
              }}
            />
          )}
          <img
            src="/icons/delete.svg"
            alt="Delete Icon"
            onClick={() => deleteComment(_id)}
          />
        </Edit>
      )}
    </Container>
  );
};

const ReactionGroup = styled.div`
  display: flex;
  column-gap: 10px;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: ease 0.3s;
  color: ${({theme}) => theme.colors.textAlternative};

  &:hover {
    text-decoration: underline;
    transform: scale(0.95);
  }
`;

const LikeCount = styled.p<{ $count: number }>`
  visibility: ${({ $count }) => ($count > 0 ? 'inline-block' : 'hidden')};
  font-size: 20px;
  margin: 0;
`;

const ActionButtonIcon = styled.button`
  display: flex;
  color: ${({ theme }) => theme.colors.primary};
  column-gap: 10px;
  transition: ease 0.3s;
  background: none;
  border: none;
  padding: 0;
  transform: scale(0.7);
  cursor: pointer;

  img {
    filter: ${({ theme }) => theme.filter.inverted};
    }

  img:hover {
    transform: scale(0.9);
  }
`;

export const Edit = styled.div`
  opacity: 0;
  visibility: hidden;
  display: flex;
  column-gap: 10px;
  align-items: center;
  justify-content: center;
  width: 40px;
  margin: 0 20px 0 0;
  cursor: pointer;
  transform: translateY(30%);
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;

  img {
  filter: ${({ theme }) => theme.filter.inverted};
  }

  img:hover {
    transition: ease 0.3s;
    transform: scale(0.9);
  }
`;