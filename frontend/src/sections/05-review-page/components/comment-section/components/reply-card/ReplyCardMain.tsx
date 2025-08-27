import styled from "styled-components"
import type { ReplyType } from "../../../../../../store/commentStore"

type ReplyCardMainProps = {
  reply: ReplyType
  editedContent: string
  setEditedContent: (content: string) => void
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  handleSaveEdit: () => void
}

export const ReplyCardMain = ({
  reply,
  editedContent,
  setEditedContent,
  isEditing,
  setIsEditing,
  handleSaveEdit,
}: ReplyCardMainProps) => {
  return (
    <Container>
      {isEditing ? (
        <>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "14px",
              borderRadius: "8px",
              border: "1px solid lightgray",
            }}
            maxLength={500}
          />
          <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
            <button onClick={handleSaveEdit}>Save</button>
            <button
              onClick={() => {
                setIsEditing(false)
                setEditedContent(reply.content)
              }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        reply.content
      )}
    </Container>
  )
}

const Container = styled.div`
  text-align: left;
  width: 100%;
  margin: 8px 0;
  color: ${({ theme }) => theme.colors.textAlternative};

  button {
    padding: 8px 14px;
    border: none;
    border-radius: 15px;
    margin: 8px 2px;
    color: white;
    background-color: #007bff;
  }
`
