import styled from "styled-components"
import { MediaQueries } from "../../../themes/mediaQueries"

// Hardcoded teams data
const spring25Team = {
  id: "1",
  name: "Spring 2025",
  description: "Advanced Web Development and Software Engineering",
  members: [
    {
      id: "1",
      name: "Alice Johnson",
      role: "Student",
      email: "alice@school.com",
      profileImage: "/logo2.png",
    },
    {
      id: "2",
      name: "Bob Smith",
      role: "Student",
      email: "bob@school.com",
      profileImage: "/logo2.png",
    },
    {
      id: "3",
      name: "Carol Davis",
      role: "Student",
      email: "carol@school.com",
      profileImage: "/logo2.png",
    },
  ],
}

const fall26Team = {
  id: "2",
  name: "Fall 2026",
  description: "Database Systems and Backend Architecture",
  members: [
    {
      id: "4",
      name: "David Wilson",
      role: "Student",
      email: "david@school.com",
      profileImage: "/logo2.png",
    },
    {
      id: "5",
      name: "Emma Brown",
      role: "Student",
      email: "emma@school.com",
      profileImage: "/logo2.png",
    },
    {
      id: "6",
      name: "Frank Miller",
      role: "Student",
      email: "frank@school.com",
      profileImage: "/logo2.png",
    },
  ],
}

const summer25Team = {
  id: "3",
  name: "Summer 2025",
  description: "Digital Design and User Experience",
  members: [
    {
      id: "7",
      name: "Grace Lee",
      role: "Student",
      email: "grace@school.com",
      profileImage: "/logo2.png",
    },
    {
      id: "8",
      name: "Henry Taylor",
      role: "Student",
      email: "henry@school.com",
      profileImage: "/logo2.png",
    },
  ],
}

export const TeamsSection = () => {
  return (
    <>
      <Spring25TeamSection />
      <Fall26TeamSection />
      <Summer25TeamSection />
    </>
  )
}

const Spring25TeamSection = () => {
  return (
    <SectionContainer
      role="region"
      aria-labelledby="spring25-team-section"
    >
      <SectionHeader>
        <SectionTitle id="spring25-team-section">{spring25Team.name}</SectionTitle>
        <a
          href="https://www.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <p id="spring25-team-section">{`Invite link to: ${spring25Team.name}`}</p>
        </a>
        <SectionCount aria-label={`${spring25Team.members.length} students in spring 2025`}>
          {spring25Team.members.length} students
        </SectionCount>
      </SectionHeader>

      <TeamDescription>{spring25Team.description}</TeamDescription>

      <MembersGrid
        role="list"
        aria-label="List of spring 2025 students"
      >
        {spring25Team.members.map((member) => (
          <MemberCard
            key={member.id}
            role="listitem"
            aria-label={`Spring 2025 student: ${member.name}`}
          >
            <MemberImageContainer>
              <MemberImage
                src={member.profileImage}
                alt={`Profile picture of ${member.name}`}
                onError={(e) => {
                  e.currentTarget.src = "/logo2.png"
                }}
              />
            </MemberImageContainer>
            <MemberInfo>
              <MemberName>{member.name}</MemberName>
              <MemberEmail aria-label={`Email: ${member.email}`}>{member.email}</MemberEmail>
              <MemberRole aria-label={`Role: ${member.role}`}>{member.role}</MemberRole>
            </MemberInfo>
          </MemberCard>
        ))}
      </MembersGrid>
    </SectionContainer>
  )
}

const Fall26TeamSection = () => {
  return (
    <SectionContainer
      role="region"
      aria-labelledby="fall26-team-section"
    >
      <SectionHeader>
        <SectionTitle id="fall26-team-section">{fall26Team.name}</SectionTitle>
        <a
          href="https://www.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <p id="fall26-team-section">{`Invite link to: ${fall26Team.name}`}</p>
        </a>
        <SectionCount aria-label={`${fall26Team.members.length} students in fall 2026`}>
          {fall26Team.members.length} students
        </SectionCount>
      </SectionHeader>

      <TeamDescription>{fall26Team.description}</TeamDescription>

      <MembersGrid
        role="list"
        aria-label="List of fall 2026 students"
      >
        {fall26Team.members.map((member) => (
          <MemberCard
            key={member.id}
            role="listitem"
            aria-label={`Fall 2026 student: ${member.name}`}
          >
            <MemberImageContainer>
              <MemberImage
                src={member.profileImage}
                alt={`Profile picture of ${member.name}`}
                onError={(e) => {
                  e.currentTarget.src = "/logo2.png"
                }}
              />
            </MemberImageContainer>
            <MemberInfo>
              <MemberName>{member.name}</MemberName>
              <MemberEmail aria-label={`Email: ${member.email}`}>{member.email}</MemberEmail>
              <MemberRole aria-label={`Role: ${member.role}`}>{member.role}</MemberRole>
            </MemberInfo>
          </MemberCard>
        ))}
      </MembersGrid>
    </SectionContainer>
  )
}

const Summer25TeamSection = () => {
  return (
    <SectionContainer
      role="region"
      aria-labelledby="summer25-team-section"
    >
      <SectionHeader>
        <SectionTitle id="summer25-team-section">{summer25Team.name}</SectionTitle>
        <a
          href="https://www.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <p id="summer25-team-section">{`Invite link to: ${summer25Team.name}`}</p>
        </a>
        <SectionCount aria-label={`${summer25Team.members.length} students in summer 2025`}>
          {summer25Team.members.length} students
        </SectionCount>
      </SectionHeader>

      <TeamDescription>{summer25Team.description}</TeamDescription>

      <MembersGrid
        role="list"
        aria-label="List of summer 2025 students"
      >
        {summer25Team.members.map((member) => (
          <MemberCard
            key={member.id}
            role="listitem"
            aria-label={`Summer 2025 student: ${member.name}`}
          >
            <MemberImageContainer>
              <MemberImage
                src={member.profileImage}
                alt={`Profile picture of ${member.name}`}
                onError={(e) => {
                  e.currentTarget.src = "/logo2.png"
                }}
              />
            </MemberImageContainer>
            <MemberInfo>
              <MemberName>{member.name}</MemberName>
              <MemberEmail aria-label={`Email: ${member.email}`}>{member.email}</MemberEmail>
              <MemberRole aria-label={`Role: ${member.role}`}>{member.role}</MemberRole>
            </MemberInfo>
          </MemberCard>
        ))}
      </MembersGrid>
    </SectionContainer>
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
