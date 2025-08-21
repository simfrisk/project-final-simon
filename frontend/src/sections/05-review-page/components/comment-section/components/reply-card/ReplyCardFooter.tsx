//#region ----- IMPORTS -----
import styled from "styled-components"
import type { ReplyType } from "../../../../../../store/commentStore"
//#endregion

//#region ----- INTERFACES / TYPES -----
type ReplyCardFooterProps = {
  reply: ReplyType
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  setReplyToCommentId: (id: string | null) => void
  toggleReplyLike: (replyId: string) => void
  deleteReply: (replyId: string, commentId: string) => void
}
//#endregion

//#region ----- COMPONENT -----
export const ReplyCardFooter = ({
  reply,
  isEditing,
  setIsEditing,
  setReplyToCommentId,
  toggleReplyLike,
  deleteReply,
}: ReplyCardFooterProps) => {
  //#region ----- RENDER -----
  return (
    <Container
      role="group"
      aria-label="Reply actions"
    >
      <Actions>
        <ActionButton
          onClick={() => setReplyToCommentId(reply.commentId)}
          aria-label="Reply to this comment"
          onKeyDown={(e) => e.stopPropagation()}
        >
          Reply
        </ActionButton>

        <ActionButtonIcon
          onClick={() => toggleReplyLike(reply._id)}
          aria-label={`Like this reply. ${reply.likesCount ?? 0} likes`}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <img
            src="/icons/like.svg"
            alt=""
            aria-hidden="true"
          />
          <LikeCount count={reply.likesCount ?? 0}>
            {reply.likesCount ?? 0}
          </LikeCount>
        </ActionButtonIcon>
      </Actions>

      <Edit>
        {!isEditing && (
          <IconButton
            onClick={() => setIsEditing(true)}
            aria-label="Edit this reply"
            onKeyDown={(e) => e.stopPropagation()}
          >
            <img
              src="/icons/edit.svg"
              alt=""
              aria-hidden="true"
            />
          </IconButton>
        )}

        <IconButton
          onClick={() => deleteReply(reply._id, reply.commentId)}
          aria-label="Delete this reply"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <img
            src="/icons/delete.svg"
            alt=""
            aria-hidden="true"
          />
        </IconButton>
      </Edit>
    </Container>
  )
  //#endregion
}
//#endregion

//#region ----- STYLED COMPONENTS -----
const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

const Actions = styled.div`
  display: flex;
  column-gap: 10px;
`

const ActionButton = styled.button`
  color: ${({ theme }) => theme.colors.textAlternative};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover,
  &:focus {
    text-decoration: underline;
    outline: none;
  }
`

const ActionButtonIcon = styled.button`
  display: flex;
  column-gap: 15px;
  background: none;
  border: none;
  padding: 0;
  transform: scale(0.7);
  cursor: pointer;

  &:hover,
  &:focus {
    transform: scale(0.9);
    outline: none;
  }

  img {
    filter: ${({ theme }) => theme.filter.inverted};
  }
`

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover,
  &:focus {
    transform: scale(0.9);
    outline: none;
  }

  img {
    filter: ${({ theme }) => theme.filter.inverted};
  }
`

const LikeCount = styled.p<{ count: number }>`
  visibility: ${({ count }) => (count > 0 ? "inline-block" : "hidden")};
  font-size: 20px;
  margin: 0;
`

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
  transition:
    opacity 0.3s ease,
    visibility 0s linear 0.3s,
    transform 0.3s ease;
`
//#endregion
