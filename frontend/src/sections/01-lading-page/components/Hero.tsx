import styled from "styled-components";
import { MainButton } from "../../../global-components/buttons";
import { Section, Container } from "../../../global-components/Section";

export const Hero = () => {
  return (
    <Section secondarySection>
      <Container>
        <Content>
          <img src="/Hero.png" alt="Image of some scribble" />
          <MainTitle>
            Collaborative Video Review, Reimagined for Learning
          </MainTitle>
          <SubTitle>
            Time-stamped feedback tools built for classrooms, courses, and content creators.
          </SubTitle>
          <MainButtonWrapper>
            <MainButton text="Get Started" url="/signUp" />
            <MainButton text="Login" url="/login" />
          </MainButtonWrapper>
        </Content>
      </Container>
    </Section>
  );
};

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;

  img {
    height: 200px;
  }
`;

const MainTitle = styled.h1`
  text-align: center;
`;

const SubTitle = styled.p`
  text-align: center;
`;

const MainButtonWrapper = styled.div`
  display: flex;
  gap: 20px;
`;