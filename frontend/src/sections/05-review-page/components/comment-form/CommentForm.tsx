//#region ----- IMPORTS -----
import styled from "styled-components"
import { useState } from "react"

import { commentStore } from "../../../../store/commentStore"
import { useVideoStore } from "../../../../store/videoStore"
import { useTimecode } from "../../../../store/timeCodeStore"
import { useProjectStore } from "../../../../store/projectStore"
import { useTabStore } from "../../../../store/tabStore"
//#endregion

//#region ----- COMPONENT -----
export const CommentForm = () => {
  //#endregion

  //#region ----- STORE HOOKS / STATE -----
  const activeTab = useTabStore((state) => state.activeTab)
  const setActiveTab = useTabStore((state) => state.setActiveTab)

  const incrementMarkerTrigger = useVideoStore((state) => state.incrementMarkerTrigger)
  const [text, setText] = useState("")
  const addMessage = commentStore((state) => state.addMessage)
  const timecode = useTimecode((state) => state.timecode)
  const stopVideo = useVideoStore((state) => state.stopVideo)

  const project = useProjectStore((state) => state.project)
  const projectId = project?._id
  //#endregion

  //#region ----- HANDLERS -----
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    addMessage({
      content: text,
      timeStamp: timecode,
      projectId: projectId,
      commentType: activeTab,
    })

    setText("")
    incrementMarkerTrigger()
  }
  //#endregion

  //#region ----- RENDER -----
  return (
    <FormContainer
      as="form"
      onSubmit={handleSubmit}
      aria-label="Add a comment"
    >
      <TextInput
        id="comment-input"
        type="text"
        placeholder="Leave your comment here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onClick={stopVideo}
        aria-required="true"
        aria-label="Comment text"
      />

      <Footer>
        <TimeTag>
          <p id="timecode-label">{timecode}</p>
        </TimeTag>

        {activeTab !== "private" && (
          <Select
            value={activeTab}
            onChange={(e) =>
              setActiveTab(e.target.value as "description" | "question" | "private" | "public")
            }
            aria-label="Select comment type"
          >
            <option value="question">Question</option>
            <option value="public">Public Comment</option>
          </Select>
        )}

        <SendButton
          type="submit"
          aria-label="Send comment"
        >
          Send
        </SendButton>
      </Footer>
    </FormContainer>
  )
  //#endregion
}

//#region ----- STYLED COMPONENTS -----
const FormContainer = styled.section`
  position: sticky;
  bottom: 16px;
  width: 95%;
  margin: 0 auto;
  padding: 12px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.specialblue};
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const TextInput = styled.input`
  height: 48px;
  padding: 10px 18px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: 2px solid #007bff;
  }
`

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`

const TimeTag = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  p {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textAlternative};
    margin: 0;
  }

  input {
    width: 16px;
    height: 16px;
  }
`

const Select = styled.select`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: 2px solid #007bff;
  }
`

const SendButton = styled.button`
  padding: 8px 26px;
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 15px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    outline: 2px solid #007bff;
  }
`
//#endregion
