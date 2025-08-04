import styled from "styled-components";
import { MediaQueries } from "../../../../themes/mediaQueries";
import { useState } from "react";
import { useClassStore } from "../../../../store/classStore";

export const SideMenu = () => {

  const [classTitle, setClassTitle] = useState("")

  const addClass = useClassStore((state) => state.addClass)

    const handleCreateProject = async () => {
      if (!classTitle.trim()) return;

      await addClass(classTitle);

      setClassTitle("");
    };

  return (
    <>
    <Container>
      <TopSection>
        <h3>Classes</h3>
        <p>HTML, CSS & JavaScript</p>
        <p>JavaScript & TypeScript</p>
        <p>Accessibility</p>
        <p>React</p>
        <p>Backend with Node.js</p>
      </TopSection>
      <BottomSection>

        <FormContainer>
          <Input
            placeholder="Project Name"
            value={classTitle}
            onChange={(e) => setClassTitle(e.target.value)}
          />
          <StyledButton type="submit" onClick={handleCreateProject}>+ Class</StyledButton>
        </FormContainer>

      </BottomSection>
    </Container>
    </>
  )
};

const Container = styled.section `
display: flex;
flex-direction: column;
background-color: ${({ theme }) => theme.colors.background};
height: 85dvh;
justify-content: space-between;
align-items: center;
margin-top: 60px;
display: none;

h3 {
  margin-bottom: 24px;
}

p {
  transition: ease .3s;
}

p:hover {
  transform: scale(.97);
}

@media ${MediaQueries.biggerSizes} {
display: flex;

}
`

const TopSection = styled.div `
`

const BottomSection = styled.div `
`

const StyledButton = styled.button`
  display: inline-block;
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  height: 50px;
  margin: 40px 0;
  text-align: center;
  transition: ease 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(0.98);
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  width: 100%;
  background-color: #e1e1e1;
  border-radius: 10px;
  padding: 10px;

  @media ${MediaQueries.biggerSizes} {
    width: 100%;
  }
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 100%;
`;