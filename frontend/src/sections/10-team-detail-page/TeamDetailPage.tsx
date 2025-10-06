//#region ----- IMPORTS -----
import styled from "styled-components"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MediaQueries } from "../../themes/mediaQueries"
import { useTeamStore, type Team } from "../../store/teamStore"
import { useWorkspaceStore } from "../../store/workspaceStore"
import { useUserStore } from "../../store/userStore"
import { useClassStore } from "../../store/classStore"
import { Navigation } from "../../global-components/navigation/Navigation"
import moment from "moment"
//#endregion

//#region ----- INTERFACES -----
interface Invitation {
  _id: string
  token: string
  teamId?: string
  expiresAt: string
  createdBy: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
}
//#endregion

export const TeamDetailPage = () => {
  //#region ----- ROUTE PARAMS -----
  const { teamId } = useParams<{ teamId: string }>()
  const navigate = useNavigate()
  //#endregion

  //#region ----- STORE HOOKS -----
  const { team, loading, fetchTeamById, addTeamClass, removeTeamClass } = useTeamStore()
  const {
    currentWorkspaceId,
    fetchInvitationHistory,
    createInvitationLink,
    deleteInvitation,
    deactivateInvitation,
  } = useWorkspaceStore()
  const { user: currentUser } = useUserStore()
  const { fetchClasses, classes } = useClassStore()
  //#endregion

  //#region ----- STATE -----
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loadingInvitations, setLoadingInvitations] = useState(false)
  const [showAssignClassesModal, setShowAssignClassesModal] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [showExpirationModal, setShowExpirationModal] = useState(false)
  const [expirationDate, setExpirationDate] = useState<string>("")
  //#endregion

  //#region ----- EFFECTS -----
  useEffect(() => {
    if (teamId) {
      fetchTeamById(teamId)
    }
  }, [teamId, fetchTeamById])

  useEffect(() => {
    const loadInvitations = async () => {
      if (currentWorkspaceId && teamId) {
        setLoadingInvitations(true)
        try {
          const allInvitations = await fetchInvitationHistory(currentWorkspaceId)
          // Filter invitations for this specific team
          const teamInvitations = allInvitations.filter((inv: Invitation) => inv.teamId === teamId)
          setInvitations(teamInvitations)
        } catch (error) {
          console.error("Failed to fetch invitations:", error)
        } finally {
          setLoadingInvitations(false)
        }
      }
    }
    loadInvitations()
  }, [currentWorkspaceId, teamId, fetchInvitationHistory])
  //#endregion

  //#region ----- EVENT HANDLERS -----
  const handleAssignClassesClick = async () => {
    if (currentWorkspaceId) {
      await fetchClasses(currentWorkspaceId)
      setShowAssignClassesModal(true)
    }
  }

  const handleOpenExpirationModal = () => {
    // Set default to 7 days from now
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 7)
    setExpirationDate(defaultDate.toISOString().slice(0, 16))
    setShowExpirationModal(true)
  }

  const handleGenerateNewLink = async () => {
    if (!currentWorkspaceId || !teamId) return
    setIsGeneratingLink(true)
    try {
      const expiresAt = expirationDate ? new Date(expirationDate) : undefined
      const link = await createInvitationLink(currentWorkspaceId, teamId, expiresAt)
      if (link) {
        // Reload invitations to show the new one
        const allInvitations = await fetchInvitationHistory(currentWorkspaceId)
        const teamInvitations = allInvitations.filter((inv: Invitation) => inv.teamId === teamId)
        setInvitations(teamInvitations)
        setShowExpirationModal(false)
        setExpirationDate("")
      }
    } catch (error) {
      console.error("Failed to generate invite link:", error)
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!currentWorkspaceId || !teamId) return
    const success = await deleteInvitation(invitationId)
    if (success) {
      // Reload invitations to remove the deleted one
      const allInvitations = await fetchInvitationHistory(currentWorkspaceId)
      const teamInvitations = allInvitations.filter((inv: Invitation) => inv.teamId === teamId)
      setInvitations(teamInvitations)
    }
  }

  const handleDeactivateInvitation = async (invitationId: string) => {
    if (!currentWorkspaceId || !teamId) return
    const success = await deactivateInvitation(invitationId)
    if (success) {
      // Reload invitations to update the status
      const allInvitations = await fetchInvitationHistory(currentWorkspaceId)
      const teamInvitations = allInvitations.filter((inv: Invitation) => inv.teamId === teamId)
      setInvitations(teamInvitations)
    }
  }
  //#endregion

  //#region ----- DERIVED DATA -----
  const teacherCount = team?.assignedTeachers?.length || 0
  const studentCount = team?.assignedStudents?.length || 0
  const memberCount = teacherCount + studentCount
  const allMembers = [...(team?.assignedTeachers || []), ...(team?.assignedStudents || [])]
  //#endregion

  //#region ----- RENDER -----
  if (loading || !team) {
    return (
      <>
        <Navigation />
        <PageContainer>
          <LoadingText>Loading team details...</LoadingText>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <PageContainer>
        <BackButton onClick={() => navigate("/admin/users?tab=teams")}>← Back to Teams</BackButton>

        <TeamHeader>
          <TeamTitle>{team.teamName}</TeamTitle>
          <TeamBadge>{memberCount} members</TeamBadge>
        </TeamHeader>

        <TeamDescription>
          Workspace: {team.workspaceId?.name || "Unknown Workspace"}
        </TeamDescription>

        {currentUser?.role !== "student" && (
          <ActionsBar>
            <ActionButton onClick={handleAssignClassesClick}>👥 Assign Classes</ActionButton>
            <ActionButton
              onClick={handleOpenExpirationModal}
              disabled={isGeneratingLink}
            >
              {isGeneratingLink ? "Generating..." : "🔗 Generate Invite Link"}
            </ActionButton>
          </ActionsBar>
        )}

        {/* Team Members Section */}
        <Section>
          <SectionTitle>Team Members</SectionTitle>
          {allMembers && allMembers.length > 0 ? (
            <MembersGrid>
              {allMembers.map((member) => (
                <MemberCard key={member._id}>
                  <MemberImageContainer>
                    <MemberImage
                      src={member.profileImage || "/logo2.png"}
                      alt={`Profile picture of ${member.name}`}
                      onError={(e) => {
                        e.currentTarget.src = "/logo2.png"
                      }}
                    />
                  </MemberImageContainer>
                  <MemberInfo>
                    <MemberName>{member.name}</MemberName>
                    <MemberEmail>{member.email}</MemberEmail>
                    <MemberRole>{member.role}</MemberRole>
                  </MemberInfo>
                </MemberCard>
              ))}
            </MembersGrid>
          ) : (
            <EmptyState>No members assigned to this team yet.</EmptyState>
          )}
        </Section>

        {/* Assigned Classes Section */}
        <Section>
          <SectionTitle>Assigned Classes</SectionTitle>
          {team.accessTo && team.accessTo.length > 0 ? (
            <ClassesList>
              {team.accessTo.map((classItem) => (
                <ClassChip key={classItem._id}>{classItem.classTitle}</ClassChip>
              ))}
            </ClassesList>
          ) : (
            <EmptyState>No classes assigned to this team yet.</EmptyState>
          )}
        </Section>

        {/* Invitation Links Section */}
        {currentUser?.role !== "student" && (
          <Section>
            <SectionTitle>Invitation Links</SectionTitle>
            {loadingInvitations ? (
              <LoadingText>Loading invitations...</LoadingText>
            ) : invitations.length > 0 ? (
              <InvitationsGrid>
                {invitations.map((invitation) => {
                  const isExpired = new Date(invitation.expiresAt) < new Date()
                  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
                  const inviteLink = `${frontendUrl}/signUp?token=${invitation.token}`

                  return (
                    <InvitationCard
                      key={invitation._id}
                      $isExpired={isExpired}
                    >
                      <InvitationHeader>
                        <StatusBadge $isExpired={isExpired}>
                          {isExpired ? "Expired" : "Active"}
                        </StatusBadge>
                        <InvitationDate>
                          Created {moment(invitation.createdAt).fromNow()}
                        </InvitationDate>
                      </InvitationHeader>

                      <InvitationDetails>
                        <DetailRow>
                          <DetailLabel>Created by:</DetailLabel>
                          <DetailValue>{invitation.createdBy.name}</DetailValue>
                        </DetailRow>
                        <DetailRow>
                          <DetailLabel>Expires:</DetailLabel>
                          <DetailValue>
                            {moment(invitation.expiresAt).format("MMM D, YYYY h:mm A")}
                          </DetailValue>
                        </DetailRow>
                      </InvitationDetails>

                      <LinkActions>
                        {!isExpired && (
                          <>
                            <InviteLink
                              href={inviteLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open Link
                            </InviteLink>
                            <CopyButton
                              onClick={() => {
                                navigator.clipboard.writeText(inviteLink)
                              }}
                            >
                              📋 Copy
                            </CopyButton>
                            <DeactivateButton
                              onClick={() => handleDeactivateInvitation(invitation._id)}
                            >
                              🚫 Deactivate
                            </DeactivateButton>
                          </>
                        )}
                        <DeleteButton onClick={() => handleDeleteInvitation(invitation._id)}>
                          🗑️ Delete
                        </DeleteButton>
                      </LinkActions>
                    </InvitationCard>
                  )
                })}
              </InvitationsGrid>
            ) : (
              <EmptyState>
                No invitation links generated yet. Click "Generate Invite Link" to create one.
              </EmptyState>
            )}
          </Section>
        )}

        {/* Assign Classes Modal */}
        {showAssignClassesModal && team && (
          <AssignClassesModal
            team={team}
            classes={classes}
            onClose={() => setShowAssignClassesModal(false)}
            onSave={async (selectedClasses: string[]) => {
              const currentClassIds = team.accessTo?.map((classItem) => classItem._id) || []

              // Add new assignments
              for (const classId of selectedClasses) {
                if (!currentClassIds.includes(classId)) {
                  await addTeamClass(team._id, classId)
                }
              }

              // Remove unassigned classes
              for (const classId of currentClassIds) {
                if (!selectedClasses.includes(classId)) {
                  await removeTeamClass(team._id, classId)
                }
              }

              setShowAssignClassesModal(false)
            }}
          />
        )}

        {/* Expiration Date Modal */}
        {showExpirationModal && (
          <ModalOverlay onClick={() => setShowExpirationModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Set Invitation Expiration</ModalTitle>
                <CloseButton onClick={() => setShowExpirationModal(false)}>×</CloseButton>
              </ModalHeader>

              <DatePickerContainer>
                <DateLabel>Expiration Date & Time:</DateLabel>
                <DateInput
                  type="datetime-local"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <DateHint>Default is 7 days from now if not specified</DateHint>
              </DatePickerContainer>

              <ModalActions>
                <CancelButton
                  onClick={() => setShowExpirationModal(false)}
                  disabled={isGeneratingLink}
                >
                  Cancel
                </CancelButton>
                <SaveButton
                  onClick={handleGenerateNewLink}
                  disabled={isGeneratingLink}
                >
                  {isGeneratingLink ? "Generating..." : "Generate Link"}
                </SaveButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </PageContainer>
    </>
  )
  //#endregion
}

//#region ----- ASSIGN CLASSES MODAL COMPONENT -----
const AssignClassesModal = ({
  team,
  classes,
  onClose,
  onSave,
}: {
  team: Team
  classes: any[]
  onClose: () => void
  onSave: (selectedClasses: string[]) => Promise<void>
}) => {
  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    team.accessTo?.map((classItem) => classItem._id) || []
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(selectedClasses)
    } catch (error) {
      console.error("Error updating team classes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Assign Classes to {team.teamName}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ClassListContainer>
          {classes.length === 0 ? (
            <NoClassesMessage>No classes available in this workspace.</NoClassesMessage>
          ) : (
            classes.map((classItem) => (
              <ClassItem key={classItem._id}>
                <ClassCheckbox
                  type="checkbox"
                  checked={selectedClasses.includes(classItem._id)}
                  onChange={() => handleClassToggle(classItem._id)}
                />
                <ClassName>{classItem.classTitle}</ClassName>
              </ClassItem>
            ))
          )}
        </ClassListContainer>

        <ModalActions>
          <CancelButton
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </CancelButton>
          <SaveButton
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Assignments"}
          </SaveButton>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  )
}
//#endregion

//#region ----- STYLED COMPONENTS -----
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.primary};
  padding: 16px;

  @media ${MediaQueries.biggerSizes} {
    padding: 32px;
  }
`

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 24px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-4px);
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 10px 20px;
    font-size: 16px;
  }
`

const TeamHeader = styled.div`
  text-align: center;
  margin-bottom: 16px;
`

const TeamTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: white;
  margin: 0 0 12px 0;

  @media ${MediaQueries.biggerSizes} {
    font-size: 48px;
  }
`

const TeamBadge = styled.span`
  background: #2ed573;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(46, 213, 115, 0.3);

  @media ${MediaQueries.biggerSizes} {
    padding: 8px 20px;
    font-size: 16px;
  }
`

const TeamDescription = styled.p`
  font-size: 14px;
  color: white;
  margin: 0 0 24px 0;
  opacity: 0.9;
  font-style: italic;
  text-align: center;

  @media ${MediaQueries.biggerSizes} {
    font-size: 16px;
    margin: 0 0 32px 0;
  }
`

const ActionsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
`

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 12px 24px;
    font-size: 16px;
  }
`

const Section = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);

  @media ${MediaQueries.biggerSizes} {
    padding: 32px;
    margin-bottom: 32px;
    border-radius: 20px;
  }
`

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: ${({ theme }) => theme.colors.text};

  @media ${MediaQueries.biggerSizes} {
    font-size: 24px;
    margin: 0 0 24px 0;
  }
`

const MembersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  @media ${MediaQueries.biggerSizes} {
    gap: 20px;
  }
`

const MemberCard = styled.div`
  background: ${({ theme }) => theme.colors.offBackground};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 20px;
    border-radius: 16px;
  }
`

const MemberImageContainer = styled.div`
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

  @media ${MediaQueries.biggerSizes} {
    width: 80px;
    height: 80px;
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
  }
`

const MemberRole = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  text-transform: capitalize;
  opacity: 0.7;

  @media ${MediaQueries.biggerSizes} {
    font-size: 12px;
  }
`

const ClassesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const ClassChip = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;

  @media ${MediaQueries.biggerSizes} {
    padding: 8px 16px;
    font-size: 16px;
  }
`

const EmptyState = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  font-style: italic;
  margin: 20px 0;
`

const LoadingText = styled.p`
  text-align: center;
  color: white;
  font-size: 16px;
  margin-top: 40px;
`

const InvitationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;

  @media ${MediaQueries.biggerSizes} {
    gap: 20px;
  }
`

const InvitationCard = styled.div<{ $isExpired: boolean }>`
  background: ${({ theme }) => theme.colors.offBackground};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 2px solid ${({ $isExpired, theme }) => ($isExpired ? "#ff6b6b" : theme.colors.primary)};
  opacity: ${({ $isExpired }) => ($isExpired ? 0.7 : 1)};

  @media ${MediaQueries.biggerSizes} {
    padding: 20px;
  }
`

const InvitationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const StatusBadge = styled.span<{ $isExpired: boolean }>`
  background: ${({ $isExpired }) => ($isExpired ? "#ff6b6b" : "#2ed573")};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`

const InvitationDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
`

const InvitationDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`

const DetailLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  font-weight: 500;
`

const DetailValue = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  text-align: right;
`

const LinkActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
`

const InviteLink = styled.a`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  flex: 1;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`

const CopyButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`

const DeactivateButton = styled.button`
  background: #ff9f43;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ee8c2b;
    transform: translateY(-2px);
  }
`

const DeleteButton = styled.button`
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ee5a52;
    transform: translateY(-2px);
  }
`

// Modal Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 16px;
  padding: 24px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.textAlternative};
`

const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 20px;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 8px;

  &:hover {
    opacity: 0.7;
  }
`

const ClassListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
`

const ClassItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.offBackground};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.offBackgroundHover};
  }
`

const ClassCheckbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.primary};
`

const ClassName = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
`

const NoClassesMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  padding: 20px;
  font-style: italic;
`

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.textAlternative};
`

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #5a6268;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const SaveButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`

const DateLabel = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 600;
`

const DateInput = styled.input`
  background: ${({ theme }) => theme.colors.offBackground};
  border: 1px solid ${({ theme }) => theme.colors.textAlternative};
  border-radius: 8px;
  padding: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }

  &::-webkit-calendar-picker-indicator {
    filter: ${({ theme }) => (theme.mode === "dark" ? "invert(1)" : "invert(0)")};
    cursor: pointer;
  }
`

const DateHint = styled.p`
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  font-size: 13px;
  margin: 0;
  font-style: italic;
`
//#endregion
