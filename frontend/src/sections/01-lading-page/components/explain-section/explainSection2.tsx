import styled from "styled-components"
import { Container, Section } from "../../../../global-components/Section"
import { ExplainerCard } from "./ExplainerCard"
import { MediaQueries } from "../../../../themes/mediaQueries"
import { spacing } from "../../../../themes/spacing"

export const ExplainSection2 = () => {
  return (
    <Section thirdSection>
      <Container>
        <Title>The platform that powers your online courses</Title>
        <CardWrapper>
          <ExplainerCard
            title="Find comments in timeline"
            text="Make sure your comments stay perfectly synced on the timeline when clicked. No interruptions or distractions, just seamless interaction."
            video="https://res.cloudinary.com/dgr7l5nsx/video/upload/f_mp4/v1754990343/videos/yhzdf7phuo0a0udgm40d.mov"
          />
          <ExplainerCard
            title="Ask questions at video"
            text="Your question is placed on the timeline at the exact moment you comment, giving it clear context within the lesson."
            video="./Commentsform.mp4"
          />
          <ExplainerCard
            title="Teachers Page to organize questions"
            text="As a teacher you’ll see every unanswered comment on your page, each one linking straight to the exact moment it was posted."
            video="./Teacher.mp4"
          />
          <ExplainerCard
            title="Personal comments on time"
            text="Ensure your videos play in their highest resolution, always ad‑free. No competitor distractions or random suggestions here."
          />
          <ExplainerCard
            title="All your classes in one page"
            text="Ensure your videos play in their highest resolution, always ad‑free. No competitor distractions or random suggestions here."
          />
          <ExplainerCard
            title="Don't forget to give some love"
            text="Ensure your videos play in their highest resolution, always ad‑free. No competitor distractions or random suggestions here."
          />
        </CardWrapper>
      </Container>
    </Section>
  )
}

const Title = styled.h2`
  text-align: center;
  margin: ${spacing.lg} 0;
`

const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${spacing.xxl};
  justify-content: center;
  margin: ${spacing.xxl} 0;

  @media ${MediaQueries.biggerSizes} {
    grid-template-columns: repeat(3, 1fr);
    gap: ${spacing.xxl};
  }
`
