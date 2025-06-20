import type { MessageType } from '../../../../../store/commentStore';
import styled from 'styled-components';
import moment from 'moment';
import { commentStore } from '../../../../../store/commentStore';
import { CircleCheckboxLabel, HiddenCheckbox, StyledCircle } from '../../../../../global-components/checkbox';

export const CommentSection = () => {
  const messages: MessageType[] = commentStore((state) => state.messages);
  const deleteMessage = commentStore((state) => state.deleteMessage);

  return (
    <CommentListContainer>
      {messages.map(({ message, createdAt, timeStamp }, index) => (
        <Card key={index}>

          <TopSection>
          <ImageContainer>
            <img src="/SImon1.jpg" alt="Profile img" />
          </ImageContainer>
          <Content>
            <CardHeader>
              <strong>Anonymous</strong>
              <Dot>&middot;</Dot>
             <span>{moment(createdAt).fromNow()}</span>
             <span>{timeStamp}</span>
            </CardHeader>

            <CardMain>{message}</CardMain>

          
          </Content>
          <Edit>
            <div>
             <CircleCheckboxLabel>
              <HiddenCheckbox />
              <StyledCircle />
            </CircleCheckboxLabel>
            </div>
          </Edit>
          </TopSection>

            <CardFooter>
              <React>
              <ActionButton>Reply</ActionButton>
              <ActionButton>Like</ActionButton>
              </React>
              <Edit>
                <img src="/icons/edit.svg" alt="Edit Icon" />
                <img src="/icons/delete.svg" alt="Delete Icon" onClick={() => deleteMessage(createdAt)} />
              </Edit>
            </CardFooter>
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

const TopSection = styled.div `
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 15px;
  align-items: center;
`

const Edit = styled.div`
  opacity: 0;
  visibility: hidden;
  display: flex;
  column-gap: 10px;
  margin: 0 15px;
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

const React = styled.div `
display: flex;
column-gap: 10px;
`

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

  &:hover ${Edit} {
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
  height: 50px;
  width: 50px;
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
  color: #007bff;
  padding: 0;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;