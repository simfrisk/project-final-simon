import styled from "styled-components"
import { MediaQueries } from "../../themes/mediaQueries"
import { Navigation } from "../../global-components/navigation/Navigation"
import { SignUpHeader } from "./components/signUpHeader"
import { SignUpForm } from "./components/signUpForm"

export const SignUpPage: React.FC = () => {
  return (
    <>
      <Navigation />
      <Container>
        <SideContainer aria-hidden="true" />
        <MainCardContainer>
          <Card>
            <SignUpHeader />
            <SignUpForm />
          </Card>
        </MainCardContainer>
      </Container>
    </>
  )
}

/* Styled Components */
const Container = styled.div`
  display: flex;
  justify-content: center;
  height: 94dvh;
  margin-bottom: 40px;
`

const SideContainer = styled.section`
  display: none;
  width: 80%;
  background-image: url("/sideImage2.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: ${({ theme }) => theme.colors.secondary};

  @media ${MediaQueries.biggerSizes} {
    display: block;
  }
`

const MainCardContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  @media ${MediaQueries.biggerSizes} {
    max-width: 2000px;
  }
`

const Card = styled.main`
  display: flex;
  flex-direction: column;
  padding: 20px;
  width: 100%;
  max-width: 600px;
  margin: 64px auto;

  @media ${MediaQueries.biggerSizes} {
    justify-content: center;
    width: 95%;
  }

  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="file"] {
    height: 40px;
    background-color: #f6f6f6;
    border: none;
    border-radius: 5px;
    margin: 10px 0;
    width: 100%;
    padding: 10px;
  }
`
