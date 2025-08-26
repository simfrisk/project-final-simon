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
      image: "/SchoolTeam.jpeg",
    },
    {
      title: "Teacher Feedback",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam rhoncus est eget est egestas sodales quis id mi. Aenean quis massa tempus, viverra nisi sit amet, finibus ex. Sed tortor massa, iaculis ut ipsum nec, ornare ullamcorper magna.",
      image: "/TeacherTeam.jpeg",
    },
    {
      title: "Group Projects",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam rhoncus est eget est egestas sodales quis id mi. Aenean quis massa tempus, viverra nisi sit amet, finibus ex. Sed tortor massa, iaculis ut ipsum nec, ornare ullamcorper magna.",
      image: "/GroupTeam.jpeg",
    },
    {
      title: "Sports & Performance",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam rhoncus est eget est egestas sodales quis id mi. Aenean quis massa tempus, viverra nisi sit amet, finibus ex. Sed tortor massa, iaculis ut ipsum nec, ornare ullamcorper magna.",
      image: "/SportTeam.jpeg",
    },
  ]

  // Image shown on the left
  const [activeIndex, setActiveIndex] = useState<number>(0)

  // Menu open state
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <Section>
      <Container>
        <Header>
          <Title>Who is it for?</Title>
          <h3>
            Take control of your comments with timestamps to keep everything organized and easy to
            find and remember. Whether you’re reviewing lessons or giving feedback, it’s all clear,
            trackable, and right where you need it.
          </h3>
        </Header>
        <ContentContainer>
          <ImageContainer>
            {items.map((item, index) => (
              <Image
                key={index}
                src={item.image}
                alt={item.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: activeIndex === index ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
            ))}
          </ImageContainer>

          <List>
            {items.map((item, index) => (
              <TargetItem
                key={index}
                {...item}
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

const Header = styled.div`
  text-align: center;
  padding-bottom: ${spacing.xxl};

  @media ${MediaQueries.biggerSizes} {
    text-align: left;
    width: 60%;
  }

  h3 {
    font-size: 21px;
  }
`

const Title = styled.h2`
  text-align: center;

  @media ${MediaQueries.biggerSizes} {
    text-align: left;
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
