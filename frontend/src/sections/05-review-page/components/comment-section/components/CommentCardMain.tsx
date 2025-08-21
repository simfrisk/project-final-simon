import styled from "styled-components"
import React from "react"

interface CommentCardMainProps {
  _id: string
  content: string
  handleSaveEdit: (id: string) => void
  setEditedContent: (content: string) => void
  editedContent: string
  editingCommentId: string | null
  setEditingCommentId: (id: string | null) => void
}

export const CommentCardMain: React.FC<CommentCardMainProps> = ({
  _id,
  content,
  handleSaveEdit,
  setEditedContent,
  editedContent,
  editingCommentId,
  setEditingCommentId,
}) => {
  return (
    <Container>
      {editingCommentId === _id ? (
        <>
          <TextArea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
            aria-label="Write a question or comment to the video"
          />
          <ButtonGroup>
            <Button onClick={() => handleSaveEdit(_id)}>Save</Button>
            <Button
              onClick={() => {
                setEditingCommentId(null)
                setEditedContent(content)
              }}
            >
              Cancel
            </Button>
          </ButtonGroup>
        </>
      ) : (
        content
      )}
    </Container>
  )
}

/* ---------------- Styled Components ---------------- */

const Container = styled.p`
  text-align: left;
  width: 100%;
  margin: 8px 0;
  color: ${({ theme }) => theme.colors.textAlternative};
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid lightgray;
`

const ButtonGroup = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 10px;
`

const Button = styled.button`
  padding: 8px 14px;
  border: none;
  border-radius: 15px;
  margin: 8px 2px;
  color: white;
  background-color: #007bff;
  transition: ease 0.3s;
  cursor: pointer;

  &:hover {
    background-color: #1988fe;
    transform: scale(0.97);
  }
`
