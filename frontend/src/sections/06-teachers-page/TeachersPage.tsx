import { useEffect } from "react";
import { Navigation } from "../../global-components/Navigation";
import { commentStore } from "../../store/commentStore";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";  // Use react-router-dom for navigation
import { SmallButton } from "../../global-components/buttons";

export const TeachersPage = () => {
  const comments = commentStore((state) => state.allComments);
  const fetchAllComments = commentStore((state) => state.fetchAllComments);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllComments();
  }, [fetchAllComments]);

  return (
    <>
      <Navigation />
      <Title>Teachers dashboard</Title>

      <Sections>
        <SmallButton text={"Projects"}></SmallButton>
        <SmallButton text={"All comments"}></SmallButton>
        <SmallButton text={"Projects"}></SmallButton>
      </Sections>

      <Wrapper>
        <CardContainer>
          <CardHeader>
            <h3>Project Title</h3>
            <p>3 comments</p>
          </CardHeader>
          <CardContent>
            <ImageContainer>
            <img src="/SImon1.jpg" alt="" />
            </ImageContainer>
            <p>This a sample comment</p>
          </CardContent>
          <CardFooter>
            <p>10 min ago</p>
            <p>12 Likes</p>
          </CardFooter>
        </CardContainer>
      </Wrapper>

      <CommentsTable>
        <thead>
          <tr>
            <th>Content</th>
            <th>Project ID</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr
              key={comment._id}
              onClick={() => navigate(`/review/${comment.projectId}`)}
              style={{ cursor: "pointer" }}
            >
              <td>{comment.content}</td>
              <td>{comment.projectId}</td>
              <td>{comment.timeStamp}</td>
            </tr>
          ))}
        </tbody>
      </CommentsTable>
    </>
  );
};

const Title = styled.h2`
  text-align: center;
  margin-top: 40px;
`;

const Sections = styled.div `
display: flex;
justify-content: center;
margin-bottom: 10px;
`

const Wrapper = styled.div `
display: flex;
justify-content: center;
`

const CardContainer = styled.article `
  display: flex;
  flex-direction: column;
  width: 90%;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.295);
  border-radius: 15px;
  background-color: #f6f6f6;
  padding: 20px 30px;
  margin-bottom: 30px;

  p {
    color: #656565; 
  }
`

const CardHeader = styled.div `
display: flex;
justify-content: space-between;
`
const CardContent = styled.div `
display: flex;
color: #656565;
column-gap: 10px;
`

const CardFooter = styled.div `
display: flex;
justify-content: space-between;
color: #656565;

`
  

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
`

const CommentsTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px 16px;
    border: 1px solid #ddd;
    text-align: left;
  }

  thead {
    background-color: #f4f4f4;
  }

  tbody {
    transition: all 0.2s ease;
  }

  tbody tr:hover {
    background-color: #3d84f5;
    transform: scale(1.01);
  }
`;