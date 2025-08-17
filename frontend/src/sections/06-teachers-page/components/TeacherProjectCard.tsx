import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import { MediaQueries } from "../../../themes/mediaQueries";

import { useVideoStore } from "../../../store/videoStore";
import { unFormatTime } from "../../05-review-page/components/video-section/utils/unFormatTime";
import { commentStore } from "../../../store/commentStore";

import type { MessageType } from "../../../store/commentStore";

interface TeacherProjectCardProps {
  projectId: string;
  projectName: string;
  projectDescription: string;
  thumbnail?: string;
  comments?: MessageType[]
}

export const TeacherProjectCard = ({
  projectName,
  projectDescription,
  thumbnail,
  comments = [],
  projectId,
}: TeacherProjectCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();

  const timeStampHandler = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    commentId: string,
    timeStamp: string
  ) => {
    e.stopPropagation();

    const newTimecode = unFormatTime(timeStamp);

    useVideoStore.getState().setTimeCode(newTimecode);
    commentStore.getState().setSelectedTimeStamp(timeStamp);
    commentStore.getState().setSelectedCommentId(commentId);

    navigate(`/review/${projectId}?commentId=${commentId}`);
  };

  return (
    <CardWrapper>
      <CardInner onClick={() => setShowComments((prev) => !prev)}>
        <CardThumbnail>
          <img src={thumbnail || "/default-thumb.jpg"} alt="Thumbnail of project" />
        </CardThumbnail>
        <CardContentWrapper>
          <CardHeader>
            <h3>{projectName}</h3>
            <p>{`${comments.length} items`}</p>
          </CardHeader>
          <p>{projectDescription}</p>
        </CardContentWrapper>
      </CardInner>

      <AnimatePresence initial={false}>
        {showComments && comments.length > 0 && (
          <motion.div
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
                  .filter((comment) => comment.isChecked === false)
                  .map((comment) => (
                    <CommentItem key={comment._id}>
                      <CommentLink
                        onClick={(e) => timeStampHandler(e, comment._id, comment.timeStamp)}
                      >
                        <CommentThumbnail>
                          <img
                            src={comment.commentCreatedBy?.profileImage || "/default-profile.jpg"}
                            alt={`${comment.commentCreatedBy?.name || "User"} profile`}
                          />
                        </CommentThumbnail>
                        <CommentContent>
                          <p>{comment.content}</p>
                          <CommentFooter>
                            <p>{moment(comment.createdAt).fromNow()}</p>
                            <p>{comment.commentCreatedBy?.name || "Unknown user"}</p>
                          </CommentFooter>
                        </CommentContent>
                      </CommentLink>
                    </CommentItem>
                  ))}
              </CommentList>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CardWrapper>
  );
};

// Styled Components

const CardWrapper = styled.div`
  width: 90%;
  max-width: 1000px;
  margin-bottom: 20px;
  border-radius: 15px;
  background-color: ${({theme}) => theme.colors.offBackground};
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.295);
  color: inherit;
  text-decoration: none;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(0.995);
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.295);
  }

  p,
  h3 {
    margin: 0;
  }

  h3 {
    white-space: nowrap;       /* prevent title wrap */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    display: -webkit-box;         /* important for multiline ellipsis */
    -webkit-line-clamp: 2;        /* limit to 3 lines */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;          /* allow wrapping inside the lines */
  }
`;

const CardInner = styled.article`
  display: flex;
  width: 100%;
  align-items: stretch; // Important!
  padding-right: 30px;
  cursor: pointer;
  transition: transform 0.3s ease;

  p {
    color: ${({theme}) => theme.colors.textAlternative}
  }

  &:hover {
    transform: scale(0.998);
  }
`;

const CardThumbnail = styled.div`
  width: 100px;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
  overflow: hidden;
  border: 4px solid ${({theme}) => theme.colors.offBackground};
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
`;

const CardContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column; 
  align-items: flex-start;
  width: 100%;
  gap: 4px;

  h3 {
    color: ${({ theme }) => theme.colors.text};
    white-space: normal; /* allow wrapping on small screens */
  }

  p {
    color: ${({ theme }) => theme.colors.textAlternative};
  }


  @media ${MediaQueries.biggerSizes} {
    flex-direction: row; /* side by side */
    justify-content: space-between;
    align-items: center;

    h3 {
      white-space: nowrap; /* prevent wrapping */
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
    }

    p {
      flex-shrink: 0;
    }
  }
`;

const CommentList = styled.div`
  width: 100%;
  overflow: hidden;
`;

const CommentItem = styled.div`
  border-radius: 10px;
  box-shadow: 0 -2px 0 rgba(32, 32, 32, 0.07);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: ${({theme}) => theme.colors.offBackgroundHover};
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.295);
  }
`;

const CommentLink = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
  width: 100%;
  padding: 14px 30px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(0.995);
  }
`;

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
`;

const CommentContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CommentFooter = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;
`;
