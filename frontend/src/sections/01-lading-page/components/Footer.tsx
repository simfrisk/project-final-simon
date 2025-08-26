import styled from "styled-components"
import { Container } from "../../../global-components/Section"
import { spacing } from "../../../themes/spacing"
import { Section as BaseSection } from "../../../global-components/Section"

export const Footer = () => {
  return (
    <Section>
      <Container>
        <Wrapper>
          <p>This is a school project created by Simon Frisk</p>
          <a
            href="https://github.com/simfrisk/project-final-simon"
            target="blank"
          >
            <img
              src="/icons/Ic-Github.svg"
              alt="Github link"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/simon-frisk-59aba7bb/"
            target="blank"
          >
            <img
              src="/icons/Linked-In.svg"
              alt=""
            />
          </a>
        </Wrapper>
      </Container>
    </Section>
  )
}

const Section = styled(BaseSection)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-align: center;
  padding: 10px 0 30px 0;
`

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${spacing.md};
  margin-top: ${spacing.lg};

  a {
    color: white;
    text-decoration: none;
  }

  img {
    height: 30px;
  }
`
