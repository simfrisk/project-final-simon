import styled from "styled-components"
import { useState } from "react"
import { MediaQueries } from "../../../themes/mediaQueries"
import { useUserStore } from "../../../store/userStore"

export const CurrentUserSection = () => {
  const { user: currentUser, updateUser } = useUserStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    role: currentUser?.role || "student",
    profileImage: currentUser?.profileImage || "",
  })

  if (!currentUser) {
    return null
  }

  const editUser = () => {
    setIsEditing(true)
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      profileImage: currentUser.profileImage,
    })
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      profileImage: currentUser.profileImage,
    })
  }

  const saveUser = async () => {
    try {
      const result = await updateUser(currentUser._id!, {
        newName: formData.name,
        newEmail: formData.email,
        newRole: formData.role,
        newProfileImage: formData.profileImage,
      })

      if (result.success) {
        setIsEditing(false)
      } else {
        console.error("Failed to update user:", result.message)
      }
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <SectionContainer
      role="region"
      aria-labelledby="current-user-section"
      $isCurrentUserSection={true}
    >
      <SectionHeader>
        <SectionTitle id="current-user-section">Current User</SectionTitle>
        <CurrentUserBadge aria-label="You are currently logged in">You</CurrentUserBadge>
      </SectionHeader>
      <CurrentUserCard
        role="listitem"
        aria-label={`Current user: ${currentUser.name}`}
      >
        <UserImageContainer>
          <UserImage
            src={currentUser.profileImage || "/logo2.png"}
            alt={`Profile picture of ${currentUser.name}`}
            onError={(e) => {
              e.currentTarget.src = "/logo2.png"
            }}
          />
        </UserImageContainer>
        {!isEditing ? (
          <EditUserButton
            onClick={editUser}
            aria-label={`Edit user ${currentUser.name}`}
          >
            ...
          </EditUserButton>
        ) : (
          <ActionButtons>
            <SaveButton
              onClick={saveUser}
              aria-label="Save changes"
            >
              ✓
            </SaveButton>
            <CancelButton
              onClick={cancelEdit}
              aria-label="Cancel editing"
            >
              ✕
            </CancelButton>
          </ActionButtons>
        )}
        <UserInfo>
          {!isEditing ? (
            <>
              <UserName>{currentUser.name}</UserName>
              <UserEmail aria-label={`Email: ${currentUser.email}`}>{currentUser.email}</UserEmail>
              <UserRole aria-label={`Role: ${currentUser.role}`}>{currentUser.role}</UserRole>
            </>
          ) : (
            <>
              <UserInput
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                aria-label="Edit name"
              />
              <UserInput
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                aria-label="Edit email"
              />
              <RoleSelect
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                aria-label="Select role"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </RoleSelect>
              <label htmlFor="profileImage">Profile picture</label>
              <input
                type="file"
                id="profileImage"
                onChange={(e) => handleInputChange("profileImage", e.target.value)}
                aria-label="Edit profile picture"
              />
            </>
          )}
        </UserInfo>
      </CurrentUserCard>
    </SectionContainer>
  )
}

const SectionContainer = styled.div<{ $isCurrentUserSection?: boolean }>`
  background: ${({ theme }) => theme.colors.background};
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  ${({ $isCurrentUserSection, theme }) =>
    $isCurrentUserSection &&
    `
    border: 4px solid ${theme.colors.primary};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  `}

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

const CurrentUserBadge = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
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

const CurrentUserCard = styled.div`
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  background: ${({ theme }) => theme.colors.background};
  backdrop-filter: blur(10px);
  width: 100%;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media ${MediaQueries.biggerSizes} {
    width: 300px;
    padding: 32px;
    margin-bottom: 32px;
    border-radius: 20px;
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

  &:hover {
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

const EditUserButton = styled.button`
  position: absolute;
  top: 30px;
  right: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0 10px 6px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

const ActionButtons = styled.div`
  position: absolute;
  top: 30px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 10;
`

const SaveButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #45a049;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

const CancelButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #da190b;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

const UserInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  @media ${MediaQueries.biggerSizes} {
    font-size: 16px;
    padding: 10px 14px;
  }
`

const RoleSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 0;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  @media ${MediaQueries.biggerSizes} {
    font-size: 16px;
    padding: 10px 14px;
  }
`
