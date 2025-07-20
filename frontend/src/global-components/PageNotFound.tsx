import styled from "styled-components";
import { Link } from "react-router-dom";

export const PageNotFound = () =>  {
  return (
    <Container>
      <Content>
        <Icon>👻</Icon>
        <Title>Page Not Found</Title>
        <Message>The page you're looking for doesn't exist or has been moved.</Message>
        <HomeButton to="/">Go Home</HomeButton>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Content = styled.div`
  text-align: center;
  max-width: 400px;
`;

const Icon = styled.div`
  font-size: 4rem;
  color: #9ca3af;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Message = styled.p`
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

const HomeButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #1f2937;
  color: #fff;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #374151;
  }
`;