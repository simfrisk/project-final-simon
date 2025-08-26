import styled from "styled-components"
import type { ReplyType } from "../../../../../../store/commentStore"
import { commentStore } from "../../../../../../store/commentStore"
import { useState } from "react"
import { ReplyCardHeader } from "./ReplyCardHeader"
import { Edit } from "./ReplyCardFooter"
import { ReplyCardMain } from "./ReplyCardMain"
import { ReplyCardFooter } from "./ReplyCardFooter"

type ReplyCardProps = {
  reply: ReplyType
  setReplyToCommentId: (id: string | null) => void
}

export const ReplyCard = ({ reply, setReplyToCommentId }: ReplyCardProps) => {
  const deleteReply = commentStore((state) => state.deleteReply)
  const updateReply = commentStore((state) => state.updateReply)
  const toggleReplyLike = commentStore((state) => state.toggleReplyLike)

  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(reply.content)

  const handleSaveEdit = async () => {
    if (editedContent.trim() === "") return

    await updateReply({
      replyId: reply._id,
      content: editedContent.trim(),
    })

    setIsEditing(false)
  }

  return (
    <Card $role={reply.replyCreatedBy?.role}>
      <ReplyCardHeader reply={reply} />

      <ReplyCardMain
        reply={reply}
        editedContent={editedContent}
        setEditedContent={setEditedContent}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleSaveEdit={handleSaveEdit}
      />

      <ReplyCardFooter
        reply={reply}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        setReplyToCommentId={setReplyToCommentId}
        toggleReplyLike={toggleReplyLike}
        deleteReply={deleteReply}
      />
    </Card>
  )
}

const Card = styled.div<{ $role?: string }>`
  width: 100%;
  margin: 12px auto;
  display: flex;
  flex-direction: column;
  background-color: ${({ $role, theme }) =>
    $role === "teacher" && theme.name === "dark"
      ? theme.colors.primary
      : $role === "teacher"
        ? theme.colors.lightBlue
        : theme.name === "dark"
          ? theme.colors.lightBlue
          : theme.colors.background};
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);
  border: solid lightgray 1px;
  transition: 0.3s ease;
  align-items: center;
  cursor: pointer;

  &:hover {
    transform: scale(0.98);
    background-color: ${({ $role, theme }) =>
      $role === "teacher" && theme.name === "dark"
        ? theme.colors.primaryHover
        : $role === "teacher"
          ? theme.colors.lightBlueHover
          : theme.name === "dark"
            ? theme.colors.lightBlueHover
            : theme.colors.backgroundHover};
  }

  &:hover ${Edit} {
    opacity: 1;
    visibility: visible;
    transform: translatey(0%);
    transition:
      opacity 1s ease,
      visibility 0s linear 0s,
      transform 0.4s ease;
  }
`
