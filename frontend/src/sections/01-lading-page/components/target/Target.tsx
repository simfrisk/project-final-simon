import styled from "styled-components"
import { Container } from "../../../../global-components/Section"
import { Section as BaseSection } from "../../../../global-components/Section"
import { TargetItem } from "./TargetItem"

export const Target = () => {
  const items = [
    {
      title: "Online Education",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam rhoncus est eget est egestas sodales quis id mi. Aenean quis massa tempus, viverra nisi sit amet, finibus ex. Sed tortor massa, iaculis ut ipsum nec, ornare ullamcorper magna. Sed gravida hendrerit semper. Integer id accumsan mauris. Etiam egestas tortor a turpis molestie, non imperdiet lacus pellentesque. Maecenas pellentesque eros vel viverra commodo. Suspendisse tincidunt, lacus convallis eleifend imperdiet, felis arcu sollicitudin ante.",
    },
    {
      title: "Teacher Feedback",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam rhoncus est eget est egestas sodales quis id mi. Aenean quis massa tempus, viverra nisi sit amet, finibus ex. Sed tortor massa, iaculis ut ipsum nec, ornare ullamcorper magna. Sed gravida hendrerit semper. Integer id accumsan mauris. Etiam egestas tortor a turpis molestie, non imperdiet lacus pellentesque. Maecenas pellentesque eros vel viverra commodo. Suspendisse tincidunt, lacus convallis eleifend imperdiet, felis arcu sollicitudin ante.",
    },
    {
      title: "Group Projects",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam rhoncus est eget est egestas sodales quis id mi. Aenean quis massa tempus, viverra nisi sit amet, finibus ex. Sed tortor massa, iaculis ut ipsum nec, ornare ullamcorper magna. Sed gravida hendrerit semper. Integer id accumsan mauris. Etiam egestas tortor a turpis molestie, non imperdiet lacus pellentesque. Maecenas pellentesque eros vel viverra commodo. Suspendisse tincidunt, lacus convallis eleifend imperdiet, felis arcu sollicitudin ante.",
    },
    {
      title: "Sports & Performance",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam rhoncus est eget est egestas sodales quis id mi. Aenean quis massa tempus, viverra nisi sit amet, finibus ex. Sed tortor massa, iaculis ut ipsum nec, ornare ullamcorper magna. Sed gravida hendrerit semper. Integer id accumsan mauris. Etiam egestas tortor a turpis molestie, non imperdiet lacus pellentesque. Maecenas pellentesque eros vel viverra commodo. Suspendisse tincidunt, lacus convallis eleifend imperdiet, felis arcu sollicitudin ante.",
    },
  ]

  return (
    <Section>
      <Container>
        <Title>Who is it for?</Title>
        <ul>
          {items.map((item, index) => (
            <TargetItem
              key={index}
              {...item}
            />
          ))}
        </ul>
      </Container>
    </Section>
  )
}

const Section = styled(BaseSection)`
  background-color: #e6e6e6; /* your custom color */
  color: black; /* adjust text color for readability */
`

const Title = styled.h2`
  text-align: center;
`
