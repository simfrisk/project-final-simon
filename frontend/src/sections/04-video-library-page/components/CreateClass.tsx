//#region ----- IMPORTS -----
import styled from "styled-components"
import { useState } from "react"
import { MediaQueries } from "../../../themes/mediaQueries"
import { useClassStore } from "../../../store/classStore"
import { useEditingStore } from "../../../store/editStore"
//#endregion

//#region ----- COMPONENT LOGIC -----
export const CreateClass = () => {
  const addClass = useClassStore((state) => state.addClass)
  const [classTitle, setClassTitle] = useState("")
  const setIsEditingClass = useEditingStore((state) => state.setIsEditingClass)

  const handleCreateProject = async () => {
    if (!classTitle.trim()) return
    await addClass(classTitle)
    setClassTitle("")
    setIsEditingClass(false)
  }

  //#endregion

  //#region ----- RENDERED UI -----
  return (
    <FormContainer
      as="form"
      onSubmit={(e) => {
        e.preventDefault()
        handleCreateProject()
      }}
    >
      <ClassNameInput
        placeholder="Project Name"
        required
        value={classTitle}
        onChange={(e) => setClassTitle(e.target.value)}
      />
      <AddProjectBtn type="submit">Add Class</AddProjectBtn>
    </FormContainer>
  )
}
//#endregion

//#region ----- STYLED COMPONENTS -----
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  width: 92vw;
  background-color: ${({ theme }) => theme.colors.offBackground};
  border: 2px solid ${({ theme }) => theme.colors.textAlternative};
  border-radius: 10px;
  padding: 10px;

  @media ${MediaQueries.biggerSizes} {
    width: 500px;
  }

  input {
    background-color: ${({ theme }) => (theme.name === "dark" ? "#363f49" : "#fff")};
    color: ${({ theme }) => theme.colors.text};
    margin: 6px 0;
  }
`

const ClassNameInput = styled.input`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 100%;
`

const AddProjectBtn = styled.button`
  height: 40px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  border: none;
  transition: ease 0.3s;
  color: white;

  &:hover {
    transform: scale(0.96);
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`
//#endregion
