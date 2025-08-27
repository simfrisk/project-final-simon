import styled from "styled-components"
import { Container } from "../../../global-components/Section"
import { spacing } from "../../../themes/spacing"
import { Section as BaseSection } from "../../../global-components/Section"
import { MediaQueries } from "../../../themes/mediaQueries"

export const Footer = () => {
  return (
    <Section
      role="contentinfo"
      aria-labelledby="footer-title"
    >
      <Container>
        <Wrapper>
          <FooterText id="footer-title">This is a school project created by Simon Frisk</FooterText>
          <SocialLinks aria-label="Social media and project links">
            <SocialLink>
              <a
                href="https://github.com/simfrisk/project-final-simon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View project source code on GitHub"
              >
                <img
                  src="/icons/Ic-Github.svg"
                  alt="GitHub logo"
                  aria-hidden="true"
                />
                <span className="sr-only">GitHub</span>
              </a>
            </SocialLink>
            <SocialLink>
              <a
                href="https://www.linkedin.com/in/simon-frisk-59aba7bb/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect with Simon Frisk on LinkedIn"
              >
                <img
                  src="/icons/Linked-In.svg"
                  alt="LinkedIn logo"
                  aria-hidden="true"
                />
                <span className="sr-only">LinkedIn</span>
              </a>
            </SocialLink>
          </SocialLinks>
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${spacing.md};
  margin-top: ${spacing.lg};

  @media ${MediaQueries.biggerSizes} {
    flex-direction: row;
    width: 100%;
  }
`

const FooterText = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
`

const SocialLinks = styled.div`
  display: flex;
  gap: ${spacing.md};
`

const SocialLink = styled.div`
  a {
    color: white;
    text-decoration: none;
    display: flex;
    align-items: center;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.8;
    }

    &:focus {
      outline: 2px solid white;
      outline-offset: 2px;
      border-radius: 4px;
    }
  }

  img {
    height: 30px;
    width: auto;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`
