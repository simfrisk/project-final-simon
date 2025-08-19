// FeatureTitle.tsx
import styled from "styled-components"
import { MediaQueries } from "../../../../themes/mediaQueries"
import { spacing } from "../../../../themes/spacing"

export const FeatureTitle = () => {
  return (
    <Container>
      <h2>Classync 101</h2>
      <p>
        Take control of your comments with timestamps to keep everything
        organized and easy to find and remember. Whether you’re reviewing
        lessons or giving feedback, it’s all clear, trackable, and right where
        you need it.
      </p>
    </Container>
  )
}

const Container = styled.div`
  h2 {
    margin: ${spacing.md} 0;
    text-align: center;

    @media ${MediaQueries.biggerSizes} {
      text-align: left;
    }
  }

  p {
    margin-top: ${spacing.sm};
    max-width: 650px;
    text-align: center;

    @media ${MediaQueries.biggerSizes} {
      text-align: left;
    }
  }
`
