import { useEffect, useState } from "react"
import { useUserStore } from "../../store/userStore"
import { useWorkspaceStore } from "../../store/workspaceStore"
import styled from "styled-components"
import { Navigation } from "../../global-components/navigation/Navigation"
import { MediaQueries } from "../../themes/mediaQueries"
import { CurrentUserSection } from "./components/CurrentUserSection"
import { TeachersSection } from "./components/TeachersSection"
import { StudentsSection } from "./components/StudentsSection"
import { TeamsSection } from "./components/TeamsSection"
import { CreateTeam } from "../08-create-team-page/CreateTeam"

interface ActiveTab {
  users: string
  teams: string
  more: string
}

export const UserPage = () => {
  const { getWorkspaceUsers, user: currentUser, loading } = useUserStore()
  const { currentWorkspaceId } = useWorkspaceStore()
  const [activeTab, setActiveTab] = useState<keyof ActiveTab>("users")

  useEffect(() => {
    if (currentWorkspaceId) {
      getWorkspaceUsers(currentWorkspaceId)
    }
  }, [currentWorkspaceId, getWorkspaceUsers])

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
          <ActionBar
            role="toolbar"
            aria-label="Dashboard actions"
          >
            <WorkingButton
              aria-label="View all users"
              onClick={() => setActiveTab("users")}
            >
              Users
            </WorkingButton>
            <WorkingButton
              aria-label="View all teams"
              onClick={() => setActiveTab("teams")}
            >
              Teams
            </WorkingButton>
            <WorkingButton
              aria-label="More"
              onClick={() => setActiveTab("more")}
            >
              More
            </WorkingButton>
          </ActionBar>
        </PageHeader>

        {activeTab === "users" && (
          <>
            <CurrentUserSection />
            {currentUser?.role === "teacher" && (
              <>
                {loading ? (
                  <LoadingContainer>
                    <Spinner />
                    <LoadingText>Loading users...</LoadingText>
                  </LoadingContainer>
                ) : (
                  <>
                    <TeachersSection />
                    <StudentsSection />
                  </>
                )}
              </>
            )}
          </>
        )}
        {activeTab === "teams" && (
          <>
            {currentUser?.role === "teacher" && <CreateTeam />}
            <TeamsSection />
          </>
        )}
        {activeTab === "more" && <p>More</p>}
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
const ActionBar = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`

const WorkingButton = styled.button`
  margin: 0px 10px 20px 10px;
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 35px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 100px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(1.02);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primaryHover};
    outline-offset: 2px;
  }

  @media ${MediaQueries.smallPhone} {
    margin: 0px 4px 20px 4px;
    padding: 8px 2px;
    max-width: 90px;
  }

  @media ${MediaQueries.biggerSizes} {
    max-width: none;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  background: ${({ theme }) => theme.colors.background};
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 24px;

  @media ${MediaQueries.biggerSizes} {
    padding: 64px 32px;
    border-radius: 20px;
    margin-bottom: 32px;
  }
`

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media ${MediaQueries.biggerSizes} {
    width: 56px;
    height: 56px;
    border-width: 5px;
  }
`

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  opacity: 0.8;

  @media ${MediaQueries.biggerSizes} {
    font-size: 18px;
  }
`
