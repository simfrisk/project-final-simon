import { useState } from "react"
import styled from "styled-components"
import { MediaQueries } from "../../../themes/mediaQueries"
import { useUserStore } from "../../../store/userStore"
import { ConfirmBox } from "../../../global-components/ComfirmBox"

export const TeachersSection = () => {
  const { users, user: currentUser, deleteUser } = useUserStore()
  const [isEditingTeachers, setIsEditingTeachers] = useState<boolean>(false)
  const [showConfirmBox, setShowConfirmBox] = useState<boolean>(false)
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null)

  const teachers = users.filter((user) => user.role === "teacher")

  const handleEditTeachers = () => {
    setIsEditingTeachers(!isEditingTeachers)
  }

  const handleDeleteClick = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName })
    setShowConfirmBox(true)
  }

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id)
      setShowConfirmBox(false)
      setUserToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setShowConfirmBox(false)
    setUserToDelete(null)
  }

  const handleDeleteUser = (user: { _id?: string; name: string }) => {
    if (user._id) {
      handleDeleteClick(user._id, user.name)
    }
  }

  return (
    <>
      <SectionContainer
        role="region"
        aria-labelledby="teachers-section"
      >
        <SectionHeader>
          <SectionTitle id="teachers-section">Teachers</SectionTitle>
          {currentUser?.role === "teacher" && (
            <EditButton onClick={handleEditTeachers}>Edit</EditButton>
          )}
          <SectionCountTeacher aria-label={`${teachers.length} teachers in total`}>
            {teachers.length} teachers
          </SectionCountTeacher>
        </SectionHeader>
        <UsersGrid
          role="list"
          aria-label="List of teachers"
        >
          {teachers
            .filter((user) => user._id !== currentUser?._id)
            .map((user, index) => (
              <UserCard
                key={user._id || `teacher-${index}`}
                role="listitem"
                aria-label={`Teacher: ${user.name}`}
              >
                <UserImageContainer>
                  {isEditingTeachers && (
                    <DeleteUserButton
                      onClick={() => handleDeleteUser(user)}
                      aria-label={`Delete user ${user.name}`}
                    >
                      x
                    </DeleteUserButton>
                  )}
                  <UserImage
                    src={user.profileImage || "/default-avatar.png"}
                    alt={`Profile picture of ${user.name}`}
                    onError={(e) => {
                      e.currentTarget.src = "/default-avatar.png"
                    }}
                  />
                </UserImageContainer>
                <UserInfo>
                  <UserName>{user.name}</UserName>
                  <UserEmail aria-label={`Email: ${user.email}`}>{user.email}</UserEmail>
                  <UserRole aria-label={`Role: ${user.role}`}>{user.role}</UserRole>
                </UserInfo>
              </UserCard>
            ))}
        </UsersGrid>
      </SectionContainer>

      {/* Confirm Box Modal */}
      {showConfirmBox && (
        <>
          <Backdrop onClick={handleCancelDelete} />
          <ConfirmBox
            message={`Are you sure you want to delete ${userToDelete?.name}?`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </>
      )}
    </>
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

const EditButton = styled.button`
  background-color: #7e94c5;
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  @media ${MediaQueries.biggerSizes} {
    font-size: 14px;
  }
`

const SectionCountTeacher = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  @media ${MediaQueries.biggerSizes} {
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 25px;
  }
`

const UsersGrid = styled.div`
  display: grid;
  justify-content: center;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;

  @media ${MediaQueries.biggerSizes} {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
`

const UserCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  border: 1px solid ${({ theme }) => theme.colors.background};
  position: relative;
  width: 100%;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  @media ${MediaQueries.biggerSizes} {
    width: 300px;
    padding: 24px;
    border-radius: 16px;
  }
`

const UserImageContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`

const UserImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.background};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  ${UserCard}:hover & {
    transform: scale(1.05);
  }

  @media ${MediaQueries.biggerSizes} {
    width: 120px;
    height: 120px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`

const UserInfo = styled.div`
  text-align: center;
`

const UserName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: ${({ theme }) => theme.colors.text};

  @media ${MediaQueries.biggerSizes} {
    font-size: 20px;
    margin: 0 0 8px 0;
  }
`

const UserEmail = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 6px 0;
  word-break: break-word;

  @media ${MediaQueries.biggerSizes} {
    font-size: 14px;
    margin: 0 0 8px 0;
  }
`

const UserRole = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  text-transform: capitalize;
  font-weight: 500;

  @media ${MediaQueries.biggerSizes} {
    font-size: 13px;
  }
`

const DeleteUserButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ff4757;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);

  &:hover {
    background: #ff3742;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
  }

  &:active {
    transform: scale(0.95);
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 4px 8px;
    font-size: 14px;
    border-radius: 25px;
  }
`

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 199;
  backdrop-filter: blur(2px);
`
