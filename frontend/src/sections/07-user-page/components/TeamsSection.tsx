import styled from "styled-components"
import { useState, useEffect } from "react"
import { MediaQueries } from "../../../themes/mediaQueries"
import { useTeamStore, type Team } from "../../../store/teamStore"
import { useWorkspaceStore } from "../../../store/workspaceStore"
import { useUserStore } from "../../../store/userStore"

export const TeamsSection = () => {
  const { teams, loading, fetchTeams } = useTeamStore()
  const { currentWorkspaceId } = useWorkspaceStore()
  const { user: currentUser } = useUserStore()

  // Fetch teams when component mounts
  useEffect(() => {
    if (currentWorkspaceId) {
      fetchTeams(currentWorkspaceId)
    }
  }, [currentWorkspaceId, fetchTeams])

  // Filter teams for students - only show their team
  const filteredTeams =
    currentUser?.role === "student"
      ? teams.filter((team) => {
          // For students, check if they are members of this team
          return currentUser.teams?.some((teamId) => teamId === team._id)
        })
      : teams

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
    <>
      {filteredTeams.map((team) => (
        <TeamSection
          key={team._id}
          team={team}
          workspaceId={currentWorkspaceId}
        />
      ))}
    </>
  )
}

const TeamSection = ({ team, workspaceId }: { team: Team; workspaceId: string }) => {
  const { createInvitationLink, error } = useWorkspaceStore()
  const { user: currentUser } = useUserStore()
  const [inviteLink, setInviteLink] = useState<string>("")
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)

  const handleGenerateInviteLink = async () => {
    setIsGeneratingLink(true)
    try {
      const link = await createInvitationLink(workspaceId, team._id)
      if (link) {
        setInviteLink(link)
      }
    } catch (error) {
      console.error("Failed to generate invite link:", error)
    } finally {
      setIsGeneratingLink(false)
    }
  }

  // Get member count from assignedTeachers
  const memberCount = team.assignedTeachers?.length || 0

  return (
    <SectionContainer
      role="region"
      aria-labelledby={`team-section-${team._id}`}
    >
      <SectionHeader>
        <SectionTitle id={`team-section-${team._id}`}>{team.teamName}</SectionTitle>
        {inviteLink ? (
          <InviteLinkContainer>
            <InviteLink
              href={inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Invite link for ${team.teamName}`}
            >
              Join {team.workspaceId?.name || "Workspace"}
            </InviteLink>
            <CopyButton onClick={() => navigator.clipboard.writeText(inviteLink)}>
              📋 Copy Link
            </CopyButton>
          </InviteLinkContainer>
        ) : (
          currentUser?.role !== "student" && (
            <div>
              <GenerateInviteButton
                onClick={handleGenerateInviteLink}
                disabled={isGeneratingLink}
                aria-label={`Generate invite link for ${team.teamName}`}
              >
                {isGeneratingLink ? "Generating..." : "Generate Invite"}
              </GenerateInviteButton>
              {error && (
                <InviteError style={{ fontSize: "12px", marginTop: "4px", color: "#ff6b6b" }}>
                  {error}
                </InviteError>
              )}
            </div>
          )
        )}
        <SectionCount aria-label={`${memberCount} members in ${team.teamName}`}>
          {memberCount} members
        </SectionCount>
      </SectionHeader>

      <TeamDescription>Workspace: {team.workspaceId?.name || "Unknown Workspace"}</TeamDescription>

      {team.assignedTeachers && team.assignedTeachers.length > 0 && (
        <MembersGrid
          role="list"
          aria-label={`List of members in ${team.teamName}`}
        >
          {team.assignedTeachers.map((teacher) => (
            <MemberCard
              key={teacher._id}
              role="listitem"
              aria-label={`Team member: ${teacher.name}`}
            >
              <MemberImageContainer>
                <MemberImage
                  src={teacher.profileImage || "/logo2.png"}
                  alt={`Profile picture of ${teacher.name}`}
                  onError={(e) => {
                    e.currentTarget.src = "/logo2.png"
                  }}
                />
              </MemberImageContainer>
              <MemberInfo>
                <MemberName>{teacher.name}</MemberName>
                <MemberEmail aria-label={`Email: ${teacher.email}`}>{teacher.email}</MemberEmail>
                <MemberRole aria-label={`Role: ${teacher.role}`}>{teacher.role}</MemberRole>
              </MemberInfo>
            </MemberCard>
          ))}
        </MembersGrid>
      )}

      {team.accessTo && team.accessTo.length > 0 && (
        <AccessToClasses>
          <ClassesLabel>Has access to classes:</ClassesLabel>
          <ClassesList>
            {team.accessTo.map((classItem) => (
              <ClassChip key={classItem._id}>{classItem.classTitle}</ClassChip>
            ))}
          </ClassesList>
        </AccessToClasses>
      )}
    </SectionContainer>
  )
}

// Styled Components
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

const SectionCount = styled.span`
  background: #2ed573;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(46, 213, 115, 0.3);

  @media ${MediaQueries.biggerSizes} {
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 25px;
  }
`

const TeamDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 24px 0;
  opacity: 0.8;
  font-style: italic;
  text-align: center;

  @media ${MediaQueries.biggerSizes} {
    font-size: 16px;
    margin: 0 0 32px 0;
  }
`

const MembersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: start;

  @media ${MediaQueries.biggerSizes} {
    gap: 20px;
  }
`

const MemberCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 20px;
    border-radius: 16px;
  }
`

const MemberImageContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
`

const MemberImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.background};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  ${MemberCard}:hover & {
    transform: scale(1.05);
  }

  @media ${MediaQueries.biggerSizes} {
    width: 80px;
    height: 80px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const MemberInfo = styled.div`
  text-align: center;
`

const MemberName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: ${({ theme }) => theme.colors.text};

  @media ${MediaQueries.biggerSizes} {
    font-size: 18px;
    margin: 0 0 6px 0;
  }
`

const MemberEmail = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 4px 0;
  word-break: break-word;
  opacity: 0.8;

  @media ${MediaQueries.biggerSizes} {
    font-size: 13px;
    margin: 0 0 6px 0;
  }
`

const MemberRole = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  text-transform: capitalize;
  font-weight: 500;
  opacity: 0.7;

  @media ${MediaQueries.biggerSizes} {
    font-size: 12px;
  }
`

// New styled components for invitation functionality
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

const GenerateInviteButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 10px 20px;
    font-size: 16px;
  }
`

const InviteLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;

  @media ${MediaQueries.biggerSizes} {
    flex-direction: row;
    gap: 12px;
  }
`

const InviteLink = styled.a`
  background: #2ed573;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #20b362;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 213, 115, 0.3);
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 10px 20px;
    font-size: 16px;
  }
`

const CopyButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 8px 16px;
    font-size: 14px;
  }
`

const AccessToClasses = styled.div`
  margin-top: 16px;
  text-align: center;
`

const ClassesLabel = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px 0;
  font-weight: 600;
`

const ClassesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
`

const ClassChip = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  @media ${MediaQueries.biggerSizes} {
    padding: 6px 12px;
    font-size: 14px;
  }
`

const InviteError = styled.div`
  text-align: center;
  margin-top: 4px;
  font-size: 12px;
  color: #ff6b6b;
`
