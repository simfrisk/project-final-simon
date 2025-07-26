import { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import { MediaQueries } from "../../../themes/mediaQueries";

interface TeacherProjectCardProps {
  projectId: string;
  projectName: string;
  projectDescription: string;
  thumbnail?: string;
  comments?: Array<{
    _id: string;
    content: string;
    createdAt: string;
    likes?: number;
    isChecked: boolean;
  }>;
}

export const TeacherProjectCard = ({
  projectName,
  projectDescription,
  thumbnail,
  comments = [],
  projectId,
}: TeacherProjectCardProps) => {
  const [showComments, setShowComments] = useState(false);

  return (
    <CardWrapper>
      <CardInner onClick={() => setShowComments((prev) => !prev)}>
        <CardThumbnail>
          <img src={thumbnail} alt="Thumbnail of project" />
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
                        to={`/review/${projectId}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CommentThumbnail>
                          <img src={thumbnail || "/default-thumb.jpg"} alt="Thumbnail" />
                        </CommentThumbnail>
                        <CommentContent>
                          <p>{comment.content}</p>
                          <CommentFooter>
                            <p>{moment(comment.createdAt).fromNow()}</p>
                            <p>{`${comment.likes ?? 4} Likes`}</p>
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
  background-color: #f6f6f6;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.295);
  color: inherit;
  text-decoration: none;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(0.995);
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.295);
  }

    p, h3 {
    margin: 0;
  }
`;

const CardInner = styled.article`
  display: flex;
  width: 100%;
  align-items: center;
  padding: 20px 30px;
  cursor: pointer;
  transition: transform 0.3s ease;

  p {
    color: #656565;
  }

  &:hover {
    transform: scale(0.998);
  }
`;

const CardThumbnail = styled.div`
  width: 50px;
  height: 60px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 8px;
  margin-right: 20px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media ${MediaQueries.biggerSizes} {
    width: 70px;
    height: 70px;
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
  justify-content: space-between;
  align-items: center;
  width: 100%;
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
    background-color: #eeeeee;
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.295);
  }
`;

const CommentLink = styled(Link)`
  display: flex;
  flex-direction: row; 
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
  border-radius: 50px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media ${MediaQueries.biggerSizes} {
    margin-left: 30px;
  }
`;

const CommentContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

`;

const CommentFooter = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;
`;