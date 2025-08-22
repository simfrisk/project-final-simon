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
        <Title>Who is it for?</Title>
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

const Title = styled.h2`
  text-align: center;
  padding-bottom: ${spacing.xxl};
`

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  align-items: stretch;
  justify-content: center;

  @media ${MediaQueries.biggerSizes} {
    flex-direction: row;
    align-items: stretch;
    gap: ${spacing.xxl};
  }
`

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 4/3;
  flex-shrink: 0;
  margin: 0 auto;

  @media ${MediaQueries.biggerSizes} {
    margin: 0;
  }
`

const Image = styled(motion.img)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
`

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 500px;

  @media ${MediaQueries.biggerSizes} {
    flex: 1;
    margin: 0;
    width: none;
  }
`
