//#region ----- IMPORTS -----
import { useState } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import moment from "moment"
import { motion, AnimatePresence } from "framer-motion"
import { MediaQueries } from "../../../themes/mediaQueries"

import { useVideoStore } from "../../../store/videoStore"
import { unFormatTime } from "../../05-review-page/components/video-section/utils/unFormatTime"
import { commentStore } from "../../../store/commentStore"

import type { MessageType } from "../../../store/commentStore"
//#endregion

//#region ----- INTERFACES -----
interface TeacherProjectCardProps {
  projectId: string
  projectName: string
  projectDescription: string
  thumbnail?: string
  comments?: MessageType[]
}
//#endregion

//#region ----- COMPONENT -----
export const TeacherProjectCard = ({
  projectName,
  projectDescription,
  thumbnail,
  comments = [],
  projectId,
}: TeacherProjectCardProps) => {
  //#endregion

  //#region ----- STATE -----
  const [showComments, setShowComments] = useState(false)
  const navigate = useNavigate()
  //#endregion

  //#region ----- HANDLERS -----
  const timeStampHandler = (
    e: React.MouseEvent<HTMLElement>,
    commentId: string,
    timeStamp: string
  ) => {
    e.stopPropagation()
    const newTimecode = unFormatTime(timeStamp)

    useVideoStore.getState().setTimeCode(newTimecode)
    commentStore.getState().setSelectedTimeStamp(timeStamp)
    commentStore.getState().setSelectedCommentId(commentId)

    navigate(`/review/${projectId}?commentId=${commentId}`)
  }
  //#endregion

  //#region ----- RENDER -----
  return (
    <CardWrapper>
      <CardHeaderButton
        aria-expanded={showComments}
        aria-controls={`comments-${projectId}`}
        onClick={() => setShowComments((prev) => !prev)}
      >
        <CardThumbnail>
          <img
            src={thumbnail || "/default-thumb.jpg"}
            alt={`Thumbnail for project: ${projectName}`}
          />
        </CardThumbnail>
        <CardContentWrapper>
          <CardHeader>
            <h3>{projectName}</h3>
            <p aria-label={`${comments.length} comments`}>{`${comments.length} items`}</p>
          </CardHeader>
          <p>{projectDescription}</p>
        </CardContentWrapper>
      </CardHeaderButton>

      <AnimatePresence initial={false}>
        {showComments && comments.length > 0 && (
          <motion.section
            id={`comments-${projectId}`}
            aria-live="polite"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CommentList>
                {comments
                  .filter((comment) => !comment.isChecked)
                  .map((comment) => (
                    <CommentItem key={comment._id}>
                      <CommentButton
                        onClick={(e) => timeStampHandler(e, comment._id, comment.timeStamp)}
                      >
                        <CommentThumbnail>
                          <img
                            src={comment.commentCreatedBy?.profileImage || "/default-profile.jpg"}
                            alt={`Profile image of ${comment.commentCreatedBy?.name || "unknown user"}`}
                          />
                        </CommentThumbnail>
                        <CommentContent>
                          <p>{comment.content}</p>
                          <CommentFooter>
                            <p>{moment(comment.createdAt).fromNow()}</p>
                            <p>{comment.commentCreatedBy?.name || "Unknown user"}</p>
                          </CommentFooter>
                        </CommentContent>
                      </CommentButton>
                    </CommentItem>
                  ))}
              </CommentList>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </CardWrapper>
  )
}
//#endregion

//#region ----- STYLED COMPONENTS -----

const CardWrapper = styled.div`
  width: 90%;
  max-width: 1000px;
  margin-bottom: 20px;
  border-radius: 15px;
  background-color: ${({ theme }) => theme.colors.offBackground};
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.295);
  color: inherit;
  text-decoration: none;
`

const CardHeaderButton = styled.button`
  display: flex;
  width: 100%;
  align-items: stretch;
  padding: 14px 18px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(0.998);
  }
`

const CardThumbnail = styled.div`
  width: 100px;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 15px;
  margin-right: 20px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media ${MediaQueries.biggerSizes} {
    width: 130px;
    aspect-ratio: 4 / 3;
    margin-right: 30px;
  }
`

const CardContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;

  p {
    color: ${({ theme }) => theme.colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    line-height: 1.4;
    max-height: 67px;
  }
`

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h3 {
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    color: ${({ theme }) => theme.colors.textAlternative};
  }

  @media ${MediaQueries.biggerSizes} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    h3 {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
    }

    p {
      flex-shrink: 0;
    }
  }
`

const CommentList = styled.div`
  width: 100%;
  overflow: hidden;
`

const CommentItem = styled.div`
  border-radius: 10px;
  box-shadow: 0 -2px 0 rgba(32, 32, 32, 0.07);
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.offBackgroundHover};
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.295);
  }
`

const CommentButton = styled.button`
  display: flex;
  align-items: center;
  gap: 22px;
  width: 100%;
  padding: 14px 30px; /* restore original padding */
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(0.995);
  }
`

const CommentThumbnail = styled.div`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media ${MediaQueries.biggerSizes} {
    width: 40px;
    height: 40px;
  }
`

const CommentContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  p {
    color: ${({ theme }) => theme.colors.text};
  }
`

const CommentFooter = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;

  p {
    color: ${({ theme }) => theme.colors.textAlternative};
  }
`

//#endregion
