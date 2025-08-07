import styled from 'styled-components';
import { CircleCheckboxLabel, HiddenCheckbox, StyledCircle } from '../../../../../global-components/checkbox';
import type { ReplyType } from '../../../../../store/commentStore';
import moment from 'moment';
import { commentStore } from '../../../../../store/commentStore';
import { replyStore } from '../../../../../store/replyStore'; // import your replyStore
import { useState } from 'react';

type ReplyCardProps = {
  reply: ReplyType;
  setReplyToCommentId: (id: string | null) => void;
};

export const ReplyCard = ({ reply, setReplyToCommentId }: ReplyCardProps) => {
  const { deleteReply } = commentStore();
  const { updateReply } = replyStore();
  const toggleLike = replyStore((state) => state.toggleLike)

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(reply.content);

  const handleSaveEdit = async () => {
    if (editedContent.trim() === '') return;

    await updateReply({
      replyId: reply._id,
      content: editedContent.trim(),
    });

    setIsEditing(false);
  };

  return (
    <Card $role={reply.replyCreatedBy?.role}>
      <TopSection>
        <ImageContainer>
          <img
            src={reply.replyCreatedBy?.profileImage || "/default-profile.png"}
            alt={`${reply.replyCreatedBy?.name || "Anonymous"}'s profile image`}
          />
        </ImageContainer>
        <Content>
          <CardHeader>
            <strong>{reply.replyCreatedBy?.name || "Anonymous"}</strong>
            <Dot>&middot;</Dot>
            <span>{moment(reply.createdAt).fromNow()}</span>
          </CardHeader>
        </Content>
        <CheckBtn>
          <CircleCheckboxLabel>
            <HiddenCheckbox />
            <StyledCircle $checked={false} />
          </CircleCheckboxLabel>
        </CheckBtn>
      </TopSection>

      <CardMain>
        {isEditing ? (
          <>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid lightgray",
              }}
            />
            <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={() => { setIsEditing(false); setEditedContent(reply.content); }}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          reply.content
        )}
      </CardMain>

      <CardFooter>
        <React>
          <ActionButton onClick={() => setReplyToCommentId(reply.commentId)}>Reply</ActionButton>
          <ActionButtonIcon onClick={() => toggleLike(reply._id)}>
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
      </CardFooter>
    </Card>
  );
};

const TopSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  gap: 15px;
  align-items: center;
`;

const CheckBtn = styled.div`
  opacity: 0;
  visibility: hidden;
  display: flex;
  column-gap: 10px;
  align-items: center;
  justify-content: center;
  width: 40px;
  cursor: pointer;
  transform: translatey(30%);
  transition:
    opacity 0.3s ease,
    visibility 0s linear 0.3s,
    transform 0.3s ease;
`;

const Edit = styled.div`
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
    transform: scale(0.80);
  }
`;

const React = styled.div`
  display: flex;
  column-gap: 10px;
`;

const Card = styled.div<{ $role?: string }>`
  width: 100%;
  margin: 12px auto;
  display: flex;
  flex-direction: column;
  background-color: ${({ $role }) => ($role === 'teacher' ? '#deeafb' : '#ffffff')};
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);
  border: solid lightgray 1px;
  transition: 0.3s ease;
  align-items: center;
  cursor: pointer;

  &:hover {
    transform: scale(0.98);
    background-color: ${({ $role }) => ($role === 'teacher' ? '#d4e3f8' : '#fafafa')};
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

  &:hover ${CheckBtn} {
    opacity: 1;
    visibility: visible;
    transform: translatey(0%);
    transition:
      opacity 1s ease,
      visibility 0s linear 0s,
      transform 0.4s ease;
  }
`;

const ImageContainer = styled.div`
  flex-shrink: 0;
  height: 32px;
  width: 32px;
  border-radius: 50px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555555;
`;

const Dot = styled.span``;

const CardMain = styled.div`
  text-align: left;
  width: 100%;
  margin: 8px 0;
  color: #333333;

    button {
    padding: 8px 14px;
    border: none;
    border-radius: 15px;
    margin: 8px 2px;
    color: white;
    background-color: #007bff;
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ActionButtonIcon = styled.button`
  background: none;
  border: none;
  padding: 0;
  transform: scale(0.70);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const LikeCount = styled.p<{ count: number }>`
visibility: ${({ count }) => (count > 0 ? 'inline-block' : 'hiddenblock')};
font-size: 20px;
margin: 0;
`;