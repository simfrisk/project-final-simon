import { useState } from 'react';
import type { MessageType } from '../../../../../store/commentStore';
import styled from 'styled-components';
import moment from 'moment';
import { commentStore } from '../../../../../store/commentStore';
import { CircleCheckboxLabel, HiddenCheckbox, StyledCircle } from '../../../../../global-components/checkbox';
import { ReplyCard } from '../components/ReplyCard';



export const CommentSection = () => {
  // local state for reply input and which comment is being replied to
  const [reply, setReply] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);

  // Zustand stores and actions
  const messages: MessageType[] = commentStore((state) => state.messages);

  const deleteMessage = commentStore((state) => state.deleteMessage);
  const setSelectedTimeStamp = commentStore((state) => state.setSelectedTimeStamp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || replyToCommentId === null) return; // input validation and check target

    const newReply = {
      replyId: Date.now(), // simple unique id
      reply: reply.trim(),
      createdAt: new Date(),
      commentId: replyToCommentId,
    };

    setReply(''); // clear input
    setReplyToCommentId(null); // reset reply target
  };

  const message = commentStore((state) => state.message);

  return (
    <CommentListContainer>
      {messages.map(({ _id, message, createdAt, timeStamp, replies }) => (
        <Card key={_id} onClick={() => setSelectedTimeStamp(timeStamp)} tabIndex={0}>
          <TopSection>
            <ImageContainer>
              <img src="/SImon1.jpg" alt="Profile img" />
            </ImageContainer>
            <Content>
              <CardHeader>
                <strong>Anonymous</strong>
                <Dot>&middot;</Dot>
                <span>{moment(createdAt).fromNow()}</span>
              </CardHeader>
            </Content>
            <CheckBtn>
              <CircleCheckboxLabel>
                <HiddenCheckbox />
                <StyledCircle />
              </CircleCheckboxLabel>
            </CheckBtn>
          </TopSection>

          <CardMain>{message}</CardMain>

          <CardFooter>
            <ReactionGroup>
              <ActionButton onClick={() => setReplyToCommentId(_id)}>Reply</ActionButton>
              <ActionButtonIcon>
                <img src="/icons/like.svg" alt="Like button" />
              </ActionButtonIcon>
            </ReactionGroup>
            <Edit>
              <img src="/icons/edit.svg" alt="Edit Icon" />
              <img src="/icons/delete.svg" alt="Delete Icon" onClick={() => deleteMessage(_id)} />
            </Edit>
          </CardFooter>

            {replyToCommentId === _id && (
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply..."
        />
        <button type="submit">Submit</button>
      </form>
    )}

   <ReplyCardContainer>
    {(replies || []).map((reply, idx) => (
      <ReplyCard key={idx} reply={reply} />
    ))}
  </ReplyCardContainer>
    </Card>
  ))}
      </CommentListContainer>
    );
  };

// Styled components

const CommentListContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
  width: 100%;
  background-color: #f5f5f5;
`;

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
  transition: opacity 0.3s ease, visibility 0s linear 0.3s, transform 0.3s ease;
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
  transition: opacity 0.3s ease, visibility 0s linear 0.3s, transform 0.3s ease;

  img {
    transform: scale(0.8);
  }
`;

const ReactionGroup = styled.div`
  display: flex;
  column-gap: 10px;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);
  transition: 0.3s ease;
  align-items: center;
  cursor: pointer;

  &:hover {
    transform: scale(0.98);
    background-color: #fafafa;
  }

  &:focus {
    transform: scale(0.98);
    background-color: #fafafa;
    border-left: solid #007bff 3px;
    transition: ease 0.2s;
  }

  &:hover ${Edit} {
    opacity: 1;
    visibility: visible;
    transform: translatey(0%);
    transition: opacity 1s ease, visibility 0s linear 0s, transform 0.4s ease;
  }

  &:hover ${CheckBtn} {
    opacity: 1;
    visibility: visible;
    transform: translatey(0%);
    transition: opacity 1s ease, visibility 0s linear 0s, transform 0.4s ease;
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

const CardMain = styled.p`
  text-align: left;
  width: 100%;
  margin: 8px 0;
  color: #333333;
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
  transform: scale(0.7);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ReplyCardContainer = styled.div`
  width: 100%;
`;