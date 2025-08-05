// Section.tsx
import styled from "styled-components";
import { MediaQueries } from "../themes/mediaQueries";

interface SectionProps {
  secondarySection?: boolean;
  children?: React.ReactNode;
}

export const Section = styled.section<SectionProps>`
  background-color: ${(props) =>
    props.secondarySection
      ? props.theme.colors.primary
      : props.theme.colors.background};
  color: ${(props) =>
    props.secondarySection
      ? "white"
      : props.theme.colors.text};
  width: 100%;
  padding: 34px 0;

  @media ${MediaQueries.biggerSizes} {
    padding: 84px 0;
  }
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 24px;

  @media ${MediaQueries.biggerSizes} {
    padding: 0 40px;
  }
`;