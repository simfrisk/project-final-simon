import { useState } from 'react';
import type { MessageType } from '../../../../../store/commentStore';
import styled from 'styled-components';
import moment from 'moment';
import { commentStore } from '../../../../../store/commentStore';
import { CircleCheckboxLabel, HiddenCheckbox, StyledCircle } from '../../../../../global-components/checkbox';
import { ReplyCard } from '../components/ReplyCard';
import { MediaQueries } from '../../../../../themes/mediaQueries';
import { unFormatTime } from '../../video-section/utils/unFormatTime';

export const CommentSection = () => {
  const [reply, setReply] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);

  const addReply = commentStore((state) => state.addReply);
  
  //These are the messages and then turned into a number and then sorted
  const rawMessages: MessageType[] = commentStore((state) => state.projectComments);
  const messages = [...rawMessages].sort((a, b) => {
  return unFormatTime(a.timeStamp) - unFormatTime(b.timeStamp);
}); 

  const toggleCheck = commentStore((state) => state.toggleCheck);
  const deleteComment = commentStore((state) => state.deleteComment);
  const setSelectedTimeStamp = commentStore((state) => state.setSelectedTimeStamp);

  const handleToggleCheck = (id: string) => {
  toggleCheck(id);
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !replyToCommentId) return;

    const targetComment = messages.find(msg => msg._id === replyToCommentId);
    if (!targetComment || !targetComment.projectId) {
      console.error("Missing projectId or commentId");
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
    } catch (err) {
      console.error("Failed to add reply:", err);
    }
  };

    interface Props {
      isChecked: boolean;
      onToggle: () => void;
    }

  return (
    <CommentListContainer>
      {messages.map(({ _id, content, createdAt, timeStamp, replies, isChecked }) => (
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
                <HiddenCheckbox
                  checked={isChecked}
                  onChange={() => handleToggleCheck(_id)}
                />
                <StyledCircle />
              </CircleCheckboxLabel>
            </CheckBtn>
          </TopSection>

          <CardMain>{content}</CardMain>

          <CardFooter>
            <ReactionGroup>
              <ActionButton onClick={() => setReplyToCommentId(_id)}>Reply</ActionButton>
              <ActionButtonIcon>
                <img src="/icons/like.svg" alt="Like button" />
              </ActionButtonIcon>
            </ReactionGroup>
            <Edit>
              <img src="/icons/edit.svg" alt="Edit Icon" />
              <img src="/icons/delete.svg" alt="Delete Icon" onClick={() => deleteComment(_id)} />
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
            {(replies || []).map((reply) => (
              <ReplyCard
                key={reply._id}
                reply={reply}
                setReplyToCommentId={setReplyToCommentId} 
              />
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
  background-color: ${({ theme }) => theme.colors.offBackground};

 @media ${MediaQueries.biggerSizes} {
   overflow: scroll;
 }
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

  img:hover {
    transition: ease .3s;
    transform: scale(0.9);
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
  transition: ease .3s;

  &:hover {
    text-decoration: underline;
    transform: scale(0.95);
  }
`;

const ActionButtonIcon = styled.button`
  transition: ease .3s;
  background: none;
  border: none;
  padding: 0;
  transform: scale(0.7);
  cursor: pointer;

  img:hover {
    transform: scale(0.9);
  }
`;

const ReplyCardContainer = styled.div`
  width: 100%;
`;