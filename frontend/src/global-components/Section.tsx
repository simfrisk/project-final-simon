// Section.tsx
import styled from "styled-components"
import { MediaQueries } from "../themes/mediaQueries"

interface SectionProps {
  secondarySection?: boolean
  thirdSection?: boolean
  children?: React.ReactNode
}

export const Section = styled.section<SectionProps>`
  background-color: ${(props) => {
    if (props.thirdSection) return "#141A20"
    if (props.secondarySection) return props.theme.colors.primary
    return props.theme.colors.background
  }};

  color: ${(props) => {
    if (props.thirdSection) return "white"
    if (props.secondarySection) return "white"
    return props.theme.colors.text
  }};

  width: 100%;
  padding: 34px 0;

  @media ${MediaQueries.biggerSizes} {
    padding: 84px 0;
  }
`

export const Container = styled.div`
  max-width: 1500px;
  margin: 0 auto;
  width: 100%;
  padding: 0 24px;

  @media ${MediaQueries.biggerSizes} {
    padding: 0 40px;
  }
`
