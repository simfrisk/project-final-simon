import React from "react"
import styled from "styled-components"
import { Navigation } from "../../global-components/navigation/Navigation"
import { MediaQueries } from "../../themes/mediaQueries"
import { LoginForm } from "./components/LoginForm"
import { LoginHeader } from "./components/LoginHeader"

export const LogInPage: React.FC = () => {
  return (
    <>
      <Navigation />
      <Container>
        <SideContainer aria-hidden="true" />
        <MainCard>
          <Card>
            <LoginHeader />
            <LoginForm />
          </Card>
        </MainCard>
      </Container>
    </>
  )
}

/* Styled Components */

const Container = styled.div`
  display: flex;
  justify-content: center;
  height: 94dvh;
`

const SideContainer = styled.section`
  display: none;
  width: 80%;
  background-image: url("/sideImage2.webp");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: ${({ theme }) => theme.colors.secondary};

  @media ${MediaQueries.biggerSizes} {
    display: block;
  }
`

const MainCard = styled.main`
  display: flex;
  justify-content: center;
  width: 100%;

  @media ${MediaQueries.biggerSizes} {
    max-width: 2000px;
  }
`

const Card = styled.section`
  display: flex;
  flex-direction: column;
  padding: 20px;
  width: 100%;
  max-width: 600px;
  margin: 64px auto;
`
