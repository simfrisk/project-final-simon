import styled from 'styled-components'
import { CircleCheckboxLabel, HiddenCheckbox, StyledCircle } from '../../../../../global-components/checkbox';
import type { ReplyType } from '../../../../../store/commentStore';
import moment from 'moment';
import { commentStore } from '../../../../../store/commentStore';

type ReplyCardProps = {
  reply: ReplyType;
  setReplyToCommentId: (id: string | null) => void;  // new prop to open reply input on main comment
};


export const ReplyCard = ({ reply, setReplyToCommentId }: ReplyCardProps) => {

const { deleteReply } = commentStore();

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

      <CardMain>{reply.content}</CardMain>

      <CardFooter>
        <React>
          {/* When clicked, this sets the reply input to open at the main comment id */}
          <ActionButton onClick={() => setReplyToCommentId(reply.commentId)}>Reply</ActionButton>
          <ActionButtonIcon>
            <img src="/icons/like.svg" alt="Like button" />
          </ActionButtonIcon>
        </React>
        <Edit>
          <img src="/icons/edit.svg" alt="Edit Icon" />
          <img onClick={() => deleteReply(reply._id, reply.commentId)} src="/icons/delete.svg" alt="Delete Icon" />
        </Edit>
      </CardFooter>
    </Card>
  );
};

const TopSection = styled.div `
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  gap: 15px;
  align-items: center;
`

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
        transform: scale(.80);
    }
`;

const React = styled.div `
display: flex;
column-gap: 10px;
`

const Card = styled.div<{ $role?: string }>`
  width: 100%;
  margin: 12px auto;
  display: flex;
  flex-direction: column;
  background-color: ${({ $role }) => ($role === 'teacher' ? ' #deeafb' : '#ffffff')};
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

const Dot = styled.span`
`;

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
  transform: scale(.70);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;
