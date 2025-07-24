import { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

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
    <CardMainContainer>
      <CardContainer onClick={() => setShowComments((prev) => !prev)}>
        <CardHeader>
          <h3>{projectName}</h3>
          <p>{`${comments.length} items`}</p>
        </CardHeader>
        <p>{projectDescription}</p>
      </CardContainer>

      {showComments && comments.length > 0 && (
        <CommentSection>
          {comments.map((comment) => (
            <CardContent
              key={comment._id}
              onClick={(e) => e.stopPropagation()}  
              to={`/review/${projectId}`}
            >
              <ImageContainer>
                <img src={thumbnail || "/default-thumb.jpg"} alt="Thumbnail" />
              </ImageContainer>
              <div>
                <p>{comment.content}</p>
                <CardFooter>
                  <p>{new Date(comment.createdAt).toLocaleString()}</p>
                  <p>{`${comment.likes ?? 4} Likes`}</p>
                </CardFooter>
              </div>
            </CardContent>
          ))}
        </CommentSection>
      )}
    </CardMainContainer>
  );
};

// Styled Components

const CardMainContainer = styled.div`
  width: 90%;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.295);
  border-radius: 15px;
  background-color: #f6f6f6;
  transition: ease 0.3s;
  margin-bottom: 20px;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: scale(0.98);
  }
`;

const CardContainer = styled.article`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px 30px;
  cursor: pointer;

  p {
    color: #656565;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CommentSection = styled.div`
  width: 100%;
`;

const CardContent = styled(Link)`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px 30px;
  box-shadow: 0 -2px 0 rgba(32, 32, 32, 0.07);
  border-radius: 10px;
  transition: ease 0.3s;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: scale(0.96);
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.295);
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;
`;

const ImageContainer = styled.div`
  flex-shrink: 0;
  height: 32px;
  width: 32px;
  border-radius: 50px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;