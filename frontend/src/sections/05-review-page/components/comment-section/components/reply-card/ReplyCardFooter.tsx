import styled from "styled-components";
import type { ReplyType } from "../../../../../../store/commentStore";

type ReplyCardFooterProps = {
  reply: ReplyType;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setReplyToCommentId: (id: string | null) => void;
  toggleReplyLike: (replyId: string) => void;
  deleteReply: (replyId: string, commentId: string) => void;
};

export const ReplyCardFooter = ({
  reply,
  isEditing,
  setIsEditing,
  setReplyToCommentId,
  toggleReplyLike,
  deleteReply,
}: ReplyCardFooterProps) => {
  
  return (
    <Container>
        <React>
          <ActionButton onClick={() => setReplyToCommentId(reply.commentId)}>Reply</ActionButton>
          <ActionButtonIcon onClick={() => toggleReplyLike(reply._id)}>
            <img src="/icons/like.svg" alt="Like button" />
            <LikeCount count={reply.likesCount ?? 0}>
              {reply.likesCount ?? 0}
            </LikeCount>
          </ActionButtonIcon>
        </React>
        <Edit>
          {!isEditing && (
            <img
              src="/icons/edit.svg"
              alt="Edit Icon"
              onClick={() => setIsEditing(true)}
            />
          )}
          <img
            onClick={() => deleteReply(reply._id, reply.commentId)}
            src="/icons/delete.svg"
            alt="Delete Icon"
          />
        </Edit>
      </Container>
  )
};

const React = styled.div`
  display: flex;
  column-gap: 10px;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const ActionButton = styled.button`
  color: ${({theme}) => theme.colors.textAlternative};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ActionButtonIcon = styled.button`
  display: flex;
  column-gap: 15px;
  background: none;
  border: none;
  padding: 0;
  transform: scale(0.70);
  cursor: pointer;

  img {
    filter: ${({ theme }) => theme.filter.inverted};
    }

  img:hover {
    transform: scale(0.9);
  }
`;

const LikeCount = styled.p<{ count: number }>`
visibility: ${({ count }) => (count > 0 ? 'inline-block' : 'hidden')};
font-size: 20px;
margin: 0;
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
  transform: translatey(30%);
  transition:
    opacity 0.3s ease,
    visibility 0s linear 0.3s,
    transform 0.3s ease;

  img {
    filter: ${({ theme }) => theme.filter.inverted};
    }

  img:hover {
    transition: ease 0.3s;
    transform: scale(0.9);
  }
`;