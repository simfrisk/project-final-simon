// AFeatureCard.tsx
import styled from "styled-components"
import { spacing } from "../../../../themes/spacing"

type AFeatureCardProps = {
  title: string
}

export const AFeatureCard = ({ title }: AFeatureCardProps) => {
  return (
    <ButtonContainer>
      <div>
        <strong>{title}</strong>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quidem nam temporibus minima.
        </p>
      </div>
    </ButtonContainer>
  )
}

const ButtonContainer = styled.button`
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 10px;
  border-left: solid 10px ${({ theme }) => theme.colors.secondary};
  text-align: left;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);
  background-color: ${({ theme }) => theme.colors.offBackground};
  width: 100%;
  height: 150px;
  padding: 0 ${spacing.lg};
  overflow: hidden;
  cursor: pointer;

  p {
    color: ${({ theme }) => theme.colors.textAlternative};
    margin-top: ${spacing.xs};
  }
`
