// AFeatureCard.tsx
import styled from "styled-components"
import { spacing } from "../../../../themes/spacing"

type AFeatureCardProps = {
  title: string
  isActive?: boolean
}

export const AFeatureCard = ({ title, isActive = false }: AFeatureCardProps) => {
  return (
    <ButtonContainer $isActive={isActive}>
      <div>
        <strong>{title}</strong>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, numquam quasi ex doloremque
          natus quia minima ab suscipit voluptatem nisi fuga eius possimus ipsum itaque explicabo.
          Commodi libero, vel eos voluptatum fuga nam culpa consequatur?
        </p>
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
  height: 150px;
  padding: 0 ${spacing.lg};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;

  p {
    color: #cecece;
    margin-top: ${spacing.xs};
  }

  ${({ $isActive }) =>
    $isActive &&
    `
    transform: translateY(-2px);
    background-color: #465169;
  `}
`
