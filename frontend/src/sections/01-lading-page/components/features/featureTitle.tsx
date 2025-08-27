// FeatureTitle.tsx
import styled from "styled-components"
import { MediaQueries } from "../../../../themes/mediaQueries"
import { spacing } from "../../../../themes/spacing"

export const FeatureTitle = () => {
  return (
    <Container>
      <Title id="feature-title">Classync 101</Title>
      <Description>
        Take control of your comments with timestamps to keep everything organized and easy to find
        and remember. Whether you're reviewing lessons or giving feedback, it's all clear,
        trackable, and right where you need it.
      </Description>
    </Container>
  )
}

const Container = styled.div`
  padding-bottom: ${spacing.sm};

  @media ${MediaQueries.biggerSizes} {
    padding-bottom: ${spacing.xxl};
  }
`

const Title = styled.h2`
  margin: ${spacing.md} 0;
  text-align: left;
`

const Description = styled.h3`
  margin: 0 auto;
  color: #eeeeee;
  font-size: 18px;
  text-align: left;

  @media ${MediaQueries.biggerSizes} {
    margin-left: 0;
    width: 67%;
    font-size: 21px;
  }
`
