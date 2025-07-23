import { useEffect } from "react";
import { Navigation } from "../../global-components/Navigation";
import { commentStore } from "../../store/commentStore";
import styled from "styled-components";

export const TeachersPage = () => {
  const comments = commentStore((state) => state.allComments)
  const fetchAllComments = commentStore((state) => state.fetchAllComments);

  useEffect(() => {
    fetchAllComments();
  }, [fetchAllComments]);

  return (
    <>
      <Navigation />
      <Title>Teachers dashboard</Title>
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
            <tr key={comment._id}>
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

const Title = styled.h2 `
text-align: center;
margin: 40px;
`

const CommentsTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 12px 16px;
    border: 1px solid #ddd;
    text-align: left;
  }

  thead {
    background-color: #f4f4f4;
  }
`;