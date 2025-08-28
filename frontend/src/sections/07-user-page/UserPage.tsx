import { useEffect } from "react"
import { useUserStore } from "../../store/userStore"
import styled from "styled-components"
import { Navigation } from "../../global-components/navigation/Navigation"
import { MediaQueries } from "../../themes/mediaQueries"

export const UserPage = () => {
  const { users, getAllUsers, user: currentUser } = useUserStore()

  useEffect(() => {
    getAllUsers()
  }, [])

  const teachers = users.filter((user) => user.role === "teacher")
  const students = users.filter((user) => user.role === "student")

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

        {/* Current User Section */}
        {currentUser && (
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
                <UserEmail aria-label={`Email: ${currentUser.email}`}>
                  {currentUser.email}
                </UserEmail>
                <UserRole aria-label={`Role: ${currentUser.role}`}>{currentUser.role}</UserRole>
              </UserInfo>
            </CurrentUserCard>
          </SectionContainer>
        )}

        <SectionContainer
          role="region"
          aria-labelledby="teachers-section"
        >
          <SectionHeader>
            <SectionTitle id="teachers-section">Teachers</SectionTitle>
            <SectionCountTeacher aria-label={`${teachers.length} teachers in total`}>
              {teachers.length} teachers
            </SectionCountTeacher>
          </SectionHeader>
          <UsersGrid
            role="list"
            aria-label="List of teachers"
          >
            {teachers.map((user, index) => (
              <UserCard
                key={user.userId || `teacher-${index}`}
                role="listitem"
                aria-label={`Teacher: ${user.name}`}
              >
                <UserImageContainer>
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

        <SectionContainer
          role="region"
          aria-labelledby="students-section"
        >
          <SectionHeader>
            <SectionTitle id="students-section">Students</SectionTitle>
            <SectionCountStudent aria-label={`${students.length} students in total`}>
              {students.length} students
            </SectionCountStudent>
          </SectionHeader>
          <UsersGrid
            role="list"
            aria-label="List of students"
          >
            {students.map((user, index) => (
              <UserCard
                key={user.userId || `student-${index}`}
                role="listitem"
                aria-label={`Student: ${user.name}`}
                $isCurrentUser={currentUser?.userId === user.userId}
              >
                <UserImageContainer>
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
  color: ${({ theme }) => theme.colors.background};

  @media ${MediaQueries.biggerSizes} {
    margin-bottom: 48px;
  }
`

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.background};

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

const SectionContainer = styled.div<{ $isCurrentUserSection?: boolean }>`
  background: rgba(255, 255, 255, 0.95);
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

const SectionCountStudent = styled.span`
  background: #f021ab;
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

const UserCard = styled.div<{ $isCurrentUser?: boolean }>`
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

const CurrentUserCard = styled(UserCard)`
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
