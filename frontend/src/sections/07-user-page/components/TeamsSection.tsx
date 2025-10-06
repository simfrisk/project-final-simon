//#region ----- IMPORTS -----
import styled from "styled-components"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MediaQueries } from "../../../themes/mediaQueries"
import { useTeamStore } from "../../../store/teamStore"
import { useWorkspaceStore } from "../../../store/workspaceStore"
import { useUserStore } from "../../../store/userStore"
//#endregion

export const TeamsSection = () => {
  //#region ----- STORE HOOKS -----
  const { teams, loading, fetchTeams } = useTeamStore()
  const { currentWorkspaceId } = useWorkspaceStore()
  const { user: currentUser } = useUserStore()
  const navigate = useNavigate()
  //#endregion

  //#region ----- EFFECTS -----
  useEffect(() => {
    if (currentWorkspaceId) {
      fetchTeams(currentWorkspaceId)
    }
  }, [currentWorkspaceId, fetchTeams])
  //#endregion

  //#region ----- DERIVED DATA -----
  const filteredTeams =
    currentUser?.role === "student"
      ? teams.filter((team) => {
          // For students, check if they are members of this team
          return team.assignedStudents?.some((student) => student._id === currentUser._id)
        })
      : teams
  //#endregion

  //#region ----- RENDER -----
  if (loading && teams.length === 0) {
    return (
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>Teams</SectionTitle>
          <LoadingText>Loading teams...</LoadingText>
        </SectionHeader>
      </SectionContainer>
    )
  }

  if (!currentWorkspaceId) {
    return (
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>Teams</SectionTitle>
          <NoWorkspaceText>Please select a workspace to view teams</NoWorkspaceText>
        </SectionHeader>
      </SectionContainer>
    )
  }

  if (filteredTeams.length === 0) {
    return (
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>Teams</SectionTitle>
          <NoTeamsText>
            {currentUser?.role === "student"
              ? "You are not assigned to any teams yet"
              : "No teams found in this workspace"}
          </NoTeamsText>
        </SectionHeader>
      </SectionContainer>
    )
  }

  return (
    <TeamsGrid>
      {filteredTeams.map((team) => {
        const teacherCount = team.assignedTeachers?.length || 0
        const studentCount = team.assignedStudents?.length || 0
        const memberCount = teacherCount + studentCount
        const classCount = team.accessTo?.length || 0

        return (
          <TeamCard
            key={team._id}
            onClick={() => navigate(`/admin/teams/${team._id}`)}
          >
            <TeamCardHeader>
              <TeamCardTitle>{team.teamName}</TeamCardTitle>
              <MemberBadge>{memberCount} members</MemberBadge>
            </TeamCardHeader>

            <TeamCardContent>
              <WorkspaceInfo>
                <WorkspaceLabel>Workspace:</WorkspaceLabel>
                <WorkspaceName>{team.workspaceId?.name || "Unknown"}</WorkspaceName>
              </WorkspaceInfo>

              <StatsRow>
                <StatItem>
                  <StatIcon>👥</StatIcon>
                  <StatValue>{memberCount} members</StatValue>
                </StatItem>
                <StatItem>
                  <StatIcon>📚</StatIcon>
                  <StatValue>{classCount} classes</StatValue>
                </StatItem>
              </StatsRow>
            </TeamCardContent>

            <ViewDetailsButton>View Details →</ViewDetailsButton>
          </TeamCard>
        )
      })}
    </TeamsGrid>
  )
  //#endregion
}

//#region ----- STYLED COMPONENTS -----
const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 0 0 24px 0;

  @media ${MediaQueries.biggerSizes} {
    gap: 24px;
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
    max-width: 100%;
  }
`

const TeamCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 24px;
    border-radius: 20px;
  }
`

const TeamCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const TeamCardTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media ${MediaQueries.biggerSizes} {
    font-size: 24px;
  }
`

const MemberBadge = styled.span`
  background: #2ed573;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  margin-left: 8px;

  @media ${MediaQueries.biggerSizes} {
    padding: 6px 12px;
    font-size: 12px;
  }
`

const TeamCardContent = styled.div`
  margin-bottom: 16px;
`

const WorkspaceInfo = styled.div`
  margin-bottom: 16px;
`

const WorkspaceLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.6;
  font-weight: 500;

  @media ${MediaQueries.biggerSizes} {
    font-size: 13px;
  }
`

const WorkspaceName = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 6px;
  font-weight: 600;

  @media ${MediaQueries.biggerSizes} {
    font-size: 15px;
  }
`

const StatsRow = styled.div`
  display: flex;
  gap: 16px;
`

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const StatIcon = styled.span`
  font-size: 16px;
`

const StatValue = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.8;

  @media ${MediaQueries.biggerSizes} {
    font-size: 14px;
  }
`

const ViewDetailsButton = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: 600;
  text-align: right;
  margin-top: 12px;

  @media ${MediaQueries.biggerSizes} {
    font-size: 15px;
  }
`

// Styled Components for loading/empty states
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

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  text-align: center;

  @media ${MediaQueries.biggerSizes} {
    flex-direction: row;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
    text-align: left;
  }
`

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;

  @media ${MediaQueries.biggerSizes} {
    font-size: 32px;
  }
`

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  margin: 0;
`

const NoWorkspaceText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  margin: 0;
`

const NoTeamsText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  margin: 0;
`
//#endregion
