import { useState } from 'react';
import type { MessageType } from '../../../../../store/commentStore';
import styled from 'styled-components';
import { commentStore } from '../../../../../store/commentStore';
import { ReplyCard } from '../components/reply-card/ReplyCard';
import { MediaQueries } from '../../../../../themes/mediaQueries';
import { unFormatTime } from '../../video-section/utils/unFormatTime';
import { useUserStore } from '../../../../../store/userStore';
import { useTabStore } from '../../../../../store/tabStore';
import { useVideoStore } from '../../../../../store/videoStore';
import { CommentCardHeader } from '../components/CommentCardHeader';
import { CheckBtn } from '../components/CommentCardHeader';
import { CommentCardMain } from '../components/CommentCardMain';
import { CommentCardFooter } from '../components/CommentCardFooter';
import { Edit } from '../components/CommentCardFooter';

export const CommentSection = () => {
  const activeTab = useTabStore((state) => state.activeTab);
  const { user } = useUserStore();

  const [reply, setReply] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  //Replie toggle
 const [openReplies, setOpenReplies] = useState<{ [key: string]: boolean }>({});

 const toggleReplies = (id: string) => {
  setOpenReplies((prev) => ({
  ...prev,
  [id]: !prev[id],
}));
 }

  const selectedCommentId = commentStore((state) => state.selectedCommentId);
  const addReply = commentStore((state) => state.addReply);
  const updateComment = commentStore((state) => state.updateComment);

  const rawMessages: MessageType[] =
    activeTab === "private"
      ? commentStore((state) => state.privateComments)
      : commentStore((state) => state.projectComments);

  const messages = [...rawMessages].sort(
    (a, b) => unFormatTime(a.timeStamp) - unFormatTime(b.timeStamp)
  );

  const toggleCheck = commentStore((state) => state.toggleCheck);
  const toggleLike = commentStore((state) => state.toggleLike)
  const deleteComment = commentStore((state) => state.deleteComment);
  const setSelectedTimeStamp = commentStore((state) => state.setSelectedTimeStamp);

  const handleToggleCheck = async (id: string) => {
    if (user?.role !== 'teacher') return;
    await toggleCheck(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !replyToCommentId) return;

    const targetComment = messages.find((msg) => msg._id === replyToCommentId);
    if (!targetComment || !targetComment.projectId) {
      console.error('Missing projectId or commentId');
      return;
    }

    try {
      await addReply({
        content: reply.trim(),
        commentId: targetComment._id,
        projectId: targetComment.projectId,
      });

      setReply('');
      setReplyToCommentId(null);
      setOpenReplies((prev) => ({
      ...prev,
      [replyToCommentId]: true,
    }));
    } catch (err) {
      console.error('Failed to add reply:', err);
    }
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editedContent.trim()) return;

    await updateComment({
      commentId,
      content: editedContent.trim(),
    });

    setEditingCommentId(null);
    setEditedContent('');
  };
  

  return (
    <CommentListContainer>
      {messages.map(({ _id, content, createdAt, timeStamp, replies, isChecked, commentCreatedBy, likesCount }) => (
        <Card
          key={_id}
          $role={commentCreatedBy?.role}
          onClick={() => {
            const seconds = unFormatTime(timeStamp);
            setSelectedTimeStamp(timeStamp);
            commentStore.getState().setSelectedCommentId(_id);
            useVideoStore.getState().setTimeCode(seconds);
            useVideoStore.getState().incrementMarkerTrigger();
          }}
          tabIndex={0}
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
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply..."
                aria-label="Write a reply for the comment"
              />
              <button type="submit" aria-label='Subimt the reply '>Add</button>
            </AddReplyForm>
          )}

          {(replies?.length || 0) > 0 && (
          <>
          
            <ShowReplies
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleReplies(_id);
              }}
            >
                <ArrowIcon isOpen={!!openReplies[_id]} />
                {`${replies?.length ?? 0} ${replies?.length === 1 ? 'Reply' : 'Replies'}`}
            </ShowReplies>

            {openReplies[_id] && (
              <ReplyCardContainer>
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
      ))}
    </CommentListContainer>
  );
};

// Styled Components

const CommentListContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.offBackground};

  @media ${MediaQueries.biggerSizes} {
    overflow: scroll;
  }
`;

const Card = styled.div<{ $role?: string }>`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);
  transition: 0.3s ease;
  align-items: center;
  cursor: pointer;
  background-color: ${({ $role, theme }) =>
    $role === 'teacher'
      ? theme.colors.lightBlue
      : theme.colors.background};


  &:hover {
    transform: scale(0.98);
      background-color: ${({ $role, theme }) =>
      $role === 'teacher'
        ? theme.colors.lightBlueHover
        : theme.colors.backgroundHover};
  }

  &:focus {
    transform: scale(0.98);
    background-color: ${({ $role, theme }) =>
      $role === 'teacher'
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
  width: 100%;
`;

const AddReplyForm = styled.form `
  input {
      padding: 6px 12px;
      border: solid 1px black;
      border-radius: 6px;
      margin: 8px 6px;
    }

    button {
      padding: 8px 14px;
      border: none;
      border-radius: 15px;
      margin: 8px 6px;
      color: white;
      background-color: #007bff;
    }
`

const ShowReplies = styled.button`
  display: flex;
  justify-content: flex-start;
  color: ${({theme}) => theme.colors.text};
  border: none;
  padding: 6px 10px;
  border-radius: 15px;
  cursor: pointer;
  background-color: transparent;
  display: flex;
  align-items: center;
  gap: 6px;  
  font-weight: bold;
  

  &:hover {
    transform: scale(0.96);
    background-color: #1961b431;
  }
`;

const ArrowIcon = styled.span<{ isOpen: boolean }>`

justify-content: center;
  display: inline-block;
  border-style: solid;
  border-width: 6px 6px 0 6px;
  border-color: ${({ theme }) => theme.colors.text} transparent transparent transparent;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(0)' : 'rotate(-90deg)')};
  transition: transform 0.3s ease;
  width: 0;
  height: 0;
`;