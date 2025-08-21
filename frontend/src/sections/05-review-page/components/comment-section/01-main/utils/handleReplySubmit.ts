type Message = {
  _id: string
  projectId?: string
  [key: string]: any
}

type AddReplyFunction = (data: {
  content: string
  commentId: string
  projectId: string
}) => Promise<void>

export const handleReplySubmit = async (
  e: React.FormEvent,
  reply: string,
  replyToCommentId: string | null,
  messages: Message[],
  addReply: AddReplyFunction,
  setReply: (value: string) => void,
  setReplyToCommentId: (id: string | null) => void,
  setOpenReplies: (updater: (prev: Set<string>) => Set<string>) => void
) => {
  e.preventDefault()

  if (!reply.trim() || !replyToCommentId) return

  const targetComment = messages.find((msg) => msg._id === replyToCommentId)
  if (!targetComment || !targetComment.projectId) {
    console.error("Missing projectId or commentId")
    return
  }

  try {
    await addReply({
      content: reply.trim(),
      commentId: targetComment._id,
      projectId: targetComment.projectId,
    })

    setReply("")
    setReplyToCommentId(null)
    setOpenReplies((prev) => new Set(prev).add(replyToCommentId))
  } catch (err) {
    console.error("Failed to add reply:", err)
  }
}
