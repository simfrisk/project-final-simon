import styled from "styled-components";
import { useProjectStore } from "../../../../store/projectStore";
import { MediaQueries } from "../../../../themes/mediaQueries";

interface CommentHeaderProps {
  setDescription: (value: boolean) => void;
  description: boolean;
}

export const CommentHeader = ({ setDescription, description }: CommentHeaderProps) => {

  const project = useProjectStore((state) => state.project);

  if (!project) return null; // or show a loading indicator

  return (
    <Container>
      <Title>{project.projectName}</Title>
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
  background-color: ${({ theme }) => theme.colors.offBackground};
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);

   @media ${MediaQueries.biggerSizes} {
    padding: 0;
  }

`;

const Title = styled.h3`
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 700;

    @media ${MediaQueries.biggerSizes} {
    margin: 25px 0;
  }
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