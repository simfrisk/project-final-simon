import styled from "styled-components";
import { Section } from "../../../global-components/Section";
import { Container as BaseContainer } from "../../../global-components/Section";

export const Collaborate = () => {
  return (
    <Section>
      <Container>
        <h2>We collbaorate with 150+ online schools</h2>
        <Schools>
          <SchoolImage src="./School1.png" alt="" />
          <SchoolImage src="./School2.png" alt="" />
          <SchoolImage src="./School5.png" alt="" />
          <SchoolImage src="./School4.png" alt="" />
          <SchoolImage src="./School3.png" alt="" />
          <SchoolImage src="./School6.png" alt="" />
          <SchoolImage src="./School7.png" alt="" />
        </Schools>
    </Container>
    </Section>
  )
};

const Container = styled(BaseContainer)`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
`

const Schools= styled.div `
`


const SchoolImage = styled.img `
height: 160px;
margin: 20px;
border-radius: 1+px;
`