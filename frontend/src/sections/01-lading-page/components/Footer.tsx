import styled from "styled-components"
import { Container } from "../../../global-components/Section"
import { MediaQueries } from "../../../themes/mediaQueries"
import { spacing } from "../../../themes/spacing"

export const Footer = () => {
  return (
    <Section>
      <Container>
        <p>This is a school project created by Simon Frisk</p>

        <SocialMedia>
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
        </SocialMedia>
      </Container>
    </Section>
  )
}

const Section = styled.section`
  background-color: black;
  color: white;
  width: 100%;
  padding: 64px 0;
  text-align: center;

  @media ${MediaQueries.biggerSizes} {
    padding: 128px 0;
  }
`

const SocialMedia = styled.div`
  display: flex;
  justify-content: center;
  gap: ${spacing.md};
  margin-top: ${spacing.md};

  a {
    color: white;
    text-decoration: none;
  }

  img {
    height: 30px;
  }
`
