import styled from 'styled-components';
import comments from '../../../../../data/comments.json'

export const CommentSection = () => {
  return (
    <CommentListContainer>
       {comments.map(({ id, user, dateCreated, message }) => (
        <Card key={id}>
          <ImageContainer>
            <img src="/SImon1.jpg" alt="Profile img" />
          </ImageContainer>
          <Content>
            <CardHeader>
              <strong>{user}</strong>
              <Dot>&middot;</Dot>
              <span>{dateCreated}</span>
            </CardHeader>

            <CardMain>
              {message}
            </CardMain>

            <CardFooter>
              <ActionButton>Reply</ActionButton>
              <ActionButton>Like</ActionButton>
            </CardFooter>
          </Content>
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

const Card = styled.div`
  display: flex;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);
  gap: 12px;
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
  gap: 16px;
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