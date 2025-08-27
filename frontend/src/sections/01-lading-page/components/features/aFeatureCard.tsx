// AFeatureCard.tsx
import styled from "styled-components"
import { spacing } from "../../../../themes/spacing"
import { MediaQueries } from "../../../../themes/mediaQueries"

type AFeatureCardProps = {
  title: string
  isActive?: boolean
}

export const AFeatureCard = ({ title, isActive = false }: AFeatureCardProps) => {
  return (
    <ButtonContainer
      $isActive={isActive}
      aria-pressed={isActive}
      aria-label={`${title} feature - ${isActive ? "Currently selected" : "Click to select"}`}
    >
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, numquam quasi ex doloremque
          natus quia minima ab suscipit voluptatem nisi fuga eius possimus ipsum itaque explicabo.
          Commodi libero, vel eos voluptatum fuga nam culpa consequatur?
        </CardDescription>
      </div>
    </ButtonContainer>
  )
}

const ButtonContainer = styled.button<{ $isActive: boolean }>`
  color: white;
  border: none;
  border-radius: 10px;
  border-left: solid 10px ${({ theme }) => theme.colors.primary};
  text-align: left;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);
  background-color: #1f2a36;
  width: 100%;
  height: 100%;
  padding: 10px ${spacing.lg};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;

  @media ${MediaQueries.biggerSizes} {
    height: 150px;
  }

  p {
    color: #cecece;
    margin-top: ${spacing.xs};
  }

  ${({ $isActive }) =>
    $isActive &&
    `
      @media ${MediaQueries.biggerSizes} {
        transform: translateY(-2px);
        background-color: #465169;
      }
    `}
`

const CardTitle = styled.strong`
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
`

const CardDescription = styled.p`
  color: #cecece;
  margin-top: ${spacing.xs};
  line-height: 1.4;
`
