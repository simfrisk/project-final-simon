import { useState } from "react"
import styled from "styled-components"
import { Container, Section as BaseSection } from "../../../../global-components/Section"
import { TargetItem } from "./TargetItem"
import { spacing } from "../../../../themes/spacing"
import { MediaQueries } from "../../../../themes/mediaQueries"
import { motion } from "framer-motion"

interface Item {
  title: string
  description: string
  image: string
}

export const Target = () => {
  const items: Item[] = [
    {
      title: "Online Education",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam rhoncus est eget est egestas sodales quis id mi. Aenean quis massa tempus, viverra nisi sit amet, finibus ex. Sed tortor massa, iaculis ut ipsum nec, ornare ullamcorper magna.",
      image: "/SchoolTeam.webp",
    },
    {
      title: "Teacher Feedback",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam rhoncus est eget est egestas sodales quis id mi. Aenean quis massa tempus, viverra nisi sit amet, finibus ex. Sed tortor massa, iaculis ut ipsum nec, ornare ullamcorper magna.",
      image: "/TeacherTeam.webp",
    },
    {
      title: "Group Projects",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam rhoncus est eget est egestas sodales quis id mi. Aenean quis massa tempus, viverra nisi sit amet, finibus ex. Sed tortor massa, iaculis ut ipsum nec, ornare ullamcorper magna.",
      image: "/GroupTeam.webp",
    },
    {
      title: "Sports & Performance",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam rhoncus est eget est egestas sodales quis id mi. Aenean quis massa tempus, viverra nisi sit amet, finibus ex. Sed tortor massa, iaculis ut ipsum nec, ornare ullamcorper magna.",
      image: "/SportTeam.webp",
    },
  ]

  // Image shown on the left
  const [activeIndex, setActiveIndex] = useState<number>(0)

  // Menu open state
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <Section aria-labelledby="target-title">
      <Container>
        <Header>
          <Title id="target-title">Who is it for?</Title>
          <h3>
            Our platform is designed for educators and students who need precise, time-stamped
            feedback on video content. Our tools help you pinpoint exact moments and provide
            contextual feedback that enhances learning.
          </h3>
        </Header>
        <ContentContainer>
          <ImageContainer
            aria-label="Target audience visual representations"
            aria-describedby="target-description"
          >
            {items.map((item, index) => (
              <Image
                key={index}
                src={item.image}
                alt={`${item.title} - Visual representation`}
                initial={{ opacity: 0 }}
                animate={{ opacity: activeIndex === index ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                aria-hidden={activeIndex !== index}
              />
            ))}
          </ImageContainer>

          <List
            aria-label="Target audience categories"
            aria-describedby="target-description"
          >
            {/* here are the children */}
            {items.map((item, index) => (
              <TargetItem
                key={index}
                {...item}
                index={index}
                isOpen={openIndex === index}
                onClick={() => {
                  setOpenIndex(openIndex === index ? null : index)
                  setActiveIndex(index)
                }}
              />
            ))}
          </List>
        </ContentContainer>
      </Container>
    </Section>
  )
}

// ---------------- Styled ----------------
const Section = styled(BaseSection)`
  background-color: ${({ theme }) => theme.colors.offBackground};
  color: ${({ theme }) => theme.colors.text};
`

const Title = styled.h2`
  text-align: left;
  margin-bottom: ${spacing.md};

  @media ${MediaQueries.biggerSizes} {
    text-align: left;
  }
`

const Header = styled.div`
  text-align: left;
  padding-bottom: ${spacing.md};

  @media ${MediaQueries.biggerSizes} {
    text-align: left;
    width: 70%;
    padding-bottom: ${spacing.xxl};
  }

  h3 {
    font-size: 18px;

    @media ${MediaQueries.biggerSizes} {
      font-size: 21px;
    }
  }
`

const ContentContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  gap: ${spacing.lg};
  align-items: stretch;
  width: 100%;

  @media ${MediaQueries.biggerSizes} {
    flex-direction: row;
    align-items: stretch;
    gap: ${spacing.xxl};
  }
`

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  flex-shrink: 0;
  margin: 0 auto;

  @media ${MediaQueries.biggerSizes} {
    margin: 0;
    flex: 1; // Add this to make it expand
  }
`

const Image = styled(motion.img)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 800px;
  height: 100%;
  object-fit: contain;
  object-fit: cover;
  border-radius: 20px;
`

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  padding: 0;
  margin: 0;

  @media ${MediaQueries.biggerSizes} {
    flex: 1;
    margin: 0;
    width: 50%;
  }
`
