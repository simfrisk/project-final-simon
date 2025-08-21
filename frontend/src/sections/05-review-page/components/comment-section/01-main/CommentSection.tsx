//#region ----- IMPORTS -----
import { useState, useMemo } from "react"
import styled from "styled-components"
import { MediaQueries } from "../../../../../themes/mediaQueries"

import { commentStore } from "../../../../../store/commentStore"
import { useUserStore } from "../../../../../store/userStore"
import { useTabStore } from "../../../../../store/tabStore"
import { useVideoStore } from "../../../../../store/videoStore"

import type { MessageType } from "../../../../../store/commentStore"
import { unFormatTime } from "../../video-section/utils/unFormatTime"
import { handleReplySubmit } from "./utils/handleReplySubmit"

import { CommentCardHeader } from "../components/CommentCardHeader"
import { CheckBtn } from "../components/CommentCardHeader"
import { CommentCardMain } from "../components/CommentCardMain"
import { CommentCardFooter } from "../components/CommentCardFooter"
import { Edit } from "../components/CommentCardFooter"
import { ReplyCard } from "../components/reply-card/ReplyCard"

//#endregion

//#region ----- COMPONENT -----
export const CommentSection = () => {
  //#region ----- STORE & STATE HOOKS -----
  const activeTab = useTabStore((state) => state.activeTab)
  const { user } = useUserStore()

  const [reply, setReply] = useState("")
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [openReplies, setOpenReplies] = useState<Set<string>>(new Set())

  const selectedCommentId = commentStore((state) => state.selectedCommentId)
  const addReply = commentStore((state) => state.addReply)
  const updateComment = commentStore((state) => state.updateComment)
  const toggleCheck = commentStore((state) => state.toggleCheck)
  const toggleLike = commentStore((state) => state.toggleLike)
  const deleteComment = commentStore((state) => state.deleteComment)
  const setSelectedTimeStamp = commentStore(
    (state) => state.setSelectedTimeStamp
  )
  //#endregion

  //#region ----- DATA PREPARATION -----
  const rawMessages: MessageType[] =
    activeTab === "private"
      ? commentStore((state) => state.privateComments)
      : commentStore((state) => state.projectComments)

  const messages = useMemo(
    () =>
      [...rawMessages].sort(
        (a, b) => unFormatTime(a.timeStamp) - unFormatTime(b.timeStamp)
      ),
    [rawMessages]
  )
  //#endregion

  //#region ----- HANDLERS -----
  const toggleReplies = (id: string) => {
    setOpenReplies((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const handleToggleCheck = async (id: string) => {
    if (user?.role !== "teacher") return
    await toggleCheck(id)
  }

  const handleSubmit = (e: React.FormEvent) =>
    handleReplySubmit(
      e,
      reply,
      replyToCommentId,
      messages,
      addReply,
      setReply,
      setReplyToCommentId,
      setOpenReplies
    )

  const handleSaveEdit = async (commentId: string) => {
    if (!editedContent.trim()) return

    await updateComment({
      commentId,
      content: editedContent.trim(),
    })

    setEditingCommentId(null)
    setEditedContent("")
  }

  const handleCardClick = (timeStamp: string, commentId: string) => {
    const seconds = unFormatTime(timeStamp)
    setSelectedTimeStamp(timeStamp)
    commentStore.getState().setSelectedCommentId(commentId)
    useVideoStore.getState().setTimeCode(seconds)
    useVideoStore.getState().incrementMarkerTrigger()
  }
  //#endregion

  //#region ----- RENDER -----
  return (
    <CommentListContainer>
      {messages.map(
        ({
          _id,
          content,
          createdAt,
          timeStamp,
          replies,
          isChecked,
          commentCreatedBy,
          likesCount,
        }) => (
          <Card
            key={_id}
            $role={commentCreatedBy?.role}
            onClick={() => handleCardClick(timeStamp, _id)}
            tabIndex={0}
            role="button"
            aria-pressed={selectedCommentId === _id}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleCardClick(timeStamp, _id)
              }
            }}
            className={selectedCommentId === _id ? "active-comment" : ""}
          >
            <CommentCardHeader
              _id={_id}
              commentCreatedBy={commentCreatedBy}
              createdAt={createdAt}
              isChecked={isChecked}
              user={user}
              handleToggleCheck={handleToggleCheck}
            />

            <CommentCardMain
              _id={_id}
              content={content}
              handleSaveEdit={handleSaveEdit}
              setEditedContent={setEditedContent}
              editedContent={editedContent}
              editingCommentId={editingCommentId}
              setEditingCommentId={setEditingCommentId}
            />

            <CommentCardFooter
              _id={_id}
              likesCount={likesCount}
              user={user}
              commentCreatedBy={commentCreatedBy}
              editingCommentId={editingCommentId}
              setEditingCommentId={setEditingCommentId}
              setEditedContent={setEditedContent}
              content={content}
              deleteComment={deleteComment}
              toggleLike={toggleLike}
              setReplyToCommentId={setReplyToCommentId}
            />

            {replyToCommentId === _id && (
              <AddReplyForm onSubmit={handleSubmit}>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply..."
                  aria-label={`Write a reply for comment by ${commentCreatedBy?.name ?? "user"}`}
                />
                <button
                  type="submit"
                  aria-label="Submit the reply"
                  disabled={!reply.trim()}
                >
                  Add
                </button>
              </AddReplyForm>
            )}

            {(replies?.length ?? 0) > 0 && (
              <>
                <ShowReplies
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleReplies(_id)
                  }}
                  aria-expanded={openReplies.has(_id)}
                  aria-controls={`replies-${_id}`}
                >
                  <ArrowIcon $isOpen={openReplies.has(_id)} />
                  {`${replies?.length ?? 0} ${replies?.length === 1 ? "Reply" : "Replies"}`}
                </ShowReplies>

                {openReplies.has(_id) && (
                  <ReplyCardContainer id={`replies-${_id}`}>
                    {replies?.map((reply) => (
                      <ReplyCard
                        key={reply._id}
                        reply={reply}
                        setReplyToCommentId={setReplyToCommentId}
                      />
                    ))}
                  </ReplyCardContainer>
                )}
              </>
            )}
          </Card>
        )
      )}
    </CommentListContainer>
  )
  //#endregion
}
//#endregion

//#region ----- STYLED COMPONENTS -----

const CommentListContainer = styled.section`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.offBackground};

  @media ${MediaQueries.biggerSizes} {
    overflow: scroll;

    &::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
`

const Card = styled.div<{ $role?: string }>`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);
  transition: 0.3s ease;
  align-items: stretch;
  cursor: pointer;
  background-color: ${({ $role, theme }) =>
    $role === "teacher" ? theme.colors.lightBlue : theme.colors.background};

  &:hover {
    transform: scale(0.98);
    background-color: ${({ $role, theme }) =>
      $role === "teacher"
        ? theme.colors.lightBlueHover
        : theme.colors.backgroundHover};
  }

  &:focus {
    transform: scale(0.98);
    background-color: ${({ $role, theme }) =>
      $role === "teacher"
        ? theme.colors.lightBlueActive
        : theme.colors.backgroundActive};
    border-left: solid #007bff 3px;
    transition: ease 0.2s;
  }

  &:hover ${Edit} {
    opacity: 1;
    visibility: visible;
    transform: translatey(0%);
  }

  &:hover ${CheckBtn} {
    opacity: 1;
    visibility: visible;
    transform: translatey(0%);
  }

  &.active-comment {
    border-left: solid #007bff 3px;
    transform: scale(0.98);
  }
`

const ReplyCardContainer = styled.div`
  display: flex;
  justify-content: space-between;
  &:hover ${Edit} {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }
`

const AddReplyForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;

  textarea {
    background-color: ${({ theme }) =>
      theme.name === "dark" ? "#242e3e" : "#fff"};
    color: ${({ theme }) => theme.colors.text};
    padding: 10px 12px;
    border: 1px solid ${({ theme }) => theme.colors.textAlternative};
    border-radius: 6px;
    width: 100%;
    min-height: 80px;
    margin: 10px 0;
    resize: vertical;
  }

  button {
    width: 100%; // full width
    padding: 8px 14px;
    border: none;
    border-radius: 15px;
    background-color: #007bff;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #0056b3;
      transform: scale(0.98);
    }
  }
`

const ShowReplies = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  margin-top: 6px;
  gap: 6px;
  padding: 4px 0;
`

const ArrowIcon = styled.span<{ $isOpen: boolean }>`
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid ${({ theme }) => theme.colors.text};
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};
`

//#endregion
