import styled from "styled-components"
import { SignUpForm } from "../../03-sign-up-page/components/signUpForm"
import { MediaQueries } from "../../../themes/mediaQueries"
import { useUserStore } from "../../../store/userStore"

export const CreateUserSection = () => {
  const { user: currentUser } = useUserStore()

  if (currentUser?.role !== "teacher") {
    return null
  }

  return (
    <SectionContainer>
      <SectionTitle>Create User (In development)</SectionTitle>
      <SignUpForm />
    </SectionContainer>
  )
}

const SectionContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media ${MediaQueries.biggerSizes} {
    padding: 32px;
    margin-bottom: 32px;
    border-radius: 20px;
  }
`

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.text};

  @media ${MediaQueries.biggerSizes} {
    font-size: 32px;
    margin: 0 0 32px 0;
  }
`
