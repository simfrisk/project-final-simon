import { useEffect } from "react"
import { useUserStore } from "../../store/userStore"
import styled from "styled-components"
import { Navigation } from "../../global-components/navigation/Navigation"

export const UserPage = () => {
  const { users, getAllUsers } = useUserStore()

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
            {teachers.map((user) => (
              <UserCard
                key={user.userId}
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
            {students.map((user) => (
              <UserCard
                key={user.userId}
                role="listitem"
                aria-label={`Student: ${user.name}`}
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
  padding: 2rem;
`

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  color: ${({ theme }) => theme.colors.background};
`

const PageTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.background};
`

const PageSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
`

const SectionContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
`

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
`
const SectionCountTeacher = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`

const SectionCountStudent = styled.span`
  background: #f021ab;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  align-items: start;
`

const UserCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  border: 1px solid ${({ theme }) => theme.colors.background};
  position: relative;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`

const UserImageContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`

const UserImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #f8f9fa;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  ${UserCard}:hover & {
    transform: scale(1.05);
  }
`

const UserInfo = styled.div`
  text-align: center;
`

const UserName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.text};
`

const UserEmail = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  word-break: break-word;
`

const UserRole = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  text-transform: capitalize;
  font-weight: 500;
`
