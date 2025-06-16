import styled from 'styled-components';

export const CommentSection = () => {
  return (
    <>
    <CommentListContainer>
      <h3>Comments</h3>
    </CommentListContainer>
    </>
  )
};

const CommentListContainer = styled.div `
height: 100px;
width: 300px;
background-color: red;
`