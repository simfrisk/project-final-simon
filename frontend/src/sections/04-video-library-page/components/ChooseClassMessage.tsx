import styled from "styled-components"
import { useClassStore } from "../../../store/classStore"
import { useUserStore } from "../../../store/userStore"
import { useEditingStore } from "../../../store/editStore"
import { useState } from "react"
import { CreateClass } from "./CreateClass"

export const ChooseClassMessage = () => {
  const classes = useClassStore((state) => state.classes)
  const user = useUserStore((state) => state.user)
  const userRole = user?.role
  const setIsEditingClass = useEditingStore((state) => state.setIsEditingClass)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreateClass = () => {
    setIsEditingClass(true)
    setShowCreateForm(true)
  }

  return (
    <Container>
      {classes.length === 0 && userRole === "teacher" ? (
        <NoClassesContainer>
          <h2>Welcome to your Library!</h2>
          <p>You don't have any classes yet. Create your first class to get started.</p>
          {showCreateForm ? (
            <CreateFormWrapper>
              <CreateClass />
            </CreateFormWrapper>
          ) : (
            <CreateButton onClick={handleCreateClass}>Create Your First Class</CreateButton>
          )}
        </NoClassesContainer>
      ) : (
        <h2>Please choose a class from the sidebar.</h2>
      )}
    </Container>
  )
}

const Container = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px;
  text-align: center;
`

const NoClassesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 600px;

  h2 {
    margin-bottom: 10px;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 20px;
  }
`

const CreateButton = styled.button`
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(0.98);
  }
`

const CreateFormWrapper = styled.div`
  width: 100%;
  max-width: 500px;
`
