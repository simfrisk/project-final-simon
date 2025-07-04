import styled from "styled-components";

interface CommentHeaderProps {
  setDescription: (value: boolean) => void;
  description: boolean;
}

export const CommentHeader = ({ setDescription, description }: CommentHeaderProps) => {
  return (
    <Container>
      <Title>Video Title</Title>
      <ButtonGroup>
        <TabButton $active={!description} onClick={() => setDescription(false)}>
        Description
      </TabButton>
      <TabButton $active={description} onClick={() => setDescription(true)}>
        Comments
      </TabButton>
      </ButtonGroup>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
  border-radius: 12px;
`;

const Title = styled.h3`
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 700;
  color: #222;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  background-color: ${({ $active }) => ($active ? "#007bff" : "transparent")};
  color: ${({ $active }) => ($active ? "white" : "#007bff")};
  border: 2px solid #007bff;
  padding: 8px 20px;
  border-radius: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? "#0056b3" : "#e6f0ff")};
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgb(0 123 255 / 0.5);
  }
`;