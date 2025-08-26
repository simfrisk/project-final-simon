//#region ----- IMPORTS -----
import styled from "styled-components"
import { useEditingStore } from "../../../../store/editStore"
import { useClassStore } from "../../../../store/classStore"
import { ConfirmBox } from "../../../../global-components/ComfirmBox"
import { useState } from "react"
//#endregion

//#region ----- TYPES -----
interface ClassOptionsProps {
  classId: string
}

interface StyledButtonProps {
  $danger?: boolean
}
//#endregion

//#region ----- COMPONENT LOGIC -----
export const ClassOptions = ({ classId }: ClassOptionsProps) => {
  const removingClassId = useEditingStore((state) => state.removingClassId)
  const setIsRemovingClass = useEditingStore((state) => state.setIsRemovingClass)
  const deleteClass = useClassStore((state) => state.deleteClass)
  const updateClass = useClassStore((state) => state.updateClass)

  const [showConfirm, setShowConfirm] = useState(false)
  const [showOptions, setShowOptions] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState("")

  const handleDeleteClick = () => {
    setShowConfirm(true)
    setShowOptions(false)
  }

  const handleConfirmDelete = () => {
    if (removingClassId) deleteClass(removingClassId)
    setIsRemovingClass(false)
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setIsRemovingClass(false)
    setShowConfirm(false)
  }

  const handleUpdating = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(true)
    setShowOptions(false)
  }

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId) return
    await updateClass(classId, { newTitle: newName })
    setIsEditing(false)
    setIsRemovingClass(false)
  }
  //#endregion

  //#region ----- RENDERED UI -----
  return (
    <>
      <TransparentBackground
        onClick={handleCancel}
        aria-hidden="true"
      />

      {showOptions && (
        <Container
          role="menu"
          aria-label="Class options"
        >
          <StyledButton
            type="button"
            onClick={handleUpdating}
            aria-label="Edit class name"
          >
            Edit name
          </StyledButton>
          <StyledButton
            type="button"
            $danger
            onClick={handleDeleteClick}
            aria-label="Delete class"
          >
            Delete Class
          </StyledButton>
        </Container>
      )}

      {showConfirm && (
        <ConfirmBox
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          message="Are you sure you want to delete?"
          onCancel={handleCancel}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isEditing && (
        <CreateWrapper
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-class-title"
        >
          <form onSubmit={handleSubmitUpdate}>
            <label
              htmlFor="newName"
              id="edit-class-title"
            >
              New Name
            </label>
            <input
              id="newName"
              type="text"
              required
              maxLength={100}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              type="submit"
              aria-label="Update class name"
            >
              Update Class
            </button>
          </form>
        </CreateWrapper>
      )}
    </>
  )
}
//#endregion

//#region ----- STYLED COMPONENTS -----
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #c7c7c7;
  position: absolute;
  padding: 5px 10px;
  border-radius: 15px;
  border: none;
  z-index: 11;
  top: 25%;
  right: 79%;
`

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-block;
  padding: 10px 20px;
  background-color: ${({ $danger, theme }) => ($danger ? "red" : theme.colors.primary)};
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  height: 40px;
  width: 100%;
  margin: 5px auto;
  text-align: center;
  transition: ease 0.3s;

  &:hover {
    background-color: ${({ $danger, theme }) => ($danger ? "#f1948a" : theme.colors.primaryHover)};
    transform: scale(0.98);
  }
`

const TransparentBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(2, 2, 2, 0.621);
  z-index: 10;
`

const CreateWrapper = styled.div`
  position: fixed;
  width: 400px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.colors.background};
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px ${({ theme }) => theme.colors.boxShadow};
  z-index: 1000;

  form {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  }

  input {
    height: 32px;
    padding: 5px 10px;
    border-radius: 5px;
  }

  textarea {
    height: 100px;
    padding: 10px 10px;
    border-radius: 5px;
  }

  button {
    padding: 5px 10px;
    margin: 10px 0;
    border-radius: 10px;
    height: 32px;
    border: none;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }
`
//#endregion
