import styled from "styled-components"

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
          />
          <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
            <button onClick={() => handleSaveEdit(_id)}>Save</button>
            <button
              onClick={() => {
                setEditingCommentId(null)
                setEditedContent(content)
              }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        content
      )}
    </Container>
  )
}

const Container = styled.p`
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
    transition: ease 0.3s;
  }

  button:hover {
    background-color: #1988fe;
    transform: scale(0.97);
  }
`
