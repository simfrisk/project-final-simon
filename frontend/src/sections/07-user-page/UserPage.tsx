import { useEffect } from "react"
import { useUserStore } from "../../store/userStore"
import styled from "styled-components"

export const UserPage = () => {
  const { users, getAllUsers } = useUserStore()

  useEffect(() => {
    getAllUsers()
  }, [])

  return (
    <UserPageContainer>
      <h1>Users</h1>
      <UsersContainer>
        {users.map((user) => (
          <UserContainer key={user.userId}>
            <img
              src={user.profileImage}
              alt={user.name}
            />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <p>{user.role}</p>
          </UserContainer>
        ))}
      </UsersContainer>
    </UserPageContainer>
  )
}

const UserPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const UsersContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  background-color: #b4c9df;
  padding: 20px;
`

const UserContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #eaeaea;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 20px;
  margin: 10px;
  width: 300px;
  height: 350px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f8f8f8;
    transform: scale(1.02);
  }

  img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }
`
