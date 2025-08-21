//#region ----- IMPORTS -----
import styled from "styled-components"
//#endregion

//#region ----- TYPES / INTERFACES -----
interface CommentCardFooterProps {
  _id: string
  likesCount?: number
  user: { role?: string; userId?: string } | null
  commentCreatedBy?: { role?: string; _id?: string }
  editingCommentId: string | null
  setEditingCommentId: (id: string | null) => void
  setEditedContent: (content: string) => void
  content: string
  deleteComment: (id: string) => void
  toggleLike: (id: string) => void
  setReplyToCommentId: (id: string) => void
}
//#endregion

//#region ----- COMPONENT -----
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
  //#endregion

  //#region ----- HANDLERS -----
  const handleEdit = () => {
    setEditingCommentId(_id)
    setEditedContent(content)
  }
  //#endregion

  //#region ----- RENDER -----
  return (
    <Container>
      <ReactionGroup>
        <ActionButton
          type="button"
          onClick={() => setReplyToCommentId(_id)}
          onKeyDown={(e) => e.stopPropagation()}
          aria-label="Reply to comment"
        >
          Reply
        </ActionButton>
        <ActionButtonIcon
          onClick={() => toggleLike(_id)}
          onKeyDown={(e) => e.stopPropagation()}
          aria-label={`Like comment. Current likes: ${likesCount ?? 0}`}
        >
          <img
            src="/icons/like.svg"
            alt=""
            aria-hidden="true"
          />
          <LikeCount $count={likesCount ?? 0}>{likesCount ?? 0}</LikeCount>
        </ActionButtonIcon>
      </ReactionGroup>

      {(user?.role === "teacher" || user?.userId === commentCreatedBy?._id) && (
        <Edit>
          {editingCommentId !== _id && (
            <EditButton
              onClick={handleEdit}
              onKeyDown={(e) => e.stopPropagation()}
              aria-label="Edit comment"
            >
              <img
                src="/icons/edit.svg"
                alt=""
                aria-hidden="true"
              />
            </EditButton>
          )}
          <EditButton
            onClick={() => deleteComment(_id)}
            onKeyDown={(e) => e.stopPropagation()}
            aria-label="Delete comment"
          >
            <img
              src="/icons/delete.svg"
              alt=""
              aria-hidden="true"
            />
          </EditButton>
        </Edit>
      )}
    </Container>
  )
  //#endregion
}

//#region ----- STYLED COMPONENTS -----
const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

const ReactionGroup = styled.div`
  display: flex;
  column-gap: 10px;
`

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textAlternative};
  transition: all 0.3s ease;

  &:hover {
    text-decoration: underline;
    transform: scale(0.95);
  }
`

const ActionButtonIcon = styled.button`
  display: flex;
  column-gap: 8px;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
  transform: scale(0.7);
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  transition: all 0.3s ease;

  img {
    filter: ${({ theme }) => theme.filter.inverted};
  }

  &:hover img {
    transform: scale(0.9);
  }
`

const LikeCount = styled.span<{ $count: number }>`
  visibility: ${({ $count }) => ($count > 0 ? "visible" : "hidden")};
  font-size: 20px;
`

export const Edit = styled.div`
  display: flex;
  column-gap: 10px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 20px;
`

const EditButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;

  img {
    filter: ${({ theme }) => theme.filter.inverted};
  }

  &:hover img {
    transform: scale(0.9);
  }
`
//#endregion
