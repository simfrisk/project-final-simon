import styled from "styled-components"
import { MediaQueries } from "../../../themes/mediaQueries"
import { useUserStore } from "../../../store/userStore"

export const CurrentUserSection = () => {
  const { user: currentUser } = useUserStore()

  if (!currentUser) {
    return null
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
            src={currentUser.profileImage || "/default-avatar.png"}
            alt={`Profile picture of ${currentUser.name}`}
            onError={(e) => {
              e.currentTarget.src = "/default-avatar.png"
            }}
          />
        </UserImageContainer>
        <UserInfo>
          <UserName>{currentUser.name}</UserName>
          <UserEmail aria-label={`Email: ${currentUser.email}`}>{currentUser.email}</UserEmail>
          <UserRole aria-label={`Role: ${currentUser.role}`}>{currentUser.role}</UserRole>
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
