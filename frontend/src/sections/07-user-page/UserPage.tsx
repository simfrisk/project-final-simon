import { useEffect } from "react"
import { useUserStore } from "../../store/userStore"
import styled from "styled-components"
import { Navigation } from "../../global-components/navigation/Navigation"
import { MediaQueries } from "../../themes/mediaQueries"
import { CurrentUserSection } from "./components/CurrentUserSection"
import { TeachersSection } from "./components/TeachersSection"
import { StudentsSection } from "./components/StudentsSection"
import { CreateUserSection } from "./components/CreateUserSection"

export const UserPage = () => {
  const { getAllUsers } = useUserStore()

  useEffect(() => {
    getAllUsers()
  }, [getAllUsers])

  return (
    <>
      <Navigation />
      <UserPageContainer
        role="main"
        aria-label="User Directory"
      >
        <PageHeader>
          <PageTitle>Users</PageTitle>
          <PageSubtitle>See all teachers and students</PageSubtitle>
        </PageHeader>

        <CurrentUserSection />
        <TeachersSection />
        <StudentsSection />
        <CreateUserSection />
      </UserPageContainer>
    </>
  )
}

const UserPageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.primary};
  padding: 16px;

  @media ${MediaQueries.biggerSizes} {
    padding: 32px;
  }
`

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  color: white;

  @media ${MediaQueries.biggerSizes} {
    margin-bottom: 48px;
  }
`

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px 0;

  @media ${MediaQueries.biggerSizes} {
    font-size: 56px;
  }
`

const PageSubtitle = styled.p`
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;

  @media ${MediaQueries.biggerSizes} {
    font-size: 19px;
  }
`
